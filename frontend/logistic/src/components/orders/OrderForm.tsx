import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Package, Weight, Ruler, Thermometer } from 'lucide-react'
import { useState, useEffect } from 'react'
import { api, getCargoTypeOptions, getTemperatureOptions, getSpecialRequirementsOptions, calculateRoute } from '@/lib/api'
import type { Cargo, Route } from '@/lib/api'

interface OrderFormData {
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
}

export function OrderForm() {
  const [formData, setFormData] = useState<OrderFormData>({
    cargoType: '',
    weight: '',
    length: '',
    width: '',
    height: '',
    temperature: '',
    loadingAddress: '',
    unloadingAddress: '',
    loadingDate: '',
    unloadingDate: '',
    specialRequirements: ''
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // Options from API
  const [cargoTypeOptions, setCargoTypeOptions] = useState<string[]>([])
  const [temperatureOptions, setTemperatureOptions] = useState<string[]>([])
  const [specialRequirementsOptions, setSpecialRequirementsOptions] = useState<string[]>([])
  
  // Load options on mount
  useEffect(() => {
    const loadOptions = async () => {
      try {
        const [cargoTypes, temperatures, specialReqs] = await Promise.all([
          getCargoTypeOptions(),
          getTemperatureOptions(),
          getSpecialRequirementsOptions()
        ])
        
        setCargoTypeOptions(cargoTypes.choices)
        setTemperatureOptions(temperatures.choices)
        setSpecialRequirementsOptions(specialReqs.choices)
      } catch (err) {
        console.error('Failed to load options:', err)
      }
    }
    
    loadOptions()
  }, [])

  const handleChange = (field: keyof OrderFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)
    
    try {
      const origin = formData.loadingAddress || 'Warsaw'
      const destination = formData.unloadingAddress || 'Berlin'
      
      // Step 1: Calculate route with Google Maps to get real distance
      let distance_km = 500 // Default fallback
      let estimated_time = '06:00:00'
      
      try {
        const routeCalc = await calculateRoute({
          origin_address: origin,
          destination_address: destination,
          avoid_tolls: false,
          avoid_highways: false,
          avoid_ferries: false
        })
        distance_km = routeCalc.distance_km
        // Convert hours to HH:MM:SS format
        const hours = Math.floor(routeCalc.estimated_time_hours)
        const minutes = Math.round((routeCalc.estimated_time_hours - hours) * 60)
        estimated_time = `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:00`
        console.log('Route calculated:', routeCalc)
      } catch (routeError) {
        console.warn('Failed to calculate route, using defaults:', routeError)
      }
      
      // Step 2: Create Cargo
      const cargoData = {
        name: formData.cargoType || 'Generic Cargo',
        length: parseFloat(formData.length) || 100,
        width: parseFloat(formData.width) || 80,
        height: parseFloat(formData.height) || 120,
        weight: parseFloat(formData.weight) || 500,
        requires_cold: formData.temperature ? parseFloat(formData.temperature) < 10 : false,
        requires_box: true,
        requires_crate: false,
        forklift_needed: parseFloat(formData.weight) > 1000,
        license_c_required: true,
        license_ce_required: parseFloat(formData.weight) > 1500,
        license_adr_required: false,
        special_training: formData.specialRequirements ? [formData.specialRequirements] : []
      }
      
      const cargoResponse = await api.post<Cargo>('/cargos/', cargoData)
      console.log('Cargo created:', cargoResponse.data)
      
      // Step 3: Create Route with real distance
      const routeData = {
        origin,
        destination,
        distance_km,
        estimated_time,
        holiday_blocked: false,
        status: 'planned'
      }
      
      const newRouteResponse = await api.post<Route>('/routes/', routeData)
      const route = newRouteResponse.data
      console.log('Route created:', route)
      
      // Step 4: Create Order - backend will auto-calculate cost/revenue/profit
      const orderData = {
        user: 1, // Default user - in production this would come from auth
        cargo: cargoResponse.data.id,
        route: route.id,
        planned_date: formData.loadingDate || new Date().toISOString().split('T')[0],
        status: 'new',
        origin,
        destination,
        cargo_type: formData.cargoType || 'General Cargo',
        weight: parseFloat(formData.weight) || 0,
        temperature: formData.temperature || 'Ambient',
        special_requirements: formData.specialRequirements || 'None',
        loading_date: formData.loadingDate || new Date().toISOString().split('T')[0],
        unloading_date: formData.unloadingDate || formData.loadingDate || new Date().toISOString().split('T')[0]
      }
      
      console.log('Creating order with data:', orderData)
      const orderResponse = await api.post('/orders/', orderData)
      console.log('Order created with financials:', orderResponse.data)
      
      alert(`Order created successfully!\n\nCost: ${orderResponse.data.cost?.toFixed(2)} PLN\nRevenue: ${orderResponse.data.revenue?.toFixed(2)} PLN\nProfit: ${orderResponse.data.profit?.toFixed(2)} PLN`)
      
      // Navigate to orders list
      window.location.href = '/orders'
    } catch (err: any) {
      console.error('Error creating order:', err)
      console.error('Error details:', err.response?.data)
      const errorDetails = err.response?.data 
        ? JSON.stringify(err.response.data, null, 2)
        : err.message
      setError(errorDetails || 'Failed to create order')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card className="bg-zinc-900 border-zinc-800">
      <CardHeader>
        <CardTitle className="text-white text-2xl flex items-center gap-2">
          <Package className="h-6 w-6 text-red-500" />
          Order Parameters
        </CardTitle>
        <CardDescription className="text-zinc-400">
          Enter transport details
        </CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit} className="px-6 pb-6 space-y-6">
        {/* Error Display */}
        {error && (
          <div className="bg-red-900/20 border border-red-700 rounded-lg px-4 py-3 text-red-400">
            <strong>Error:</strong> {error}
          </div>
        )}
        
        {/* Cargo Details */}
        <div className="space-y-4">
          <h3 className="text-white font-semibold text-lg">Cargo Type</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-zinc-400 text-sm block mb-2">Cargo Type</label>
              <select
                value={formData.cargoType}
                onChange={(e) => handleChange('cargoType', e.target.value)}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-white placeholder:text-zinc-500 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20"
              >
                <option value="">Select cargo type...</option>
                {cargoTypeOptions.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-zinc-400 text-sm block mb-2 flex items-center gap-2">
                <Weight className="h-4 w-4" />
                Weight (kg)
              </label>
              <input
                type="number"
                placeholder="e.g. 1500"
                value={formData.weight}
                onChange={(e) => handleChange('weight', e.target.value)}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-white placeholder:text-zinc-500 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20"
              />
            </div>
          </div>
        </div>

        {/* Dimensions */}
        <div className="space-y-4">
          <h3 className="text-white font-semibold text-lg flex items-center gap-2">
            <Ruler className="h-5 w-5 text-red-500" />
            Dimensions (cm)
          </h3>
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="text-zinc-400 text-sm block mb-2">Length</label>
              <input
                type="number"
                placeholder="e.g. 240"
                value={formData.length}
                onChange={(e) => handleChange('length', e.target.value)}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-white placeholder:text-zinc-500 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20"
              />
            </div>
            <div>
              <label className="text-zinc-400 text-sm block mb-2">Width</label>
              <input
                type="number"
                placeholder="e.g. 120"
                value={formData.width}
                onChange={(e) => handleChange('width', e.target.value)}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-white placeholder:text-zinc-500 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20"
              />
            </div>
            <div>
              <label className="text-zinc-400 text-sm block mb-2">Height</label>
              <input
                type="number"
                placeholder="e.g. 180"
                value={formData.height}
                onChange={(e) => handleChange('height', e.target.value)}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-white placeholder:text-zinc-500 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20"
              />
            </div>
          </div>
        </div>

        {/* Temperature */}
        <div className="space-y-4">
          <h3 className="text-white font-semibold text-lg flex items-center gap-2">
            <Thermometer className="h-5 w-5 text-red-500" />
            Transport Conditions
          </h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-zinc-400 text-sm block mb-2">Temperature</label>
              <select
                value={formData.temperature}
                onChange={(e) => handleChange('temperature', e.target.value)}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-white placeholder:text-zinc-500 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20"
              >
                <option value="">Select temperature...</option>
                {temperatureOptions.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-zinc-400 text-sm block mb-2">Special Requirements</label>
              <select
                value={formData.specialRequirements}
                onChange={(e) => handleChange('specialRequirements', e.target.value)}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-white placeholder:text-zinc-500 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20"
              >
                <option value="">Select special requirements...</option>
                {specialRequirementsOptions.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Addresses */}
        <div className="space-y-4">
          <h3 className="text-white font-semibold text-lg">Loading / Unloading</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-zinc-400 text-sm block mb-2">Loading Address</label>
              <input
                type="text"
                placeholder="e.g. Warsaw, Transport St. 1"
                value={formData.loadingAddress}
                onChange={(e) => handleChange('loadingAddress', e.target.value)}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-white placeholder:text-zinc-500 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20"
              />
            </div>
            <div>
              <label className="text-zinc-400 text-sm block mb-2">Loading Date</label>
              <input
                type="date"
                value={formData.loadingDate}
                onChange={(e) => handleChange('loadingDate', e.target.value)}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-white placeholder:text-zinc-500 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20"
              />
            </div>
            <div>
              <label className="text-zinc-400 text-sm block mb-2">Unloading Address</label>
              <input
                type="text"
                placeholder="e.g. Berlin, Main St. 45"
                value={formData.unloadingAddress}
                onChange={(e) => handleChange('unloadingAddress', e.target.value)}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-white placeholder:text-zinc-500 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20"
              />
            </div>
            <div>
              <label className="text-zinc-400 text-sm block mb-2">Unloading Date</label>
              <input
                type="date"
                value={formData.unloadingDate}
                onChange={(e) => handleChange('unloadingDate', e.target.value)}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-white placeholder:text-zinc-500 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20"
              />
            </div>
          </div>
        </div>

        <div className="flex gap-4 pt-4">
          <Button
            type="submit"
            className="bg-red-600 hover:bg-red-700 text-white flex-1"
            size="lg"
            disabled={isLoading}
          >
            {isLoading ? 'Creating Order...' : 'Add Order'}
          </Button>
          <Button
            type="button"
            variant="outline"
            className="border-zinc-700 text-white hover:bg-zinc-800"
            size="lg"
            disabled={isLoading}
            onClick={() => {
              setFormData({
                cargoType: '',
                weight: '',
                length: '',
                width: '',
                height: '',
                temperature: '',
                loadingAddress: '',
                unloadingAddress: '',
                loadingDate: '',
                unloadingDate: '',
                specialRequirements: ''
              })
            }}
          >
            Clear
          </Button>
        </div>
      </form>
    </Card>
  )
}

