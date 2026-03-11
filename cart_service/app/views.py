import os
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from .models import Cart, CartItem
from .serializers import CartSerializer, CartItemSerializer
import requests

BOOK_SERVICE_URL = os.getenv('BOOK_SERVICE_URL', 'http://localhost:8002')


class CartCreate(APIView):

    def post(self, request):
        customer_id = request.data.get("customer_id")
        if customer_id is None:
            return Response(
                {"error": "customer_id is required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        cart, created = Cart.objects.get_or_create(customer_id=customer_id)
        serializer = CartSerializer(cart)
        if created:
            return Response(serializer.data, status=status.HTTP_201_CREATED)

        return Response(serializer.data, status=status.HTTP_200_OK)


class AddCartItem(APIView):

    def post(self, request):
        cart_id = request.data.get("cart_id")
        book_id = request.data.get("book_id")
        quantity = request.data.get("quantity", 1)

        # Validate cart exists
        try:
            cart = Cart.objects.get(id=cart_id)
        except Cart.DoesNotExist:
            return Response(
                {"error": "Cart not found"},
                status=status.HTTP_404_NOT_FOUND
            )

        # Call book-service to validate book exists
        try:
            r = requests.get(f"{BOOK_SERVICE_URL}/books/", timeout=5)
            r.raise_for_status()
            books = r.json()
        except requests.RequestException:
            return Response(
                {"error": "Book service unavailable"},
                status=status.HTTP_503_SERVICE_UNAVAILABLE
            )

        # Check if book exists
        if not any(b["id"] == book_id for b in books):
            return Response(
                {"error": "Book not found"},
                status=status.HTTP_404_NOT_FOUND
            )

        # Create cart item
        cart_item_data = {
            "cart": cart_id,
            "book_id": book_id,
            "quantity": quantity
        }
        serializer = CartItemSerializer(data=cart_item_data)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data, status=status.HTTP_201_CREATED)

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ManageCartItem(APIView):

    def patch(self, request, item_id):
        try:
            item = CartItem.objects.get(id=item_id)
        except CartItem.DoesNotExist:
            return Response(
                {"error": "Cart item not found"},
                status=status.HTTP_404_NOT_FOUND
            )

        quantity = request.data.get("quantity")
        if quantity is None:
            return Response(
                {"error": "quantity is required"},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            quantity = int(quantity)
        except (TypeError, ValueError):
            return Response(
                {"error": "quantity must be an integer"},
                status=status.HTTP_400_BAD_REQUEST
            )

        if quantity <= 0:
            item.delete()
            return Response(status=status.HTTP_204_NO_CONTENT)

        item.quantity = quantity
        item.save(update_fields=["quantity"])
        serializer = CartItemSerializer(item)
        return Response(serializer.data)

    def delete(self, request, item_id):
        try:
            item = CartItem.objects.get(id=item_id)
        except CartItem.DoesNotExist:
            return Response(
                {"error": "Cart item not found"},
                status=status.HTTP_404_NOT_FOUND
            )

        item.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class CartDetail(APIView):

    def get(self, request, customer_id):
        cart = Cart.objects.filter(customer_id=customer_id).order_by('id').first()
        if cart is None:
            return Response(
                {"error": "Cart not found"},
                status=status.HTTP_404_NOT_FOUND
            )

        items = CartItem.objects.filter(cart=cart)
        cart_serializer = CartSerializer(cart)
        item_serializer = CartItemSerializer(items, many=True)
        return Response(
            {
                "cart": cart_serializer.data,
                "items": item_serializer.data,
            }
        )


class ViewCart(APIView):

    def get(self, request, customer_id):
        cart = Cart.objects.filter(customer_id=customer_id).order_by('id').first()
        if cart is None:
            return Response(
                {"error": "Cart not found"},
                status=status.HTTP_404_NOT_FOUND
            )

        items = CartItem.objects.filter(cart=cart)
        serializer = CartItemSerializer(items, many=True)
        return Response(serializer.data)