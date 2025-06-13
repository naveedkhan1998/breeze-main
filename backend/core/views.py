# views.py

from functools import lru_cache
import logging

from django.core.cache import cache
from django.db.models import Q
from django.shortcuts import get_object_or_404
from rest_framework import status, viewsets
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from core.breeze import breeze_session_manager
from core.models import (
    BreezeAccount,
    Candle,
    Exchanges,
    Instrument,
    PercentageInstrument,
    SubscribedInstruments,
)
from core.serializers import (
    AllInstrumentSerializer,
    BreezeAccountSerializer,
    CandleSerializer,
    InstrumentSerializer,
    SubscribedSerializer,
)
from core.tasks import load_instrument_candles, resample_candles, websocket_start

logger = logging.getLogger(__name__)


class BreezeAccountViewSet(viewsets.ModelViewSet):
    """
    A ViewSet for viewing and editing BreezeAccount instances.
    """

    serializer_class = BreezeAccountSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return BreezeAccount.objects.filter(user=self.request.user)

    def list(self, request):
        queryset = self.get_queryset()
        if queryset.exists():
            serializer = self.get_serializer(queryset, many=True)
            return Response(
                {"msg": "Okay", "data": serializer.data}, status=status.HTTP_200_OK
            )
        return Response({"msg": "No accounts found"}, status=status.HTTP_404_NOT_FOUND)

    def create(self, request):
        serializer = self.get_serializer(data=request.data)
        if serializer.is_valid():
            serializer.save(user=request.user)
            return Response(
                {"msg": "Account created successfully", "data": serializer.data},
                status=status.HTTP_201_CREATED,
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    def update(self, request, pk=None):
        instance = get_object_or_404(self.get_queryset(), pk=pk)
        serializer = self.get_serializer(instance, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(
                {"msg": "Account updated successfully", "data": serializer.data},
                status=status.HTTP_200_OK,
            )
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

    @action(detail=False, methods=["get"], url_path="breeze_status")
    def get_breeze_status(self, request):
        """
        Retrieves the status of the Breeze session and the WebSocket connection for the authenticated user.

        Returns:
            Response: JSON containing session and WebSocket statuses.
        """
        try:
            user_id = self.request.user.id

            # Initialize BreezeSession (retrieves cached instance or creates a new one)
            session = breeze_session_manager.initialize_session(user_id)

            # Check session status by fetching funds
            check_breeze_session = session.get_funds()

            # Check if ticks have been received in the last 10 seconds
            websocket_status = bool(cache.get("ticks_received", False))

            # Determine session status message
            if check_breeze_session.get("Status") == 200:
                session_status = True
                status_code = status.HTTP_200_OK
            else:
                session_status = False
                status_code = status.HTTP_200_OK

            # Construct response data
            response_data = {
                "session_status": session_status,
                "websocket_status": websocket_status,
            }

            # Log the successful status check
            logger.info(f"Breeze status checked for user {user_id}: {response_data}")

            return Response({"msg": "done", "data": response_data}, status=status_code)

        except BreezeAccount.DoesNotExist:
            # Handle case where BreezeAccount does not exist for the user
            logger.warning(
                f"No BreezeAccount found for user ID {self.request.user.id}."
            )
            return Response(
                {
                    "msg": "error",
                    "data": {"session_status": False, "websocket_status": False},
                },
                status=status.HTTP_200_OK,
            )

        except Exception as e:
            # Log the exception with stack trace
            logger.error(
                f"Error in get_breeze_status for user ID {self.request.user.id}: {e}",
                exc_info=True,
            )

            # Return a response indicating failure
            return Response(
                {
                    "msg": "error",
                    "data": {"session_status": False, "websocket_status": False},
                },
                status=status.HTTP_200_OK,
            )

    @action(detail=False, methods=["post"], url_path="websocket_start")
    def start_websocket(self, request):
        try:
            user = self.request.user
            websocket_start.delay(user.id)
            return Response(
                {"msg": "WebSocket Started successfully", "data": "WebSocket Started"},
                status=status.HTTP_201_CREATED,
            )
        except Exception as e:
            logger.error(f"Error starting WebSocket: {e}", exc_info=True)
            return Response(
                {
                    "msg": "Error starting WebSocket",
                    "data": "WebSocket could not start",
                },
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )


class InstrumentViewSet(viewsets.ReadOnlyModelViewSet):
    """
    A ViewSet for viewing Instrument instances.
    """

    queryset = Instrument.objects.all()
    serializer_class = AllInstrumentSerializer
    permission_classes = [IsAuthenticated]

    def list(self, request):
        exchange = request.query_params.get("exchange")
        search_term = request.query_params.get("search")

        if not exchange:
            return Response(
                {"msg": "Exchange is required"}, status=status.HTTP_400_BAD_REQUEST
            )

        if not search_term or len(search_term) < 2:
            return Response(
                {"msg": "Search term must be at least 2 characters long"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        qs_exchange = Exchanges.objects.filter(title=exchange).last()
        if not qs_exchange:
            return Response(
                {"msg": "Invalid Exchange"}, status=status.HTTP_400_BAD_REQUEST
            )

        # Create filters based on the search term
        filters = Q(exchange=qs_exchange) & (
            Q(strike_price__icontains=search_term)
            | Q(short_name__icontains=search_term)
            | Q(company_name__icontains=search_term)
            | Q(stock_token__icontains=search_term)
            | Q(token__icontains=search_term)
            | Q(instrument__icontains=search_term)
            | Q(series__icontains=search_term)
            | Q(option_type__icontains=search_term)
            | Q(exchange_code__icontains=search_term)
        )

        queryset = Instrument.objects.filter(filters)

        if qs_exchange.title == "FON":
            queryset = queryset[:50]

        if queryset.exists():
            serializer = self.get_serializer(queryset, many=True)
            return Response(
                {"msg": "Ok", "data": serializer.data}, status=status.HTTP_200_OK
            )

        return Response(
            {"msg": "No instruments found"}, status=status.HTTP_404_NOT_FOUND
        )


class SubscribedInstrumentsViewSet(viewsets.ModelViewSet):
    """
    A ViewSet for viewing and editing SubscribedInstruments instances.
    """

    queryset = SubscribedInstruments.objects.all()
    serializer_class = SubscribedSerializer
    permission_classes = [IsAuthenticated]

    def list(self, request):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return Response(
            {"msg": "success", "data": serializer.data}, status=status.HTTP_200_OK
        )

    def destroy(self, request, pk=None):
        instrument = get_object_or_404(SubscribedInstruments, pk=pk)
        instrument.delete()
        return Response({"msg": "success"}, status=status.HTTP_200_OK)

    @action(detail=True, methods=["post"], url_path="subscribe")
    def subscribe(self, request, pk=None):
        instrument = get_object_or_404(Instrument, pk=pk)
        data = InstrumentSerializer(instrument).data
        data.pop("id", None)

        duration = request.data.get("duration")
        exchange_id = data.pop("exchange")

        if SubscribedInstruments.objects.filter(**data).exists():
            return Response(
                {"error": "already subscribed"}, status=status.HTTP_400_BAD_REQUEST
            )

        sub_ins = SubscribedInstruments.objects.create(exchange_id=exchange_id, **data)
        PercentageInstrument.objects.create(instrument=sub_ins)
        load_instrument_candles.delay(sub_ins.id, request.user.id, duration=duration)

        serializer = self.get_serializer(sub_ins)
        return Response(
            {"msg": "success", "data": serializer.data}, status=status.HTTP_201_CREATED
        )


class CandleViewSet(viewsets.ViewSet):
    """
    A ViewSet for handling Candle related operations.
    """

    permission_classes = [IsAuthenticated]

    @lru_cache(maxsize=128)
    def get_cached_candles(self, instrument_id):
        instrument = get_object_or_404(SubscribedInstruments, id=instrument_id)
        qs = Candle.objects.filter(instrument=instrument).order_by("date")
        return CandleSerializer(qs, many=True).data

    @action(detail=False, methods=["get"], url_path="get_candles")
    def get_candles(self, request):
        instrument_id = request.query_params.get("id")
        tf = request.query_params.get("tf")
        if not instrument_id:
            return Response(
                {"msg": "Missing instrument ID"}, status=status.HTTP_400_BAD_REQUEST
            )

        instrument = get_object_or_404(SubscribedInstruments, id=instrument_id)
        qs = Candle.objects.filter(instrument=instrument).order_by("date")
        CandleSerializer(qs, many=True).data

        candles = CandleSerializer(qs, many=True).data

        if tf:
            try:
                timeframe = int(tf)
                new_candles = resample_candles(candles, timeframe)
            except ValueError:
                return Response(
                    {"msg": "Invalid timeframe"}, status=status.HTTP_400_BAD_REQUEST
                )
        else:
            new_candles = candles

        return Response({"msg": "done", "data": new_candles}, status=status.HTTP_200_OK)
