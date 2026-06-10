from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'products', views.ProductViewSet, basename='product')
router.register(r'categories', views.CategoryViewSet, basename='category')

urlpatterns = [
    path('', include(router.urls)),
    path('auth/register/', views.register),
    path('auth/login/', views.login_view),
    path('users/<int:user_id>/', views.get_user),
    path('users/<int:user_id>/update/', views.update_profile),
    path('users/<int:user_id>/cart/', views.get_cart),
    path('users/<int:user_id>/cart/add/', views.add_to_cart),
    path('users/<int:user_id>/cart/items/<int:item_id>/', views.update_cart_item),
    path('users/<int:user_id>/cart/items/<int:item_id>/remove/', views.remove_cart_item),
    path('users/<int:user_id>/cart/clear/', views.clear_cart),
    path('users/<int:user_id>/orders/', views.get_orders),
    path('users/<int:user_id>/orders/create/', views.create_order),
    path('users/<int:user_id>/addresses/', views.addresses),
    path('users/<int:user_id>/addresses/<int:address_id>/', views.delete_address),
    path('users/<int:user_id>/payment-methods/', views.payment_methods),
]