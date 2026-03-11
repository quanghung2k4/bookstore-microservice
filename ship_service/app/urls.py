from django.urls import path
from .views import ShipmentCreateView, ShippingMethodListCreateView

urlpatterns = [
    path('shipping-methods/', ShippingMethodListCreateView.as_view()),
    path('shipments/', ShipmentCreateView.as_view()),
]
