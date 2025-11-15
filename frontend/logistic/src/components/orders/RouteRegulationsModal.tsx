import { useState, useEffect } from 'react'
import { X, MapPin, Route as RouteIcon, Clock, Globe, AlertTriangle, Hotel, Calendar, Snowflake, Info, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { api } from '@/lib/api'

interface CountryRegulation {
  country: string
  country_code: string
  critical_requirements: string[]
  hotel_required: boolean
  hotel_details: string
  weekend_ban: boolean
  weekend_ban_details: string
  winter_tires_required: boolean
  winter_tires_details: string
  special_warnings: string
}

interface RouteData {
  origin: {
    formatted_address: string
  }
  destination: {
    formatted_address: string
  }
  distance_km: number
  estimated_time_formatted: string
  countries_passed: Array<{
    name: string
    code: string
    order: number
  }>
  transport_regulations?: {
    analysis_status: string
    regulations: CountryRegulation[]
    error?: string | null
  }
  summary: {
    average_speed_kmh: number
  }
}

interface RouteRegulationsModalProps {
  isOpen: boolean
  onClose: () => void
  origin: string
  destination: string
}

export function RouteRegulationsModal({ isOpen, onClose, origin, destination }: RouteRegulationsModalProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [routeData, setRouteData] = useState<RouteData | null>(null)

  useEffect(() => {
    if (isOpen && origin && destination) {
      calculateRoute()
    }
  }, [isOpen, origin, destination])

  const calculateRoute = async () => {
    setLoading(true)
    setError(null)
    
    try {
      const response = await api.post('/routes/calculate/', {
        origin_address: origin,
        destination_address: destination,
        avoid_tolls: false,
        avoid_highways: false,
        avoid_ferries: false
      })

      setRouteData(response.data)
    } catch (err: any) {
      console.error('Route calculation error:', err)
      setError(err.response?.data?.message || err.message || 'Failed to calculate route')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-zinc-800">
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <RouteIcon className="h-6 w-6 text-blue-500" />
              Route & Transport Regulations
            </h2>
            <p className="text-zinc-400 text-sm mt-1">
              AI-analyzed requirements for your route
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="text-zinc-400 hover:text-white hover:bg-zinc-800"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {loading && (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="h-12 w-12 text-blue-500 animate-spin mb-4" />
              <p className="text-zinc-400">Calculating route and analyzing regulations...</p>
            </div>
          )}

          {error && (
            <div className="bg-red-900/20 border border-red-800 rounded-lg p-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-red-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-red-400 font-medium">Error</p>
                  <p className="text-zinc-300 text-sm mt-1">{error}</p>
                </div>
              </div>
            </div>
          )}

          {routeData && !loading && (
            <div className="space-y-6">
              {/* Route Summary */}
              <div className="grid md:grid-cols-3 gap-4">
                <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <RouteIcon className="h-5 w-5 text-blue-500" />
                    <span className="text-zinc-400 text-sm">Distance</span>
                  </div>
                  <p className="text-2xl font-bold text-white">{routeData.distance_km} km</p>
                </div>

                <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <Clock className="h-5 w-5 text-green-500" />
                    <span className="text-zinc-400 text-sm">Est. Time</span>
                  </div>
                  <p className="text-2xl font-bold text-white">{routeData.estimated_time_formatted}</p>
                </div>

                <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-2">
                    <Globe className="h-5 w-5 text-purple-500" />
                    <span className="text-zinc-400 text-sm">Countries</span>
                  </div>
                  <p className="text-2xl font-bold text-white">{routeData.countries_passed.length}</p>
                </div>
              </div>

              {/* Route Details */}
              <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-4">
                <h3 className="text-white font-semibold mb-3">Route Overview</h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-green-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-zinc-400 text-sm">From</p>
                      <p className="text-white">{routeData.origin.formatted_address}</p>
                    </div>
                  </div>
                  
                  <div className="border-l-2 border-zinc-700 ml-2 pl-4 py-2">
                    <p className="text-zinc-400 text-sm mb-2">Countries:</p>
                    <div className="flex flex-wrap gap-2">
                      {routeData.countries_passed.map((country) => (
                        <span
                          key={country.code}
                          className="px-3 py-1 bg-zinc-900 border border-zinc-700 rounded-full text-sm text-white"
                        >
                          {country.name}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-zinc-400 text-sm">To</p>
                      <p className="text-white">{routeData.destination.formatted_address}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Transport Regulations */}
              {routeData.transport_regulations && routeData.transport_regulations.regulations && routeData.transport_regulations.regulations.length > 0 ? (
                <div className="space-y-4">
                  <h3 className="text-xl font-bold text-white flex items-center gap-2">
                    <Globe className="h-6 w-6 text-blue-500" />
                    Transport Regulations by Country
                  </h3>
                  
                  {routeData.transport_regulations.regulations.map((reg) => (
                    <div 
                      key={reg.country_code}
                      className="bg-zinc-800 border border-zinc-700 rounded-lg p-5"
                    >
                      {/* Country Header */}
                      <div className="flex items-center gap-3 mb-4 pb-3 border-b border-zinc-700">
                        <h4 className="text-white font-bold text-lg flex items-center gap-2">
                          {reg.country}
                          <span className="text-xs px-2 py-0.5 bg-zinc-700 rounded text-zinc-300 font-normal">
                            {reg.country_code}
                          </span>
                        </h4>
                      </div>

                      {/* Critical Requirements */}
                      {reg.critical_requirements && reg.critical_requirements.length > 0 && (
                        <div className="mb-4">
                          <h5 className="text-sm font-semibold text-zinc-300 mb-2 flex items-center gap-2">
                            <AlertTriangle className="h-4 w-4 text-orange-500" />
                            Critical Requirements
                          </h5>
                          <ul className="space-y-2">
                            {reg.critical_requirements.map((req, idx) => (
                              <li key={idx} className="text-sm text-zinc-300 pl-6 relative">
                                <span className="absolute left-0 top-1.5 w-2 h-2 bg-orange-500 rounded-full"></span>
                                {req}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}

                      {/* Key Information Cards */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
                        {reg.hotel_required && (
                          <div className="bg-zinc-900 rounded-lg p-3 border border-zinc-700">
                            <div className="flex items-start gap-2">
                              <Hotel className="h-4 w-4 text-purple-400 mt-0.5 flex-shrink-0" />
                              <div>
                                <p className="text-xs font-semibold text-purple-400 mb-1">Hotel Required</p>
                                <p className="text-xs text-zinc-300">
                                  {reg.hotel_details || 'Driver must rest in proper accommodation'}
                                </p>
                              </div>
                            </div>
                          </div>
                        )}

                        {reg.weekend_ban && (
                          <div className="bg-zinc-900 rounded-lg p-3 border border-red-900/50">
                            <div className="flex items-start gap-2">
                              <Calendar className="h-4 w-4 text-red-400 mt-0.5 flex-shrink-0" />
                              <div>
                                <p className="text-xs font-semibold text-red-400 mb-1">Weekend Driving Ban</p>
                                <p className="text-xs text-zinc-300">
                                  {reg.weekend_ban_details || 'Restrictions apply on weekends'}
                                </p>
                              </div>
                            </div>
                          </div>
                        )}

                        {reg.winter_tires_required && (
                          <div className="bg-zinc-900 rounded-lg p-3 border border-blue-900/50">
                            <div className="flex items-start gap-2">
                              <Snowflake className="h-4 w-4 text-blue-400 mt-0.5 flex-shrink-0" />
                              <div>
                                <p className="text-xs font-semibold text-blue-400 mb-1">Winter Tires Required</p>
                                <p className="text-xs text-zinc-300">
                                  {reg.winter_tires_details || 'Winter tires mandatory'}
                                </p>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Special Warnings */}
                      {reg.special_warnings && reg.special_warnings.trim() !== '' && (
                        <div className="mt-4 bg-yellow-900/10 border border-yellow-800/50 rounded-lg p-3">
                          <div className="flex items-start gap-2">
                            <Info className="h-4 w-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                            <div>
                              <p className="text-xs font-semibold text-yellow-400 mb-1">Additional Notes</p>
                              <p className="text-xs text-zinc-300">{reg.special_warnings}</p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}

                  {/* AI Attribution */}
                  <div className="text-xs text-zinc-500 pt-2">
                    Regulations analyzed by AI based on transport law database (November 2025)
                  </div>
                </div>
              ) : (
                <div className="bg-yellow-900/20 border border-yellow-800 rounded-lg p-4">
                  <p className="text-yellow-400">
                    {routeData.transport_regulations?.error || 'No regulation data available for this route'}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-zinc-800">
          <Button
            onClick={onClose}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          >
            Close
          </Button>
        </div>
      </div>
    </div>
  )
}
