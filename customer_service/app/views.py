import os
import requests
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Customer
from .serializers import CustomerSerializer

CART_SERVICE_URL = os.getenv('CART_SERVICE_URL', 'http://localhost:8003')


class CustomerListCreate(APIView):

    def get(self, request):
        customers = Customer.objects.all()
        serializer = CustomerSerializer(customers, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = CustomerSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        customer = serializer.save()

        try:
            cart_response = requests.post(
                f"{CART_SERVICE_URL}/carts/",
                json={"customer_id": customer.id},
                timeout=5,
            )
            cart_response.raise_for_status()
        except requests.RequestException:
            customer.delete()
            return Response(
                {"error": "Cart service unavailable. Registration rolled back."},
                status=status.HTTP_503_SERVICE_UNAVAILABLE,
            )

        response_data = CustomerSerializer(customer).data
        response_data["cart"] = cart_response.json()
        return Response(response_data, status=status.HTTP_201_CREATED)


class CustomerLogin(APIView):

    def post(self, request):
        email = (request.data.get('email') or '').strip()
        password = request.data.get('password') or ''

        if not email or not password:
            return Response(
                {"error": "Email and password are required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            customer = Customer.objects.get(email__iexact=email)
        except Customer.DoesNotExist:
            return Response(
                {"error": "Invalid email or password."},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        if not customer.check_password(password):
            return Response(
                {"error": "Invalid email or password."},
                status=status.HTTP_401_UNAUTHORIZED,
            )

        return Response(CustomerSerializer(customer).data)