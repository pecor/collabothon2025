from rest_framework import serializers
from .models import User, Vehicle, Route, Cargo, Order, Tracker, Holiday, TransportLaw


class UserSerializer(serializers.ModelSerializer):
    current_vehicle_info = serializers.SerializerMethodField()
    
    class Meta:
        model = User
        fields = '__all__'
    
    def get_current_vehicle_info(self, obj):
        """Get current vehicle information"""
        if obj.current_vehicle:
            return {
                'id': obj.current_vehicle.id,
                'registration_no': obj.current_vehicle.registration_no,
                'type': obj.current_vehicle.type,
                'status': obj.current_vehicle.status
            }
        return None


class VehicleSerializer(serializers.ModelSerializer):
    current_driver_name = serializers.CharField(source='current_driver.name', read_only=True)
    current_driver_info = serializers.SerializerMethodField()
    
    class Meta:
        model = Vehicle
        fields = '__all__'
    
    def get_current_driver_info(self, obj):
        """Get current driver information"""
        if obj.current_driver:
            return {
                'id': obj.current_driver.id,
                'name': obj.current_driver.name,
                'email': obj.current_driver.email,
                'phone': obj.current_driver.phone,
                'current_country': obj.current_driver.current_country,
                'current_city': obj.current_driver.current_city
            }
        return None


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
        # Use origin and destination from Order if available, otherwise from Route
        if obj.origin and obj.destination:
            return f"{obj.origin} → {obj.destination}"
        elif obj.route:
            return f"{obj.route.origin} → {obj.route.destination}"
        return None
    
    def get_vehicle_info(self, obj):
        if obj.vehicle:
            return f"{obj.vehicle.registration_no} ({obj.vehicle.type})"
        return None


class OrderCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating orders with all required form fields"""
    
    # Make required fields explicit
    cargo = serializers.PrimaryKeyRelatedField(queryset=Cargo.objects.all(), required=True)
    route = serializers.PrimaryKeyRelatedField(queryset=Route.objects.all(), required=True)
    planned_date = serializers.DateField(required=True)
    origin = serializers.CharField(max_length=255, required=True, help_text="Starting location")
    destination = serializers.CharField(max_length=255, required=True, help_text="Destination location")
    cargo_type = serializers.CharField(max_length=255, required=True, help_text="e.g. Pallets, Boxes, Chemicals")
    weight = serializers.FloatField(required=True, help_text="Weight in kg")
    temperature = serializers.CharField(max_length=100, required=True, help_text="e.g. -18 to -20 or 'Ambient'")
    loading_date = serializers.DateField(required=True)
    unloading_date = serializers.DateField(required=True)
    
    # Optional fields
    user = serializers.PrimaryKeyRelatedField(queryset=User.objects.all(), required=False, allow_null=True)
    vehicle = serializers.PrimaryKeyRelatedField(queryset=Vehicle.objects.all(), required=False, allow_null=True)
    driver = serializers.PrimaryKeyRelatedField(queryset=User.objects.all(), required=False, allow_null=True)
    status = serializers.ChoiceField(choices=Order.STATUS_CHOICES, default='new', required=False)
    special_requirements = serializers.CharField(required=False, allow_null=True, allow_blank=True, help_text="e.g. ADR, Forklift, Tarpaulin", style={'base_template': 'textarea.html'})
    
    # Financial fields (read-only, auto-calculated)
    cost = serializers.FloatField(read_only=True, help_text="Total cost of the order (auto-calculated)")
    revenue = serializers.FloatField(read_only=True, help_text="Total revenue from the order (auto-calculated)")
    profit = serializers.FloatField(read_only=True, help_text="Profit (revenue - cost), calculated automatically")
    
    class Meta:
        model = Order
        fields = [
            'user', 'cargo', 'route', 'planned_date', 'vehicle', 'driver', 'status',
            'origin', 'destination',
            'cargo_type', 'weight', 'temperature', 'special_requirements',
            'loading_date', 'unloading_date', 'cost', 'revenue', 'profit'
        ]
    
    def validate(self, data):
        """Validate order data"""
        # Validate that unloading_date is after loading_date
        loading_date = data.get('loading_date')
        unloading_date = data.get('unloading_date')
        
        if loading_date and unloading_date:
            if unloading_date <= loading_date:
                raise serializers.ValidationError({
                    'unloading_date': 'Unloading date must be after loading date.'
                })
        
        # Validate that weight is positive
        weight = data.get('weight')
        if weight is not None and weight <= 0:
            raise serializers.ValidationError({
                'weight': 'Weight must be greater than 0.'
            })
        
        return data
    
    def create(self, validated_data):
        """Create order and auto-calculate cost, revenue, and profit based on route distance"""
        route = validated_data.get('route')
        
        # ALWAYS auto-calculate financial fields based on route distance
        if route and route.distance_km:
            distance_km = route.distance_km
            
            # Formula: (distance_km * 0.8 + distance_km/100*30*6.15) * 1.1
            calculated_cost = (distance_km * 0.8 + distance_km / 100 * 30 * 6.15) * 1.1
            validated_data['cost'] = round(calculated_cost, 2)
            
            # Calculate revenue (cost + 30%)
            validated_data['revenue'] = round(calculated_cost * 1.3, 2)
            
            # Calculate profit
            validated_data['profit'] = round(validated_data['revenue'] - validated_data['cost'], 2)
        else:
            # If no route or distance, set to 0 to avoid NULL
            validated_data['cost'] = 0.0
            validated_data['revenue'] = 0.0
            validated_data['profit'] = 0.0
        
        return super().create(validated_data)
    
    def update(self, instance, validated_data):
        """Update order and recalculate cost, revenue, profit based on route distance"""
        route = validated_data.get('route', instance.route)
        
        # ALWAYS auto-recalculate financial fields based on route distance
        if route and route.distance_km:
            distance_km = route.distance_km
            
            # Formula: (distance_km * 0.8 + distance_km/100*30*6.15) * 1.1
            calculated_cost = (distance_km * 0.8 + distance_km / 100 * 30 * 6.15) * 1.1
            validated_data['cost'] = round(calculated_cost, 2)
            
            # Calculate revenue (cost + 30%)
            validated_data['revenue'] = round(calculated_cost * 1.3, 2)
            
            # Calculate profit
            validated_data['profit'] = round(validated_data['revenue'] - validated_data['cost'], 2)
        else:
            # If no route or distance, set to 0 to avoid NULL
            validated_data['cost'] = 0.0
            validated_data['revenue'] = 0.0
            validated_data['profit'] = 0.0
        
        return super().update(instance, validated_data)


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
