from rest_framework import filters, viewsets
from rest_framework.permissions import AllowAny, IsAdminUser
from .models import Category, Product
from .serializers import CategorySerializer, ProductSerializer

class PublicReadAdminWriteMixin:
    def get_permissions(self):
        if self.action in ["list", "retrieve"]:
            return [AllowAny()]
        return [IsAdminUser()]

class CategoryViewSet(PublicReadAdminWriteMixin, viewsets.ModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer

class ProductViewSet(PublicReadAdminWriteMixin, viewsets.ModelViewSet):
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    filter_backends = [filters.SearchFilter]
    search_fields = ["name", "description", "category__name"]

    def get_queryset(self):
        if self.request.user and self.request.user.is_staff:
            return Product.objects.all()
        return Product.objects.filter(is_active=True)
