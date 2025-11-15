import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Package, MapPin, Calendar, Weight, Plus, Search } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Navbar } from '@/components/layout'
import { getOrders, getOrderStatusOptions, type Order as ApiOrder } from '@/lib/api'

interface Order {
  id: string
  cargoType: string
  weight: string
  length: string
  width: string
  height: string
  temperature: string
  loadingAddress: string
  unloadingAddress: string
  loadingDate: string
  unloadingDate: string
  specialRequirements: string
  status: 'pending' | 'matched' | 'in_transit' | 'completed'
  apiStatus: string // Original status from API
  createdAt: string
}

export function Orders() {
  const navigate = useNavigate()
  const [orders, setOrders] = useState<Order[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<string>('new')
  const [statusOptions, setStatusOptions] = useState<Array<{ value: string; label: string }>>([])

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const [apiOrders, statusOpts] = await Promise.all([
          getOrders(),
          getOrderStatusOptions()
        ])
        
        setStatusOptions(statusOpts.choices)
        
        // Map API orders to component format
        const mappedOrders: Order[] = apiOrders.map((order: ApiOrder) => ({
          id: order.id.toString(),
          cargoType: order.cargo_name || 'Unknown',
          weight: order.weight ? `${order.weight} kg` : 'Not specified',
          length: '0 cm', // Dodaj jeśli masz w API
          width: '0 cm',
          height: '0 cm',
          temperature: order.temperature || 'Standard',
          loadingAddress: order.route_info?.split(' → ')[0] || 'Unknown',
          unloadingAddress: order.route_info?.split(' → ')[1] || 'Unknown',
          loadingDate: order.loading_date || order.planned_date,
          unloadingDate: order.unloading_date || order.planned_date,
          specialRequirements: order.special_requirements || 'None',
          apiStatus: order.status, // Keep original API status for filtering
          status: order.status === 'new' ? 'pending' : 
                 order.status === 'assigned' ? 'matched' : 
                 order.status === 'in_transit' ? 'in_transit' : 
                 order.status === 'completed' ? 'completed' : 'pending',
          createdAt: order.creation_date
        }))

        setOrders(mappedOrders)
      } catch (error) {
        console.error('Failed to fetch orders:', error)
        // Fallback to localStorage if API fails
        const storedOrders = JSON.parse(localStorage.getItem('orders') || '[]')
        setOrders(storedOrders)
      } finally {
        setLoading(false)
      }
    }

    fetchOrders()
  }, [])

  const filteredOrders = orders.filter(order =>
    (order.cargoType.toLowerCase().includes(searchQuery.toLowerCase()) ||
    order.loadingAddress.toLowerCase().includes(searchQuery.toLowerCase()) ||
    order.unloadingAddress.toLowerCase().includes(searchQuery.toLowerCase())) &&
    (statusFilter === '' || order.apiStatus === statusFilter)
  )

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-900/30 border-yellow-800 text-yellow-400'
      case 'matched':
        return 'bg-blue-900/30 border-blue-800 text-blue-400'
      case 'in_transit':
        return 'bg-green-900/30 border-green-800 text-green-400'
      case 'completed':
        return 'bg-zinc-800 border-zinc-700 text-zinc-400'
      default:
        return 'bg-zinc-800 border-zinc-700 text-zinc-400'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Awaiting match'
      case 'matched':
        return 'Driver matched'
      case 'in_transit':
        return 'In transit'
      case 'completed':
        return 'Completed'
      default:
        return status
    }
  }

  const handleOrderClick = (orderId: string) => {
    // Store selected order ID and navigate to matching
    sessionStorage.setItem('selectedOrderId', orderId)
    navigate(`/matching?orderId=${orderId}`)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white">
        <Navbar />
        <main className="pt-36 pb-12 px-8">
          <div className="max-w-7xl mx-auto text-center">
            <p className="text-zinc-400">Loading orders...</p>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />

      {/* Main Content */}
      <main className="pt-36 pb-12 px-8">
        <div className="max-w-7xl mx-auto">
          {/* Page Title */}
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h2 className="text-4xl font-bold text-white mb-3">
                Orders needing driver assignment
              </h2>
              <p className="text-zinc-400 text-lg">
                Click on an order to match driver and vehicle
              </p>
            </div>
            <Button
              className="bg-red-600 hover:bg-red-700 text-white"
              size="lg"
              onClick={() => navigate('/add-order')}
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Order
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-yellow-900/20 border border-yellow-800 rounded-lg p-4">
              <p className="text-yellow-400 text-sm mb-1">Pending</p>
              <p className="text-white text-2xl font-bold">
                {orders.filter(o => o.apiStatus === 'new').length}
              </p>
            </div>
            <div className="bg-blue-900/20 border border-blue-800 rounded-lg p-4">
              <p className="text-blue-400 text-sm mb-1">Matched</p>
              <p className="text-white text-2xl font-bold">
                {orders.filter(o => o.apiStatus === 'assigned').length}
              </p>
            </div>
            <div className="bg-green-900/20 border border-green-800 rounded-lg p-4">
              <p className="text-green-400 text-sm mb-1">In Transit</p>
              <p className="text-white text-2xl font-bold">
                {orders.filter(o => o.apiStatus === 'in_transit').length}
              </p>
            </div>
            <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-4">
              <p className="text-zinc-400 text-sm mb-1">All Orders</p>
              <p className="text-white text-2xl font-bold">{orders.length}</p>
            </div>
          </div>

          {/* Search */}
          <div className="mb-6 flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
              <input
                type="text"
                placeholder="Search by cargo type, address..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-10 pr-4 py-3 text-white placeholder:text-zinc-500 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20"
              />
            </div>
            <div className="w-64">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-3 text-white focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20"
              >
                <option value="">All Statuses</option>
                {statusOptions.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Orders List */}
          {filteredOrders.length === 0 ? (
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-12 text-center">
              <Package className="h-16 w-16 text-zinc-600 mx-auto mb-4" />
              <h3 className="text-white text-xl font-semibold mb-2">
                No Orders
              </h3>
              <p className="text-zinc-400 mb-6">
                Add your first order to start matching drivers
              </p>
              <Button
                className="bg-red-600 hover:bg-red-700 text-white"
                onClick={() => navigate('/add-order')}
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Order
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredOrders.map((order) => (
                <div
                  key={order.id}
                  onClick={() => handleOrderClick(order.id)}
                  className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 hover:border-zinc-700 hover:bg-zinc-800/50 transition-all cursor-pointer"
                >
                  <div className="flex flex-wrap items-start justify-between mb-4 gap-2">
                    <div className="flex items-start gap-4 flex-1 min-w-0">
                      <div className="bg-zinc-800 p-3 rounded-lg">
                        <Package className="h-6 w-6 text-red-500" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <h3 className="text-white text-xl font-bold break-words">
                            {order.cargoType || 'Brak opisu'}
                          </h3>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(order.status)}`}>
                            {getStatusText(order.status)}
                          </span>
                        </div>
                        <p className="text-zinc-500 text-sm truncate">
                          Added: {new Date(order.createdAt).toLocaleString('en-US')}
                        </p>
                      </div>
                    </div>
                    <div className="w-full sm:w-auto flex-shrink-0">
                      <Button
                        variant="outline"
                        className="border-zinc-700 text-white hover:bg-red-600 hover:border-red-600 w-full sm:w-auto"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleOrderClick(order.id)
                        }}
                      >
                        Match Driver
                      </Button>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Route */}
                    <div className="bg-zinc-800/50 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <MapPin className="h-4 w-4 text-green-500" />
                        <span className="text-zinc-400 text-xs">Route</span>
                      </div>
                      <p className="text-white text-sm font-medium">
                        {order.loadingAddress || 'N/A'} → {order.unloadingAddress || 'N/A'}
                      </p>
                    </div>

                    {/* Weight */}
                    <div className="bg-zinc-800/50 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <Weight className="h-4 w-4 text-blue-500" />
                        <span className="text-zinc-400 text-xs">Weight</span>
                      </div>
                      <p className="text-white text-sm font-medium">
                        {order.weight ? `${order.weight}` : 'Not specified'}
                      </p>
                    </div>

                    {/* Dates */}
                    <div className="bg-zinc-800/50 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <Calendar className="h-4 w-4 text-yellow-500" />
                        <span className="text-zinc-400 text-xs">Loading</span>
                      </div>
                      <p className="text-white text-sm font-medium">
                        {order.loadingDate ? new Date(order.loadingDate).toLocaleString('en-US', { 
                          day: '2-digit', 
                          month: '2-digit', 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        }) : 'Not specified'}
                      </p>
                    </div>

                    {/* Special Requirements */}
                    <div className="bg-zinc-800/50 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <Package className="h-4 w-4 text-red-500" />
                        <span className="text-zinc-400 text-xs">Requirements</span>
                      </div>
                      <p className="text-white text-sm font-medium">
                        {order.specialRequirements || 'None'}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="py-8 px-8 border-t border-zinc-800 bg-black">
        <p className="text-center text-zinc-500 text-sm">
          TruckAI © 2025 - Red Hat Challenge | Collabothon 2025
        </p>
      </footer>
    </div>
  )
}

