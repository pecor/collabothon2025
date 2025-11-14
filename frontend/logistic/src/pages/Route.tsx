import { MapPlaceholder, RouteDetails, RouteRestrictions, VehicleStatus } from '@/components/route'
import { Navbar } from '@/components/layout'

export function Route() {
  const routeDetails = {
    from: 'Warszawa, ul. Transportowa 1',
    to: 'Berlin, Hauptstraße 45',
    distance: '573 km',
    duration: '6h 45min',
    eta: '2025-11-20 15:30'
  }

  const waypoints = [
    { name: 'Warszawa (start)', time: '08:00', status: 'completed' as const, alert: null },
    { name: 'Poznań (postój)', time: '11:15', status: 'completed' as const, alert: null },
    { name: 'Granica PL/DE', time: '13:30', status: 'current' as const, alert: 'Kontrola celna - opóźnienie 15min' },
    { name: 'Frankfurt (Oder)', time: '14:00', status: 'pending' as const, alert: null },
    { name: 'Berlin (cel)', time: '15:30', status: 'pending' as const, alert: null }
  ]

  const restrictions = [
    { location: 'Niemcy - Autostrada A2', rule: 'Zakaz wyprzedzania ciężarówek 06:00-20:00', severity: 'info' as const },
    { location: 'Niemcy - ogólnokrajowy', rule: 'Brak zakazów świątecznych w tym dniu', severity: 'ok' as const }
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
      <Navbar />

      <main className="pt-24 pb-12 px-8">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-white mb-3">Route Visualization</h2>
          <p className="text-zinc-400 text-lg mb-8">Map, ETA and real-time monitoring</p>

          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <MapPlaceholder from={routeDetails.from} to={routeDetails.to} />
              <RouteDetails 
                from={routeDetails.from}
                to={routeDetails.to}
                distance={routeDetails.distance}
                duration={routeDetails.duration}
                waypoints={waypoints} 
              />
              <RouteRestrictions restrictions={restrictions} />
            </div>
            <VehicleStatus vehicle={vehicle} />
          </div>
        </div>
      </main>
    </div>
  )
}

