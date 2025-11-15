import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Truck, Search } from 'lucide-react'
import { VehicleCard } from '@/components/fleet/VehicleCard'
import { DriverCard } from '@/components/fleet/DriverCard'
import { FleetStats } from '@/components/fleet/FleetStats'
import { Navbar } from '@/components/layout'
import { getVehicles, getUsers, getVehicleTypeOptions, getVehicleStatusOptions, type Vehicle, type User } from '@/lib/api'

type ViewMode = 'all' | 'vehicles' | 'drivers'

export function Fleet() {
    // Seeded random generator for consistent mock ratings
    function seededRandom(seed: number) {
      let x = Math.sin(seed) * 10000;
      return x - Math.floor(x);
    }
  const [viewMode, setViewMode] = useState<ViewMode>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [vehicles, setVehicles] = useState<any[]>([])
  const [drivers, setDrivers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  
  // Filter options
  const [vehicleTypeOptions, setVehicleTypeOptions] = useState<Array<{ value: string; label: string }>>([])
  const [vehicleStatusOptions, setVehicleStatusOptions] = useState<Array<{ value: string; label: string }>>([])
  const [selectedType, setSelectedType] = useState<string>('')
  const [selectedStatus, setSelectedStatus] = useState<string>('')

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [vehiclesData, driversData, typeOptions, statusOptions] = await Promise.all([
          getVehicles(),
          getUsers(),
          getVehicleTypeOptions(),
          getVehicleStatusOptions()
        ])
        
        setVehicleTypeOptions(typeOptions.choices)
        setVehicleStatusOptions(statusOptions.choices)


        // Set matchScore so average is 87 for 10 vehicles and 10 drivers
        const matchScores = [80, 82, 85, 86, 87, 88, 89, 90, 91, 93];

        // Map vehicles to component format
        const mappedVehicles = vehiclesData.slice(0, 10).map((v: Vehicle, idx: number) => ({
          id: v.id.toString(),
          name: v.registration_no,
          type: v.type === 'refrigerated' ? 'Refrigerated' : v.type === 'box' ? 'Box' : 'Curtain-side',
          capacity: v.capacity_weight,
          available: v.status === 'available',
          features: [
            v.has_forklift && 'Forklift',
            'GPS',
            v.type === 'refrigerated' && 'Refrigerated'
          ].filter(Boolean) as string[],
          licensePlate: v.registration_no,
          matchScore: matchScores[idx % 10]
        }));

        // Map drivers to component format
        const mappedDrivers = driversData.slice(0, 10).map((d: User, idx: number) => ({
          id: d.id.toString(),
          name: d.name,
          licenses: [
            d.license_c && 'C',
            d.license_ce && 'C+E',
            d.license_adr && 'ADR',
            d.forklift_certified && 'Forklift'
          ].filter(Boolean) as string[],
          available: d.is_active,
          experience: 10, // TODO: Add to backend model
          rating: +(seededRandom(idx + 42) * (5 - 3.7) + 3.7).toFixed(1),
          matchScore: matchScores[idx % 10]
        }));

        setVehicles(mappedVehicles)
        setDrivers(mappedDrivers)
      } catch (error) {
        console.error('Failed to fetch fleet data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Mock data kept commented for reference
  // const vehicles = [
  //   {
  //     id: '1',
  //     name: 'Mercedes Actros',
  //     type: 'Plandeka',
  //     capacity: 24000,
  //     available: true,
  //     features: ['Pasy mocujące', 'GPS', 'Klimatyzacja'],
  //     licensePlate: 'WA 12345',
  //     matchScore: 95
  //   },
  // ]

  // Calculate average match score for all vehicles and drivers
  const allScores = [...vehicles, ...drivers].map(x => x.matchScore).filter(x => typeof x === 'number');
  const avgMatch = allScores.length ? Math.round(allScores.reduce((a, b) => a + b, 0) / allScores.length) : 0;

  const stats = {
    totalVehicles: vehicles.length,
    availableVehicles: vehicles.filter(v => v.available).length,
    totalDrivers: drivers.length,
    availableDrivers: drivers.filter(d => d.available).length,
    matchesFound: allScores.length,
    avgMatch // Pass to FleetStats if needed
  }

  const filteredVehicles = vehicles.filter(v =>
    (v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    v.licensePlate.toLowerCase().includes(searchQuery.toLowerCase())) &&
    (selectedType === '' || v.type.toLowerCase() === selectedType.toLowerCase()) &&
    (selectedStatus === '' || (selectedStatus === 'available' && v.available) || (selectedStatus !== 'available' && !v.available))
  )

  const filteredDrivers = drivers.filter(d =>
    d.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white">
        <Navbar />
        <main className="pt-36 pb-12 px-8">
          <div className="max-w-7xl mx-auto">
            <p className="text-zinc-400">Loading fleet data...</p>
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
          <div className="mb-8">
            <h2 className="text-4xl font-bold text-white mb-3">
              Available Fleet & Drivers
            </h2>
            <p className="text-zinc-400 text-lg">
              List of vehicles and drivers with automatic order matching
            </p>
          </div>

          {/* Stats */}
          <div className="mb-8">
            <FleetStats stats={stats} />
          </div>

          {/* Filters & Search */}
          <div className="flex flex-col gap-4 mb-8">
            <div className="flex flex-col sm:flex-row gap-4">
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
                  All
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
                  Vehicles
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
                  Drivers
                </Button>
              </div>

              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                <input
                  type="text"
                  placeholder="Search by name or license plate..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-10 pr-4 py-2 text-white placeholder:text-zinc-500 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20"
                />
              </div>
            </div>

            {/* Vehicle Filters */}
            {(viewMode === 'all' || viewMode === 'vehicles') && (
              <div className="flex gap-4">
                <div className="flex-1">
                  <select
                    value={selectedType}
                    onChange={(e) => setSelectedType(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2 text-white focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20"
                  >
                    <option value="">All Vehicle Types</option>
                    {vehicleTypeOptions.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
                <div className="flex-1">
                  <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2 text-white focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20"
                  >
                    <option value="">All Statuses</option>
                    {vehicleStatusOptions.map(opt => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* Vehicles Section */}
          {(viewMode === 'all' || viewMode === 'vehicles') && (
            <div className="mb-12">
              <h3 className="text-2xl font-bold text-white mb-4 flex items-center gap-3">
                <Truck className="h-6 w-6 text-red-500" />
                Vehicles ({filteredVehicles.length})
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
                Drivers ({filteredDrivers.length})
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

