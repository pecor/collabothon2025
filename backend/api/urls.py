from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'users', views.UserViewSet, basename='user')
router.register(r'drivers', views.UserViewSet, basename='driver')
router.register(r'vehicles', views.VehicleViewSet, basename='vehicle')
router.register(r'routes', views.RouteViewSet, basename='route')
router.register(r'cargos', views.CargoViewSet, basename='cargo')
router.register(r'orders', views.OrderViewSet, basename='order')
router.register(r'trackers', views.TrackerViewSet, basename='tracker')
router.register(r'holidays', views.HolidayViewSet, basename='holiday')
router.register(r'transport-laws', views.TransportLawViewSet, basename='transport-law')

urlpatterns = [
    path('', include(router.urls)),
    path('health/', views.health_check, name='health_check'),
    path('dashboard/stats/', views.dashboard_stats, name='dashboard_stats'),
]
