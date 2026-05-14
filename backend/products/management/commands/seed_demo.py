from django.core.management.base import BaseCommand
from products.models import Category, Product

class Command(BaseCommand):
    help = "Create demo categories and products"

    def handle(self, *args, **options):
        category, _ = Category.objects.get_or_create(
            slug="electronics",
            defaults={
                "name": "Electronics",
                "description": "Electronic products and accessories",
            },
        )

        products = [
            {
                "name": "Wireless Headphones",
                "slug": "wireless-headphones",
                "description": "Bluetooth headphones with clear sound and long battery life.",
                "price": 249,
                "stock": 20,
            },
            {
                "name": "Smart Watch",
                "slug": "smart-watch",
                "description": "Sport smartwatch with fitness tracking and modern design.",
                "price": 399,
                "stock": 15,
            },
            {
                "name": "Phone Stand",
                "slug": "phone-stand",
                "description": "Adjustable phone stand for desk and office use.",
                "price": 79,
                "stock": 30,
            },
        ]

        for data in products:
            Product.objects.get_or_create(
                slug=data["slug"],
                defaults={**data, "category": category, "is_active": True},
            )

        self.stdout.write(self.style.SUCCESS("Demo data created successfully."))
