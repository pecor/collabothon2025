import { X, MapPin, User, DollarSign, Package, Calendar, Truck, Calculator } from 'lucide-react'
import { type Order as ApiOrder } from '@/lib/api'
import { RouteMap } from './RouteMap'
import { useState } from 'react'
import api from '@/lib/api'

interface OrderModalProps {
  order: ApiOrder
  isOpen: boolean
  onClose: () => void
  onUpdate?: () => void
}

interface RouteData {
  cities?: Array<{ name: string; country: string }>
  waypoints?: Array<{ lat: number; lng: number }>
}

export function OrderModal({ order, isOpen, onClose, onUpdate }: OrderModalProps) {
  const [routeData, setRouteData] = useState<RouteData | null>(null)
  const [isCalculating, setIsCalculating] = useState(false)
  const [calculationMessage, setCalculationMessage] = useState<string | null>(null)

  if (!isOpen) return null

  const handleCalculateFinancials = async () => {
    setIsCalculating(true)
    setCalculationMessage(null)
    
    try {
      const response = await api.post(`/orders/${order.id}/calculate_financials/`)
      setCalculationMessage(`✓ Calculated: Cost ${response.data.cost} PLN, Revenue ${response.data.revenue} PLN, Profit ${response.data.profit} PLN`)
      
      // Refresh order data
      if (onUpdate) {
        setTimeout(() => {
          onUpdate()
          onClose()
        }, 1500)
      }
    } catch (error: any) {
      setCalculationMessage(`✗ Error: ${error.response?.data?.error || 'Failed to calculate'}`)
    } finally {
      setIsCalculating(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'bg-yellow-900/30 border-yellow-800 text-yellow-400'
      case 'assigned': return 'bg-blue-900/30 border-blue-800 text-blue-400'
      case 'in_transit': return 'bg-green-900/30 border-green-800 text-green-400'
      case 'completed': return 'bg-zinc-800 border-zinc-600 text-zinc-400'
      default: return 'bg-zinc-800 border-zinc-700 text-zinc-400'
    }
  }

  return (
    <>
      {/* Custom scrollbar styles */}
      <style>{`
        .custom-modal-scrollbar::-webkit-scrollbar {
          width: 12px;
          background: #18181b;
        }
        .custom-modal-scrollbar::-webkit-scrollbar-thumb {
          background: #3f3f46;
          border-radius: 8px;
          border: 3px solid #18181b;
        }
        .custom-modal-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #dc2626;
        }
        .custom-modal-scrollbar::-webkit-scrollbar-track {
          background: #09090b;
          border-radius: 8px;
        }
      `}</style>

      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 animate-in fade-in duration-200"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div 
          className="bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden pointer-events-auto animate-in zoom-in-95 duration-200"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-red-950 to-red-900 border-b border-red-800 p-6 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Truck className="h-6 w-6 text-red-300" />
                <h2 className="text-2xl font-bold text-white">
                  {order.cargo_name || `Shipment #${order.id}`}
                </h2>
                <span className={`px-3 py-1 rounded-full text-xs border ${getStatusColor(order.status)}`}>
                  {order.status.replace('_', ' ').toUpperCase()}
                </span>
              </div>
              <p className="text-red-200 flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                {order.route_info || 'Route information'}
              </p>
            </div>
            <button
              onClick={onClose}
              className="bg-red-900/50 hover:bg-red-900 p-2 rounded-lg transition-colors"
            >
              <X className="h-6 w-6 text-white" />
            </button>
          </div>

          {/* Content */}
          <div className="overflow-y-auto max-h-[calc(90vh-100px)] custom-modal-scrollbar">
            <div className="p-6 space-y-6">
              {/* Interactive Route Map */}
              <RouteMap 
                origin={order.route_info?.split(' → ')[0] || 'Warsaw'}
                destination={order.route_info?.split(' → ')[1] || 'Berlin'}
                currentPosition={null}
                status={order.status}
                onRouteDataLoaded={(data) => setRouteData(data)}
              />

              {/* Order Details Grid */}
              <div className="grid md:grid-cols-2 gap-6">
                {/* Cargo Details */}
                <div className="bg-zinc-800 border border-zinc-700 rounded-xl p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <Package className="h-5 w-5 text-blue-500" />
                    <h3 className="text-white font-semibold text-lg">Cargo Details</h3>
                  </div>
                  <div className="space-y-3 text-sm">
                    <div>
                      <span className="text-zinc-400">Name:</span>
                      <p className="text-white font-medium">{order.cargo_name || 'Not specified'}</p>
                    </div>
                    <div>
                      <span className="text-zinc-400">Type:</span>
                      <p className="text-white font-medium">{order.cargo_type || 'Standard'}</p>
                    </div>
                    <div>
                      <span className="text-zinc-400">Weight:</span>
                      <p className="text-white font-medium">{order.weight ? `${order.weight} kg` : 'Not specified'}</p>
                    </div>
                    <div>
                      <span className="text-zinc-400">Temperature:</span>
                      <p className="text-white font-medium">{order.temperature || 'Standard'}</p>
                    </div>
                    <div>
                      <span className="text-zinc-400">Special Requirements:</span>
                      <p className="text-white font-medium">{order.special_requirements || 'None'}</p>
                    </div>
                  </div>
                </div>

                {/* Dates */}
                <div className="bg-zinc-800 border border-zinc-700 rounded-xl p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <Calendar className="h-5 w-5 text-green-500" />
                    <h3 className="text-white font-semibold text-lg">Timeline</h3>
                  </div>
                  <div className="space-y-3 text-sm">
                    <div>
                      <span className="text-zinc-400">Created:</span>
                      <p className="text-white font-medium">{new Date(order.creation_date).toLocaleString()}</p>
                    </div>
                    <div>
                      <span className="text-zinc-400">Loading Date:</span>
                      <p className="text-white font-medium">{new Date(order.loading_date).toLocaleString()}</p>
                    </div>
                    <div>
                      <span className="text-zinc-400">Unloading Date:</span>
                      <p className="text-white font-medium">{new Date(order.unloading_date).toLocaleString()}</p>
                    </div>
                    <div>
                      <span className="text-zinc-400">Status:</span>
                      <p className="text-white font-medium capitalize">{order.status.replace('_', ' ')}</p>
                    </div>
                  </div>
                </div>

                {/* Driver & Vehicle */}
                <div className="bg-zinc-800 border border-zinc-700 rounded-xl p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <User className="h-5 w-5 text-yellow-500" />
                    <h3 className="text-white font-semibold text-lg">Assignment</h3>
                  </div>
                  <div className="space-y-3 text-sm">
                    <div>
                      <span className="text-zinc-400">Driver:</span>
                      <p className="text-white font-medium">{order.user_name || order.driver_name || 'Not assigned'}</p>
                    </div>
                    <div>
                      <span className="text-zinc-400">Vehicle:</span>
                      <p className="text-white font-medium">{order.vehicle_info || 'Not assigned'}</p>
                    </div>
                  </div>
                </div>

                {/* Profit Breakdown */}
                <div className="bg-zinc-800 border border-zinc-700 rounded-xl p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <DollarSign className="h-5 w-5 text-red-500" />
                    <h3 className="text-white font-semibold text-lg">Financial</h3>
                    <button
                      onClick={handleCalculateFinancials}
                      disabled={isCalculating}
                      className="ml-auto bg-red-600 hover:bg-red-700 disabled:bg-zinc-700 disabled:cursor-not-allowed px-3 py-1.5 rounded-lg text-xs font-medium text-white transition-colors flex items-center gap-1.5"
                    >
                      <Calculator className="h-3.5 w-3.5" />
                      {isCalculating ? 'Calculating...' : 'Calculate'}
                    </button>
                  </div>
                  {calculationMessage && (
                    <div className={`mb-3 p-2 rounded text-xs ${calculationMessage.startsWith('✓') ? 'bg-green-900/30 text-green-400' : 'bg-red-900/30 text-red-400'}`}>
                      {calculationMessage}
                    </div>
                  )}
                  <div className="space-y-3 text-sm">
                    <div>
                      <span className="text-zinc-400">Cost:</span>
                      <p className="text-white font-medium">{order.cost ? `${order.cost.toLocaleString()} PLN` : 'Not calculated'}</p>
                    </div>
                    <div>
                      <span className="text-zinc-400">Revenue:</span>
                      <p className="text-white font-medium">{order.revenue ? `${order.revenue.toLocaleString()} PLN` : 'Not calculated'}</p>
                    </div>
                    <div className="pt-2 border-t border-zinc-700">
                      <span className="text-zinc-400">Profit:</span>
                      <p className="text-green-400 font-bold text-lg">
                        {order.profit ? `+${order.profit.toLocaleString()} PLN` : 'Not calculated'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Tracker Info - Mock Live Tracking */}
              <div className="bg-zinc-800 border border-zinc-700 rounded-xl p-5">
                <div className="flex items-center gap-2 mb-4">
                  <MapPin className="h-5 w-5 text-purple-500" />
                  <h3 className="text-white font-semibold text-lg">Live Tracking</h3>
                  <span className="ml-auto flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-green-400 text-xs font-medium">LIVE</span>
                  </span>
                </div>
                
                {/* Current Location */}
                <div className="bg-zinc-900 border border-zinc-700 rounded-lg p-4 mb-4">
                  <div className="flex items-start gap-3">
                    <div className="bg-purple-900/30 p-2 rounded-lg">
                      <MapPin className="h-5 w-5 text-purple-400" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-white font-semibold mb-1">Current Location</h4>
                      <p className="text-zinc-300 text-sm mb-2">
                        {(() => {
                          const origin = order.route_info?.split(' → ')[0] || 'Warsaw'
                          const destination = order.route_info?.split(' → ')[1] || 'Berlin'
                          
                          if (order.status === 'new') return `Waiting at ${origin}`
                          if (order.status === 'completed') return `Delivered in ${destination}`
                          
                          // Use actual cities from Google Maps API
                          if (routeData?.cities && routeData.cities.length > 0) {
                            const cityIndex = order.id % routeData.cities.length
                            const city = routeData.cities[cityIndex]
                            return `Near ${city.name}, ${city.country}`
                          }
                          
                          // Fallback if API data not loaded yet
                          return `En route to ${destination}`
                        })()}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-zinc-400">
                        <span>Last update: {new Date(Date.now() - Math.random() * 600000).toLocaleTimeString()}</span>
                        <span>Speed: {Math.floor(Math.random() * 30 + 70)} km/h</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Progress Stats */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-zinc-900 border border-zinc-700 rounded-lg p-3 text-center">
                    <p className="text-zinc-400 text-xs mb-1">Distance Covered</p>
                    <p className="text-white font-bold text-lg">
                      {order.status === 'completed' ? '100%' : 
                       order.status === 'in_transit' ? `${Math.floor((order.id * 17 + 30) % 50 + 25)}%` : 
                       order.status === 'assigned' ? `${Math.floor((order.id * 13) % 15 + 5)}%` :
                       '0%'}
                    </p>
                  </div>
                  <div className="bg-zinc-900 border border-zinc-700 rounded-lg p-3 text-center">
                    <p className="text-zinc-400 text-xs mb-1">ETA</p>
                    <p className="text-white font-bold text-lg">
                      {order.status === 'completed' ? 'Delivered' : 
                       order.status === 'in_transit' ? `${Math.floor((order.id * 11 % 5) + 2)}h ${Math.floor((order.id * 7) % 60)}m` : 
                       order.status === 'assigned' ? `${Math.floor((order.id * 13 % 8) + 4)}h` :
                       'Pending'}
                    </p>
                  </div>
                  <div className="bg-zinc-900 border border-zinc-700 rounded-lg p-3 text-center">
                    <p className="text-zinc-400 text-xs mb-1">Stops</p>
                    <p className="text-white font-bold text-lg">
                      {Math.floor(order.id % 3) + (order.status === 'in_transit' ? 1 : 0)}
                    </p>
                  </div>
                </div>

                {/* Progress Bar */}
                {(order.status === 'in_transit' || order.status === 'assigned') && (
                  <div className="mt-4">
                    <div className="flex items-center justify-between text-xs text-zinc-400 mb-2">
                      <span>{order.route_info?.split(' → ')[0]}</span>
                      <span>{order.route_info?.split(' → ')[1]}</span>
                    </div>
                    <div className="h-2 bg-zinc-700 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-green-500 to-green-400 rounded-full transition-all duration-500"
                        style={{ width: `${order.status === 'in_transit' ? Math.floor((order.id * 17 + 30) % 50 + 25) : Math.floor((order.id * 13) % 15 + 5)}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
