from django.urls import path
from .views import OrderCustomerListView, OrderListCreateView

urlpatterns = [
    path('orders/', OrderListCreateView.as_view()),
    path('orders/customer/<int:customer_id>/', OrderCustomerListView.as_view()),
]
