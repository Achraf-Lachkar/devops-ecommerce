from rest_framework import serializers
from products.models import Product
from .models import Order, OrderItem

class OrderItemCreateSerializer(serializers.Serializer):
    product_id = serializers.IntegerField()
    quantity = serializers.IntegerField(min_value=1)

class OrderItemReadSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source="product.name", read_only=True)

    class Meta:
        model = OrderItem
        fields = ["id", "product", "product_name", "quantity", "unit_price"]

class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemCreateSerializer(many=True, write_only=True, required=False)
    order_items = OrderItemReadSerializer(source="items", many=True, read_only=True)

    class Meta:
        model = Order
        fields = [
            "id", "customer_name", "customer_email", "customer_phone",
            "customer_address", "items", "order_items", "total_amount",
            "status", "created_at",
        ]
        read_only_fields = ["id", "total_amount", "created_at", "order_items"]

    def create(self, validated_data):
        items_data = validated_data.pop("items", [])
        order = Order.objects.create(**validated_data)
        total = 0

        for item_data in items_data:
            product = Product.objects.get(id=item_data["product_id"], is_active=True)
            quantity = item_data["quantity"]

            if product.stock < quantity:
                raise serializers.ValidationError(
                    f"Not enough stock for product: {product.name}"
                )

            OrderItem.objects.create(
                order=order,
                product=product,
                quantity=quantity,
                unit_price=product.price,
            )

            product.stock -= quantity
            product.save()
            total += product.price * quantity

        order.total_amount = total
        order.save()
        return order

    def update(self, instance, validated_data):
        validated_data.pop("items", None)
        for attr, value in validated_data.items():
            setattr(instance, attr, value)
        instance.save()
        return instance
