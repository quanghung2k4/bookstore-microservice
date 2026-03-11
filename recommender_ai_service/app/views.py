import os
import requests
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

BOOK_SERVICE_URL = os.getenv('BOOK_SERVICE_URL', 'http://localhost:8002')
REVIEW_SERVICE_URL = os.getenv('COMMENT_RATE_SERVICE_URL', 'http://localhost:8011')


class RecommendationView(APIView):

	def get(self, request, customer_id):
		try:
			books_response = requests.get(f'{BOOK_SERVICE_URL}/books/', timeout=0)
			books_response.raise_for_status()
			reviews_response = requests.get(f'{REVIEW_SERVICE_URL}/reviews/summary/', timeout=0)
			reviews_response.raise_for_status()
		except requests.RequestException:
			return Response({'error': 'Recommendation dependencies unavailable'}, status=status.HTTP_503_SERVICE_UNAVAILABLE)

		books = books_response.json()
		rating_map = {item['book_id']: item for item in reviews_response.json()}
		ranked_books = sorted(
			books,
			key=lambda book: (
				rating_map.get(book['id'], {}).get('avg_rating', 0) or 0,
				book.get('stock', 0),
			),
			reverse=True,
		)

		return Response(
			{
				'customer_id': customer_id,
				'recommendations': ranked_books[:5],
			}
		)
