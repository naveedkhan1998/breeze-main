# urls.py

from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    BreezeAccountViewSet,
    InstrumentViewSet,
    SubscribedInstrumentsViewSet,
    CandleViewSet,
)

router = DefaultRouter()
router.register(r"breeze", BreezeAccountViewSet, basename="breeze")
router.register(r"instruments", InstrumentViewSet, basename="instruments")
router.register(
    r"subscribed_instruments",
    SubscribedInstrumentsViewSet,
    basename="subscribed_instruments",
)
router.register(r"candles", CandleViewSet, basename="candles")


urlpatterns = [
    path("", include(router.urls)),
]
