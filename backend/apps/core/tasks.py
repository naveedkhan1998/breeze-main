from datetime import datetime, time, timedelta
import json
import time as PythonTime

from celery import shared_task
from celery.utils.log import get_task_logger
from django.core.cache import cache
from django.db import close_old_connections
from pytz import timezone
from redis.exceptions import RedisError

from apps.account.models import User
from apps.core.breeze import breeze_session_manager
from apps.core.models import (
    Candle,
    SubscribedInstruments,
    Tick,
)
from apps.core.utils import fetch_historical_data
from main import const

logger = get_task_logger(__name__)


LOCK_TTL = 300  # 5 minutes
LOCK_WAIT = 5  # seconds to wait for lock
RETRY_MAX = None  # unlimited
RETRY_BACKOFF = True
RETRY_BACKOFF_MAX = 300  # cap 5 min


@shared_task(
    bind=True,
    name="websocket_start",
    autoretry_for=(Exception,),
    retry_backoff=RETRY_BACKOFF,
    retry_backoff_max=RETRY_BACKOFF_MAX,
    max_retries=RETRY_MAX,
)
def websocket_start(_self, user_id: int) -> None:
    """
    Single-shot task that owns ONE websocket session.
    It will autoretry on any uncaught error with exponential back-off.
    """

    lock_key = f"ws:{user_id}:lock"
    try:
        # Robust redis lock: cleared automatically after LOCK_TTL
        with cache.lock(
            lock_key, timeout=LOCK_TTL, blocking_timeout=LOCK_WAIT
        ) as acquired:
            if not acquired:
                logger.info("Another websocket task is active for user %s", user_id)
                return

            logger.info("Acquired lock for user %s, starting websocket loop", user_id)
            _run_session_loop(user_id)

    except Exception as exc:
        logger.exception("websocket_start blew up, will retry: %s", exc)
        raise  # triggers Celery autoretry


# ------------------------------------------------------------------------- #


def _run_session_loop(user_id: int) -> None:
    redis_client = cache.client.get_client("default")
    sub_queue = f"user:{user_id}:subscriptions"
    first_run = True
    while True:
        try:
            close_old_connections()
            user = User.objects.get(pk=user_id)

            sess = breeze_session_manager.initialize_session(user_id)
            sess.ws_connect()
            logger.info("WS connected for %s", user.email)

            if first_run:
                try:
                    load_candles.delay(user.pk)
                    logger.info("Triggered async candle load")
                except Exception as c_err:
                    logger.warning("Could not queue candle load: %s", c_err)
                first_run = False

            # --- heartbeat callback -------------------------------------
            def on_ticks(ticks):
                # 1 push downstream work
                tick_handler.delay(ticks)

                # 2 heartbeat
                try:
                    redis_client.set(
                        const.WEBSOCKET_HEARTBEAT_KEY,
                        1,
                        ex=const.WEBSOCKET_HEARTBEAT_TTL,
                    )
                except RedisError as rerr:
                    logger.warning("Redis heartbeat failed: %s", rerr)

            sess.on_ticks = on_ticks

            _prime_subscriptions(sess)

            while True:
                _pump_sub_queue(redis_client, sub_queue, sess)
                PythonTime.sleep(0.5)

        except Exception as e:
            if "Session key is expired" in str(e):
                logger.warning("Breeze session expired — will retry in 5 min")
                PythonTime.sleep(5)
                raise  # let Celery back-off
            logger.exception("Unhandled WS error")
            raise


def _prime_subscriptions(sess):
    subs = SubscribedInstruments.objects.all()
    for ins in subs:
        if ins.percentage.is_loading:
            ins.percentage.percentage = 0
            ins.percentage.is_loading = False
            ins.percentage.save(update_fields=["percentage", "is_loading"])
        sess.subscribe_feeds(stock_token=ins.stock_token)
    logger.info("Initial %d instruments subscribed", subs.count())


def _pump_sub_queue(rds, queue_key, sess):
    """
    Non-blocking pop from Redis list; if something is there subscribe on WS.
    """
    try:
        popped = rds.blpop(queue_key, timeout=0)
    except RedisError as rerr:
        logger.warning("Redis BLPOP failed: %s", rerr)
        return
    if popped:
        _, raw = popped
        try:
            data = json.loads(raw)
            token = data.get("stock_token")
            if token:
                sess.subscribe_feeds(stock_token=token)
                logger.info("Subscribed to %s", token)
        except Exception as e:
            logger.warning("Bad subscription payload: %s", e)


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
            try:
                # Try to get a single candle
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
            except Candle.MultipleObjectsReturned:
                # If multiple candles exist for the same time, merge them
                candles = list(
                    Candle.objects.filter(instrument_id=ins_id, date=candle_time)
                )
                logger.warning(
                    f"Multiple candles found for instrument ID {ins_id} at {candle_time}. Merging."
                )

                # Create a new merged candle with the first candle's open and earliest date
                merged_candle = candles[0]

                # Find the lowest low, highest high, and sum volumes
                for c in candles[1:]:
                    merged_candle.low = min(merged_candle.low, c.low)
                    merged_candle.high = max(merged_candle.high, c.high)
                    merged_candle.volume += c.volume
                    # Keep the latest close
                    merged_candle.close = c.close

                # Save the merged candle and delete others
                merged_candle.save()
                Candle.objects.filter(instrument_id=ins_id, date=candle_time).exclude(
                    id=merged_candle.id
                ).delete()

                # Use the merged candle for further processing
                candle = merged_candle
                created = False

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

        # Define a callback function to process data batches as they arrive
        def process_candle_batch(batch_data):
            candles_to_create = []

            # Log batch processing start time
            batch_start = datetime.now()
            logger.info(
                f"Processing batch of {len(batch_data)} candles for instrument ID {ins_id}"
            )

            for item in batch_data:
                date = datetime.strptime(item["datetime"], "%Y-%m-%d %H:%M:%S")
                market_open_time = date.replace(
                    hour=9, minute=15, second=0, microsecond=0
                )
                market_close_time = date.replace(
                    hour=15, minute=30, second=0, microsecond=0
                )

                if (
                    date.time() < market_open_time.time()
                    or date.time() > market_close_time.time()
                ):
                    continue
                # now convert date to India timezone
                date = india_tz.localize(date)
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

            # Bulk create the batch of candles immediately
            if candles_to_create:
                db_start = datetime.now()
                Candle.objects.bulk_create(candles_to_create, ignore_conflicts=True)
                db_time = datetime.now() - db_start
                batch_time = datetime.now() - batch_start

                logger.info(
                    f"Created {len(candles_to_create)} candles for instrument ID {ins_id}. "
                    f"DB time: {db_time.total_seconds():.2f}s, Total time: {batch_time.total_seconds():.2f}s"
                )

        # Fetch and process historical data using the callback with reverse order
        logger.info(
            f"Starting historical data fetch for instrument ID {ins_id} from {start} to {end}"
        )
        fetch_historical_data(
            sess,
            start,
            end,
            sub_ins.short_name,
            expiry,
            sub_ins.stock_token,
            sub_ins,
            batch_callback=process_candle_batch,
            reverse_order=True,
        )

        # Update percentage loading status
        percentage = sub_ins.percentage
        percentage.percentage = 100
        percentage.is_loading = True
        percentage.save()

        # Enqueue the subscription request in Redis cache
        redis_client = cache.client.get_client("default")
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
