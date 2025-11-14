import { Card, CardHeader, CardTitle } from '@/components/ui/card'

interface Vehicle {
  name: string
  plate: string
  driver: string
  speed: string
  fuel: string
}

interface VehicleStatusProps {
  vehicle: Vehicle
}

export function VehicleStatus({ vehicle }: VehicleStatusProps) {
  return (
    <Card className="bg-zinc-900 border-zinc-800 sticky top-28">
      <CardHeader>
        <CardTitle className="text-white text-xl mb-4">Vehicle Status</CardTitle>
        <div className="space-y-4">
          <div className="bg-zinc-800 rounded-lg p-4">
            <p className="text-zinc-400 text-xs mb-1">Vehicle</p>
            <p className="text-white font-bold text-lg">{vehicle.name}</p>
            <p className="text-zinc-400 text-sm">{vehicle.plate}</p>
          </div>
          <div className="bg-zinc-800 rounded-lg p-4">
            <p className="text-zinc-400 text-xs mb-1">Driver</p>
            <p className="text-white font-medium">{vehicle.driver}</p>
          </div>
          <div className="bg-zinc-800 rounded-lg p-4">
            <p className="text-zinc-400 text-xs mb-1">Speed</p>
            <p className="text-white font-bold text-2xl">{vehicle.speed}</p>
          </div>
          <div className="bg-zinc-800 rounded-lg p-4">
            <p className="text-zinc-400 text-xs mb-1">Fuel</p>
            <div className="flex items-center gap-2">
              <div className="flex-1 h-2 bg-zinc-700 rounded-full overflow-hidden">
                <div className="h-full bg-green-500" style={{ width: vehicle.fuel }}></div>
              </div>
              <span className="text-white font-medium text-sm">{vehicle.fuel}</span>
            </div>
          </div>
          <div className="bg-green-900/30 border border-green-800 rounded-lg p-4">
            <p className="text-green-400 font-medium">🟢 Tracking Active</p>
            <p className="text-green-200 text-xs mt-1">Last update: 30s ago</p>
          </div>
        </div>
      </CardHeader>
    </Card>
  )
}

