import { Button } from '@/components/ui/button'
import { Truck, ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { MapPlaceholder, RouteDetails, RouteRestrictions, VehicleStatus } from '@/components/route'

export function Route() {
  const navigate = useNavigate()

  const routeDetails = {
    from: 'Warszawa, ul. Transportowa 1',
    to: 'Berlin, Hauptstraße 45',
    distance: '573 km',
    duration: '6h 45min',
    eta: '2025-11-20 15:30'
  }

  const waypoints = [
    { name: 'Warszawa (start)', time: '08:00', status: 'completed', alert: null },
    { name: 'Poznań (postój)', time: '11:15', status: 'completed', alert: null },
    { name: 'Granica PL/DE', time: '13:30', status: 'current', alert: 'Kontrola celna - opóźnienie 15min' },
    { name: 'Frankfurt (Oder)', time: '14:00', status: 'pending', alert: null },
    { name: 'Berlin (cel)', time: '15:30', status: 'pending', alert: null }
  ]

  const restrictions = [
    { location: 'Niemcy - Autostrada A2', rule: 'Zakaz wyprzedzania ciężarówek 06:00-20:00', severity: 'info' },
    { location: 'Niemcy - ogólnokrajowy', rule: 'Brak zakazów świątecznych w tym dniu', severity: 'ok' }
  ]

  const vehicle = {
    name: 'Mercedes Actros',
    plate: 'WA 12345',
    driver: 'Jan Kowalski',
    speed: '87 km/h',
    fuel: '78%'
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-zinc-800 bg-black/80 backdrop-blur-sm">
        <div className="w-full px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Button variant="outline" size="icon" onClick={() => navigate('/matching')}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
              <div className="bg-red-600 p-2 rounded-lg">
                <Truck className="h-7 w-7 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">TruckAI</h1>
                <p className="text-xs text-zinc-500">Wizualizacja trasy</p>
              </div>
            </div>
          </div>
          <Button onClick={() => navigate('/dashboard')}>Dashboard</Button>
        </div>
      </header>

      <main className="pt-24 pb-12 px-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-white mb-3">Wizualizacja Trasy</h2>
          <p className="text-zinc-400 text-lg mb-8">Mapa, ETA i monitoring w czasie rzeczywistym</p>

          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <MapPlaceholder from={routeDetails.from} to={routeDetails.to} />
              <RouteDetails routeDetails={routeDetails} waypoints={waypoints} />
              <RouteRestrictions restrictions={restrictions} />
            </div>
            <VehicleStatus vehicle={vehicle} />
          </div>
        </div>
      </main>
    </div>
  )
}

