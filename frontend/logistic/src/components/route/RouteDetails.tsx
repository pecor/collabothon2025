import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import { MapPin, Navigation, Clock, AlertCircle, CheckCircle2 } from 'lucide-react'

interface Waypoint {
  name: string
  time: string
  status: 'completed' | 'current' | 'pending'
  alert: string | null
}

interface RouteDetailsProps {
  from: string
  to: string
  distance: string
  duration: string
  waypoints: Waypoint[]
}

export function RouteDetails({ from, to, distance, duration, waypoints }: RouteDetailsProps) {
  return (
    <Card className="bg-zinc-900 border-zinc-800">
      <CardHeader>
        <CardTitle className="text-white text-xl mb-4">Szczegóły trasy</CardTitle>
        <div className="grid md:grid-cols-2 gap-4 mb-6">
          <div className="bg-zinc-800 rounded-lg p-4">
            <MapPin className="h-5 w-5 text-green-500 mb-2" />
            <p className="text-zinc-400 text-xs mb-1">Początek</p>
            <p className="text-white font-medium text-sm">{from}</p>
          </div>
          <div className="bg-zinc-800 rounded-lg p-4">
            <MapPin className="h-5 w-5 text-red-500 mb-2" />
            <p className="text-zinc-400 text-xs mb-1">Koniec</p>
            <p className="text-white font-medium text-sm">{to}</p>
          </div>
          <div className="bg-zinc-800 rounded-lg p-4">
            <Navigation className="h-5 w-5 text-blue-500 mb-2" />
            <p className="text-zinc-400 text-xs mb-1">Dystans</p>
            <p className="text-white font-bold text-lg">{distance}</p>
          </div>
          <div className="bg-zinc-800 rounded-lg p-4">
            <Clock className="h-5 w-5 text-yellow-500 mb-2" />
            <p className="text-zinc-400 text-xs mb-1">ETA</p>
            <p className="text-white font-bold text-lg">{duration}</p>
          </div>
        </div>

        <div className="space-y-3">
          {waypoints.map((point, idx) => (
            <div
              key={idx}
              className={`flex items-center gap-4 p-3 rounded-lg ${
                point.status === 'completed'
                  ? 'bg-green-900/20 border border-green-800'
                  : point.status === 'current'
                  ? 'bg-blue-900/20 border border-blue-800'
                  : 'bg-zinc-800 border border-zinc-700'
              }`}
            >
              <div className="flex-shrink-0">
                {point.status === 'completed' ? (
                  <CheckCircle2 className="h-6 w-6 text-green-500" />
                ) : point.status === 'current' ? (
                  <div className="h-6 w-6 rounded-full bg-blue-500 animate-pulse" />
                ) : (
                  <div className="h-6 w-6 rounded-full border-2 border-zinc-600" />
                )}
              </div>
              <div className="flex-1">
                <p className="text-white font-medium">{point.name}</p>
                <p className="text-zinc-400 text-sm">{point.time}</p>
                {point.alert && (
                  <div className="flex items-center gap-2 mt-1 text-yellow-400 text-xs">
                    <AlertCircle className="h-3 w-3" />
                    {point.alert}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardHeader>
    </Card>
  )
}

