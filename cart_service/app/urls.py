from django.urls import path
from .views import CartCreate, AddCartItem, CartDetail, ManageCartItem, ViewCart

urlpatterns = [
    path('carts/', CartCreate.as_view()),
    path('cart-items/', AddCartItem.as_view()),
    path('cart-items/<int:item_id>/', ManageCartItem.as_view()),
    path('carts/customer/<int:customer_id>/', CartDetail.as_view()),
    path('carts/<int:customer_id>/', ViewCart.as_view()),
]