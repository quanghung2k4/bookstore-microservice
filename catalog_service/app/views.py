from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import BookCatalog, Category
from .serializers import BookCatalogSerializer, CategorySerializer


class CategoryListCreateView(APIView):

	def get(self, request):
		serializer = CategorySerializer(Category.objects.all(), many=True)
		return Response(serializer.data)

	def post(self, request):
		serializer = CategorySerializer(data=request.data)
		if serializer.is_valid():
			serializer.save()
			return Response(serializer.data, status=status.HTTP_201_CREATED)
		return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class BookCatalogView(APIView):

	def get(self, request):
		serializer = BookCatalogSerializer(BookCatalog.objects.select_related('category').all(), many=True)
		return Response(serializer.data)

	def post(self, request):
		serializer = BookCatalogSerializer(data=request.data)
		if serializer.is_valid():
			serializer.save()
			return Response(serializer.data, status=status.HTTP_201_CREATED)
		return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
