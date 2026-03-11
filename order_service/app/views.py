import os
from decimal import Decimal
import requests
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import Order, OrderItem
from .serializers import OrderSerializer

CART_SERVICE_URL = os.getenv('CART_SERVICE_URL', 'http://localhost:8003')
BOOK_SERVICE_URL = os.getenv('BOOK_SERVICE_URL', 'http://localhost:8002')
PAY_SERVICE_URL = os.getenv('PAY_SERVICE_URL', 'http://localhost:8009')
SHIP_SERVICE_URL = os.getenv('SHIP_SERVICE_URL', 'http://localhost:8010')


class OrderListCreateView(APIView):

	def get(self, request):
		serializer = OrderSerializer(Order.objects.all().order_by('-created_at'), many=True)
		return Response(serializer.data)

	def post(self, request):
		customer_id = request.data.get('customer_id')
		payment_method = request.data.get('payment_method')
		shipping_method = request.data.get('shipping_method')
		shipping_address = request.data.get('shipping_address')

		if not all([customer_id, payment_method, shipping_method, shipping_address]):
			return Response({'error': 'customer_id, payment_method, shipping_method and shipping_address are required'}, status=status.HTTP_400_BAD_REQUEST)

		try:
			cart_response = requests.get(f'{CART_SERVICE_URL}/carts/customer/{customer_id}/', timeout=5)
			cart_response.raise_for_status()
			cart_payload = cart_response.json()

			books_response = requests.get(f'{BOOK_SERVICE_URL}/books/', timeout=5)
			books_response.raise_for_status()
		except requests.RequestException:
			return Response({'error': 'Required upstream service is unavailable'}, status=status.HTTP_503_SERVICE_UNAVAILABLE)

		items = cart_payload.get('items', [])
		if not items:
			return Response({'error': 'Cart is empty'}, status=status.HTTP_400_BAD_REQUEST)

		books_by_id = {book['id']: book for book in books_response.json()}
		total_amount = Decimal('0.00')
		order_lines = []
		for item in items:
			book = books_by_id.get(item['book_id'])
			if book is None:
				return Response({'error': f"Book {item['book_id']} not found"}, status=status.HTTP_400_BAD_REQUEST)

			price = Decimal(str(book['price']))
			quantity = int(item['quantity'])
			total_amount += price * quantity
			order_lines.append({'book_id': item['book_id'], 'quantity': quantity, 'price': price, 'cart_item_id': item['id']})

		order = Order.objects.create(
			customer_id=customer_id,
			payment_method=payment_method,
			shipping_method=shipping_method,
			shipping_address=shipping_address,
			total_amount=total_amount,
			status='processing',
		)

		for line in order_lines:
			OrderItem.objects.create(order=order, book_id=line['book_id'], quantity=line['quantity'], price=line['price'])

		try:
			payment_response = requests.post(
				f'{PAY_SERVICE_URL}/payments/charge/',
				json={
					'customer_id': customer_id,
					'order_id': order.id,
					'method': payment_method,
					'amount': str(total_amount),
					'status': 'paid',
				},
				timeout=5,
			)
			payment_response.raise_for_status()

			shipment_response = requests.post(
				f'{SHIP_SERVICE_URL}/shipments/',
				json={
					'customer_id': customer_id,
					'order_id': order.id,
					'method': shipping_method,
					'address': shipping_address,
					'status': 'processing',
				},
				timeout=5,
			)
			shipment_response.raise_for_status()
		except requests.RequestException:
			order.delete()
			return Response({'error': 'Payment or shipment service failed. Order rolled back.'}, status=status.HTTP_503_SERVICE_UNAVAILABLE)

		for line in order_lines:
			try:
				requests.delete(f"{CART_SERVICE_URL}/cart-items/{line['cart_item_id']}/", timeout=5)
			except requests.RequestException:
				pass

		order.status = 'confirmed'
		order.save(update_fields=['status'])
		serializer = OrderSerializer(order)
		return Response(
			{
				'order': serializer.data,
				'payment': payment_response.json(),
				'shipment': shipment_response.json(),
			},
			status=status.HTTP_201_CREATED,
		)


class OrderCustomerListView(APIView):

	def get(self, request, customer_id):
		serializer = OrderSerializer(Order.objects.filter(customer_id=customer_id).order_by('-created_at'), many=True)
		return Response(serializer.data)
