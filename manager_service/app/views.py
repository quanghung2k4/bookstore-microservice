import os
import requests
from rest_framework.response import Response
from rest_framework.views import APIView

BOOK_SERVICE_URL = os.getenv('BOOK_SERVICE_URL', 'http://localhost:8002')
CUSTOMER_SERVICE_URL = os.getenv('CUSTOMER_SERVICE_URL', 'http://localhost:8004')
ORDER_SERVICE_URL = os.getenv('ORDER_SERVICE_URL', 'http://localhost:8008')
REVIEW_SERVICE_URL = os.getenv('COMMENT_RATE_SERVICE_URL', 'http://localhost:8011')


class ManagerDashboardView(APIView):

	def fetch_count(self, url, key='count'):
		try:
			response = requests.get(url, timeout=5)
			response.raise_for_status()
			data = response.json()
			if isinstance(data, list):
				return len(data)
			return data.get(key, 0)
		except requests.RequestException:
			return None

	def get(self, request):
		return Response(
			{
				'books': self.fetch_count(f'{BOOK_SERVICE_URL}/books/'),
				'customers': self.fetch_count(f'{CUSTOMER_SERVICE_URL}/customers/'),
				'orders': self.fetch_count(f'{ORDER_SERVICE_URL}/orders/'),
				'reviews': self.fetch_count(f'{REVIEW_SERVICE_URL}/reviews/'),
			}
		)
