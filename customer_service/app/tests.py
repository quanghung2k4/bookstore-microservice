from unittest.mock import Mock, patch

from django.test import TestCase
from rest_framework.test import APIClient

from .models import Customer


class CustomerAuthTests(TestCase):
	def setUp(self):
		self.client = APIClient()

	@patch('app.views.requests.post')
	def test_register_creates_cart_and_hashes_password(self, mock_post):
		mock_response = Mock()
		mock_response.json.return_value = {'id': 9, 'customer_id': 1}
		mock_response.raise_for_status.return_value = None
		mock_post.return_value = mock_response

		response = self.client.post(
			'/customers/register/',
			{
				'name': 'Lan',
				'email': 'lan@example.com',
				'password': 'secret123',
			},
			format='json',
		)

		self.assertEqual(response.status_code, 201)
		self.assertEqual(response.data['name'], 'Lan')
		self.assertIn('cart', response.data)

		customer = Customer.objects.get(email='lan@example.com')
		self.assertNotEqual(customer.password, 'secret123')
		self.assertTrue(customer.check_password('secret123'))

	def test_login_returns_customer_when_password_matches(self):
		customer = Customer(name='Minh', email='minh@example.com')
		customer.set_password('secret123')
		customer.save()

		response = self.client.post(
			'/customers/login/',
			{
				'email': 'minh@example.com',
				'password': 'secret123',
			},
			format='json',
		)

		self.assertEqual(response.status_code, 200)
		self.assertEqual(response.data['id'], customer.id)
		self.assertEqual(response.data['email'], 'minh@example.com')

	def test_login_rejects_invalid_password(self):
		customer = Customer(name='Minh', email='minh@example.com')
		customer.set_password('secret123')
		customer.save()

		response = self.client.post(
			'/customers/login/',
			{
				'email': 'minh@example.com',
				'password': 'wrongpass',
			},
			format='json',
		)

		self.assertEqual(response.status_code, 401)
