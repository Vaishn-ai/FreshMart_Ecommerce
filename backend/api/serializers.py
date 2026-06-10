from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Category, Product, UserProfile, Address, Cart, CartItem, Order, OrderItem, PaymentMethod


class CategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = Category
        fields = ['id', 'name', 'icon', 'slug']


class ProductSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)

    class Meta:
        model = Product
        fields = ['id','name','description','price','original_price','unit',
                  'price_per_unit','category','category_name','image_url','badge','is_active','created_at']


class UserProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserProfile
        fields = ['membership','phone','avatar_url','points','wallet_balance']


class UserSerializer(serializers.ModelSerializer):
    profile = UserProfileSerializer(read_only=True)
    orders_count = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ['id','username','email','first_name','last_name','profile','orders_count']

    def get_orders_count(self, obj):
        return obj.orders.count()


class AddressSerializer(serializers.ModelSerializer):
    class Meta:
        model = Address
        fields = ['id','label','icon','line1','line2','city','state','zip_code','is_default']


class CartItemSerializer(serializers.ModelSerializer):
    product = ProductSerializer(read_only=True)
    product_id = serializers.PrimaryKeyRelatedField(queryset=Product.objects.all(), source='product', write_only=True)
    subtotal = serializers.ReadOnlyField()

    class Meta:
        model = CartItem
        fields = ['id','product','product_id','quantity','subtotal']


class CartSerializer(serializers.ModelSerializer):
    items = CartItemSerializer(many=True, read_only=True)
    total_items = serializers.ReadOnlyField()
    subtotal = serializers.ReadOnlyField()

    class Meta:
        model = Cart
        fields = ['id','items','total_items','subtotal','updated_at']


class OrderItemSerializer(serializers.ModelSerializer):
    product_name = serializers.CharField(source='product.name', read_only=True)
    product_image = serializers.CharField(source='product.image_url', read_only=True)

    class Meta:
        model = OrderItem
        fields = ['id','product','product_name','product_image','quantity','price_at_purchase']


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    items_count = serializers.SerializerMethodField()

    class Meta:
        model = Order
        fields = ['id','order_number','status','total_amount','delivery_fee',
                  'tax','items','items_count','estimated_delivery','created_at']

    def get_items_count(self, obj):
        return obj.items.count()


class PaymentMethodSerializer(serializers.ModelSerializer):
    class Meta:
        model = PaymentMethod
        fields = ['id','card_type','last_four','is_default']


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=6)

    class Meta:
        model = User
        fields = ['username','email','first_name','last_name','password']

    def create(self, validated_data):
        user = User.objects.create_user(**validated_data)
        UserProfile.objects.create(user=user)
        Cart.objects.create(user=user)
        return user