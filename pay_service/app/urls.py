from django.urls import path
from .views import PaymentChargeView, PaymentMethodListCreateView

urlpatterns = [
    path('payment-methods/', PaymentMethodListCreateView.as_view()),
    path('payments/charge/', PaymentChargeView.as_view()),
]
