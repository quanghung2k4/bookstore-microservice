from django.contrib import admin
from django.urls import path, re_path

from .views import (
    book_list,
    home,
    proxy_book_service,
    proxy_catalog_service,
    proxy_cart_service,
    proxy_customer_service,
    proxy_manager_service,
    proxy_order_service,
    proxy_pay_service,
    proxy_recommend_service,
    proxy_review_service,
    proxy_ship_service,
    proxy_staff_service,
    view_cart,
)

urlpatterns = [
    path('', home),
    path('admin/', admin.site.urls),
    path('books/', book_list),
    path('cart/<int:customer_id>/', view_cart),
    re_path(r'^api/book/(?P<upstream_path>.*)$', proxy_book_service),
    re_path(r'^api/customer/(?P<upstream_path>.*)$', proxy_customer_service),
    re_path(r'^api/staff/(?P<upstream_path>.*)$', proxy_staff_service),
    re_path(r'^api/manager/(?P<upstream_path>.*)$', proxy_manager_service),
    re_path(r'^api/catalog/(?P<upstream_path>.*)$', proxy_catalog_service),
    re_path(r'^api/cart/(?P<upstream_path>.*)$', proxy_cart_service),
    re_path(r'^api/order/(?P<upstream_path>.*)$', proxy_order_service),
    re_path(r'^api/pay/(?P<upstream_path>.*)$', proxy_pay_service),
    re_path(r'^api/ship/(?P<upstream_path>.*)$', proxy_ship_service),
    re_path(r'^api/review/(?P<upstream_path>.*)$', proxy_review_service),
    re_path(r'^api/recommend/(?P<upstream_path>.*)$', proxy_recommend_service),
]