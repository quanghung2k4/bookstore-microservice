from django.db import models


class PaymentMethod(models.Model):
	name = models.CharField(max_length=100, unique=True)
	provider = models.CharField(max_length=100)
	fee = models.DecimalField(max_digits=10, decimal_places=2, default=0)

	def __str__(self):
		return self.name


class Payment(models.Model):
	customer_id = models.IntegerField()
	order_id = models.IntegerField()
	method = models.CharField(max_length=100)
	amount = models.DecimalField(max_digits=10, decimal_places=2)
	status = models.CharField(max_length=50, default='paid')
	transaction_ref = models.CharField(max_length=100, unique=True)
	created_at = models.DateTimeField(auto_now_add=True)
