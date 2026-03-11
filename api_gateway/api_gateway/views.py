import os
from urllib.parse import urlencode

from django.http import HttpResponse, JsonResponse
from django.shortcuts import render
import requests
from django.views.decorators.csrf import csrf_exempt

BOOK_SERVICE_URL = os.getenv('BOOK_SERVICE_URL', 'http://localhost:8002')
CART_SERVICE_URL = os.getenv('CART_SERVICE_URL', 'http://localhost:8003')
CUSTOMER_SERVICE_URL = os.getenv('CUSTOMER_SERVICE_URL', 'http://localhost:8004')
STAFF_SERVICE_URL = os.getenv('STAFF_SERVICE_URL', 'http://localhost:8005')
MANAGER_SERVICE_URL = os.getenv('MANAGER_SERVICE_URL', 'http://localhost:8006')
CATALOG_SERVICE_URL = os.getenv('CATALOG_SERVICE_URL', 'http://localhost:8007')
ORDER_SERVICE_URL = os.getenv('ORDER_SERVICE_URL', 'http://localhost:8008')
PAY_SERVICE_URL = os.getenv('PAY_SERVICE_URL', 'http://localhost:8009')
SHIP_SERVICE_URL = os.getenv('SHIP_SERVICE_URL', 'http://localhost:8010')
COMMENT_RATE_SERVICE_URL = os.getenv('COMMENT_RATE_SERVICE_URL', 'http://localhost:8011')
RECOMMENDER_AI_SERVICE_URL = os.getenv('RECOMMENDER_AI_SERVICE_URL', 'http://localhost:8012')


def _build_target_url(base_url, upstream_path, query_params):
    normalized_path = upstream_path or ''
    target_url = f"{base_url.rstrip('/')}/{normalized_path}"
    if query_params:
      target_url = f"{target_url}?{urlencode(list(query_params.items()), doseq=True)}"
    return target_url


def _proxy_request(request, base_url, upstream_path=''):
    target_url = _build_target_url(base_url, upstream_path, request.GET)
    headers = {}
    if request.content_type:
        headers['Content-Type'] = request.content_type

    try:
        upstream_response = requests.request(
            method=request.method,
            url=target_url,
            data=request.body or None,
            headers=headers,
            timeout=15,
        )
    except requests.RequestException as error:
        return JsonResponse(
            {
                'error': 'Upstream service unavailable.',
                'target': target_url,
                'detail': str(error),
            },
            status=503,
        )

    response = HttpResponse(
        upstream_response.content,
        status=upstream_response.status_code,
        content_type=upstream_response.headers.get('Content-Type', 'application/json'),
    )
    return response

def home(request):
    """API Gateway home page with available endpoints"""
    endpoints = {
        "message": "Welcome to Bookstore Microservice API Gateway",
        "frontend": {
            "react_store": "http://localhost:5173"
        },
        "services": {
            "api_gateway": "http://localhost:8000",
            "book_service": "http://localhost:8002",
            "cart_service": "http://localhost:8003",
            "customer_service": "http://localhost:8004",
            "staff_service": "http://localhost:8005",
            "manager_service": "http://localhost:8006",
            "catalog_service": "http://localhost:8007",
            "order_service": "http://localhost:8008",
            "pay_service": "http://localhost:8009",
            "ship_service": "http://localhost:8010",
            "comment_rate_service": "http://localhost:8011",
            "recommender_ai_service": "http://localhost:8012"
        },
        "available_endpoints": {
            "book_proxy": {
                "url": "/api/book/books/",
                "methods": ["GET", "POST", "PATCH", "DELETE"],
                "description": "Proxy requests to book_service"
            },
            "customer_proxy": {
                "url": "/api/customer/customers/login/",
                "methods": ["GET", "POST"],
                "description": "Proxy requests to customer_service"
            },
            "staff_proxy": {
                "url": "/api/staff/staff/",
                "methods": ["GET", "POST", "PATCH", "DELETE"],
                "description": "Proxy requests to staff_service"
            },
            "manager_proxy": {
                "url": "/api/manager/reports/dashboard/",
                "methods": ["GET"],
                "description": "Proxy requests to manager_service"
            },
            "catalog_proxy": {
                "url": "/api/catalog/catalog/books/",
                "methods": ["GET", "POST"],
                "description": "Proxy requests to catalog_service"
            },
            "cart_proxy": {
                "url": "/api/cart/carts/customer/<customer_id>/",
                "methods": ["GET", "POST", "PATCH", "DELETE"],
                "description": "Proxy requests to cart_service"
            },
            "order_proxy": {
                "url": "/api/order/orders/customer/<customer_id>/",
                "methods": ["GET", "POST"],
                "description": "Proxy requests to order_service"
            },
            "pay_proxy": {
                "url": "/api/pay/payment-methods/",
                "methods": ["GET", "POST"],
                "description": "Proxy requests to pay_service"
            },
            "ship_proxy": {
                "url": "/api/ship/shipping-methods/",
                "methods": ["GET", "POST"],
                "description": "Proxy requests to ship_service"
            },
            "review_proxy": {
                "url": "/api/review/reviews/book/<book_id>/",
                "methods": ["GET", "POST"],
                "description": "Proxy requests to comment_rate_service"
            },
            "recommend_proxy": {
                "url": "/api/recommend/recommendations/<customer_id>/",
                "methods": ["GET"],
                "description": "Proxy requests to recommender_ai_service"
            },
            "gateway_home": {
                "url": "/",
                "method": "GET",
                "description": "Service map and frontend entry points"
            },
            "admin": {
                "url": "/admin/",
                "method": "GET",
                "description": "Django admin panel"
            }
        },
        "example_requests": {
            "list_books": "GET /api/book/books/",
            "customer_login": "POST /api/customer/customers/login/",
            "view_cart": "GET /api/cart/carts/customer/1/"
        }
    }
    return JsonResponse(endpoints)

def book_list(request):
    """Display all books in HTML template"""
    try:
        r = requests.get(f"{BOOK_SERVICE_URL}/books/", timeout=0)
        r.raise_for_status()
        books = r.json()
        return render(request, "books.html", {"books": books})
    except requests.RequestException as e:
        return render(request, "books.html", {
            "books": [],
            "error": f"Failed to fetch books: {str(e)}"
        })

def view_cart(request, customer_id):
    """Display cart items in HTML template"""
    try:
        r = requests.get(f"{CART_SERVICE_URL}/carts/{customer_id}/", timeout=0)
        r.raise_for_status()
        items = r.json()
        return render(request, "cart.html", {"items": items, "customer_id": customer_id})
    except requests.RequestException as e:
        return render(request, "cart.html", {
            "items": [],
            "customer_id": customer_id,
            "error": f"Failed to fetch cart: {str(e)}"
        })


@csrf_exempt
def proxy_book_service(request, upstream_path=''):
    return _proxy_request(request, BOOK_SERVICE_URL, upstream_path)


@csrf_exempt
def proxy_customer_service(request, upstream_path=''):
    return _proxy_request(request, CUSTOMER_SERVICE_URL, upstream_path)


@csrf_exempt
def proxy_staff_service(request, upstream_path=''):
    return _proxy_request(request, STAFF_SERVICE_URL, upstream_path)


@csrf_exempt
def proxy_manager_service(request, upstream_path=''):
    return _proxy_request(request, MANAGER_SERVICE_URL, upstream_path)


@csrf_exempt
def proxy_catalog_service(request, upstream_path=''):
    return _proxy_request(request, CATALOG_SERVICE_URL, upstream_path)


@csrf_exempt
def proxy_cart_service(request, upstream_path=''):
    return _proxy_request(request, CART_SERVICE_URL, upstream_path)


@csrf_exempt
def proxy_order_service(request, upstream_path=''):
    return _proxy_request(request, ORDER_SERVICE_URL, upstream_path)


@csrf_exempt
def proxy_pay_service(request, upstream_path=''):
    return _proxy_request(request, PAY_SERVICE_URL, upstream_path)


@csrf_exempt
def proxy_ship_service(request, upstream_path=''):
    return _proxy_request(request, SHIP_SERVICE_URL, upstream_path)


@csrf_exempt
def proxy_review_service(request, upstream_path=''):
    return _proxy_request(request, COMMENT_RATE_SERVICE_URL, upstream_path)


@csrf_exempt
def proxy_recommend_service(request, upstream_path=''):
    return _proxy_request(request, RECOMMENDER_AI_SERVICE_URL, upstream_path)