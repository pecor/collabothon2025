import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Truck, ArrowLeft, Filter, Search } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { VehicleCard } from '@/components/fleet/VehicleCard'
import { DriverCard } from '@/components/fleet/DriverCard'
import { FleetStats } from '@/components/fleet/FleetStats'

type ViewMode = 'all' | 'vehicles' | 'drivers'

export function Fleet() {
  const navigate = useNavigate()
  const [viewMode, setViewMode] = useState<ViewMode>('all')
  const [searchQuery, setSearchQuery] = useState('')

  // Mock data - TODO: Replace with API
  const vehicles = [
    {
      id: '1',
      name: 'Mercedes Actros',
      type: 'Plandeka',
      capacity: 24000,
      available: true,
      features: ['Pasy mocujące', 'GPS', 'Klimatyzacja'],
      licensePlate: 'WA 12345',
      matchScore: 95
    },
    {
      id: '2',
      name: 'Volvo FH16',
      type: 'Chłodnia',
      capacity: 22000,
      available: true,
      features: ['Chłodnia -25°C', 'Multi-temp', 'Wózek widłowy'],
      licensePlate: 'WA 67890',
      matchScore: 78
    },
    {
      id: '3',
      name: 'Scania R450',
      type: 'Plandeka',
      capacity: 24000,
      available: false,
      features: ['Pasy mocujące', 'GPS'],
      licensePlate: 'WA 11111',
      matchScore: 87
    },
    {
      id: '4',
      name: 'MAN TGX',
      type: 'Box',
      capacity: 20000,
      available: true,
      features: ['Winda załadowcza', 'GPS'],
      licensePlate: 'WA 22222',
      matchScore: 65
    }
  ]

  const drivers = [
    {
      id: '1',
      name: 'Jan Kowalski',
      licenses: ['C+E', 'ADR', 'Wózek widłowy'],
      available: true,
      experience: 12,
      rating: 4.8,
      matchScore: 92
    },
    {
      id: '2',
      name: 'Anna Nowak',
      licenses: ['C+E', 'Wózek widłowy'],
      available: true,
      experience: 8,
      rating: 4.9,
      matchScore: 85
    },
    {
      id: '3',
      name: 'Piotr Wiśniewski',
      licenses: ['C', 'ADR'],
      available: false,
      experience: 15,
      rating: 4.7,
      matchScore: 70
    },
    {
      id: '4',
      name: 'Maria Lewandowska',
      licenses: ['C+E', 'ADR', 'Wózek widłowy'],
      available: true,
      experience: 10,
      rating: 5.0,
      matchScore: 98
    }
  ]

  const stats = {
    totalVehicles: vehicles.length,
    availableVehicles: vehicles.filter(v => v.available).length,
    totalDrivers: drivers.length,
    availableDrivers: drivers.filter(d => d.available).length,
    matchesFound: 4
  }

  const filteredVehicles = vehicles.filter(v =>
    v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.licensePlate.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const filteredDrivers = drivers.filter(d =>
    d.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header - Fixed */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-zinc-800 bg-black/80 backdrop-blur-sm">
        <div className="w-full px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Button
              variant="outline"
              size="icon"
              className="border-zinc-700 text-white hover:bg-zinc-900"
              onClick={() => navigate('/')}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div 
              className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => navigate('/')}
            >
              <div className="bg-red-600 p-2 rounded-lg">
                <Truck className="h-7 w-7 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">TruckAI</h1>
                <p className="text-xs text-zinc-500">Flota i kierowcy</p>
              </div>
            </div>
          </div>
          <Button 
            className="bg-red-600 hover:bg-red-700 text-white"
            onClick={() => navigate('/add-order')}
          >
            Dodaj zlecenie
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-24 pb-12 px-8">
        <div className="max-w-7xl mx-auto">
          {/* Page Title */}
          <div className="mb-8">
            <h2 className="text-4xl font-bold text-white mb-3">
              Dostępna Flota i Kierowcy
            </h2>
            <p className="text-zinc-400 text-lg">
              Lista pojazdów i kierowców z automatycznym dopasowaniem do zlecenia
            </p>
          </div>

          {/* Stats */}
          <div className="mb-8">
            <FleetStats stats={stats} />
          </div>

          {/* Filters & Search */}
          <div className="flex flex-col sm:flex-row gap-4 mb-8">
            <div className="flex gap-2">
              <Button
                onClick={() => setViewMode('all')}
                variant={viewMode === 'all' ? 'default' : 'outline'}
                className={
                  viewMode === 'all'
                    ? 'bg-red-600 hover:bg-red-700 text-white'
                    : 'border-zinc-700 text-white hover:bg-zinc-900'
                }
              >
                Wszystko
              </Button>
              <Button
                onClick={() => setViewMode('vehicles')}
                variant={viewMode === 'vehicles' ? 'default' : 'outline'}
                className={
                  viewMode === 'vehicles'
                    ? 'bg-red-600 hover:bg-red-700 text-white'
                    : 'border-zinc-700 text-white hover:bg-zinc-900'
                }
              >
                Pojazdy
              </Button>
              <Button
                onClick={() => setViewMode('drivers')}
                variant={viewMode === 'drivers' ? 'default' : 'outline'}
                className={
                  viewMode === 'drivers'
                    ? 'bg-red-600 hover:bg-red-700 text-white'
                    : 'border-zinc-700 text-white hover:bg-zinc-900'
                }
              >
                Kierowcy
              </Button>
            </div>

            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
              <input
                type="text"
                placeholder="Szukaj po nazwie, numerze rejestracyjnym..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-10 pr-4 py-2.5 text-white placeholder:text-zinc-500 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20"
              />
            </div>

            <Button
              variant="outline"
              className="border-zinc-700 text-white hover:bg-zinc-900"
            >
              <Filter className="h-4 w-4 mr-2" />
              Filtry
            </Button>
          </div>

          {/* Vehicles Section */}
          {(viewMode === 'all' || viewMode === 'vehicles') && (
            <div className="mb-12">
              <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                <Truck className="h-6 w-6 text-red-500" />
                Pojazdy ({filteredVehicles.length})
              </h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredVehicles.map(vehicle => (
                  <VehicleCard key={vehicle.id} vehicle={vehicle} />
                ))}
              </div>
            </div>
          )}

          {/* Drivers Section */}
          {(viewMode === 'all' || viewMode === 'drivers') && (
            <div>
              <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                <Truck className="h-6 w-6 text-red-500" />
                Kierowcy ({filteredDrivers.length})
              </h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredDrivers.map(driver => (
                  <DriverCard key={driver.id} driver={driver} />
                ))}
              </div>
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

