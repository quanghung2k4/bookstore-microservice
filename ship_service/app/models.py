from django.db import models


class ShippingMethod(models.Model):
	name = models.CharField(max_length=100, unique=True)
	provider = models.CharField(max_length=100)
	price = models.DecimalField(max_digits=10, decimal_places=2, default=0)
	estimated_days = models.IntegerField(default=3)

	def __str__(self):
		return self.name


class Shipment(models.Model):
	customer_id = models.IntegerField()
	order_id = models.IntegerField()
	method = models.CharField(max_length=100)
	address = models.CharField(max_length=255)
	status = models.CharField(max_length=50, default='processing')
	tracking_code = models.CharField(max_length=100, unique=True)
	created_at = models.DateTimeField(auto_now_add=True)
