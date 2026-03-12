import os
from collections import Counter

import requests
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

BOOK_SERVICE_URL = os.getenv('BOOK_SERVICE_URL', 'http://localhost:8002')
REVIEW_SERVICE_URL = os.getenv('COMMENT_RATE_SERVICE_URL', 'http://localhost:8011')
ORDER_SERVICE_URL = os.getenv('ORDER_SERVICE_URL', 'http://localhost:8008')
REQUEST_TIMEOUT_SECONDS = max(float(os.getenv('RECOMMENDER_REQUEST_TIMEOUT', '5')), 0.1)


def _sort_by_rating(books, rating_map):
	return sorted(
		books,
		key=lambda book: (
			rating_map.get(book['id'], {}).get('avg_rating', 0) or 0,
			rating_map.get(book['id'], {}).get('total_reviews', 0) or 0,
			book.get('stock', 0),
		),
		reverse=True,
	)


class RecommendationView(APIView):

	def get(self, request, customer_id):
		try:
			books_response = requests.get(f'{BOOK_SERVICE_URL}/books/', timeout=REQUEST_TIMEOUT_SECONDS)
			books_response.raise_for_status()
			reviews_response = requests.get(f'{REVIEW_SERVICE_URL}/reviews/summary/', timeout=REQUEST_TIMEOUT_SECONDS)
			reviews_response.raise_for_status()
			customer_orders_response = requests.get(
				f'{ORDER_SERVICE_URL}/orders/customer/{customer_id}/',
				timeout=REQUEST_TIMEOUT_SECONDS,
			)
			customer_orders_response.raise_for_status()
			all_reviews_response = requests.get(f'{REVIEW_SERVICE_URL}/reviews/', timeout=REQUEST_TIMEOUT_SECONDS)
			all_reviews_response.raise_for_status()
		except requests.RequestException:
			return Response({'error': 'Recommendation dependencies unavailable'}, status=status.HTTP_503_SERVICE_UNAVAILABLE)

		books = books_response.json()
		books_by_id = {book['id']: book for book in books}
		rating_map = {item['book_id']: item for item in reviews_response.json()}
		customer_orders = customer_orders_response.json()
		customer_reviews = [review for review in all_reviews_response.json() if review.get('customer_id') == customer_id]

		has_personalization_data = bool(customer_orders) or bool(customer_reviews)
		if not has_personalization_data:
			ranked_books = _sort_by_rating(books, rating_map)
			return Response(
				{
					'customer_id': customer_id,
					'strategy': 'rating_fallback',
					'is_fallback': True,
					'reason': 'no_personalization_data',
					'recommendations': ranked_books[:5],
				}
			)

		preferred_book_ids = set()
		for order in customer_orders:
			for item in order.get('items', []):
				preferred_book_ids.add(item.get('book_id'))

		for review in customer_reviews:
			if Number := review.get('rating'):
				if int(Number) >= 4:
					preferred_book_ids.add(review.get('book_id'))

		preferred_authors = Counter()
		for book_id in preferred_book_ids:
			book = books_by_id.get(book_id)
			if book and book.get('author'):
				preferred_authors[book['author']] += 1

		seen_book_ids = {review.get('book_id') for review in customer_reviews}
		seen_book_ids.update(preferred_book_ids)

		candidate_books = [book for book in books if book.get('id') not in seen_book_ids]
		if not candidate_books:
			candidate_books = books

		ranked_books = sorted(
			candidate_books,
			key=lambda book: (
				preferred_authors.get(book.get('author'), 0),
				rating_map.get(book['id'], {}).get('avg_rating', 0) or 0,
				rating_map.get(book['id'], {}).get('total_reviews', 0) or 0,
				book.get('stock', 0),
			),
			reverse=True,
		)

		return Response(
			{
				'customer_id': customer_id,
				'strategy': 'personalized_by_history',
				'is_fallback': False,
				'recommendations': ranked_books[:5],
			}
		)
