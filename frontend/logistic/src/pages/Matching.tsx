import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Navbar } from '@/components/layout'
import { 
  getOrder, 
  getCargo, 
  getRoute, 
  getVehicles, 
  getUsers,
  assignOrder,
  manualAssignOrder,
  type Order,
  type Cargo,
  type Route,
  type Vehicle,
  type User as ApiUser,
  type OrderAssignmentResult
} from '@/lib/api'
import { Truck, User, Sparkles, CheckCircle, AlertCircle, ArrowRight, TrendingUp, Award } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function Matching() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null)
  const [currentCargo, setCurrentCargo] = useState<Cargo | null>(null)
  const [currentRoute, setCurrentRoute] = useState<Route | null>(null)
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [drivers, setDrivers] = useState<ApiUser[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [aiRecommendation, setAiRecommendation] = useState<OrderAssignmentResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isAssigning, setIsAssigning] = useState(false)
  const [assignmentSuccess, setAssignmentSuccess] = useState(false)
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null)
  const [selectedDriver, setSelectedDriver] = useState<ApiUser | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      const orderId = searchParams.get('orderId')
      if (!orderId) {
        navigate('/orders')
        return
      }

      try {
        const [orderData, vehiclesData, driversData] = await Promise.all([
          getOrder(parseInt(orderId)),
          getVehicles(),
          getUsers()
        ])

        setCurrentOrder(orderData)
        setVehicles(vehiclesData.filter(v => v.status === 'available'))
        setDrivers(driversData.filter(d => d.is_active))

        // Fetch cargo and route details
        if (orderData.cargo) {
          const cargoData = await getCargo(orderData.cargo)
          setCurrentCargo(cargoData)
        }
        if (orderData.route) {
          const routeData = await getRoute(orderData.route)
          setCurrentRoute(routeData)
        }
      } catch (error) {
        console.error('Failed to fetch data:', error)
        setError('Failed to load order data')
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [searchParams, navigate])

  const handleAIAnalyze = async () => {
    if (!currentOrder) return

    setIsAnalyzing(true)
    setError(null)

    try {
      const result = await assignOrder(currentOrder.id)
      setAiRecommendation(result)
    } catch (err: any) {
      console.error('AI Analysis error:', err)
      setError(err.response?.data?.error || 'Failed to analyze order. Please try again.')
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleAssignNow = async () => {
    if (!aiRecommendation || !currentOrder) return

    setIsAssigning(true)
    try {
      // Order is already assigned by the /assign endpoint
      setAssignmentSuccess(true)
      
      setTimeout(() => {
        navigate('/orders')
      }, 2000)
    } catch (err: any) {
      setError('Failed to assign order')
    } finally {
      setIsAssigning(false)
    }
  }

  const handleManualAssign = async () => {
    if (!selectedVehicle || !selectedDriver || !currentOrder) {
      setError('Please select both a vehicle and a driver')
      return
    }

    setIsAssigning(true)
    setError(null)

    try {
      await manualAssignOrder(currentOrder.id, selectedVehicle.id, selectedDriver.id)
      setAssignmentSuccess(true)
      
      setTimeout(() => {
        navigate('/orders')
      }, 2000)
    } catch (err: any) {
      console.error('Manual assignment error:', err)
      setError(err.response?.data?.error || 'Failed to assign order manually')
    } finally {
      setIsAssigning(false)
    }
  }

  const getVehicleTypeName = (type: string) => {
    const typeMap: Record<string, string> = {
      'refrigerated': 'Refrigerated',
      'box': 'Box',
      'cargo': 'Curtain-side'
    }
    return typeMap[type] || type
  }

  const getDriverLicenses = (driver: ApiUser) => {
    const licenses = []
    if (driver.license_c) licenses.push('C')
    if (driver.license_ce) licenses.push('C+E')
    if (driver.license_adr) licenses.push('ADR')
    if (driver.forklift_certified) licenses.push('Forklift')
    return licenses
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black text-white">
        <Navbar />
        <main className="pt-36 pb-12 px-8">
          <div className="max-w-7xl mx-auto text-center">
            <p className="text-zinc-400">Loading matching data...</p>
          </div>
        </main>
      </div>
    )
  }

  if (!currentOrder) {
    return (
      <div className="min-h-screen bg-black text-white">
        <Navbar />
        <main className="pt-36 pb-12 px-8">
          <div className="max-w-7xl mx-auto text-center">
            <p className="text-zinc-400">Order not found</p>
            <Button onClick={() => navigate('/orders')} className="mt-4">
              Back to Orders
            </Button>
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
          {/* Header */}
          <div className="mb-8">
            <h2 className="text-4xl font-bold text-white mb-3">
              AI Matching & Assignment
            </h2>
            <p className="text-zinc-400 text-lg">
              Order #{currentOrder.id} - {currentRoute?.origin} → {currentRoute?.destination}
            </p>
          </div>

          {/* AI Analyze Button */}
          {!aiRecommendation && !assignmentSuccess && (
            <div className="bg-gradient-to-r from-red-950 to-red-900 border border-red-800 rounded-xl p-6 mb-8">
              <div className="flex flex-col md:flex-row items-start md:items-center md:justify-between gap-4">
                <div className="flex-1">
                  <h3 className="text-xl md:text-2xl font-bold text-white mb-2 flex items-center gap-2">
                    <Sparkles className="h-8 w-8 md:h-6 md:w-6 text-yellow-400" />
                    AI-Powered Smart Matching
                  </h3>
                  <p className="text-red-100 text-sm md:text-base">
                    Let our AI analyze and find the best driver and vehicle combination for this order
                  </p>
                </div>
                <Button
                  onClick={handleAIAnalyze}
                  disabled={isAnalyzing}
                  className="bg-yellow-600 hover:bg-yellow-700 text-white font-bold px-8 w-full md:w-auto"
                  size="lg"
                >
                  {isAnalyzing ? (
                    <>
                      <Sparkles className="h-5 w-5 mr-2 animate-spin" />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-5 w-5 mr-2" />
                      AI Analyze & Match
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="bg-red-900/20 border border-red-800 rounded-lg p-4 mb-8">
              <div className="flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-red-400 mt-0.5" />
                <div>
                  <h4 className="text-red-400 font-semibold mb-1">Error</h4>
                  <p className="text-red-300 text-sm">{error}</p>
                </div>
              </div>
            </div>
          )}

          {/* Success Message */}
          {assignmentSuccess && (
            <div className="bg-green-900/20 border border-green-800 rounded-lg p-6 mb-8">
              <div className="flex items-start gap-3">
                <CheckCircle className="h-6 w-6 text-green-400 mt-0.5" />
                <div>
                  <h4 className="text-green-400 font-semibold mb-1 text-xl">Order Assigned Successfully!</h4>
                  <p className="text-green-300">Redirecting to orders list...</p>
                </div>
              </div>
            </div>
          )}

          {/* AI Recommendation */}
          {aiRecommendation && !assignmentSuccess && (
            <div className="bg-gradient-to-br from-green-950 to-green-900/50 border-2 border-green-500 rounded-xl p-6 mb-8 shadow-2xl">
              <div className="flex items-center gap-2 mb-4">
                <Award className="h-6 w-6 text-green-400" />
                <h3 className="text-2xl font-bold text-white">AI Recommendation - Best Match</h3>
              </div>

              <div className="grid md:grid-cols-2 gap-6 mb-6">
                {/* Recommended Vehicle */}
                <div className="bg-zinc-900 border border-green-800 rounded-lg p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <Truck className="h-5 w-5 text-green-400" />
                    <h4 className="text-white font-bold">Recommended Vehicle</h4>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-zinc-400">Registration:</span>
                      <p className="text-white font-medium">{aiRecommendation.assigned_vehicle.registration_no}</p>
                    </div>
                    <div>
                      <span className="text-zinc-400">Type:</span>
                      <p className="text-white font-medium">{getVehicleTypeName(aiRecommendation.assigned_vehicle.type)}</p>
                    </div>
                    <div>
                      <span className="text-zinc-400">Capacity:</span>
                      <p className="text-white font-medium">{aiRecommendation.assigned_vehicle.capacity_weight} kg</p>
                    </div>
                    {aiRecommendation.assigned_vehicle.has_forklift && (
                      <div className="bg-blue-900/30 border border-blue-800 rounded px-2 py-1 inline-block">
                        <span className="text-blue-400 text-xs">✓ Has Forklift</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Recommended Driver */}
                <div className="bg-zinc-900 border border-green-800 rounded-lg p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <User className="h-5 w-5 text-green-400" />
                    <h4 className="text-white font-bold">Recommended Driver</h4>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-zinc-400">Name:</span>
                      <p className="text-white font-medium">{aiRecommendation.assigned_driver.name}</p>
                    </div>
                    <div>
                      <span className="text-zinc-400">Licenses:</span>
                      <div className="flex gap-2 mt-1">
                        {aiRecommendation.assigned_driver.license_c && (
                          <span className="bg-blue-900/30 border border-blue-800 rounded px-2 py-0.5 text-blue-400 text-xs">C</span>
                        )}
                        {aiRecommendation.assigned_driver.license_ce && (
                          <span className="bg-blue-900/30 border border-blue-800 rounded px-2 py-0.5 text-blue-400 text-xs">C+E</span>
                        )}
                        {aiRecommendation.assigned_driver.license_adr && (
                          <span className="bg-orange-900/30 border border-orange-800 rounded px-2 py-0.5 text-orange-400 text-xs">ADR</span>
                        )}
                        {aiRecommendation.assigned_driver.forklift_certified && (
                          <span className="bg-purple-900/30 border border-purple-800 rounded px-2 py-0.5 text-purple-400 text-xs">Forklift</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Financial Info */}
              <div className="bg-zinc-900/50 border border-green-800 rounded-lg p-4 mb-6">
                <div className="flex items-center gap-4">
                  <TrendingUp className="h-5 w-5 text-green-400" />
                  <div className="flex-1">
                    <span className="text-zinc-400 text-sm">Estimated Profit:</span>
                    <p className="text-green-400 font-bold text-2xl">{aiRecommendation.estimated_profit.toLocaleString()} PLN</p>
                  </div>
                  <div className="flex-1">
                    <span className="text-zinc-400 text-sm">Estimated Revenue:</span>
                    <p className="text-white font-bold text-xl">{aiRecommendation.estimated_revenue.toLocaleString()} PLN</p>
                  </div>
                </div>
              </div>

              {/* Assignment Reasons */}
              <div className="bg-zinc-900/50 border border-green-800 rounded-lg p-4 mb-6">
                <h5 className="text-white font-semibold mb-2">Why this match?</h5>
                <ul className="space-y-1">
                  {aiRecommendation.assignment_reasons.map((reason, idx) => (
                    <li key={idx} className="text-green-300 text-sm flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                      {reason}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Warnings */}
              {aiRecommendation.warnings && aiRecommendation.warnings.length > 0 && (
                <div className="bg-yellow-900/20 border border-yellow-800 rounded-lg p-4 mb-6">
                  <h5 className="text-yellow-400 font-semibold mb-2 flex items-center gap-2">
                    <AlertCircle className="h-4 w-4" />
                    Warnings
                  </h5>
                  <ul className="space-y-1">
                    {aiRecommendation.warnings.map((warning, idx) => (
                      <li key={idx} className="text-yellow-300 text-sm">• {warning}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Assign Button */}
              <Button
                onClick={handleAssignNow}
                disabled={isAssigning}
                className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-6 text-lg"
              >
                {isAssigning ? (
                  <>
                    <Sparkles className="h-5 w-5 mr-2 animate-spin" />
                    Assigning...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-5 w-5 mr-2" />
                    Assign Now
                    <ArrowRight className="h-5 w-5 ml-2" />
                  </>
                )}
              </Button>
            </div>
          )}

          {/* Available Resources (shown when no recommendation yet) */}
          {!aiRecommendation && !assignmentSuccess && (
            <>
              {/* Manual Assignment Section */}
              {(selectedVehicle || selectedDriver) && (
                <div className="bg-zinc-900 border border-zinc-700 rounded-xl p-6 mb-8">
                  <h3 className="text-white font-bold text-lg mb-4">Manual Selection</h3>
                  <div className="grid md:grid-cols-2 gap-4 mb-4">
                    {selectedVehicle && (
                      <div className="bg-zinc-800 border border-blue-600 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Truck className="h-4 w-4 text-blue-400" />
                          <span className="text-blue-400 font-semibold text-sm">Selected Vehicle</span>
                        </div>
                        <p className="text-white font-medium">{selectedVehicle.registration_no}</p>
                        <p className="text-zinc-400 text-sm">{getVehicleTypeName(selectedVehicle.type)} - {selectedVehicle.capacity_weight} kg</p>
                      </div>
                    )}
                    {selectedDriver && (
                      <div className="bg-zinc-800 border border-green-600 rounded-lg p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <User className="h-4 w-4 text-green-400" />
                          <span className="text-green-400 font-semibold text-sm">Selected Driver</span>
                        </div>
                        <p className="text-white font-medium">{selectedDriver.name}</p>
                        <div className="flex gap-1 mt-1">
                          {getDriverLicenses(selectedDriver).slice(0, 3).map((license) => (
                            <span key={license} className="text-xs bg-blue-900/30 border border-blue-800 text-blue-400 px-1.5 py-0.5 rounded">
                              {license}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  <Button
                    onClick={handleManualAssign}
                    disabled={!selectedVehicle || !selectedDriver || isAssigning}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold"
                  >
                    {isAssigning ? (
                      <>
                        <Sparkles className="h-4 w-4 mr-2 animate-spin" />
                        Assigning...
                      </>
                    ) : (
                      <>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Assign Selected Vehicle & Driver
                      </>
                    )}
                  </Button>
                </div>
              )}

              <div className="grid md:grid-cols-2 gap-8">
                {/* Available Vehicles */}
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Truck className="h-6 w-6 text-blue-400" />
                    <h3 className="text-xl font-bold text-white">Available Vehicles ({vehicles.length})</h3>
                  </div>
                  <div className="space-y-3 max-h-[600px] overflow-y-auto">
                    {/* Custom scrollbar styles */}
                    <style>{`
                      .custom-scrollbar::-webkit-scrollbar {
                        width: 10px;
                        background: #18181b;
                      }
                      .custom-scrollbar::-webkit-scrollbar-thumb {
                        background: #334155;
                        border-radius: 8px;
                        border: 2px solid #18181b;
                      }
                      .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                        background: #2563eb;
                      }
                    `}</style>
                    <div className="custom-scrollbar space-y-3 max-h-[600px] overflow-y-auto">
                      {vehicles.slice(0, 10).map((vehicle) => (
                        <div 
                          key={vehicle.id} 
                          onClick={() => setSelectedVehicle(vehicle)}
                          className={`bg-zinc-800 border rounded-lg p-4 cursor-pointer transition-all hover:bg-zinc-750 ${
                            selectedVehicle?.id === vehicle.id 
                              ? 'border-blue-500 ring-2 ring-blue-500/50' 
                              : 'border-zinc-700 hover:border-zinc-600'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-white font-medium">{vehicle.registration_no}</span>
                            <span className="text-xs bg-blue-900/30 border border-blue-800 text-blue-400 px-2 py-1 rounded">
                              {getVehicleTypeName(vehicle.type)}
                            </span>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div>
                              <span className="text-zinc-400">Capacity:</span>
                              <p className="text-white">{vehicle.capacity_weight} kg</p>
                            </div>
                            <div>
                              <span className="text-zinc-400">Volume:</span>
                              <p className="text-white">{vehicle.capacity_volume} m³</p>
                            </div>
                          </div>
                          {vehicle.has_forklift && (
                            <div className="mt-2">
                              <span className="text-xs bg-purple-900/30 border border-purple-800 text-purple-400 px-2 py-1 rounded">
                                ✓ Forklift
                              </span>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Available Drivers */}
                <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <User className="h-6 w-6 text-green-400" />
                    <h3 className="text-xl font-bold text-white">Available Drivers ({drivers.length})</h3>
                  </div>
                  <div className="space-y-3 max-h-[600px] overflow-y-auto">
                  {/* Custom scrollbar styles */}
                  <style>{`
                    .custom-scrollbar-driver::-webkit-scrollbar {
                      width: 10px;
                      background: #18181b;
                    }
                    .custom-scrollbar-driver::-webkit-scrollbar-thumb {
                      background: #334155;
                      border-radius: 8px;
                      border: 2px solid #18181b;
                    }
                    .custom-scrollbar-driver::-webkit-scrollbar-thumb:hover {
                      background: #22c55e;
                    }
                  `}</style>
                  <div className="custom-scrollbar-driver space-y-3 max-h-[600px] overflow-y-auto">
                    {drivers.slice(0, 10).map((driver) => (
                      <div 
                        key={driver.id} 
                        onClick={() => setSelectedDriver(driver)}
                        className={`bg-zinc-800 border rounded-lg p-4 cursor-pointer transition-all hover:bg-zinc-750 ${
                          selectedDriver?.id === driver.id 
                            ? 'border-green-500 ring-2 ring-green-500/50' 
                            : 'border-zinc-700 hover:border-zinc-600'
                        }`}
                      >
                        <p className="text-white font-medium mb-2">{driver.name}</p>
                        <div className="flex flex-wrap gap-2">
                          {getDriverLicenses(driver).map((license) => (
                            <span
                              key={license}
                              className={`text-xs px-2 py-1 rounded ${
                                license === 'ADR'
                                  ? 'bg-orange-900/30 border border-orange-800 text-orange-400'
                                  : license === 'Forklift'
                                  ? 'bg-purple-900/30 border border-purple-800 text-purple-400'
                                  : 'bg-blue-900/30 border border-blue-800 text-blue-400'
                              }`}
                            >
                              {license}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                  </div>
                </div>
              </div>
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
