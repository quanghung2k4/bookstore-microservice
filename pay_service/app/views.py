import uuid
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import Payment, PaymentMethod
from .serializers import PaymentMethodSerializer, PaymentSerializer


class PaymentMethodListCreateView(APIView):

	def get(self, request):
		serializer = PaymentMethodSerializer(PaymentMethod.objects.all(), many=True)
		return Response(serializer.data)

	def post(self, request):
		serializer = PaymentMethodSerializer(data=request.data)
		if serializer.is_valid():
			serializer.save()
			return Response(serializer.data, status=status.HTTP_201_CREATED)
		return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class PaymentChargeView(APIView):

	def post(self, request):
		payload = request.data.copy()
		payload['transaction_ref'] = f"PAY-{uuid.uuid4().hex[:10].upper()}"
		serializer = PaymentSerializer(data=payload)
		if serializer.is_valid():
			serializer.save()
			return Response(serializer.data, status=status.HTTP_201_CREATED)
		return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
