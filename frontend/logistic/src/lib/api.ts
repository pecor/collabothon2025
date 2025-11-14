import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Export api instance for direct use
export { api };

// Types
export interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  license_c: boolean;
  license_ce: boolean;
  license_adr: boolean;
  forklift_certified: boolean;
  is_active: boolean;
}

export interface Vehicle {
  id: number;
  registration_no: string;
  type: 'refrigerated' | 'box' | 'cargo';
  capacity_weight: number;
  capacity_volume: number;
  has_forklift: boolean;
  status: 'available' | 'in_transit' | 'maintenance';
  current_driver: number | null;
  current_driver_name?: string;
}

export interface Route {
  id: number;
  origin: string;
  destination: string;
  distance_km: number;
  estimated_time: string;
  holiday_blocked: boolean;
  status: 'planned' | 'in_progress' | 'completed';
}

export interface Cargo {
  id: number;
  name: string;
  length: number;
  width: number;
  height: number;
  weight: number;
  requires_cold: boolean;
  requires_box: boolean;
  requires_crate: boolean;
  forklift_needed: boolean;
  license_c_required: boolean;
  license_ce_required: boolean;
  license_adr_required: boolean;
  special_training: string[];
}

export interface Order {
  id: number;
  user: number;
  user_name?: string;
  cargo: number;
  cargo_name?: string;
  cargo_type?: string;
  route: number;
  route_info?: string;
  vehicle: number | null;
  vehicle_info?: string;
  driver: number | null;
  driver_name?: string;
  status: 'new' | 'assigned' | 'in_transit' | 'completed' | 'cancelled';
  creation_date: string;
  planned_date: string;
  actual_end_date: string | null;
  temperature: string;
  weight: number;
  special_requirements: string;
  loading_date: string;
  unloading_date: string;
  cost?: number;
  revenue?: number;
  profit?: number;
}

export interface Tracker {
  id: number;
  vehicle: number;
  vehicle_info?: {
    registration_no: string;
    type: string;
    status: string;
  };
  current_location: string;
  distance_to_dest_km: number;
  estimated_arrival: string;
  tracking_points: Record<string, any>;
}

export interface Holiday {
  id: number;
  date: string;
  country: string;
  description: string;
  license_c_allowed: number;
  license_ce_allowed: number;
  license_adr_allowed: number;
}

export interface DashboardStats {
  orders: {
    total: number;
    active: number;
    completed: number;
    pending: number;
  };
  vehicles: {
    available: number;
    in_transit: number;
    total: number;
  };
  drivers: {
    active: number;
    total: number;
  };
}

export interface OrderAssignmentResult {
  order_id: number;
  assigned_vehicle: Vehicle;
  assigned_driver: User;
  estimated_profit: number;
  estimated_revenue: number;
  warnings: string[];
  assignment_reasons: string[];
}

// API Functions

// Dashboard
export const getDashboardStats = async (): Promise<DashboardStats> => {
  const response = await api.get('/dashboard/stats/');
  return response.data;
};

// Users/Drivers
export const getUsers = async (): Promise<User[]> => {
  const response = await api.get('/users/');
  return response.data;
};

export const getUser = async (id: number): Promise<User> => {
  const response = await api.get(`/users/${id}/`);
  return response.data;
};

export const getAvailableDrivers = async (params?: {
  date?: string;
  license_c?: boolean;
  license_ce?: boolean;
  license_adr?: boolean;
  forklift_certified?: boolean;
}): Promise<User[]> => {
  const response = await api.get('/users/available_drivers/', { params });
  return response.data;
};

export const getDriverStatistics = async (id: number) => {
  const response = await api.get(`/users/${id}/statistics/`);
  return response.data;
};

// Vehicles
export const getVehicles = async (): Promise<Vehicle[]> => {
  const response = await api.get('/vehicles/');
  return response.data;
};

export const getVehicle = async (id: number): Promise<Vehicle> => {
  const response = await api.get(`/vehicles/${id}/`);
  return response.data;
};

export const getAvailableVehicles = async (params?: {
  date?: string;
  type?: string;
  min_capacity_weight?: number;
  min_capacity_volume?: number;
  requires_forklift?: boolean;
}): Promise<Vehicle[]> => {
  const response = await api.get('/vehicles/available_vehicles/', { params });
  return response.data;
};

export const getVehicleStatistics = async (id: number) => {
  const response = await api.get(`/vehicles/${id}/statistics/`);
  return response.data;
};

// Routes
export const getRoutes = async (): Promise<Route[]> => {
  const response = await api.get('/routes/');
  return response.data;
};

export const getRoute = async (id: number): Promise<Route> => {
  const response = await api.get(`/routes/${id}/`);
  return response.data;
};

export const searchRoutes = async (origin?: string, destination?: string): Promise<Route[]> => {
  const response = await api.get('/routes/search/', {
    params: { origin, destination },
  });
  return response.data;
};

export const optimizeRoute = async (data: {
  origin: string;
  destination: string;
  cargo_ids: number[];
  planned_date: string;
  optimize_for?: 'profit' | 'time' | 'distance';
}) => {
  const response = await api.post('/routes/optimize/', data);
  return response.data;
};

// Cargo
export const getCargos = async (): Promise<Cargo[]> => {
  const response = await api.get('/cargos/');
  return response.data;
};

export const getCargo = async (id: number): Promise<Cargo> => {
  const response = await api.get(`/cargos/${id}/`);
  return response.data;
};

export const getCargoRequirements = async (id: number) => {
  const response = await api.get(`/cargos/${id}/requirements/`);
  return response.data;
};

// Orders
export const getOrders = async (): Promise<Order[]> => {
  const response = await api.get('/orders/');
  return response.data;
};

export const getOrder = async (id: number): Promise<Order> => {
  const response = await api.get(`/orders/${id}/`);
  return response.data;
};

export const getPendingOrders = async (): Promise<Order[]> => {
  const response = await api.get('/orders/pending/');
  return response.data;
};

export const getActiveOrders = async (): Promise<Order[]> => {
  const response = await api.get('/orders/active/');
  return response.data;
};

export const createOrder = async (data: {
  user: number;
  cargo: number;
  route: number;
  planned_date: string;
  vehicle?: number;
  driver?: number;
  status?: string;
}): Promise<Order> => {
  const response = await api.post('/orders/', data);
  return response.data;
};

export const assignOrder = async (id: number): Promise<OrderAssignmentResult> => {
  const response = await api.post(`/orders/${id}/assign/`);
  return response.data;
};

export const completeOrder = async (id: number): Promise<Order> => {
  const response = await api.post(`/orders/${id}/complete/`);
  return response.data;
};

export const calculateProfit = async (data: {
  order_id?: number;
  route_id?: number;
  cargo_id?: number;
  vehicle_id?: number;
  distance_km?: number;
  estimated_revenue?: number;
}) => {
  const response = await api.post('/orders/calculate_profit/', data);
  return response.data;
};

// Trackers
export const getTrackers = async (): Promise<Tracker[]> => {
  const response = await api.get('/trackers/');
  return response.data;
};

export const getActiveTrackers = async (): Promise<Tracker[]> => {
  const response = await api.get('/trackers/active/');
  return response.data;
};

export const updateTrackerLocation = async (
  id: number,
  data: {
    location?: string;
    distance_to_dest_km?: number;
  }
): Promise<Tracker> => {
  const response = await api.post(`/trackers/${id}/update_location/`, data);
  return response.data;
};

// Holidays
export const getHolidays = async (): Promise<Holiday[]> => {
  const response = await api.get('/holidays/');
  return response.data;
};

export const checkHolidayRestrictions = async (date: string, country: string = 'PL') => {
  const response = await api.get('/holidays/check_date/', {
    params: { date, country },
  });
  return response.data;
};

export const getUpcomingHolidays = async (country: string = 'PL', days: number = 30): Promise<Holiday[]> => {
  const response = await api.get('/holidays/upcoming/', {
    params: { country, days },
  });
  return response.data;
};

// Select/Dropdown Options
export const getOrderStatusOptions = async (): Promise<{ choices: Array<{ value: string; label: string }> }> => {
  const response = await api.get('/orders/select-status/');
  return response.data;
};

export const getCargoTypeOptions = async (): Promise<{ choices: string[] }> => {
  const response = await api.get('/orders/select-cargo-type/');
  return response.data;
};

export const getTemperatureOptions = async (): Promise<{ choices: string[] }> => {
  const response = await api.get('/orders/select-temperature/');
  return response.data;
};

export const getSpecialRequirementsOptions = async (): Promise<{ choices: string[] }> => {
  const response = await api.get('/orders/select-special-requirements/');
  return response.data;
};

export const getVehicleTypeOptions = async (): Promise<{ choices: Array<{ value: string; label: string }> }> => {
  const response = await api.get('/vehicles/select-type/');
  return response.data;
};

export const getVehicleStatusOptions = async (): Promise<{ choices: Array<{ value: string; label: string }> }> => {
  const response = await api.get('/vehicles/select-status/');
  return response.data;
};

export const getRouteStatusOptions = async (): Promise<{ choices: Array<{ value: string; label: string }> }> => {
  const response = await api.get('/routes/select-status/');
  return response.data;
};

export const getHolidayLicenseAllowedOptions = async (): Promise<{ choices: Array<{ value: number; label: string }> }> => {
  const response = await api.get('/holidays/select-license-allowed/');
  return response.data;
};

export default api;
