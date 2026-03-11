import os
import requests
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import StaffMember
from .serializers import StaffMemberSerializer

BOOK_SERVICE_URL = os.getenv('BOOK_SERVICE_URL', 'http://localhost:8002')


class StaffListCreate(APIView):

	def get(self, request):
		serializer = StaffMemberSerializer(StaffMember.objects.all(), many=True)
		return Response(serializer.data)

	def post(self, request):
		serializer = StaffMemberSerializer(data=request.data)
		if serializer.is_valid():
			serializer.save()
			return Response(serializer.data, status=status.HTTP_201_CREATED)
		return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class StaffBooksView(APIView):

	def get(self, request):
		try:
			response = requests.get(f'{BOOK_SERVICE_URL}/books/', timeout=5)
			response.raise_for_status()
			return Response(response.json())
		except requests.RequestException:
			return Response({'error': 'Book service unavailable'}, status=status.HTTP_503_SERVICE_UNAVAILABLE)

	def post(self, request):
		try:
			response = requests.post(f'{BOOK_SERVICE_URL}/books/', json=request.data, timeout=5)
			return Response(response.json(), status=response.status_code)
		except requests.RequestException:
			return Response({'error': 'Book service unavailable'}, status=status.HTTP_503_SERVICE_UNAVAILABLE)


class StaffBookDetail(APIView):

	def patch(self, request, book_id):
		try:
			response = requests.patch(f'{BOOK_SERVICE_URL}/books/{book_id}/', json=request.data, timeout=5)
			return Response(response.json() if response.content else {}, status=response.status_code)
		except requests.RequestException:
			return Response({'error': 'Book service unavailable'}, status=status.HTTP_503_SERVICE_UNAVAILABLE)

	def delete(self, request, book_id):
		try:
			response = requests.delete(f'{BOOK_SERVICE_URL}/books/{book_id}/', timeout=5)
			if response.content:
				return Response(response.json(), status=response.status_code)
			return Response(status=response.status_code)
		except requests.RequestException:
			return Response({'error': 'Book service unavailable'}, status=status.HTTP_503_SERVICE_UNAVAILABLE)
