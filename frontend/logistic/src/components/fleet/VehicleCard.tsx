import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Truck, Thermometer, Package, CheckCircle2, XCircle } from 'lucide-react'

interface VehicleCardProps {
  vehicle: {
    id: string
    name: string
    type: string
    capacity: number
    available: boolean
    features: string[]
    licensePlate: string
    matchScore?: number
  }
}

export function VehicleCard({ vehicle }: VehicleCardProps) {
  const getScoreColor = (score?: number) => {
    if (!score) return 'text-zinc-500'
    if (score >= 80) return 'text-green-400'
    if (score >= 60) return 'text-yellow-400'
    return 'text-red-400'
  }

  const getScoreBg = (score?: number) => {
    if (!score) return 'bg-zinc-800'
    if (score >= 80) return 'bg-green-900/30 border-green-800'
    if (score >= 60) return 'bg-yellow-900/30 border-yellow-800'
    return 'bg-red-900/30 border-red-800'
  }

  return (
    <Card className="bg-zinc-900 border-zinc-800 hover:border-zinc-700 transition-all">
      <CardHeader>
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="bg-zinc-800 p-3 rounded-lg">
              <Truck className="h-6 w-6 text-red-500" />
            </div>
            <div>
              <CardTitle className="text-white text-lg">{vehicle.name}</CardTitle>
              <CardDescription className="text-zinc-500 text-sm">
                {vehicle.licensePlate}
              </CardDescription>
            </div>
          </div>
          
          {vehicle.matchScore !== undefined && (
            <div className={`px-3 py-1.5 rounded-lg border ${getScoreBg(vehicle.matchScore)}`}>
              <span className={`text-lg font-bold ${getScoreColor(vehicle.matchScore)}`}>
                {vehicle.matchScore}%
              </span>
            </div>
          )}
        </div>

        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-zinc-500">Type:</span>
              <p className="text-white font-medium">{vehicle.type}</p>
            </div>
            <div>
              <span className="text-zinc-500">Capacity:</span>
              <p className="text-white font-medium">{vehicle.capacity} kg</p>
            </div>
          </div>

          <div>
            <span className="text-zinc-500 text-sm block mb-2">Special features:</span>
            <div className="flex flex-wrap gap-2">
              {vehicle.features.map((feature, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-zinc-800 border border-zinc-700 rounded text-xs text-zinc-300"
                >
                  {feature}
                </span>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2 pt-2">
            {vehicle.available ? (
              <>
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <span className="text-green-400 text-sm font-medium">Available</span>
              </>
            ) : (
              <>
                <XCircle className="h-4 w-4 text-red-500" />
                <span className="text-red-400 text-sm font-medium">Unavailable</span>
              </>
            )}
          </div>
        </div>
      </CardHeader>
    </Card>
  )
}

