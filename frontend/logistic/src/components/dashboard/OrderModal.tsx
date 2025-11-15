import { X, MapPin, User, DollarSign, Package, Calendar, Truck } from 'lucide-react'
import { type Order as ApiOrder } from '@/lib/api'
import { RouteMap } from './RouteMap'

interface OrderModalProps {
  order: ApiOrder
  isOpen: boolean
  onClose: () => void
}

export function OrderModal({ order, isOpen, onClose }: OrderModalProps) {
  if (!isOpen) return null

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
                  </div>
                  <div className="space-y-3 text-sm">
                    <div>
                      <span className="text-zinc-400">Cost:</span>
                      <p className="text-white font-medium">{order.cost ? `${order.cost.toLocaleString()} PLN` : 'Not specified'}</p>
                    </div>
                    <div>
                      <span className="text-zinc-400">Revenue:</span>
                      <p className="text-white font-medium">{order.revenue ? `${order.revenue.toLocaleString()} PLN` : 'Not specified'}</p>
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

              {/* Tracker Info - TODO */}
              <div className="bg-zinc-800 border border-zinc-700 rounded-xl p-5">
                <div className="flex items-center gap-2 mb-4">
                  <MapPin className="h-5 w-5 text-purple-500" />
                  <h3 className="text-white font-semibold text-lg">Live Tracking</h3>
                </div>
                <div className="bg-zinc-900 border border-zinc-700 rounded-lg p-4 text-center">
                  <p className="text-zinc-400 text-sm">
                    TODO: Display real-time tracker data from <span className="text-red-400 font-mono">/trackers/</span> endpoint
                  </p>
                  <p className="text-zinc-500 text-xs mt-2">
                    (Current location, distance to destination, estimated arrival time)
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
