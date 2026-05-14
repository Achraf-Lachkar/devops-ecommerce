from django.contrib.auth.models import User
from rest_framework.authtoken.models import Token
from rest_framework.test import APITestCase
from rest_framework import status
from .models import Category, Product

class ProductApiTests(APITestCase):
    def setUp(self):
        self.admin = User.objects.create_superuser(
            username="admin", email="admin@example.com", password="Admin12345"
        )
        self.token = Token.objects.create(user=self.admin)
        self.category = Category.objects.create(
            name="Electronics", slug="electronics", description="Electronic products"
        )

    def test_public_can_list_products(self):
        Product.objects.create(
            category=self.category,
            name="Smart Watch",
            slug="smart-watch",
            description="Test product",
            price=399,
            stock=10,
        )
        response = self.client.get("/api/products/")
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)

    def test_admin_can_create_product(self):
        self.client.credentials(HTTP_AUTHORIZATION=f"Token {self.token.key}")
        response = self.client.post(
            "/api/products/",
            {
                "category_id": self.category.id,
                "name": "Phone Stand",
                "slug": "phone-stand",
                "description": "Adjustable stand",
                "price": "79.00",
                "stock": 30,
                "is_active": True,
            },
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(Product.objects.count(), 1)
