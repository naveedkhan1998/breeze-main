import json
import time as PythonTime
from pytz import timezone
from celery import shared_task
from core.helper import date_parser
from core.breeze import breeze_session_manager, BreezeConnect
from celery.utils.log import get_task_logger
from datetime import datetime, timedelta, time
from account.models import User
from core.models import (
    Tick,
    SubscribedInstruments,
    Candle,
)
from django.core.cache import cache

logger = get_task_logger(__name__)


@shared_task(name="websocket_start")
def websocket_start(user_id: int):
    """
    Initializes the WebSocket connection for the user and subscribes to feeds
    for instruments. Listens for new subscription requests and subscribes dynamically.
    """
    # Define a unique lock key for the user to prevent multiple task instances
    lock_key = f"websocket_start_lock_{user_id}"
    lock = cache.add(lock_key, "true", timeout=3600)  # 1-hour lock

    if not lock:
        # Task is already running for this user
        logger.error(f"WebSocket task already running for user {user_id}.")
        return

    try:
        # Retrieve the user
        try:
            user = User.objects.get(pk=user_id)
        except User.DoesNotExist:
            logger.warning(f"No user found with id {user_id}.")
            return

        # Initialize WebSocket session
        sess = breeze_session_manager.initialize_session(user_id)
        sess.ws_connect()

        # Subscribe to initial instruments
        sub_ins = SubscribedInstruments.objects.all()
        load_candles.delay(user.pk)  # Asynchronously load candle data

        def on_ticks(ticks):
            cache.set("ticks_received", True, timeout=10)
            # logger.info(f"Received ticks: {ticks}")
            tick_handler.delay(ticks)

        if sub_ins.exists():
            for ins in sub_ins:
                if ins.percentage.is_loading:
                    ins.percentage.percentage = 0
                    ins.percentage.is_loading = False
                    ins.percentage.save()
                    sess.subscribe_feeds(stock_token=ins.stock_token)

        sess.on_ticks = on_ticks
        logger.info("WebSocket connection established and initial subscriptions set.")

        # Access Redis via Django's cache
        redis_client = cache.client.get_client("default")
        subscription_queue = f"user:{user_id}:subscriptions"

        while True:
            try:
                # Attempt to pop a new subscription from the queue with a timeout
                subscription = redis_client.blpop(subscription_queue, timeout=5)
                if subscription:
                    _, data = subscription
                    subscription_data = json.loads(data)
                    stock_token = subscription_data.get("stock_token")

                    if stock_token:
                        # Subscribe to the new instrument
                        sess.subscribe_feeds(stock_token=stock_token)
                        logger.info(f"Subscribed to new instrument: {stock_token}")

            except Exception as e:
                logger.error(f"Error while processing subscription: {e}", exc_info=True)

            # Implement a short sleep to prevent tight looping
            PythonTime.sleep(1)

    except Exception as e:
        logger.error(f"Error in websocket_start: {e}", exc_info=True)
    finally:
        # Clean up: Disconnect WebSocket and release the lock
        try:
            sess.ws_disconnect()
            logger.info("WebSocket connection closed.")
        except Exception as e:
            logger.error(f"Error while disconnecting WebSocket: {e}", exc_info=True)

        cache.delete(lock_key)


@shared_task(name="tick_handler")
def tick_handler(ticks):
    """
    Processes incoming tick data by storing it in the database if within market hours.

    Args:
        ticks (dict): A dictionary containing tick data with keys 'ltt', 'symbol', and 'last'.
    """
    try:
        # Set the time zone to India
        india_tz = timezone("Asia/Kolkata")

        # Get the current time in India
        current_time_in_india = datetime.now(india_tz).time()

        # Define market hours
        market_start = time(9, 15)
        market_end = time(15, 30)

        # Check if it's within the market hours in India
        if market_start <= current_time_in_india <= market_end:
            date = datetime.strptime(ticks["ltt"], "%a %b %d %H:%M:%S %Y")
            sub_ins = SubscribedInstruments.objects.filter(
                stock_token=ticks["symbol"]
            ).first()
            if sub_ins:
                volume = 0
                if ticks["ltq"]:
                    volume = ticks["ltq"]
                Tick.objects.create(
                    instrument=sub_ins, ltp=ticks["last"], ltq=volume, date=date
                )
                logger.info(
                    f"Tick saved for instrument {sub_ins.stock_token} at {date}."
                )
            else:
                logger.warning(
                    f"No subscribed instrument found for symbol: {ticks['symbol']}"
                )
        else:
            logger.info("Tick received outside of market hours. Ignored.")
    except Exception as e:
        logger.error(f"Error in tick_handler: {e}", exc_info=True)


@shared_task(name="candle_maker")
def candle_maker():
    """
    Initiates the candle-making process for all subscribed instruments by delegating
    to the 'sub_candle_maker' task for each instrument.
    """
    try:
        sub_ins = SubscribedInstruments.objects.all()
        if sub_ins.exists():
            for ins in sub_ins:
                if ins.percentage.is_loading:
                    sub_candle_maker.delay(ins.id)
            logger.info(f"Initiated candle making for {sub_ins.count()} instruments.")
        else:
            logger.info("No subscribed instruments found for candle making.")
    except Exception as e:
        logger.error(f"Error in candle_maker: {e}", exc_info=True)


@shared_task(name="sub_candle_maker")
def sub_candle_maker(ins_id: int):
    """
    Processes ticks for a specific instrument to create or update the most recent candle.

    Args:
        ins_id (int): The ID of the subscribed instrument.
    """
    try:
        ticks = Tick.objects.filter(instrument_id=ins_id, used=False).order_by("date")
        if not ticks.exists():
            logger.info(f"No new ticks to process for instrument ID {ins_id}.")
            return

        for tick in ticks:
            # buy_volume = tick.get("totalBuyQt", 0)
            # sell_volume = tick.get("totalSellQ", 0)
            candle_time = tick.date.replace(second=0, microsecond=0)
            candle, created = Candle.objects.get_or_create(
                instrument_id=ins_id,
                date=candle_time,
                defaults={
                    "open": tick.ltp,
                    "high": tick.ltp,
                    "low": tick.ltp,
                    "close": tick.ltp,
                    "volume": tick.ltq,
                },
            )

            if not created:
                updated = False
                if candle.low > tick.ltp:
                    candle.low = tick.ltp
                    updated = True
                if candle.high < tick.ltp:
                    candle.high = tick.ltp
                    updated = True
                if candle.low <= tick.ltp <= candle.high:
                    candle.close = tick.ltp
                    updated = True
                if updated:
                    candle.volume += tick.ltq
                    candle.save()
                    logger.info(
                        f"Candle updated for instrument ID {ins_id} at {candle_time}."
                    )
                else:
                    logger.debug(
                        f"No update required for candle at {candle_time} for instrument ID {ins_id}."
                    )

        # Delete ticks after use
        count = ticks.count()
        ticks.delete()
        logger.info(
            f"Processed and marked {count} ticks as used for instrument ID {ins_id}."
        )
    except Exception as e:
        logger.error(
            f"Error in sub_candle_maker for instrument ID {ins_id}: {e}", exc_info=True
        )


@shared_task(name="load_instrument_candles")
def load_instrument_candles(ins_id: int, user_id: int, duration: int = 4):
    """
    Loads historical candle data for a specific instrument within a given duration.

    Args:
        ins_id (int): The ID of the subscribed instrument.
        user_id (int): The ID of the user initiating the request.
        duration (int, optional): Number of weeks of historical data to fetch. Defaults to 4.
    """
    try:
        sess = breeze_session_manager.initialize_session(user_id)
        sub_ins = (
            SubscribedInstruments.objects.filter(id=ins_id)
            .select_related("percentage")
            .first()
        )

        if not sub_ins:
            logger.warning(f"Subscribed instrument with ID {ins_id} does not exist.")
            return

        qs = Candle.objects.filter(instrument=sub_ins).order_by("date")
        india_tz = timezone("Asia/Kolkata")

        # Define the end and start dates
        end = datetime.now(india_tz)
        start = end - timedelta(weeks=duration)

        if qs.exists():
            start = qs.last().date

        expiry = None
        if sub_ins.expiry:
            expiry = sub_ins.expiry

        data = fetch_historical_data(
            sess, start, end, sub_ins.short_name, expiry, sub_ins.stock_token, sub_ins
        )

        if data:
            candles_to_create = []
            for item in data:
                date = datetime.strptime(item["datetime"], "%Y-%m-%d %H:%M:%S")
                market_open_time = date.replace(
                    hour=9, minute=15, second=0, microsecond=0
                )

                if date.time() < market_open_time.time():
                    continue

                candle = Candle(
                    instrument=sub_ins,
                    date=date,
                    open=item["open"],
                    close=item["close"],
                    low=item["low"],
                    high=item["high"],
                    volume=item.get("volume", 0),
                )
                candles_to_create.append(candle)

            # Bulk create candles in chunks
            if candles_to_create:
                chunk_size = 800
                for i in range(0, len(candles_to_create), chunk_size):
                    chunk = candles_to_create[i : i + chunk_size]
                    Candle.objects.bulk_create(chunk)
                logger.info(
                    f"Loaded {len(candles_to_create)} candles for instrument ID {ins_id}."
                )

        # Update percentage loading status
        percentage = sub_ins.percentage
        percentage.percentage = 100
        percentage.is_loading = True
        percentage.save()
        # Enqueue the subscription request in Redis cache
        redis_client = cache.client.get_client()
        subscription = {"stock_token": sub_ins.stock_token}
        subscription_queue = f"user:{user_id}:subscriptions"
        redis_client.rpush(subscription_queue, json.dumps(subscription))
        logger.info(f"Completed loading candles for instrument ID {ins_id}.")

    except Exception as e:
        logger.error(
            f"Error in load_instrument_candles for instrument ID {ins_id}: {e}",
            exc_info=True,
        )


@shared_task(name="load_candles")
def load_candles(user_id: int):
    """
    Loads historical candle data for all subscribed instruments for a given user.

    Args:
        user_id (int): The ID of the user initiating the request.
    """
    try:
        sub_ins_queryset = SubscribedInstruments.objects.all()

        if not sub_ins_queryset.exists():
            logger.info("No subscribed instruments found to load candles.")
            return

        for ins in sub_ins_queryset:
            load_instrument_candles.delay(ins.id, user_id, duration=4)

        logger.info(
            f"Initiated loading candles for {sub_ins_queryset.count()} instruments."
        )
    except Exception as e:
        logger.error(f"Error in load_candles: {e}", exc_info=True)


def fetch_historical_data(
    breeze_session: BreezeConnect,
    start: datetime,
    end: datetime,
    short_name: str,
    expiry: datetime,
    stock_token: str,
    instrument: SubscribedInstruments,
) -> list:
    """
    Fetches historical data from the Breeze API for the given instrument within the specified date range.

    Args:
        session (BreezeSession): The Breeze session for API communication.
        start (datetime): The start datetime for fetching data.
        end (datetime): The end datetime for fetching data.
        short_name (str): The short name of the instrument.
        expiry (datetime): The expiry datetime if applicable.
        stock_token (str): The stock token identifier.
        instrument (SubscribedInstruments): The subscribed instrument instance.

    Returns:
        list: A list of historical data dictionaries.
    """
    data = []
    current_start = start
    diff: timedelta = end - start
    div = max(diff.days // 2, 1)  # Prevent division by zero

    try:
        while current_start < end:
            # Update loading percentage incrementally
            instrument.percentage.percentage += (1 / div) * 100
            instrument.percentage.save()

            current_end = min(current_start + timedelta(days=2), end)

            if instrument.series.upper() == "OPTION":
                market = "NFO"
                product_type = "options"
                option_type = (
                    "call" if instrument.option_type.upper() == "CE" else "put"
                )
                strike_price = str(instrument.strike_price)
                date_parser(expiry) if expiry else None
            else:
                market = "NSE" if stock_token.startswith("4") else "BSE"
                product_type = "futures"
                option_type = None
                strike_price = None

            current_data = breeze_session.get_historical_data_v2(
                interval="1minute",
                from_date=date_parser(current_start),
                to_date=date_parser(current_end),
                stock_code=short_name,
                exchange_code=market,
                product_type=(
                    product_type if instrument.series.upper() != "OPTION" else "options"
                ),
                expiry_date=date_parser(expiry) if expiry else None,
                right=option_type,
                strike_price=strike_price if strike_price else None,
            )
            fetched_data = current_data.get("Success", [])
            if fetched_data:
                data.extend(fetched_data)
                logger.info(
                    f"Fetched {len(fetched_data)} data points for instrument {short_name} from {current_start} to {current_end}."
                )

            current_start += timedelta(days=2)

        # Final update to set percentage to 90% before completion
        instrument.percentage.percentage = 90
        instrument.percentage.save()

    except Exception as e:
        logger.error(
            f"Error in fetch_historical_data for instrument {short_name}: {e}",
            exc_info=True,
        )

    return data


@shared_task(name="resample_candles")
def resample_candles(candles: list, timeframe: int) -> list:
    """
    Resamples a list of candle data to a specified timeframe.

    Args:
        candles (list): A list of candle dictionaries containing 'date', 'open', 'high', 'low', 'close', and 'volume'.
        timeframe (int): The timeframe in minutes to resample the candles.

    Returns:
        list: A list of resampled candle dictionaries.
    """
    if not candles:
        logger.warning("No candles provided for resampling.")
        return []

    try:
        resampled_candles = []
        current_time = datetime.fromisoformat(candles[0]["date"])
        next_time = current_time + timedelta(minutes=timeframe)
        current_open = candles[0]["open"]
        current_high = float("-inf")
        current_low = float("inf")
        current_close = None
        current_volume = 0
        current_day = current_time.date()

        for candle in candles:
            candle_date = datetime.fromisoformat(candle["date"])
            candle_day = candle_date.date()

            # Check if the day has changed
            if candle_day != current_day:
                # Include the last incomplete candle of the previous day
                resampled_candles.append(
                    {
                        "open": current_open,
                        "high": current_high,
                        "low": current_low,
                        "close": current_close,
                        "volume": current_volume,
                        "date": current_time.isoformat(),
                    }
                )
                # Reset for the new day
                current_time = candle_date
                next_time = current_time + timedelta(minutes=timeframe)
                current_open = candle["open"]
                current_high = candle["high"]
                current_low = candle["low"]
                current_volume = candle["volume"]
                current_close = candle["close"]
                current_day = candle_day
                continue

            if candle_date >= next_time:
                resampled_candles.append(
                    {
                        "open": current_open,
                        "high": current_high,
                        "low": current_low,
                        "close": current_close,
                        "volume": current_volume,
                        "date": current_time.isoformat(),
                    }
                )
                current_time = next_time
                next_time = current_time + timedelta(minutes=timeframe)
                current_open = candle["open"]
                current_high = candle["high"]
                current_low = candle["low"]
                current_volume = candle["volume"]
            else:
                current_high = max(current_high, candle["high"])
                current_low = min(current_low, candle["low"])
                current_volume += candle["volume"]

            current_close = candle["close"]

        # Include the last incomplete candle
        resampled_candles.append(
            {
                "open": current_open,
                "high": current_high,
                "low": current_low,
                "close": current_close,
                "volume": current_volume,
                "date": current_time.isoformat(),
            }
        )

        logger.info(
            f"Resampled {len(resampled_candles)} candles to a {timeframe}-minute timeframe."
        )
        return resampled_candles

    except Exception as e:
        logger.error(f"Error in resample_candles: {e}", exc_info=True)
        return []
