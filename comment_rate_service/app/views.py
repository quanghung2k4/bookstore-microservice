from django.db.models import Avg, Count
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import Review
from .serializers import ReviewSerializer


class ReviewListCreateView(APIView):

	def get(self, request):
		serializer = ReviewSerializer(Review.objects.all().order_by('-created_at'), many=True)
		return Response(serializer.data)

	def post(self, request):
		serializer = ReviewSerializer(data=request.data)
		if serializer.is_valid():
			serializer.save()
			return Response(serializer.data, status=status.HTTP_201_CREATED)
		return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ReviewByBookView(APIView):

	def get(self, request, book_id):
		reviews = Review.objects.filter(book_id=book_id).order_by('-created_at')
		serializer = ReviewSerializer(reviews, many=True)
		return Response(serializer.data)


class BookReviewSummaryView(APIView):

	def get(self, request):
		summary = list(
			Review.objects.values('book_id')
			.annotate(avg_rating=Avg('rating'), total_reviews=Count('id'))
			.order_by('-avg_rating', '-total_reviews')
		)
		return Response(summary)
