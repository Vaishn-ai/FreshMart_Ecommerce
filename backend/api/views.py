from rest_framework import viewsets
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.contrib.auth import authenticate
from django.contrib.auth.models import User
from django.shortcuts import get_object_or_404
from .models import Category, Product, UserProfile, Address, Cart, CartItem, Order, OrderItem, PaymentMethod
from .serializers import (CategorySerializer, ProductSerializer, UserSerializer,
    AddressSerializer, CartSerializer, CartItemSerializer,
    OrderSerializer, PaymentMethodSerializer, RegisterSerializer)


@api_view(['POST'])
def register(request):
    serializer = RegisterSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        return Response({'message': 'Account created', 'user_id': user.id}, status=201)
    return Response(serializer.errors, status=400)


@api_view(['POST'])
def login_view(request):
    user = authenticate(username=request.data.get('username'), password=request.data.get('password'))
    if user:
        return Response({'user': UserSerializer(user).data, 'message': 'Login successful'})
    return Response({'error': 'Invalid credentials'}, status=400)


@api_view(['GET'])
def get_user(request, user_id):
    user = get_object_or_404(User, id=user_id)
    return Response(UserSerializer(user).data)


@api_view(['PUT'])
def update_profile(request, user_id):
    user = get_object_or_404(User, id=user_id)
    for field in ['first_name', 'last_name', 'email']:
        setattr(user, field, request.data.get(field, getattr(user, field)))
    user.save()
    return Response(UserSerializer(user).data)


class CategoryViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Category.objects.all()
    serializer_class = CategorySerializer


class ProductViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = ProductSerializer

    def get_queryset(self):
        qs = Product.objects.filter(is_active=True).select_related('category')
        if cat := self.request.query_params.get('category'):
            qs = qs.filter(category__slug=cat)
        if badge := self.request.query_params.get('badge'):
            qs = qs.filter(badge__icontains=badge)
        if search := self.request.query_params.get('search'):
            qs = qs.filter(name__icontains=search)
        return qs


@api_view(['GET'])
def get_cart(request, user_id):
    cart, _ = Cart.objects.get_or_create(user=get_object_or_404(User, id=user_id))
    return Response(CartSerializer(cart).data)


@api_view(['POST'])
def add_to_cart(request, user_id):
    cart, _ = Cart.objects.get_or_create(user=get_object_or_404(User, id=user_id))
    product = get_object_or_404(Product, id=request.data.get('product_id'))
    item, created = CartItem.objects.get_or_create(cart=cart, product=product)
    item.quantity = item.quantity + int(request.data.get('quantity', 1)) if not created else int(request.data.get('quantity', 1))
    item.save()
    return Response(CartSerializer(cart).data)


@api_view(['PUT'])
def update_cart_item(request, user_id, item_id):
    user = get_object_or_404(User, id=user_id)
    item = get_object_or_404(CartItem, id=item_id, cart__user=user)
    qty = int(request.data.get('quantity', 1))
    if qty <= 0:
        item.delete()
    else:
        item.quantity = qty
        item.save()
    return Response(CartSerializer(Cart.objects.get(user=user)).data)


@api_view(['DELETE'])
def remove_cart_item(request, user_id, item_id):
    user = get_object_or_404(User, id=user_id)
    get_object_or_404(CartItem, id=item_id, cart__user=user).delete()
    return Response(CartSerializer(Cart.objects.get(user=user)).data)


@api_view(['DELETE'])
def clear_cart(request, user_id):
    cart = get_object_or_404(Cart, user=get_object_or_404(User, id=user_id))
    cart.items.all().delete()
    return Response(CartSerializer(cart).data)


@api_view(['GET'])
def get_orders(request, user_id):
    orders = Order.objects.filter(user=get_object_or_404(User, id=user_id)).order_by('-created_at')
    return Response(OrderSerializer(orders, many=True).data)


@api_view(['POST'])
def create_order(request, user_id):
    user = get_object_or_404(User, id=user_id)
    cart = get_object_or_404(Cart, user=user)
    if not cart.items.exists():
        return Response({'error': 'Cart is empty'}, status=400)
    import random, string
    subtotal = cart.subtotal
    tax = round(subtotal * 0.07, 2)
    order = Order.objects.create(
        user=user,
        order_number='FMT-' + ''.join(random.choices(string.digits, k=5)),
        status='confirmed', total_amount=subtotal + tax, tax=tax,
        delivery_address=user.addresses.filter(is_default=True).first(),
        estimated_delivery='Today, 4-6 PM',
    )
    for item in cart.items.all():
        OrderItem.objects.create(order=order, product=item.product,
            quantity=item.quantity, price_at_purchase=item.product.price)
    cart.items.all().delete()
    return Response(OrderSerializer(order).data, status=201)


@api_view(['GET', 'POST'])
def addresses(request, user_id):
    user = get_object_or_404(User, id=user_id)
    if request.method == 'GET':
        return Response(AddressSerializer(user.addresses.all(), many=True).data)
    s = AddressSerializer(data=request.data)
    if s.is_valid():
        s.save(user=user)
        return Response(s.data, status=201)
    return Response(s.errors, status=400)


@api_view(['DELETE'])
def delete_address(request, user_id, address_id):
    get_object_or_404(Address, id=address_id, user__id=user_id).delete()
    return Response(status=204)


@api_view(['GET'])
def payment_methods(request, user_id):
    user = get_object_or_404(User, id=user_id)
    return Response(PaymentMethodSerializer(user.payment_methods.all(), many=True).data)