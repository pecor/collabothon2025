import { useState, useEffect } from 'react'
import { Navigation, Search, MapPin } from 'lucide-react'
import { Navbar } from '@/components/layout'
import { getRoutes, getRouteStatusOptions, type Route } from '@/lib/api'

export function Routes() {
  const [routes, setRoutes] = useState<Route[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('')
  const [statusOptions, setStatusOptions] = useState<Array<{ value: string; label: string }>>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [routesData, statusOpts] = await Promise.all([
          getRoutes(),
          getRouteStatusOptions()
        ])
        
        setRoutes(routesData)
        setStatusOptions(statusOpts.choices)
      } catch (error) {
        console.error('Failed to fetch routes:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const filteredRoutes = routes.filter(route =>
    (route.origin.toLowerCase().includes(searchQuery.toLowerCase()) ||
    route.destination.toLowerCase().includes(searchQuery.toLowerCase())) &&
    (statusFilter === '' || route.status === statusFilter)
  )

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'planned':
        return 'bg-yellow-900/30 border-yellow-800 text-yellow-400'
      case 'in_progress':
        return 'bg-blue-900/30 border-blue-800 text-blue-400'
      case 'completed':
        return 'bg-green-900/30 border-green-800 text-green-400'
      default:
        return 'bg-zinc-800 border-zinc-700 text-zinc-400'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'planned':
        return 'Planned'
      case 'in_progress':
        return 'In Progress'
      case 'completed':
        return 'Completed'
      default:
        return status
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white">
        <Navbar />
        <main className="pt-36 pb-12 px-8">
          <div className="max-w-7xl mx-auto">
            <p className="text-zinc-400">Loading routes...</p>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />

      <main className="pt-36 pb-12 px-8">
        <div className="max-w-7xl mx-auto">
          {/* Page Title */}
          <div className="mb-8">
            <h2 className="text-4xl font-bold text-white mb-3">
              Routes Management
            </h2>
            <p className="text-zinc-400 text-lg">
              View and manage all transport routes
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-4 mb-8">
            <div className="bg-yellow-900/20 border border-yellow-800 rounded-lg p-4">
              <p className="text-yellow-400 text-sm mb-1">Planned</p>
              <p className="text-white text-2xl font-bold">
                {routes.filter(r => r.status === 'planned').length}
              </p>
            </div>
            <div className="bg-blue-900/20 border border-blue-800 rounded-lg p-4">
              <p className="text-blue-400 text-sm mb-1">In Progress</p>
              <p className="text-white text-2xl font-bold">
                {routes.filter(r => r.status === 'in_progress').length}
              </p>
            </div>
            <div className="bg-green-900/20 border border-green-800 rounded-lg p-4">
              <p className="text-green-400 text-sm mb-1">Completed</p>
              <p className="text-white text-2xl font-bold">
                {routes.filter(r => r.status === 'completed').length}
              </p>
            </div>
            <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-4">
              <p className="text-zinc-400 text-sm mb-1">Total Routes</p>
              <p className="text-white text-2xl font-bold">{routes.length}</p>
            </div>
          </div>

          {/* Filters */}
          <div className="flex gap-4 mb-6">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
              <input
                type="text"
                placeholder="Search by origin or destination..."
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

          {/* Routes List */}
          {filteredRoutes.length === 0 ? (
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-12 text-center">
              <Navigation className="h-16 w-16 text-zinc-700 mx-auto mb-4" />
              <p className="text-zinc-400 text-lg mb-2">No routes found</p>
              <p className="text-zinc-500 text-sm">
                {searchQuery || statusFilter
                  ? 'Try adjusting your filters'
                  : 'Routes will appear here once created'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredRoutes.map((route) => (
                <div
                  key={route.id}
                  className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 hover:border-zinc-700 hover:bg-zinc-800/50 transition-all"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="bg-red-600 p-3 rounded-lg">
                        <Navigation className="h-6 w-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-white font-semibold text-lg">
                            {route.origin} → {route.destination}
                          </h3>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                              route.status
                            )}`}
                          >
                            {getStatusLabel(route.status)}
                          </span>
                        </div>
                        <p className="text-zinc-400 text-sm">Route #{route.id}</p>
                      </div>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-4 gap-4 pt-4 border-t border-zinc-800">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-green-500" />
                      <div>
                        <p className="text-zinc-500 text-xs">Origin</p>
                        <p className="text-white text-sm font-medium">{route.origin}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-red-500" />
                      <div>
                        <p className="text-zinc-500 text-xs">Destination</p>
                        <p className="text-white text-sm font-medium">{route.destination}</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-zinc-500 text-xs mb-1">Distance</p>
                      <p className="text-white font-semibold">{route.distance_km} km</p>
                    </div>
                    <div>
                      <p className="text-zinc-500 text-xs mb-1">Estimated Time</p>
                      <p className="text-white font-semibold">{route.estimated_time}</p>
                    </div>
                  </div>

                  {route.holiday_blocked && (
                    <div className="mt-4 bg-red-900/20 border border-red-800 rounded-lg p-3 flex items-center gap-2">
                      <span className="text-red-400 text-sm">⚠️ Holiday restrictions apply</span>
                    </div>
                  )}
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
