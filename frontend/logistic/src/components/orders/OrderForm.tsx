import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Package, Weight, Ruler, Thermometer } from 'lucide-react'
import { useState } from 'react'

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

  const handleChange = (field: keyof OrderFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Form submitted:', formData)
    
    // Get existing orders from localStorage
    const existingOrders = JSON.parse(localStorage.getItem('orders') || '[]')
    
    // Create new order with unique ID and timestamp
    const newOrder = {
      id: Date.now().toString(),
      ...formData,
      status: 'pending',
      createdAt: new Date().toISOString()
    }
    
    // Add to orders list
    existingOrders.push(newOrder)
    localStorage.setItem('orders', JSON.stringify(existingOrders))
    
    // Navigate to orders list
    window.location.href = '/orders'
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
        {/* Cargo Details */}
        <div className="space-y-4">
          <h3 className="text-white font-semibold text-lg">Cargo Type</h3>
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-zinc-400 text-sm block mb-2">Cargo Type</label>
              <input
                type="text"
                placeholder="e.g. Pallets, Boxes, Chemicals"
                value={formData.cargoType}
                onChange={(e) => handleChange('cargoType', e.target.value)}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-white placeholder:text-zinc-500 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20"
              />
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
              <label className="text-zinc-400 text-sm block mb-2">Temperature (°C)</label>
              <input
                type="text"
                placeholder="e.g. -18 to -20 or 'Ambient'"
                value={formData.temperature}
                onChange={(e) => handleChange('temperature', e.target.value)}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-white placeholder:text-zinc-500 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20"
              />
            </div>
            <div>
              <label className="text-zinc-400 text-sm block mb-2">Special Requirements</label>
              <input
                type="text"
                placeholder="e.g. ADR, Forklift, Tarpaulin"
                value={formData.specialRequirements}
                onChange={(e) => handleChange('specialRequirements', e.target.value)}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-white placeholder:text-zinc-500 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20"
              />
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
                type="datetime-local"
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
                type="datetime-local"
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
          >
            Add Order
          </Button>
          <Button
            type="button"
            variant="outline"
            className="border-zinc-700 text-white hover:bg-zinc-800"
            size="lg"
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

