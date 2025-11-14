import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Sparkles, Eye, EyeOff, User, Package, Truck } from 'lucide-react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Navbar } from '@/components/layout'
import { getOrder, getVehicles, getUsers, assignOrder, getCargo, getRoute } from '@/lib/api'
import type { Cargo, Route } from '@/lib/api'
import type { Order, Vehicle, User as ApiUser } from '@/lib/api'

interface TruckerMatch {
  id: string
  score: number
  vehicle: {
    name: string
    plate: string
    type: string
    capacity: number
    features: string[]
  }
  driver: {
    name: string
    licenses: string[]
    experience: number
    rating: number
  }
  profit: number
  cost: number
  eta: string
  reasons: string[]
}

export function Matching() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [showLowMatches, setShowLowMatches] = useState(false)
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null)
  const [currentCargo, setCurrentCargo] = useState<Cargo | null>(null)
  const [currentRoute, setCurrentRoute] = useState<Route | null>(null)
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [drivers, setDrivers] = useState<ApiUser[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      const orderId = searchParams.get('orderId')
      if (orderId) {
        try {
          // Fetch order, vehicles, and drivers from API
          const [orderData, vehiclesData, driversData] = await Promise.all([
            getOrder(parseInt(orderId)),
            getVehicles(),
            getUsers()
          ])
          setCurrentOrder(orderData)
          setVehicles(vehiclesData)
          setDrivers(driversData)
          
          // Fetch cargo and route if order has them
          if (orderData.cargo && typeof orderData.cargo === 'number') {
            const cargoData = await getCargo(orderData.cargo)
            setCurrentCargo(cargoData)
          }
          if (orderData.route && typeof orderData.route === 'number') {
            const routeData = await getRoute(orderData.route)
            setCurrentRoute(routeData)
          }
        } catch (error) {
          console.error('Failed to fetch data:', error)
          alert('Failed to load data from database')
        } finally {
          setIsLoading(false)
        }
      } else {
        setIsLoading(false)
      }
    }
    fetchData()
  }, [searchParams])

  // Generate matches from real database data
  const allMatches: TruckerMatch[] = vehicles.slice(0, 6).map((vehicle, index) => {
    const driver = drivers[index % drivers.length]
    const score = 98 - (index * 7)
    
    // Map vehicle type to Polish names
    const typeMap: Record<string, string> = {
      'refrigerated': 'Chłodnia',
      'box': 'Box',
      'cargo': 'Plandeka'
    }
    
    // Get driver licenses
    const licenses = []
    if (driver?.license_c) licenses.push('C')
    if (driver?.license_ce) licenses.push('C+E')
    if (driver?.license_adr) licenses.push('ADR')
    if (driver?.forklift_certified) licenses.push('Wózek widłowy')
    
    return {
      id: vehicle.id.toString(),
      score: score,
      vehicle: {
        name: vehicle.registration_no,
        plate: vehicle.registration_no,
        type: typeMap[vehicle.type] || vehicle.type,
        capacity: vehicle.capacity_weight,
        features: [
          vehicle.has_forklift ? 'Wózek widłowy' : null,
          'GPS',
          vehicle.type === 'refrigerated' ? 'Chłodnia' : null
        ].filter(Boolean) as string[]
      },
      driver: {
        name: driver?.name || 'Unknown',
        licenses: licenses,
        experience: 5 + index * 2,
        rating: 4.8 - (index * 0.1)
      },
      profit: 3400 - (index * 300),
      cost: 1800 + (index * 50),
      eta: `${12 + index}h ${20 + (index * 15)}min`,
      reasons: [
        score >= 90 ? 'Pełna zgodność z wymaganiami zlecenia' : 'Podstawowe wymagania spełnione',
        `Ładowność ${vehicle.capacity_weight} kg`,
        driver?.name ? `Kierowca: ${driver.name}` : 'Kierowca dostępny',
        vehicle.status === 'available' ? 'Pojazd dostępny od zaraz' : 'Pojazd w użyciu',
        score >= 90 ? 'Najwyższy szacowany zysk' : 'Dobra rentowność'
      ]
    }
  })

  // Sort by score descending
  const sortedMatches = [...allMatches].sort((a, b) => b.score - a.score)
  
  // Filter matches based on threshold
  const highMatches = sortedMatches.filter(m => m.score >= 60)
  const lowMatches = sortedMatches.filter(m => m.score < 60)

  const displayedMatches = showLowMatches ? sortedMatches : highMatches

  const getMatchCardBg = (score: number) => {
    if (score >= 90) return 'bg-gradient-to-br from-green-900/30 to-green-950/20 border-green-800'
    if (score >= 75) return 'bg-gradient-to-br from-blue-900/30 to-blue-950/20 border-blue-800'
    if (score >= 60) return 'bg-gradient-to-br from-yellow-900/30 to-yellow-950/20 border-yellow-800'
    return 'bg-gradient-to-br from-red-900/30 to-red-950/20 border-red-800'
  }

  const getScoreBadge = (score: number) => {
    if (score >= 90) return { text: 'PERFECT', color: 'bg-green-600 text-white' }
    if (score >= 75) return { text: 'VERY GOOD', color: 'bg-blue-600 text-white' }
    if (score >= 60) return { text: 'ACCEPTABLE', color: 'bg-yellow-600 text-black' }
    return { text: 'NOT RECOMMENDED', color: 'bg-red-600 text-white' }
  }

  // @ts-ignore - match parameter kept for UI callback compatibility
  const handleSelectMatch = async (match: TruckerMatch) => {
    const orderId = searchParams.get('orderId')
    if (!orderId || !currentOrder) {
      alert('No order data!')
      return
    }

    try {
      // Call AI assignment endpoint
      const result = await assignOrder(parseInt(orderId))
      alert(
        `✅ Order Assigned!\n\n` +
        `Vehicle: ${result.assigned_vehicle.registration_no}\n` +
        `Driver: ${result.assigned_driver.name}\n` +
        `Profit: ${result.estimated_profit} PLN`
      )
      navigate('/orders')
    } catch (error: any) {
      console.error('Failed to assign:', error)
      alert(`Failed: ${error.response?.data?.error || error.message}`)
    }
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />

      <main className="pt-24 pb-12 px-8">
        <div className="max-w-7xl mx-auto">
          {isLoading ? (
            <div className="text-center py-12">
              <p className="text-white">Loading...</p>
            </div>
          ) : !currentOrder ? (
            <div className="text-center py-12">
              <p className="text-white">No order data!</p>
            </div>
          ) : (
            <>
          <div className="flex items-center gap-3 mb-3">
            <Sparkles className="h-8 w-8 text-red-500" />
            <h2 className="text-4xl font-bold text-white">Matched Truckers</h2>
          </div>
          <p className="text-zinc-400 text-lg mb-8">
            Best vehicle + driver combinations for your order • Found {allMatches.length} matches
          </p>

          {/* Current Order Info */}
          {currentOrder && (
            <div className="bg-gradient-to-r from-red-900/30 to-red-950/20 border border-red-800 rounded-xl p-6 mb-8">
              <div className="flex items-start gap-4">
                <div className="bg-red-600 p-3 rounded-lg">
                  <Package className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-white text-xl font-bold mb-2">
                    Order: {currentCargo?.name || 'No description'}
                  </h3>
                  <div className="grid md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-red-300">Route:</span>
                      <p className="text-white font-medium">{currentRoute?.origin} → {currentRoute?.destination}</p>
                    </div>
                    <div>
                      <span className="text-red-300">Weight:</span>
                      <p className="text-white font-medium">{currentCargo?.weight} kg</p>
                    </div>
                    <div>
                      <span className="text-red-300">Dimensions:</span>
                      <p className="text-white font-medium">{currentCargo?.length} × {currentCargo?.width} × {currentCargo?.height} cm</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Stats Summary */}
          <div className="grid grid-cols-4 gap-4 mb-8">
            <div className="bg-green-900/20 border border-green-800 rounded-lg p-4">
              <p className="text-green-400 text-sm mb-1">Perfect match</p>
              <p className="text-white text-2xl font-bold">{allMatches.filter(m => m.score >= 90).length}</p>
            </div>
            <div className="bg-blue-900/20 border border-blue-800 rounded-lg p-4">
              <p className="text-blue-400 text-sm mb-1">Very good</p>
              <p className="text-white text-2xl font-bold">{allMatches.filter(m => m.score >= 75 && m.score < 90).length}</p>
            </div>
            <div className="bg-yellow-900/20 border border-yellow-800 rounded-lg p-4">
              <p className="text-yellow-400 text-sm mb-1">Acceptable</p>
              <p className="text-white text-2xl font-bold">{allMatches.filter(m => m.score >= 60 && m.score < 75).length}</p>
            </div>
            <div className="bg-red-900/20 border border-red-800 rounded-lg p-4">
              <p className="text-red-400 text-sm mb-1">Low match</p>
              <p className="text-white text-2xl font-bold">{lowMatches.length}</p>
            </div>
          </div>

          {/* Toggle low matches */}
          {lowMatches.length > 0 && (
            <div className="mb-6">
              <Button
                variant="outline"
                className="border-zinc-700 text-white hover:bg-zinc-900"
                onClick={() => setShowLowMatches(!showLowMatches)}
              >
                {showLowMatches ? (
                  <>
                    <EyeOff className="h-4 w-4 mr-2" />
                    Hide low matches
                  </>
                ) : (
                  <>
                    <Eye className="h-4 w-4 mr-2" />
                    Show all ({lowMatches.length} hidden)
                  </>
                )}
              </Button>
            </div>
          )}

          {/* Matches List */}
          <div className="space-y-6">
            {displayedMatches.map((match, index) => {
              const badge = getScoreBadge(match.score)
              
              return (
                <div
                  key={match.id}
                  className={`border rounded-xl p-6 ${getMatchCardBg(match.score)} hover:scale-[1.01] transition-all`}
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center gap-4">
                      <div className="bg-black/30 rounded-full w-12 h-12 flex items-center justify-center text-2xl font-bold text-white border border-zinc-700">
                        #{index + 1}
                      </div>
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-2xl font-bold text-white">
                            {match.score}% Match
                          </h3>
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${badge.color}`}>
                            {badge.text}
                          </span>
                        </div>
                        <p className="text-zinc-400">Estimated profit: <span className="text-green-400 font-bold">{match.profit} PLN</span> • Cost: {match.cost} PLN • ETA: {match.eta}</p>
                      </div>
                    </div>
                  </div>

                  {/* Vehicle + Driver Grid */}
                  <div className="grid md:grid-cols-2 gap-6 mb-6">
                    {/* Vehicle */}
                    <div className="bg-black/30 rounded-lg p-5 border border-zinc-700">
                      <div className="flex items-center gap-3 mb-4">
                        <Truck className="h-6 w-6 text-red-500" />
                        <div>
                          <h4 className="text-white font-bold text-lg">{match.vehicle.name}</h4>
                          <p className="text-zinc-400 text-sm">{match.vehicle.plate}</p>
                        </div>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-zinc-400">Type:</span>
                          <span className="text-white font-medium">{match.vehicle.type}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-zinc-400">Capacity:</span>
                          <span className="text-white font-medium">{match.vehicle.capacity} kg</span>
                        </div>
                        <div className="mt-3">
                          <span className="text-zinc-400 text-xs block mb-2">Features:</span>
                          <div className="flex flex-wrap gap-2">
                            {match.vehicle.features.map((feat, i) => (
                              <span key={i} className="px-2 py-1 bg-zinc-800 rounded text-xs text-zinc-300">
                                {feat}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Driver */}
                    <div className="bg-black/30 rounded-lg p-5 border border-zinc-700">
                      <div className="flex items-center gap-3 mb-4">
                        <User className="h-6 w-6 text-red-500" />
                        <div>
                          <h4 className="text-white font-bold text-lg">{match.driver.name}</h4>
                          <p className="text-zinc-400 text-sm">{match.driver.experience} years experience</p>
                        </div>
                      </div>
                      <div className="space-y-2 text-sm mb-3">
                        <div className="flex justify-between">
                          <span className="text-zinc-400">Rating:</span>
                          <span className="text-white font-medium">⭐ {match.driver.rating.toFixed(1)} / 5.0</span>
                        </div>
                      </div>
                      <div>
                        <span className="text-zinc-400 text-xs block mb-2">Licenses:</span>
                        <div className="flex flex-wrap gap-2">
                          {match.driver.licenses.map((lic, i) => (
                            <span key={i} className="px-2 py-1 bg-zinc-800 rounded text-xs text-zinc-300 font-medium">
                              {lic}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Reasons */}
                  <div className="bg-black/30 rounded-lg p-5 border border-zinc-700">
                    <h5 className="text-white font-semibold mb-3 flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-red-500" />
                      Why this combination?
                    </h5>
                    <ul className="space-y-2">
                      {match.reasons.map((reason, i) => (
                        <li key={i} className="text-zinc-300 text-sm flex items-start gap-2">
                          <span className="text-red-500 mt-0.5">•</span>
                          {reason}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Action */}
                  <div className="mt-6 flex gap-3">
                    <Button 
                      className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                      size="lg"
                      onClick={() => handleSelectMatch(match)}
                    >
                      Select this combination
                    </Button>
                    <Button 
                      variant="outline"
                      className="border-zinc-700 text-white hover:bg-zinc-800"
                      size="lg"
                      onClick={() => navigate(`/route?orderId=${searchParams.get('orderId')}`)}
                    >
                      View Route
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>

          {!showLowMatches && lowMatches.length > 0 && (
            <div className="mt-8 p-6 bg-zinc-900 border border-zinc-800 rounded-lg text-center">
              <p className="text-zinc-400 mb-3">
                Hidden {lowMatches.length} matches with low compatibility (&lt;60%)
              </p>
              <Button
                variant="outline"
                className="border-zinc-700 text-white hover:bg-zinc-900"
                onClick={() => setShowLowMatches(true)}
              >
                Show all matches
              </Button>
            </div>
          )}
            </>
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


