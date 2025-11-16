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
    # Custom endpoints must be BEFORE router to avoid conflicts
    path('routes/calculate/', views.calculate_route, name='calculate_route'),
    path('orders/extract-from-email/', views.extract_order_from_email, name='extract_order_from_email'),
    path('health/', views.health_check, name='health_check'),
    path('dashboard/stats/', views.dashboard_stats, name='dashboard_stats'),
    path('orders/fetch-latest-email/', views.fetch_and_extract_latest_email, name='fetch_and_extract_latest_email'),
    # Router URLs (must be last to catch remaining routes)
    path('', include(router.urls)),
]
