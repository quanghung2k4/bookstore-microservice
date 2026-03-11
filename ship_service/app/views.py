import uuid
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from .models import Shipment, ShippingMethod
from .serializers import ShipmentSerializer, ShippingMethodSerializer


class ShippingMethodListCreateView(APIView):

	def get(self, request):
		serializer = ShippingMethodSerializer(ShippingMethod.objects.all(), many=True)
		return Response(serializer.data)

	def post(self, request):
		serializer = ShippingMethodSerializer(data=request.data)
		if serializer.is_valid():
			serializer.save()
			return Response(serializer.data, status=status.HTTP_201_CREATED)
		return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class ShipmentCreateView(APIView):

	def post(self, request):
		payload = request.data.copy()
		payload['tracking_code'] = f"SHIP-{uuid.uuid4().hex[:10].upper()}"
		serializer = ShipmentSerializer(data=payload)
		if serializer.is_valid():
			serializer.save()
			return Response(serializer.data, status=status.HTTP_201_CREATED)
		return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
