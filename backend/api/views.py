from rest_framework import viewsets, status
from rest_framework.decorators import api_view, action
from rest_framework.response import Response
from django.db.models import Q, Count, Avg
from datetime import datetime, timedelta
from .models import User, Vehicle, Route, Cargo, Order, Tracker, Holiday, TransportLaw
from .serializers import (
    UserSerializer, VehicleSerializer, RouteSerializer, CargoSerializer,
    OrderSerializer, OrderCreateSerializer, TrackerSerializer, HolidaySerializer,
    OrderAssignmentSerializer, VehicleAvailabilitySerializer, DriverAvailabilitySerializer,
    RouteOptimizationSerializer, ProfitCalculationSerializer, TransportLawSerializer
)


@api_view(['GET'])
def health_check(request):
    """Simple health check endpoint"""
    return Response({
        'status': 'ok',
        'message': 'Django backend is running!'
    })


class UserViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing drivers/operators
    """
    queryset = User.objects.all()
    serializer_class = UserSerializer
    
    @action(detail=False, methods=['get'])
    def available_drivers(self, request):
        """Get available drivers based on criteria"""
        date = request.query_params.get('date')
        license_c = request.query_params.get('license_c', 'false').lower() == 'true'
        license_ce = request.query_params.get('license_ce', 'false').lower() == 'true'
        license_adr = request.query_params.get('license_adr', 'false').lower() == 'true'
        forklift = request.query_params.get('forklift_certified', 'false').lower() == 'true'
        
        drivers = User.objects.filter(is_active=True)
        
        if license_c:
            drivers = drivers.filter(license_c=True)
        if license_ce:
            drivers = drivers.filter(license_ce=True)
        if license_adr:
            drivers = drivers.filter(license_adr=True)
        if forklift:
            drivers = drivers.filter(forklift_certified=True)
        
        # Filter out drivers already assigned on the given date
        if date:
            assigned_drivers = Order.objects.filter(
                planned_date=date,
                status__in=['assigned', 'in_transit']
            ).values_list('driver_id', flat=True)
            drivers = drivers.exclude(id__in=assigned_drivers)
        
        serializer = self.get_serializer(drivers, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def statistics(self, request, pk=None):
        """Get driver statistics"""
        driver = self.get_object()
        orders = Order.objects.filter(driver=driver)
        
        stats = {
            'total_orders': orders.count(),
            'completed_orders': orders.filter(status='completed').count(),
            'in_progress_orders': orders.filter(status='in_transit').count(),
            'cancelled_orders': orders.filter(status='cancelled').count(),
            'licenses': {
                'license_c': driver.license_c,
                'license_ce': driver.license_ce,
                'license_adr': driver.license_adr,
                'forklift_certified': driver.forklift_certified
            }
        }
        return Response(stats)


class VehicleViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing vehicles
    """
    queryset = Vehicle.objects.all()
    serializer_class = VehicleSerializer
    
    @action(detail=False, methods=['get'])
    def available_vehicles(self, request):
        """Get available vehicles based on criteria"""
        date = request.query_params.get('date')
        vehicle_type = request.query_params.get('type')
        min_weight = request.query_params.get('min_capacity_weight')
        min_volume = request.query_params.get('min_capacity_volume')
        requires_forklift = request.query_params.get('requires_forklift', 'false').lower() == 'true'
        
        vehicles = Vehicle.objects.filter(status='available')
        
        if vehicle_type:
            vehicles = vehicles.filter(type=vehicle_type)
        if min_weight:
            vehicles = vehicles.filter(capacity_weight__gte=float(min_weight))
        if min_volume:
            vehicles = vehicles.filter(capacity_volume__gte=float(min_volume))
        if requires_forklift:
            vehicles = vehicles.filter(has_forklift=True)
        
        # Filter out vehicles already assigned on the given date
        if date:
            assigned_vehicles = Order.objects.filter(
                planned_date=date,
                status__in=['assigned', 'in_transit']
            ).values_list('vehicle_id', flat=True)
            vehicles = vehicles.exclude(id__in=assigned_vehicles)
        
        serializer = self.get_serializer(vehicles, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def statistics(self, request, pk=None):
        """Get vehicle statistics"""
        vehicle = self.get_object()
        orders = Order.objects.filter(vehicle=vehicle)
        
        stats = {
            'total_orders': orders.count(),
            'completed_orders': orders.filter(status='completed').count(),
            'in_progress_orders': orders.filter(status='in_transit').count(),
            'current_status': vehicle.status,
            'specifications': {
                'type': vehicle.type,
                'capacity_weight': vehicle.capacity_weight,
                'capacity_volume': vehicle.capacity_volume,
                'has_forklift': vehicle.has_forklift
            }
        }
        return Response(stats)


class RouteViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing routes
    """
    queryset = Route.objects.all()
    serializer_class = RouteSerializer
    
    @action(detail=False, methods=['get'])
    def search(self, request):
        """Search routes by origin/destination"""
        origin = request.query_params.get('origin', '')
        destination = request.query_params.get('destination', '')
        
        routes = Route.objects.all()
        
        if origin:
            routes = routes.filter(origin__icontains=origin)
        if destination:
            routes = routes.filter(destination__icontains=destination)
        
        serializer = self.get_serializer(routes, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['post'])
    def optimize(self, request):
        """Optimize route selection based on criteria"""
        serializer = RouteOptimizationSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        # Mock optimization logic - would be replaced with AI algorithm
        routes = Route.objects.filter(
            origin__icontains=serializer.validated_data['origin'],
            destination__icontains=serializer.validated_data['destination']
        )
        
        if serializer.validated_data['optimize_for'] == 'distance':
            routes = routes.order_by('distance_km')
        elif serializer.validated_data['optimize_for'] == 'time':
            routes = routes.order_by('estimated_time')
        
        route_serializer = RouteSerializer(routes, many=True)
        return Response({
            'optimized_routes': route_serializer.data,
            'optimization_type': serializer.validated_data['optimize_for']
        })


class CargoViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing cargo items
    """
    queryset = Cargo.objects.all()
    serializer_class = CargoSerializer
    
    @action(detail=True, methods=['get'])
    def requirements(self, request, pk=None):
        """Get cargo requirements summary"""
        cargo = self.get_object()
        
        requirements = {
            'vehicle_requirements': {
                'requires_cold': cargo.requires_cold,
                'requires_box': cargo.requires_box,
                'requires_crate': cargo.requires_crate,
                'forklift_needed': cargo.forklift_needed,
                'min_weight_capacity': cargo.weight,
                'min_volume_capacity': (cargo.length * cargo.width * cargo.height) / 1000000
            },
            'driver_requirements': {
                'license_c_required': cargo.license_c_required,
                'license_ce_required': cargo.license_ce_required,
                'license_adr_required': cargo.license_adr_required,
                'special_training': cargo.special_training
            },
            'suggested_vehicle_type': 'refrigerated' if cargo.requires_cold else 'box' if cargo.requires_box else 'cargo'
        }
        
        return Response(requirements)


class OrderViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing orders with AI-powered assignment
    """
    queryset = Order.objects.all()
    
    def get_serializer_class(self):
        if self.action == 'create':
            return OrderCreateSerializer
        return OrderSerializer
    
    @action(detail=False, methods=['get'])
    def pending(self, request):
        """Get pending orders (new status)"""
        orders = Order.objects.filter(status='new')
        serializer = OrderSerializer(orders, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def active(self, request):
        """Get active orders (assigned or in transit)"""
        orders = Order.objects.filter(status__in=['assigned', 'in_transit'])
        serializer = OrderSerializer(orders, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def assign(self, request, pk=None):
        """
        AI-powered automatic assignment of driver and vehicle to order
        This is the core TruckAI functionality
        """
        order = self.get_object()
        
        # Check if order is already assigned
        if order.status != 'new':
            return Response(
                {'error': 'Order is already assigned or completed'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Get cargo requirements
        cargo = order.cargo
        route = order.route
        planned_date = order.planned_date
        
        # Calculate volume from dimensions (length * width * height in cm³, convert to m³)
        cargo_volume = (cargo.length * cargo.width * cargo.height) / 1000000
        
        # Find compatible vehicles
        compatible_vehicles = Vehicle.objects.filter(
            status='available',
            capacity_weight__gte=cargo.weight,
            capacity_volume__gte=cargo_volume
        )
        
        # Filter by vehicle type requirements
        if cargo.requires_cold:
            compatible_vehicles = compatible_vehicles.filter(type='refrigerated')
        elif cargo.requires_box:
            compatible_vehicles = compatible_vehicles.filter(type='box')
        
        if cargo.forklift_needed:
            compatible_vehicles = compatible_vehicles.filter(has_forklift=True)
        
        # Exclude vehicles already assigned on this date
        assigned_vehicles = Order.objects.filter(
            planned_date=planned_date,
            status__in=['assigned', 'in_transit']
        ).values_list('vehicle_id', flat=True)
        compatible_vehicles = compatible_vehicles.exclude(id__in=assigned_vehicles)
        
        # Find compatible drivers
        compatible_drivers = User.objects.filter(is_active=True)
        
        if cargo.license_c_required:
            compatible_drivers = compatible_drivers.filter(license_c=True)
        if cargo.license_ce_required:
            compatible_drivers = compatible_drivers.filter(license_ce=True)
        if cargo.license_adr_required:
            compatible_drivers = compatible_drivers.filter(license_adr=True)
        if cargo.forklift_needed:
            compatible_drivers = compatible_drivers.filter(forklift_certified=True)
        
        # Exclude drivers already assigned on this date
        assigned_drivers = Order.objects.filter(
            planned_date=planned_date,
            status__in=['assigned', 'in_transit']
        ).values_list('driver_id', flat=True)
        compatible_drivers = compatible_drivers.exclude(id__in=assigned_drivers)
        
        # Check for holiday restrictions
        warnings = []
        holiday_check = Holiday.objects.filter(
            date=planned_date,
            country__in=['PL', 'DE']  # Add more countries as needed
        )
        
        if holiday_check.exists():
            for holiday in holiday_check:
                if cargo.license_c_required and holiday.license_c_allowed == 0:
                    warnings.append(f"Category C transport restricted on {holiday.date} ({holiday.description})")
                if cargo.license_ce_required and holiday.license_ce_allowed == 0:
                    warnings.append(f"Category C+E transport restricted on {holiday.date} ({holiday.description})")
                if cargo.license_adr_required and holiday.license_adr_allowed == 0:
                    warnings.append(f"ADR transport restricted on {holiday.date} ({holiday.description})")
        
        # If warnings exist and route is holiday blocked, reject assignment
        if warnings and route.holiday_blocked:
            return Response({
                'error': 'Cannot assign order due to holiday restrictions',
                'warnings': warnings,
                'suggested_action': 'Change planned date or route'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        # Check if we have compatible resources
        if not compatible_vehicles.exists():
            return Response({
                'error': 'No compatible vehicles available',
                'reasons': [
                    f"Requires: {'refrigerated' if cargo.requires_cold else 'box' if cargo.requires_box else 'cargo'} type",
                    f"Min weight capacity: {cargo.weight} kg",
                    f"Min volume capacity: {(cargo.length * cargo.width * cargo.height) / 1000000} m³",
                    f"Forklift required: {cargo.forklift_needed}"
                ]
            }, status=status.HTTP_404_NOT_FOUND)
        
        if not compatible_drivers.exists():
            return Response({
                'error': 'No compatible drivers available',
                'reasons': [
                    f"License C required: {cargo.license_c_required}",
                    f"License C+E required: {cargo.license_ce_required}",
                    f"ADR required: {cargo.license_adr_required}",
                    f"Forklift certified: {cargo.forklift_needed}"
                ]
            }, status=status.HTTP_404_NOT_FOUND)
        
        # Select best vehicle and driver (simplified - would use AI scoring)
        selected_vehicle = compatible_vehicles.first()
        selected_driver = compatible_drivers.first()
        
        # Calculate estimated profit (simplified formula)
        # Real implementation would use AI model
        base_rate = 2.5  # PLN per km
        estimated_revenue = route.distance_km * base_rate
        fuel_cost = route.distance_km * 0.8  # PLN per km
        driver_cost = 500  # Daily rate
        estimated_profit = estimated_revenue - fuel_cost - driver_cost
        
        # Assign to order
        order.vehicle = selected_vehicle
        order.driver = selected_driver
        order.status = 'assigned'
        order.save()
        
        # Update vehicle status
        selected_vehicle.status = 'in_transit'
        selected_vehicle.current_driver = selected_driver
        selected_vehicle.save()
        
        response_data = {
            'order_id': order.id,
            'assigned_vehicle': VehicleSerializer(selected_vehicle).data,
            'assigned_driver': UserSerializer(selected_driver).data,
            'estimated_profit': round(estimated_profit, 2),
            'estimated_revenue': round(estimated_revenue, 2),
            'warnings': warnings,
            'assignment_reasons': [
                f"Vehicle {selected_vehicle.registration_no} meets all requirements",
                f"Driver {selected_driver.name} has required licenses",
                f"Both available on {planned_date}"
            ]
        }
        
        return Response(response_data)
    
    @action(detail=True, methods=['post'])
    def complete(self, request, pk=None):
        """Mark order as completed"""
        order = self.get_object()
        
        if order.status != 'in_transit':
            return Response(
                {'error': 'Order must be in transit to be completed'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        order.status = 'completed'
        order.actual_end_date = datetime.now()
        order.save()
        
        # Update vehicle status
        if order.vehicle:
            order.vehicle.status = 'available'
            order.vehicle.current_driver = None
            order.vehicle.save()
        
        serializer = OrderSerializer(order)
        return Response(serializer.data)
    
    @action(detail=False, methods=['post'])
    def calculate_profit(self, request):
        """Calculate estimated profit for a potential order"""
        serializer = ProfitCalculationSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        data = serializer.validated_data
        
        # Simplified profit calculation
        base_rate = 2.5
        distance = data.get('distance_km', 0)
        revenue = data.get('estimated_revenue', distance * base_rate)
        
        fuel_cost = distance * 0.8
        driver_cost = 500
        maintenance_cost = distance * 0.2
        
        total_cost = fuel_cost + driver_cost + maintenance_cost
        profit = revenue - total_cost
        margin = (profit / revenue * 100) if revenue > 0 else 0
        
        return Response({
            'estimated_revenue': round(revenue, 2),
            'estimated_costs': {
                'fuel': round(fuel_cost, 2),
                'driver': driver_cost,
                'maintenance': round(maintenance_cost, 2),
                'total': round(total_cost, 2)
            },
            'estimated_profit': round(profit, 2),
            'profit_margin_percent': round(margin, 2)
        })


class TrackerViewSet(viewsets.ModelViewSet):
    """
    ViewSet for real-time vehicle tracking
    """
    queryset = Tracker.objects.all()
    serializer_class = TrackerSerializer
    
    @action(detail=False, methods=['get'])
    def active(self, request):
        """Get all active trackers"""
        active_vehicles = Vehicle.objects.filter(status='in_transit')
        trackers = Tracker.objects.filter(vehicle__in=active_vehicles)
        serializer = self.get_serializer(trackers, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['post'])
    def update_location(self, request, pk=None):
        """Update tracker location"""
        tracker = self.get_object()
        
        location = request.data.get('location')
        distance_remaining = request.data.get('distance_to_dest_km')
        
        if location:
            tracker.current_location = location
        if distance_remaining is not None:
            tracker.distance_to_dest_km = distance_remaining
            
            # Update ETA based on remaining distance (simplified)
            avg_speed = 80  # km/h
            hours_remaining = distance_remaining / avg_speed
            tracker.estimated_arrival = datetime.now() + timedelta(hours=hours_remaining)
        
        # Add to tracking history
        if not tracker.tracking_points:
            tracker.tracking_points = {}
        
        tracker.tracking_points[str(datetime.now())] = {
            'location': location,
            'distance_remaining': distance_remaining
        }
        
        tracker.save()
        
        serializer = self.get_serializer(tracker)
        return Response(serializer.data)


class HolidayViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing holidays and transport restrictions
    """
    queryset = Holiday.objects.all()
    serializer_class = HolidaySerializer
    
    @action(detail=False, methods=['get'])
    def check_date(self, request):
        """Check if a specific date has transport restrictions"""
        date = request.query_params.get('date')
        country = request.query_params.get('country', 'PL')
        
        if not date:
            return Response({'error': 'Date parameter is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        holidays = Holiday.objects.filter(date=date, country=country)
        
        if not holidays.exists():
            return Response({
                'date': date,
                'country': country,
                'is_holiday': False,
                'restrictions': None
            })
        
        holiday = holidays.first()
        return Response({
            'date': date,
            'country': country,
            'is_holiday': True,
            'description': holiday.description,
            'restrictions': {
                'license_c_allowed': holiday.license_c_allowed == 1,
                'license_ce_allowed': holiday.license_ce_allowed == 1,
                'license_adr_allowed': holiday.license_adr_allowed == 1
            }
        })
    
    @action(detail=False, methods=['get'])
    def upcoming(self, request):
        """Get upcoming holidays"""
        country = request.query_params.get('country', 'PL')
        days = int(request.query_params.get('days', 30))
        
        start_date = datetime.now().date()
        end_date = start_date + timedelta(days=days)
        
        holidays = Holiday.objects.filter(
            country=country,
            date__gte=start_date,
            date__lte=end_date
        )
        
        serializer = self.get_serializer(holidays, many=True)
        return Response(serializer.data)


@api_view(['GET'])
def dashboard_stats(request):
    """Get dashboard statistics"""
    total_orders = Order.objects.count()
    active_orders = Order.objects.filter(status__in=['assigned', 'in_transit']).count()
    completed_orders = Order.objects.filter(status='completed').count()
    pending_orders = Order.objects.filter(status='new').count()
    
    available_vehicles = Vehicle.objects.filter(status='available').count()
    in_transit_vehicles = Vehicle.objects.filter(status='in_transit').count()
    
    active_drivers = User.objects.filter(is_active=True).count()
    
    return Response({
        'orders': {
            'total': total_orders,
            'active': active_orders,
            'completed': completed_orders,
            'pending': pending_orders
        },
        'vehicles': {
            'available': available_vehicles,
            'in_transit': in_transit_vehicles,
            'total': Vehicle.objects.count()
        },
        'drivers': {
            'active': active_drivers,
            'total': User.objects.count()
        }
    })


class TransportLawViewSet(viewsets.ReadOnlyModelViewSet):
    """
    ViewSet for viewing transport law regulations by country
    Read-only as these are reference data imported from CSV
    """
    queryset = TransportLaw.objects.all()
    serializer_class = TransportLawSerializer
    lookup_field = 'country'
    
    @action(detail=False, methods=['get'])
    def by_country(self, request):
        """Get transport law by country name (case-insensitive)"""
        country = request.query_params.get('country', '').strip()
        if not country:
            return Response(
                {'error': 'Country parameter is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        try:
            law = TransportLaw.objects.get(country__iexact=country)
            serializer = self.get_serializer(law)
            return Response(serializer.data)
        except TransportLaw.DoesNotExist:
            return Response(
                {'error': f'Transport law not found for country: {country}'},
                status=status.HTTP_404_NOT_FOUND
            )
    
    @action(detail=False, methods=['get'])
    def countries(self, request):
        """Get list of all available countries"""
        countries = TransportLaw.objects.values_list('country', flat=True).order_by('country')
        return Response({'countries': list(countries)})
