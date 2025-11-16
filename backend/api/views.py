from rest_framework import viewsets, status
from rest_framework.decorators import api_view, action
from rest_framework.response import Response
from django.db.models import Q
from datetime import datetime, timedelta
import googlemaps
from django.conf import settings
from drf_spectacular.utils import extend_schema, OpenApiExample
import os
import imaplib
import email
from email.header import decode_header
from .models import User, Vehicle, Route, Cargo, Order, Tracker, Holiday, TransportLaw
from .serializers import (
    UserSerializer, VehicleSerializer, RouteSerializer, CargoSerializer,
    OrderSerializer, OrderCreateSerializer, TrackerSerializer, HolidaySerializer,
    RouteOptimizationSerializer, ProfitCalculationSerializer, TransportLawSerializer,
    RouteCalculationSerializer
)
from .ai_matching import ai_score_drivers


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
    queryset = User.objects.select_related('current_vehicle').all()
    serializer_class = UserSerializer
    
    def get_queryset(self):
        """Filter drivers by location and vehicle if provided"""
        queryset = User.objects.select_related('current_vehicle').all()
        
        # Filter by country
        country = self.request.query_params.get('country')
        if country:
            queryset = queryset.filter(current_country__icontains=country)
        
        # Filter by city
        city = self.request.query_params.get('city')
        if city:
            queryset = queryset.filter(current_city__icontains=city)
        
        # Filter by vehicle
        vehicle_id = self.request.query_params.get('vehicle_id')
        if vehicle_id:
            queryset = queryset.filter(current_vehicle_id=vehicle_id)
        
        # Filter by has vehicle
        has_vehicle = self.request.query_params.get('has_vehicle')
        if has_vehicle:
            if has_vehicle.lower() == 'true':
                queryset = queryset.filter(current_vehicle__isnull=False)
            elif has_vehicle.lower() == 'false':
                queryset = queryset.filter(current_vehicle__isnull=True)
        
        return queryset
    
    @action(detail=False, methods=['get'])
    def available_drivers(self, request):
        """Get available drivers based on criteria"""
        date = request.query_params.get('date')
        license_c = request.query_params.get('license_c', 'false').lower() == 'true'
        license_ce = request.query_params.get('license_ce', 'false').lower() == 'true'
        license_adr = request.query_params.get('license_adr', 'false').lower() == 'true'
        forklift = request.query_params.get('forklift_certified', 'false').lower() == 'true'
        country = request.query_params.get('country')
        city = request.query_params.get('city')
        vehicle_id = request.query_params.get('vehicle_id')
        
        drivers = User.objects.filter(is_active=True).select_related('current_vehicle')
        
        if license_c:
            drivers = drivers.filter(license_c=True)
        if license_ce:
            drivers = drivers.filter(license_ce=True)
        if license_adr:
            drivers = drivers.filter(license_adr=True)
        if forklift:
            drivers = drivers.filter(forklift_certified=True)
        if country:
            drivers = drivers.filter(current_country__icontains=country)
        if city:
            drivers = drivers.filter(current_city__icontains=city)
        if vehicle_id:
            drivers = drivers.filter(current_vehicle_id=vehicle_id)
        
        # Filter out drivers already assigned on the given date
        if date:
            assigned_drivers = Order.objects.filter(
                planned_date=date,
                status__in=['assigned', 'in_transit']
            ).select_related('driver').values_list('driver_id', flat=True)
            drivers = drivers.exclude(id__in=assigned_drivers)
        
        serializer = self.get_serializer(drivers, many=True)
        return Response(serializer.data)
    
    @extend_schema(
        summary='Get drivers by location',
        description='Get drivers filtered by country and/or city',
        responses={
            200: {
                'type': 'array',
                'items': {'$ref': '#/components/schemas/User'}
            }
        }
    )
    @action(detail=False, methods=['get'], url_path='by-location')
    def by_location(self, request):
        """Get drivers by location (country and/or city)"""
        country = request.query_params.get('country')
        city = request.query_params.get('city')
        
        drivers = User.objects.filter(is_active=True).select_related('current_vehicle')
        
        if country:
            drivers = drivers.filter(current_country__icontains=country)
        if city:
            drivers = drivers.filter(current_city__icontains=city)
        
        serializer = self.get_serializer(drivers, many=True)
        return Response(serializer.data)
    
    @extend_schema(
        summary='Get drivers by vehicle',
        description='Get drivers assigned to a specific vehicle',
        responses={
            200: {
                'type': 'array',
                'items': {'$ref': '#/components/schemas/User'}
            }
        }
    )
    @action(detail=False, methods=['get'], url_path='by-vehicle')
    def by_vehicle(self, request):
        """Get drivers assigned to a specific vehicle"""
        vehicle_id = request.query_params.get('vehicle_id')
        
        if not vehicle_id:
            return Response(
                {'error': 'vehicle_id parameter is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        drivers = User.objects.filter(
            current_vehicle_id=vehicle_id,
            is_active=True
        ).select_related('current_vehicle')
        
        serializer = self.get_serializer(drivers, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def statistics(self, request, pk=None):
        """Get driver statistics"""
        driver = self.get_object()
        orders = Order.objects.filter(driver=driver).select_related('route', 'cargo', 'user', 'vehicle')
        
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
            },
            'current_location': {
                'country': driver.current_country,
                'city': driver.current_city
            },
            'current_vehicle': {
                'id': driver.current_vehicle.id if driver.current_vehicle else None,
                'registration_no': driver.current_vehicle.registration_no if driver.current_vehicle else None,
                'type': driver.current_vehicle.type if driver.current_vehicle else None
            } if driver.current_vehicle else None
        }
        return Response(stats)


class VehicleViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing vehicles
    """
    queryset = Vehicle.objects.select_related('current_driver').all()
    serializer_class = VehicleSerializer
    
    def get_queryset(self):
        """Filter vehicles by driver if provided"""
        queryset = Vehicle.objects.select_related('current_driver').all()
        
        # Filter by driver
        driver_id = self.request.query_params.get('driver_id')
        if driver_id:
            queryset = queryset.filter(current_driver_id=driver_id)
        
        # Filter by has driver
        has_driver = self.request.query_params.get('has_driver')
        if has_driver:
            if has_driver.lower() == 'true':
                queryset = queryset.filter(current_driver__isnull=False)
            elif has_driver.lower() == 'false':
                queryset = queryset.filter(current_driver__isnull=True)
        
        return queryset
    
    @extend_schema(
        summary='Get available vehicle types',
        description='Returns all available vehicle type choices',
        responses={
            200: {
                'type': 'object',
                'properties': {
                    'choices': {
                        'type': 'array',
                        'items': {
                            'type': 'object',
                            'properties': {
                                'value': {'type': 'string'},
                                'label': {'type': 'string'}
                            }
                        }
                    }
                }
            }
        }
    )
    @action(detail=False, methods=['get'], url_path='select-type')
    def select_type(self, request):
        """Get available vehicle type choices"""
        choices = [
            {'value': value, 'label': label}
            for value, label in Vehicle.TYPE_CHOICES
        ]
        return Response({'choices': choices})
    
    @extend_schema(
        summary='Get available vehicle statuses',
        description='Returns all available vehicle status choices',
        responses={
            200: {
                'type': 'object',
                'properties': {
                    'choices': {
                        'type': 'array',
                        'items': {
                            'type': 'object',
                            'properties': {
                                'value': {'type': 'string'},
                                'label': {'type': 'string'}
                            }
                        }
                    }
                }
            }
        }
    )
    @action(detail=False, methods=['get'], url_path='select-status')
    def select_status(self, request):
        """Get available vehicle status choices"""
        choices = [
            {'value': value, 'label': label}
            for value, label in Vehicle.STATUS_CHOICES
        ]
        return Response({'choices': choices})
    
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
            ).select_related('vehicle').values_list('vehicle_id', flat=True)
            vehicles = vehicles.exclude(id__in=assigned_vehicles)
        
        serializer = self.get_serializer(vehicles, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def statistics(self, request, pk=None):
        """Get vehicle statistics"""
        vehicle = self.get_object()
        orders = Order.objects.filter(vehicle=vehicle).select_related('route', 'cargo', 'user', 'driver')
        
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
    
    @extend_schema(
        summary='Get available route statuses',
        description='Returns all available route status choices',
        responses={
            200: {
                'type': 'object',
                'properties': {
                    'choices': {
                        'type': 'array',
                        'items': {
                            'type': 'object',
                            'properties': {
                                'value': {'type': 'string'},
                                'label': {'type': 'string'}
                            }
                        }
                    }
                }
            }
        }
    )
    @action(detail=False, methods=['get'], url_path='select-status')
    def select_status(self, request):
        """Get available route status choices"""
        choices = [
            {'value': value, 'label': label}
            for value, label in Route.STATUS_CHOICES
        ]
        return Response({'choices': choices})
    
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
    
    @extend_schema(
        summary='Optimize route selection',
        description='Optimize route selection based on criteria (profit, time, or distance)',
        request=RouteOptimizationSerializer,
        examples=[
            OpenApiExample(
                'Optimize for profit',
                value={
                    'origin': 'Warsaw, Poland',
                    'destination': 'Berlin, Germany',
                    'cargo_ids': [1, 2, 3],
                    'planned_date': '2025-12-01',
                    'optimize_for': 'profit'
                },
                request_only=True,
            ),
            OpenApiExample(
                'Optimize for distance',
                value={
                    'origin': 'Krakow, Poland',
                    'destination': 'Prague, Czech Republic',
                    'cargo_ids': [4, 5],
                    'planned_date': '2025-12-05',
                    'optimize_for': 'distance'
                },
                request_only=True,
            ),
            OpenApiExample(
                'Optimize for time',
                value={
                    'origin': 'Gdansk, Poland',
                    'destination': 'Stockholm, Sweden',
                    'cargo_ids': [6],
                    'planned_date': '2025-12-10',
                    'optimize_for': 'time'
                },
                request_only=True,
            ),
        ],
        responses={
            200: {
                'type': 'object',
                'properties': {
                    'optimized_routes': {
                        'type': 'array',
                        'items': {'$ref': '#/components/schemas/Route'}
                    },
                    'optimization_type': {'type': 'string'}
                }
            }
        }
    )
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
    
    def get_queryset(self):
        """Filter orders by origin and destination if provided"""
        queryset = Order.objects.select_related('route', 'cargo', 'user', 'vehicle', 'driver').all()
        
        # Filter by origin
        origin = self.request.query_params.get('origin')
        if origin:
            queryset = queryset.filter(origin__icontains=origin)
        
        # Filter by destination
        destination = self.request.query_params.get('destination')
        if destination:
            queryset = queryset.filter(destination__icontains=destination)
        
        return queryset
    
    def get_serializer_class(self):
        if self.action == 'create':
            return OrderCreateSerializer
        return OrderSerializer
    
    @extend_schema(
        summary='Get available order statuses',
        description='Returns all available order status choices for dropdown/buttons',
        responses={
            200: {
                'type': 'object',
                'properties': {
                    'choices': {
                        'type': 'array',
                        'items': {
                            'type': 'object',
                            'properties': {
                                'value': {'type': 'string'},
                                'label': {'type': 'string'}
                            }
                        }
                    }
                }
            }
        }
    )
    @action(detail=False, methods=['get'], url_path='select-status')
    def select_status(self, request):
        """Get available order status choices"""
        choices = [
            {'value': value, 'label': label}
            for value, label in Order.STATUS_CHOICES
        ]
        return Response({'choices': choices})
    
    @extend_schema(
        summary='Get available cargo types',
        description='Returns unique cargo types from existing orders plus common examples',
        responses={
            200: {
                'type': 'object',
                'properties': {
                    'choices': {
                        'type': 'array',
                        'items': {'type': 'string'}
                    }
                }
            }
        }
    )
    @action(detail=False, methods=['get'], url_path='select-cargo-type')
    def select_cargo_type(self, request):
        """Get available cargo types (unique from database + common examples)"""
        # Get unique cargo types from existing orders
        existing_types = Order.objects.values_list('cargo_type', flat=True).distinct()
        existing_types = [ct for ct in existing_types if ct]  # Filter out None/empty
        
        # Common cargo types (from help_text examples)
        common_types = [
            'Pallets',
            'Boxes',
            'Chemicals',
            'Electronics',
            'Food Products',
            'Machinery',
            'Textiles',
            'Pharmaceuticals',
            'Furniture',
            'Automotive Parts',
            'Fresh Vegetables',
            'Frozen Goods',
            'Liquids',
            'Construction Materials',
            'Paper Products',
        ]
        
        # Combine and remove duplicates, sort alphabetically
        all_types = sorted(set(existing_types + common_types))
        
        return Response({'choices': all_types})
    
    @extend_schema(
        summary='Get available temperature options',
        description='Returns common temperature options for cargo transport',
        responses={
            200: {
                'type': 'object',
                'properties': {
                    'choices': {
                        'type': 'array',
                        'items': {'type': 'string'}
                    }
                }
            }
        }
    )
    @action(detail=False, methods=['get'], url_path='select-temperature')
    def select_temperature(self, request):
        """Get available temperature options"""
        # Get unique temperatures from existing orders
        existing_temps = Order.objects.values_list('temperature', flat=True).distinct()
        existing_temps = [t for t in existing_temps if t]  # Filter out None/empty
        
        # Common temperature options (from help_text examples)
        common_temps = [
            'Ambient',
            '2 to 4',
            '2 to 8',
            '-18 to -20',
            '-15 to -18',
            '-2 to 0',
            '0 to 4',
            '15 to 20',
            'Frozen',
            'Refrigerated',
            'Cool',
            'Room Temperature',
        ]
        
        # Combine and remove duplicates, sort with Ambient first
        all_temps = sorted(set(existing_temps + common_temps), key=lambda x: (x != 'Ambient', x))
        
        return Response({'choices': all_temps})
    
    @extend_schema(
        summary='Get available special requirements',
        description='Returns common special requirements options',
        responses={
            200: {
                'type': 'object',
                'properties': {
                    'choices': {
                        'type': 'array',
                        'items': {'type': 'string'}
                    }
                }
            }
        }
    )
    @action(detail=False, methods=['get'], url_path='select-special-requirements')
    def select_special_requirements(self, request):
        """Get available special requirements options"""
        # Get unique special requirements from existing orders
        existing_reqs = Order.objects.values_list('special_requirements', flat=True).distinct()
        existing_reqs = [r for r in existing_reqs if r]  # Filter out None/empty
        
        # Common special requirements (from help_text examples)
        common_reqs = [
            'ADR',
            'Forklift',
            'Tarpaulin',
            'Refrigerated',
            'Refrigerated ADR',
            'Forklift Tarpaulin',
            'Hazardous Materials',
            'Oversized Load',
            'Fragile',
            'High Value',
            'Time Sensitive',
            'Customs Documentation',
        ]
        
        # Combine and remove duplicates, sort alphabetically
        all_reqs = sorted(set(existing_reqs + common_reqs))
        
        return Response({'choices': all_reqs})
    
    @action(detail=False, methods=['get'])
    def pending(self, request):
        """Get pending orders (new status)"""
        orders = Order.objects.filter(status='new').select_related('route', 'cargo', 'user', 'vehicle', 'driver')
        serializer = OrderSerializer(orders, many=True)
        return Response(serializer.data)
    
    @extend_schema(
        summary='Get orders by assignment status',
        description='Get orders grouped by assignment status - returns assigned orders (with driver and vehicle) and unassigned orders',
        responses={
            200: {
                'type': 'object',
                'properties': {
                    'assigned': {
                        'type': 'object',
                        'properties': {
                            'count': {'type': 'integer'},
                            'orders': {
                                'type': 'array',
                                'items': {'$ref': '#/components/schemas/Order'}
                            }
                        }
                    },
                    'unassigned': {
                        'type': 'object',
                        'properties': {
                            'count': {'type': 'integer'},
                            'orders': {
                                'type': 'array',
                                'items': {'$ref': '#/components/schemas/Order'}
                            }
                        }
                    },
                    'summary': {
                        'type': 'object',
                        'properties': {
                            'total_assigned': {'type': 'integer'},
                            'total_unassigned': {'type': 'integer'},
                            'total_orders': {'type': 'integer'}
                        }
                    }
                }
            }
        }
    )
    @action(detail=False, methods=['get'])
    def assignment_status(self, request):
        """
        Get orders grouped by assignment status
        Returns assigned orders (with driver and vehicle) and unassigned orders
        """
        # Orders with both driver and vehicle assigned
        assigned_orders = Order.objects.filter(
            driver__isnull=False,
            vehicle__isnull=False
        ).select_related('driver', 'vehicle', 'cargo', 'route', 'user')
        
        # Orders without driver or vehicle (or both)
        unassigned_orders = Order.objects.filter(
            Q(driver__isnull=True) | Q(vehicle__isnull=True)
        ).select_related('driver', 'vehicle', 'cargo', 'route', 'user')
        
        assigned_serializer = OrderSerializer(assigned_orders, many=True)
        unassigned_serializer = OrderSerializer(unassigned_orders, many=True)
        
        return Response({
            'assigned': {
                'count': assigned_orders.count(),
                'orders': assigned_serializer.data
            },
            'unassigned': {
                'count': unassigned_orders.count(),
                'orders': unassigned_serializer.data
            },
            'summary': {
                'total_assigned': assigned_orders.count(),
                'total_unassigned': unassigned_orders.count(),
                'total_orders': Order.objects.count()
            }
        })
    
    @action(detail=False, methods=['get'])
    def active(self, request):
        """Get active orders (assigned or in transit)"""
        orders = Order.objects.filter(status__in=['assigned', 'in_transit']).select_related('route', 'cargo', 'user', 'vehicle', 'driver')
        serializer = OrderSerializer(orders, many=True)
        return Response(serializer.data)
    
    @action(detail=True, methods=['get'])
    def preview_assignment(self, request, pk=None):
        """
        Preview AI driver matching without actually assigning the order
        Shows which drivers would be selected and their scores
        """
        order = self.get_object()
        cargo = order.cargo
        
        # Find compatible drivers (same logic as assign())
        compatible_drivers = User.objects.filter(is_active=True).select_related('current_vehicle')
        
        needs_adr = (order.special_requirements and 'adr' in order.special_requirements.lower()) or cargo.license_adr_required
        needs_forklift = (order.special_requirements and 'forklift' in order.special_requirements.lower()) or cargo.forklift_needed
        
        if cargo.license_c_required:
            compatible_drivers = compatible_drivers.filter(license_c=True)
        if cargo.license_ce_required:
            compatible_drivers = compatible_drivers.filter(license_ce=True)
        if needs_adr:
            compatible_drivers = compatible_drivers.filter(license_adr=True)
        if needs_forklift:
            compatible_drivers = compatible_drivers.filter(forklift_certified=True)
        
        # Exclude already assigned drivers
        assigned_drivers = Order.objects.filter(
            planned_date=order.planned_date,
            status__in=['assigned', 'in_transit']
        ).values_list('driver_id', flat=True)
        compatible_drivers = compatible_drivers.exclude(id__in=assigned_drivers)
        
        if not compatible_drivers.exists():
            return Response({
                'error': 'No compatible drivers available',
                'compatible_count': 0,
                'candidates': []
            })
        
        # Get AI scores
        driver_scores = ai_score_drivers(order, compatible_drivers)
        
        # Add driver details to response
        driver_ids = [s['driver_id'] for s in driver_scores]
        drivers = User.objects.filter(id__in=driver_ids).select_related('current_vehicle')
        driver_map = {d.id: d for d in drivers}
        
        candidates = []
        for score_data in driver_scores[:10]:  # Top 10
            driver = driver_map.get(score_data['driver_id'])
            if driver:
                candidates.append({
                    'rank': len(candidates) + 1,
                    'driver': UserSerializer(driver).data,
                    'score': score_data['score'],
                    'reason': score_data['reason'],
                    'distance_to_origin_km': score_data.get('distance_km'),
                    'has_vehicle': driver.current_vehicle is not None,
                    'vehicle': VehicleSerializer(driver.current_vehicle).data if driver.current_vehicle else None
                })
        
        # Format response compatible with OrderAssignmentResult interface
        best_candidate = candidates[0] if candidates else None
        
        return Response({
            'order_id': order.id,
            'assigned_driver': best_candidate['driver'] if best_candidate else None,
            'assigned_vehicle': best_candidate['vehicle'] if best_candidate else None,
            'estimated_profit': order.profit or 0,
            'estimated_revenue': order.revenue or 0,
            'warnings': [],
            'assignment_reasons': [best_candidate['reason']] if best_candidate else [],
            # Additional data for UI
            'candidates': candidates,
            'compatible_count': compatible_drivers.count(),
            'best_match': best_candidate
        })
    
    @action(detail=True, methods=['post'])
    def calculate_financials(self, request, pk=None):
        """Calculate and update cost, revenue, profit for an order based on route distance"""
        order = self.get_object()
        route = order.route
        
        if not route or not route.distance_km:
            return Response(
                {'error': 'Order must have a route with distance to calculate financials'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        distance_km = route.distance_km
        
        # Formula: (distance_km * 0.8 + distance_km/100*30*6.15) * 1.1
        calculated_cost = (distance_km * 0.8 + distance_km / 100 * 30 * 6.15) * 1.1
        order.cost = round(calculated_cost, 2)
        
        # Calculate revenue (cost + 30%)
        order.revenue = round(calculated_cost * 1.3, 2)
        
        # Calculate profit
        order.profit = round(order.revenue - order.cost, 2)
        
        order.save()
        
        return Response({
            'success': True,
            'message': 'Financial values calculated successfully',
            'distance_km': distance_km,
            'cost': order.cost,
            'revenue': order.revenue,
            'profit': order.profit
        })
    
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
        
        # Use order weight if available, otherwise use cargo weight
        order_weight = order.weight if order.weight is not None else cargo.weight
        
        # Calculate volume from dimensions (length * width * height in cm³, convert to m³)
        cargo_volume = (cargo.length * cargo.width * cargo.height) / 1000000
        
        # Find compatible vehicles
        compatible_vehicles = Vehicle.objects.filter(
            status='available',
            capacity_weight__gte=order_weight,
            capacity_volume__gte=cargo_volume
        )
        
        # Filter by vehicle type requirements
        # Check temperature requirement from order or cargo
        requires_cold = (order.temperature is not None and 'ambient' not in order.temperature.lower()) if order.temperature else cargo.requires_cold
        if requires_cold:
            compatible_vehicles = compatible_vehicles.filter(type='refrigerated')
        elif cargo.requires_box:
            compatible_vehicles = compatible_vehicles.filter(type='box')
        
        # Check special requirements for forklift
        needs_forklift = (order.special_requirements and 'forklift' in order.special_requirements.lower()) or cargo.forklift_needed
        if needs_forklift:
            compatible_vehicles = compatible_vehicles.filter(has_forklift=True)
        
        # Exclude vehicles already assigned on this date
        assigned_vehicles = Order.objects.filter(
            planned_date=planned_date,
            status__in=['assigned', 'in_transit']
        ).select_related('vehicle').values_list('vehicle_id', flat=True)
        compatible_vehicles = compatible_vehicles.exclude(id__in=assigned_vehicles)
        
        # Find compatible drivers
        compatible_drivers = User.objects.filter(is_active=True).select_related('current_vehicle')
        
        # Check special requirements for licenses
        needs_adr = (order.special_requirements and 'adr' in order.special_requirements.lower()) or cargo.license_adr_required
        needs_forklift_driver = needs_forklift
        
        if cargo.license_c_required:
            compatible_drivers = compatible_drivers.filter(license_c=True)
        if cargo.license_ce_required:
            compatible_drivers = compatible_drivers.filter(license_ce=True)
        if needs_adr:
            compatible_drivers = compatible_drivers.filter(license_adr=True)
        if needs_forklift_driver:
            compatible_drivers = compatible_drivers.filter(forklift_certified=True)
        
        # Exclude drivers already assigned on this date
        assigned_drivers = Order.objects.filter(
            planned_date=planned_date,
            status__in=['assigned', 'in_transit']
        ).select_related('driver').values_list('driver_id', flat=True)
        compatible_drivers = compatible_drivers.exclude(id__in=assigned_drivers)
        
        # Prefer drivers with assigned vehicles
        # Also prefer drivers in the origin country/city
        # Use origin from Order if available, otherwise from Route
        origin_str = (order.origin or (route.origin if route else '')).lower()
        origin_country = None
        origin_city = None
        
        # Try to extract country and city from origin (simple heuristic)
        # This could be enhanced with geocoding
        if 'poland' in origin_str or 'polska' in origin_str or 'warsaw' in origin_str or 'krakow' in origin_str:
            origin_country = 'Poland'
        elif 'germany' in origin_str or 'niemcy' in origin_str or 'berlin' in origin_str or 'munich' in origin_str:
            origin_country = 'Germany'
        elif 'czech' in origin_str or 'prague' in origin_str:
            origin_country = 'Czech Republic'
        
        # Prefer drivers in origin country and with assigned vehicles
        # We'll sort manually after fetching to prioritize correctly
        if origin_country:
            # Annotate to prioritize drivers in origin country
            from django.db.models import Case, When, IntegerField
            compatible_drivers = compatible_drivers.annotate(
                location_match=Case(
                    When(current_country__iexact=origin_country, then=1),
                    default=0,
                    output_field=IntegerField()
                ),
                has_vehicle=Case(
                    When(current_vehicle__isnull=False, then=1),
                    default=0,
                    output_field=IntegerField()
                )
            ).order_by('-location_match', '-has_vehicle')
        else:
            # Just prefer drivers with assigned vehicles
            compatible_drivers = compatible_drivers.order_by('-current_vehicle_id')
        
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
                    f"Requires: {'refrigerated' if requires_cold else 'box' if cargo.requires_box else 'cargo'} type",
                    f"Min weight capacity: {order_weight} kg",
                    f"Min volume capacity: {(cargo.length * cargo.width * cargo.height) / 1000000} m³",
                    f"Forklift required: {needs_forklift}"
                ]
            }, status=status.HTTP_404_NOT_FOUND)
        
        if not compatible_drivers.exists():
            return Response({
                'error': 'No compatible drivers available',
                'reasons': [
                    f"License C required: {cargo.license_c_required}",
                    f"License C+E required: {cargo.license_ce_required}",
                    f"ADR required: {needs_adr}",
                    f"Forklift certified: {needs_forklift_driver}"
                ]
            }, status=status.HTTP_404_NOT_FOUND)
        
        # ==========================================
        # 🚀 AI-POWERED DRIVER MATCHING
        # ==========================================
        # Use Granite AI to score and select the best driver
        driver_scores = ai_score_drivers(order, compatible_drivers)
        
        # Get the best match (highest score)
        best_driver_match = driver_scores[0] if driver_scores else None
        
        if not best_driver_match:
            # Fallback to first driver if AI fails
            selected_driver = compatible_drivers.first()
            ai_used = False
            ai_score = None
            ai_reason = "AI matching unavailable, used fallback"
        else:
            selected_driver = User.objects.get(id=best_driver_match['driver_id'])
            ai_used = True
            ai_score = best_driver_match['score']
            ai_reason = best_driver_match['reason']
        
        # Select vehicle
        selected_vehicle = None
        
        # First, try to use driver's assigned vehicle if it's compatible
        if selected_driver.current_vehicle and selected_driver.current_vehicle in compatible_vehicles:
            if selected_driver.current_vehicle.id not in assigned_vehicles:
                selected_vehicle = selected_driver.current_vehicle
        
        # If no vehicle from driver, select first compatible vehicle
        if not selected_vehicle:
            selected_vehicle = compatible_vehicles.first()
        
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
        
        # Update vehicle status and link to driver
        selected_vehicle.status = 'in_transit'
        selected_vehicle.current_driver = selected_driver
        selected_vehicle.save()
        
        # Update driver's current vehicle assignment (if not already set)
        if selected_driver.current_vehicle != selected_vehicle:
            selected_driver.current_vehicle = selected_vehicle
            selected_driver.save()
        
        # Build response with AI matching details
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
            ],
            'ai_matching': {
                'used': ai_used,
                'score': ai_score,
                'reason': ai_reason,
                'distance_to_origin_km': best_driver_match.get('distance_km') if best_driver_match else None,
                'all_candidates': driver_scores[:5] if len(driver_scores) > 1 else []  # Top 5 alternatives
            }
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
        active_vehicles = Vehicle.objects.filter(status='in_transit').select_related('current_driver')
        trackers = Tracker.objects.filter(vehicle__in=active_vehicles).select_related('vehicle')
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
    
    @extend_schema(
        summary='Get available license restriction options',
        description='Returns available license restriction/allowed choices',
        responses={
            200: {
                'type': 'object',
                'properties': {
                    'choices': {
                        'type': 'array',
                        'items': {
                            'type': 'object',
                            'properties': {
                                'value': {'type': 'integer'},
                                'label': {'type': 'string'}
                            }
                        }
                    }
                }
            }
        }
    )
    @action(detail=False, methods=['get'], url_path='select-license-allowed')
    def select_license_allowed(self, request):
        """Get available license allowed/restricted choices"""
        choices = [
            {'value': value, 'label': label}
            for value, label in [(0, 'Restricted'), (1, 'Allowed')]
        ]
        return Response({'choices': choices})
    
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


@extend_schema(
    request=RouteCalculationSerializer,
    responses={
        200: {
            'type': 'object',
            'properties': {
                'origin': {
                    'type': 'object',
                    'properties': {
                        'address': {'type': 'string'},
                        'formatted_address': {'type': 'string'},
                        'coordinates': {
                            'type': 'object',
                            'properties': {
                                'lat': {'type': 'number'},
                                'lng': {'type': 'number'}
                            }
                        }
                    }
                },
                'destination': {
                    'type': 'object',
                    'properties': {
                        'address': {'type': 'string'},
                        'formatted_address': {'type': 'string'},
                        'coordinates': {
                            'type': 'object',
                            'properties': {
                                'lat': {'type': 'number'},
                                'lng': {'type': 'number'}
                            }
                        }
                    }
                },
                'distance_km': {'type': 'number'},
                'distance_miles': {'type': 'number'},
                'distance_meters': {'type': 'integer'},
                'estimated_time_seconds': {'type': 'integer'},
                'estimated_time_hours': {'type': 'number'},
                'estimated_time_formatted': {'type': 'string'},
                'countries': {
                    'type': 'array',
                    'items': {'type': 'string'}
                },
                'cities': {
                    'type': 'array',
                    'items': {
                        'type': 'object',
                        'properties': {
                            'name': {'type': 'string'},
                            'country': {'type': 'string'},
                            'coordinates': {
                                'type': 'object',
                                'properties': {
                                    'lat': {'type': 'number'},
                                    'lng': {'type': 'number'}
                                }
                            }
                        }
                    }
                },
                'waypoints': {
                    'type': 'array',
                    'items': {
                        'type': 'object',
                        'properties': {
                            'lat': {'type': 'number'},
                            'lng': {'type': 'number'}
                        }
                    }
                },
                'route_summary': {'type': 'string'},
                'summary': {
                    'type': 'object',
                    'properties': {
                        'total_countries': {'type': 'integer'},
                        'total_cities': {'type': 'integer'},
                        'total_waypoints': {'type': 'integer'},
                        'average_speed_kmh': {'type': 'number'}
                    }
                },
                'route_options': {
                    'type': 'object',
                    'properties': {
                        'avoid_tolls': {'type': 'boolean'},
                        'avoid_highways': {'type': 'boolean'},
                        'avoid_ferries': {'type': 'boolean'}
                    }
                }
            }
        },
        400: {
            'type': 'object',
            'properties': {
                'error': {'type': 'string'},
                'message': {'type': 'string'}
            }
        },
        500: {
            'type': 'object',
            'properties': {
                'error': {'type': 'string'},
                'message': {'type': 'string'},
                'details': {'type': 'string'}
            }
        }
    },
    summary='Calculate route between two addresses',
    description='Calculate route, distance, estimated time, and countries/cities passed through using Google Maps API',
    examples=[
        OpenApiExample(
            'Example Request',
            value={
                'origin_address': 'Warsaw, Poland',
                'destination_address': 'Berlin, Germany',
                'avoid_tolls': False,
                'avoid_highways': False,
                'avoid_ferries': False
            },
            request_only=True
        ),
        OpenApiExample(
            'Example Response',
            value={
                'origin': {
                    'address': 'Warsaw, Poland',
                    'formatted_address': 'Warsaw, Poland',
                    'coordinates': {'lat': 52.2297, 'lng': 21.0122}
                },
                'destination': {
                    'address': 'Berlin, Germany',
                    'formatted_address': 'Berlin, Germany',
                    'coordinates': {'lat': 52.5200, 'lng': 13.4050}
                },
                'distance_km': 574.23,
                'distance_miles': 356.45,
                'distance_meters': 574230,
                'estimated_time_seconds': 25860,
                'estimated_time_hours': 7.18,
                'estimated_time_formatted': '7h 11min',
                'countries': ['Germany', 'Poland'],
                'cities': [
                    {
                        'name': 'Poznań',
                        'country': 'Poland',
                        'coordinates': {'lat': 52.4064, 'lng': 16.9252}
                    }
                ],
                'waypoints': [
                    {'lat': 52.2297, 'lng': 21.0122},
                    {'lat': 52.4064, 'lng': 16.9252}
                ],
                'route_summary': 'A2 and A1',
                'summary': {
                    'total_countries': 2,
                    'total_cities': 1,
                    'total_waypoints': 150,
                    'average_speed_kmh': 80.0
                },
                'route_options': {
                    'avoid_tolls': False,
                    'avoid_highways': False,
                    'avoid_ferries': False
                }
            },
            response_only=True
        )
    ]
)
@api_view(['POST'])
def calculate_route(request):
    """
    Calculate route between two addresses using Google Maps API.
    Returns distance, estimated time, countries/cities passed through, and AI-analyzed transport regulations.
    
    The endpoint now includes AI analysis of transport regulations for each country on the route,
    providing critical requirements like:
    - Hotel/rest requirements for drivers
    - Weekend driving bans
    - Required certificates (A1, posting declarations)
    - Toll system requirements
    - Winter tire requirements
    - Special warnings and restrictions
    """
    serializer = RouteCalculationSerializer(data=request.data)
    serializer.is_valid(raise_exception=True)
    
    origin = serializer.validated_data['origin_address']
    destination = serializer.validated_data['destination_address']
    avoid_tolls = serializer.validated_data.get('avoid_tolls', False)
    avoid_highways = serializer.validated_data.get('avoid_highways', False)
    avoid_ferries = serializer.validated_data.get('avoid_ferries', False)
    
    # Check if Google Maps API key is configured
    api_key = settings.GOOGLE_MAPS_API_KEY
    if not api_key:
        return Response({
            'error': 'Google Maps API key is not configured',
            'message': 'Please set GOOGLE_MAPS_API_KEY environment variable'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    
    try:
        # Initialize Google Maps client
        gmaps = googlemaps.Client(key=api_key)
        
        # Step 1: Geocode addresses to get coordinates
        origin_geocode = gmaps.geocode(origin)
        dest_geocode = gmaps.geocode(destination)
        
        if not origin_geocode or not dest_geocode:
            return Response({
                'error': 'Could not geocode one or both addresses',
                'origin_found': origin_geocode is not None and len(origin_geocode) > 0,
                'destination_found': dest_geocode is not None and len(dest_geocode) > 0
            }, status=status.HTTP_400_BAD_REQUEST)
        
        origin_location = origin_geocode[0]['geometry']['location']
        dest_location = dest_geocode[0]['geometry']['location']
        
        # Step 2: Calculate route using Google Directions API
        avoid_list = []
        if avoid_tolls:
            avoid_list.append('tolls')
        if avoid_highways:
            avoid_list.append('highways')
        if avoid_ferries:
            avoid_list.append('ferries')
        
        directions_result = gmaps.directions(
            origin=origin,
            destination=destination,
            mode='driving',
            avoid=avoid_list if avoid_list else None,
            alternatives=False
        )
        
        if not directions_result or len(directions_result) == 0:
            return Response({
                'error': 'Could not calculate route',
                'message': 'Google Maps could not find a route between the addresses'
            }, status=status.HTTP_400_BAD_REQUEST)
        
        route = directions_result[0]
        leg = route['legs'][0]
        
        # Extract route information
        distance_meters = leg['distance']['value']
        distance_km = distance_meters / 1000
        duration_seconds = leg['duration']['value']
        duration_hours = duration_seconds / 3600
        
        # Extract steps for waypoints
        steps = leg.get('steps', [])
        waypoints = []
        for step in steps:
            start_location = step['start_location']
            waypoints.append({
                'lat': start_location['lat'],
                'lng': start_location['lng']
            })
        
        # Add destination as final waypoint
        if waypoints:
            end_location = leg['end_location']
            waypoints.append({
                'lat': end_location['lat'],
                'lng': end_location['lng']
            })
        
        # Step 3: Extract countries and cities from route using reverse geocoding
        countries_passed = set()
        countries_info = []  # List with order and details
        cities_passed = []
        seen_countries = set()  # Track countries to maintain order
        
        # Sample waypoints to avoid too many API calls (but get enough to detect all countries)
        sample_waypoints = waypoints[::max(1, len(waypoints) // 20)][:15]
        
        for idx, waypoint in enumerate(sample_waypoints):
            try:
                reverse_geocode = gmaps.reverse_geocode((waypoint['lat'], waypoint['lng']))
                if reverse_geocode:
                    address_components = reverse_geocode[0].get('address_components', [])
                    
                    # Extract country with code
                    country_name = None
                    country_code = None
                    for component in address_components:
                        if 'country' in component.get('types', []):
                            country_name = component['long_name']
                            country_code = component['short_name']
                            countries_passed.add(country_name)
                            
                            # Add to countries_info if not seen before (maintain order)
                            if country_code not in seen_countries:
                                seen_countries.add(country_code)
                                countries_info.append({
                                    'name': country_name,
                                    'code': country_code,
                                    'order': len(countries_info) + 1,
                                    'coordinates': waypoint
                                })
                            break
                    
                    # Extract city
                    city_name = None
                    for component in address_components:
                        if any(t in component.get('types', []) for t in ['locality', 'administrative_area_level_2', 'administrative_area_level_1']):
                            city_name = component['long_name']
                            break
                    
                    if city_name:
                        cities_passed.append({
                            'name': city_name,
                            'country': country_name or '',
                            'country_code': country_code or '',
                            'coordinates': waypoint,
                            'order': idx + 1
                        })
            except Exception as e:
                print(f"Reverse geocoding error for waypoint: {e}")
                continue
        
        # Remove duplicate cities while maintaining order
        seen_cities = set()
        unique_cities = []
        for city in cities_passed:
            key = (city.get('name', ''), city.get('country_code', ''))
            if key not in seen_cities:
                seen_cities.add(key)
                unique_cities.append(city)
        
        # Format addresses
        origin_formatted = origin_geocode[0].get('formatted_address', origin)
        dest_formatted = dest_geocode[0].get('formatted_address', destination)
        
        # Analyze transport regulations for countries on route using AI
        from .ai_extraction import analyze_route_regulations
        countries_codes_list = [c['code'] for c in countries_info]
        regulations_analysis = analyze_route_regulations(
            countries_codes=countries_codes_list,
            distance_km=distance_km,
            estimated_time_hours=duration_hours
        )
        
        return Response({
            'origin': {
                'address': origin,
                'formatted_address': origin_formatted,
                'coordinates': {
                    'lat': origin_location['lat'],
                    'lng': origin_location['lng']
                }
            },
            'destination': {
                'address': destination,
                'formatted_address': dest_formatted,
                'coordinates': {
                    'lat': dest_location['lat'],
                    'lng': dest_location['lng']
                }
            },
            'distance_km': round(distance_km, 2),
            'distance_miles': round(distance_km * 0.621371, 2),
            'distance_meters': distance_meters,
            'estimated_time_seconds': duration_seconds,
            'estimated_time_hours': round(duration_hours, 2),
            'estimated_time_formatted': format_duration(duration_seconds),
            'countries': sorted(list(countries_passed)),  # Simple list for backward compatibility
            'countries_passed': countries_info,  # Detailed info with order and codes
            'cities': unique_cities,
            'waypoints': waypoints,
            'route_summary': route.get('summary', ''),
            'summary': {
                'total_countries': len(countries_passed),
                'countries_list': [c['name'] for c in countries_info],  # Countries in order of travel
                'countries_codes': [c['code'] for c in countries_info],  # Country codes in order
                'total_cities': len(unique_cities),
                'total_waypoints': len(waypoints),
                'average_speed_kmh': round(distance_km / duration_hours, 2) if duration_hours > 0 else 0
            },
            'route_options': {
                'avoid_tolls': avoid_tolls,
                'avoid_highways': avoid_highways,
                'avoid_ferries': avoid_ferries
            },
            'transport_regulations': {
                'analysis_status': 'success' if regulations_analysis.get('success') else 'partial',
                'countries_analyzed': regulations_analysis.get('countries_analyzed', 0),
                'regulations': regulations_analysis.get('regulations', []),
                'error': regulations_analysis.get('error') if not regulations_analysis.get('success') else None
            }
        })
        
    except googlemaps.exceptions.ApiError as e:
        return Response({
            'error': 'Google Maps API error',
            'message': str(e),
            'details': 'Check your API key and billing status'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    except Exception as e:
        return Response({
            'error': str(e),
            'message': 'Error calculating route'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


def format_duration(seconds):
    """
    Format duration in seconds to human-readable string
    """
    hours = int(seconds // 3600)
    minutes = int((seconds % 3600) // 60)
    
    if hours > 0:
        return f"{hours}h {minutes}min"
    return f"{minutes}min"


@api_view(['POST'])
def extract_order_from_email(request):
    """
    Extract order data from email content using Granite AI
    
    Expects:
    {
        "email_content": "string - raw email text"
    }
    
    Returns:
    {
        "success": true,
        "data": {
            "cargo_name": "...",
            "cargo_type": "...",
            "weight": 24000,
            "temperature": "Ambient",
            "special_requirements": "...",
            "loading_address": "Warsaw",
            "unloading_address": "Berlin",
            "loading_date": "2025-11-20",
            "unloading_date": "2025-11-22",
            "adr_required": false,
            "vehicle_type": "Curtain-side"
        }
    }
    """
    from .ai_extraction import extract_order_data_from_email
    
    email_content = request.data.get('email_content', '')
    
    if not email_content or len(email_content.strip()) < 10:
        return Response({
            'success': False,
            'error': 'Email content is required and must be at least 10 characters'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    # Extract data using Granite AI
    extracted_data = extract_order_data_from_email(email_content)
    
    if not extracted_data.get('success', True):
        return Response({
            'success': False,
            'error': extracted_data.get('error', 'Failed to extract data'),
            'raw_response': extracted_data.get('raw_response', ''),
            'data': {
                k: v for k, v in extracted_data.items() 
                if k not in ['success', 'error', 'raw_response', 'raw_ai_response']
            }
        }, status=status.HTTP_200_OK)  # Still return 200 with partial data
    
    return Response({
        'success': True,
        'data': {
            k: v for k, v in extracted_data.items() 
            if k not in ['success', 'error', 'raw_response', 'raw_ai_response']
        },
        'raw_ai_response': extracted_data.get('raw_ai_response', '') if settings.DEBUG else None
    })

@api_view(['GET', 'POST'])
def fetch_and_extract_latest_email(request):
    """
    Connect to IMAP server, fetch the latest email, and extract order data using AI
    
    Uses environment variables for IMAP configuration:
    - IMAP_HOST: IMAP server hostname (e.g., 'imap.gmail.com')
    - IMAP_PORT: IMAP server port (default: 993 for SSL, 143 for non-SSL)
    - IMAP_USERNAME: Email username
    - IMAP_PASSWORD: Email password or app password
    - IMAP_USE_SSL: Use SSL/TLS (default: True)
    - IMAP_MAILBOX: Mailbox to check (default: 'INBOX')
    
    Returns:
    {
        "success": true,
        "email_subject": "...",
        "email_from": "...",
        "email_date": "...",
        "data": {
            "cargo_name": "...",
            "cargo_type": "...",
            ...
        }
    }
    """
    from .ai_extraction import extract_order_data_from_email
    
    imap_host = os.getenv('IMAP_HOST', '')
    imap_port = int(os.getenv('IMAP_PORT', '993'))
    imap_username = os.getenv('IMAP_USERNAME', '')
    imap_password = os.getenv('IMAP_PASSWORD', '')
    imap_use_ssl = os.getenv('IMAP_USE_SSL', 'True').lower() == 'true'
    imap_mailbox = os.getenv('IMAP_MAILBOX', 'INBOX')
    
    if not imap_host or not imap_username or not imap_password:
        return Response({
            'success': False,
            'error': 'IMAP configuration missing. Please set IMAP_HOST, IMAP_USERNAME, and IMAP_PASSWORD environment variables.'
        }, status=status.HTTP_400_BAD_REQUEST)
    
    mail = None
    try:
        if imap_use_ssl:
            mail = imaplib.IMAP4_SSL(imap_host, imap_port)
        else:
            mail = imaplib.IMAP4(imap_host, imap_port)
        
        mail.login(imap_username, imap_password)
        mail.select(imap_mailbox)
        
        status_code, messages = mail.search(None, 'ALL')
        if status_code != 'OK':
            return Response({
                'success': False,
                'error': f'Failed to search mailbox: {messages}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        email_ids = messages[0].split()
        if not email_ids:
            return Response({
                'success': False,
                'error': 'No emails found in mailbox'
            }, status=status.HTTP_404_NOT_FOUND)
        
        latest_email_id = email_ids[-1]
        status_code, msg_data = mail.fetch(latest_email_id, '(RFC822)')
        
        if status_code != 'OK':
            return Response({
                'success': False,
                'error': f'Failed to fetch email: {msg_data}'
            }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
        email_body = msg_data[0][1]
        email_message = email.message_from_bytes(email_body)
        
        subject = decode_header(email_message["Subject"])[0][0]
        if isinstance(subject, bytes):
            subject = subject.decode()
        
        from_addr = decode_header(email_message["From"])[0][0]
        if isinstance(from_addr, bytes):
            from_addr = from_addr.decode()
        
        email_date = email_message["Date"]
        
        email_content = ""
        if email_message.is_multipart():
            for part in email_message.walk():
                content_type = part.get_content_type()
                content_disposition = str(part.get("Content-Disposition"))
                
                if content_type == "text/plain" and "attachment" not in content_disposition:
                    try:
                        body = part.get_payload(decode=True)
                        charset = part.get_content_charset() or 'utf-8'
                        email_content = body.decode(charset)
                        break
                    except:
                        pass
                elif content_type == "text/html" and "attachment" not in content_disposition and not email_content:
                    try:
                        body = part.get_payload(decode=True)
                        charset = part.get_content_charset() or 'utf-8'
                        email_content = body.decode(charset)
                    except:
                        pass
        else:
            try:
                body = email_message.get_payload(decode=True)
                charset = email_message.get_content_charset() or 'utf-8'
                email_content = body.decode(charset)
            except:
                email_content = str(email_message.get_payload())
        
        if not email_content or len(email_content.strip()) < 10:
            return Response({
                'success': False,
                'error': 'Email content is empty or too short',
                'email_subject': subject,
                'email_from': from_addr,
                'email_date': email_date
            }, status=status.HTTP_400_BAD_REQUEST)
        
        extracted_data = extract_order_data_from_email(email_content)
        
        if not extracted_data.get('success', True):
            return Response({
                'success': False,
                'error': extracted_data.get('error', 'Failed to extract data'),
                'email_subject': subject,
                'email_from': from_addr,
                'email_date': email_date,
                'data': {
                    k: v for k, v in extracted_data.items() 
                    if k not in ['success', 'error', 'raw_response', 'raw_ai_response']
                }
            }, status=status.HTTP_200_OK)
        
        return Response({
            'success': True,
            'email_subject': subject,
            'email_from': from_addr,
            'email_date': email_date,
            'data': {
                k: v for k, v in extracted_data.items() 
                if k not in ['success', 'error', 'raw_response', 'raw_ai_response']
            },
            'raw_ai_response': extracted_data.get('raw_ai_response', '') if settings.DEBUG else None
        })
        
    except imaplib.IMAP4.error as e:
        return Response({
            'success': False,
            'error': f'IMAP error: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    except Exception as e:
        return Response({
            'success': False,
            'error': f'Unexpected error: {str(e)}'
        }, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
    finally:
        if mail:
            try:
                mail.close()
                mail.logout()
            except:
                pass

