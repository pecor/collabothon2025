from rest_framework import serializers
from .models import User, Vehicle, Route, Cargo, Order, Tracker, Holiday, TransportLaw


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = '__all__'


class VehicleSerializer(serializers.ModelSerializer):
    current_driver_name = serializers.CharField(source='current_driver.name', read_only=True)
    
    class Meta:
        model = Vehicle
        fields = '__all__'


class RouteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Route
        fields = '__all__'


class CargoSerializer(serializers.ModelSerializer):
    class Meta:
        model = Cargo
        fields = '__all__'


class OrderSerializer(serializers.ModelSerializer):
    user_name = serializers.CharField(source='user.name', read_only=True)
    cargo_name = serializers.CharField(source='cargo.name', read_only=True)
    route_info = serializers.SerializerMethodField()
    vehicle_info = serializers.SerializerMethodField()
    driver_name = serializers.CharField(source='driver.name', read_only=True)
    
    class Meta:
        model = Order
        fields = '__all__'
    
    def get_route_info(self, obj):
        if obj.route:
            return f"{obj.route.origin} → {obj.route.destination}"
        return None
    
    def get_vehicle_info(self, obj):
        if obj.vehicle:
            return f"{obj.vehicle.registration_no} ({obj.vehicle.type})"
        return None


class OrderCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating orders with all form fields"""
    class Meta:
        model = Order
        fields = [
            'user', 'cargo', 'route', 'planned_date', 'vehicle', 'driver', 'status',
            'cargo_type', 'weight', 'temperature', 'special_requirements',
            'loading_date', 'unloading_date'
        ]


class TrackerSerializer(serializers.ModelSerializer):
    vehicle_info = serializers.SerializerMethodField()
    
    class Meta:
        model = Tracker
        fields = '__all__'
    
    def get_vehicle_info(self, obj):
        return {
            'registration_no': obj.vehicle.registration_no,
            'type': obj.vehicle.type,
            'status': obj.vehicle.status
        }


class HolidaySerializer(serializers.ModelSerializer):
    class Meta:
        model = Holiday
        fields = '__all__'


class OrderAssignmentSerializer(serializers.Serializer):
    """Serializer for AI-powered order assignment"""
    order_id = serializers.IntegerField()
    suggested_vehicle_id = serializers.IntegerField(required=False, allow_null=True)
    suggested_driver_id = serializers.IntegerField(required=False, allow_null=True)
    estimated_profit = serializers.FloatField(required=False, allow_null=True)
    compatibility_score = serializers.FloatField(required=False, allow_null=True)
    warnings = serializers.ListField(child=serializers.CharField(), required=False)
    reasons = serializers.ListField(child=serializers.CharField(), required=False)


class VehicleAvailabilitySerializer(serializers.Serializer):
    """Serializer for checking vehicle availability"""
    date = serializers.DateField()
    vehicle_type = serializers.ChoiceField(choices=['refrigerated', 'box', 'cargo'], required=False)
    min_capacity_weight = serializers.FloatField(required=False)
    min_capacity_volume = serializers.FloatField(required=False)
    requires_forklift = serializers.BooleanField(required=False, default=False)


class DriverAvailabilitySerializer(serializers.Serializer):
    """Serializer for checking driver availability"""
    date = serializers.DateField()
    license_c = serializers.BooleanField(required=False, default=False)
    license_ce = serializers.BooleanField(required=False, default=False)
    license_adr = serializers.BooleanField(required=False, default=False)
    forklift_certified = serializers.BooleanField(required=False, default=False)


class RouteOptimizationSerializer(serializers.Serializer):
    """Serializer for route optimization requests"""
    origin = serializers.CharField()
    destination = serializers.CharField()
    cargo_ids = serializers.ListField(child=serializers.IntegerField())
    planned_date = serializers.DateField()
    optimize_for = serializers.ChoiceField(choices=['profit', 'time', 'distance'], default='profit')


class ProfitCalculationSerializer(serializers.Serializer):
    """Serializer for profit calculation"""
    order_id = serializers.IntegerField(required=False)
    route_id = serializers.IntegerField(required=False)
    cargo_id = serializers.IntegerField(required=False)
    vehicle_id = serializers.IntegerField(required=False)
    distance_km = serializers.FloatField(required=False)
    estimated_revenue = serializers.FloatField(required=False)


class TransportLawSerializer(serializers.ModelSerializer):
    """Serializer for Transport Law regulations"""
    class Meta:
        model = TransportLaw
        fields = '__all__'


class RouteCalculationSerializer(serializers.Serializer):
    """Serializer for route calculation request using Google Maps"""
    origin_address = serializers.CharField(required=True, help_text="Starting address (e.g., 'Warsaw, Poland')")
    destination_address = serializers.CharField(required=True, help_text="Destination address (e.g., 'Berlin, Germany')")
    avoid_tolls = serializers.BooleanField(required=False, default=False, help_text="Avoid toll roads")
    avoid_highways = serializers.BooleanField(required=False, default=False, help_text="Avoid highways")
    avoid_ferries = serializers.BooleanField(required=False, default=False, help_text="Avoid ferries")
