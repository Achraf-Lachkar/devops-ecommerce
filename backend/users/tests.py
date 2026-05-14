from django.contrib.auth.models import User
from rest_framework.test import APITestCase
from rest_framework import status

class AdminLoginTests(APITestCase):
    def test_staff_user_can_login(self):
        User.objects.create_superuser(
            username="admin",
            email="admin@example.com",
            password="Admin12345",
        )
        response = self.client.post(
            "/api/auth/admin-login/",
            {"username": "admin", "password": "Admin12345"},
            format="json",
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("token", response.data)
