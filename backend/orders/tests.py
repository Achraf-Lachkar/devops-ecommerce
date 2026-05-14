from django.contrib.auth.models import User
from rest_framework.authtoken.models import Token
from rest_framework.test import APITestCase
from rest_framework import status
from products.models import Category, Product
from .models import Order

class OrderApiTests(APITestCase):
    def setUp(self):
        category = Category.objects.create(name="Electronics", slug="electronics")
        self.product = Product.objects.create(
            category=category,
            name="Headphones",
            slug="headphones",
            description="Bluetooth headphones",
            price=249,
            stock=5,
        )
        self.admin = User.objects.create_superuser(
            username="admin", email="admin@example.com", password="Admin12345"
        )
        self.token = Token.objects.create(user=self.admin)

    def test_customer_can_create_order(self):
        response = self.client.post(
            "/api/orders/",
            {
                "customer_name": "Test Client",
                "customer_email": "client@example.com",
                "customer_phone": "0600000000",
                "customer_address": "Tanger",
                "items": [{"product_id": self.product.id, "quantity": 2}],
            },
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Order.objects.count(), 1)
        self.product.refresh_from_db()
        self.assertEqual(self.product.stock, 3)

    def test_admin_can_update_order_status(self):
        order = Order.objects.create(
            customer_name="Client",
            customer_phone="0600000000",
            customer_address="Tanger",
            total_amount=100,
        )
        self.client.credentials(HTTP_AUTHORIZATION=f"Token {self.token.key}")
        response = self.client.patch(
            f"/api/orders/{order.id}/",
            {"status": "confirmed"},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        order.refresh_from_db()
        self.assertEqual(order.status, "confirmed")
