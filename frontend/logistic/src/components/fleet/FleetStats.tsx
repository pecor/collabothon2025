import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Truck, Users, TrendingUp, CheckCircle2 } from 'lucide-react'

interface FleetStatsProps {
  stats: {
    totalVehicles: number
    availableVehicles: number
    totalDrivers: number
    availableDrivers: number
    matchesFound?: number
  }
}

export function FleetStats({ stats }: FleetStatsProps) {
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="bg-zinc-800 p-2 rounded-lg">
              <Truck className="h-5 w-5 text-red-500" />
            </div>
            <div>
              <CardDescription className="text-zinc-500 text-xs">Vehicles</CardDescription>
              <CardTitle className="text-white text-2xl">
                {stats.availableVehicles}/{stats.totalVehicles}
              </CardTitle>
            </div>
          </div>
        </CardHeader>
      </Card>

      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="bg-zinc-800 p-2 rounded-lg">
              <Users className="h-5 w-5 text-red-500" />
            </div>
            <div>
              <CardDescription className="text-zinc-500 text-xs">Drivers</CardDescription>
              <CardTitle className="text-white text-2xl">
                {stats.availableDrivers}/{stats.totalDrivers}
              </CardTitle>
            </div>
          </div>
        </CardHeader>
      </Card>

      {stats.matchesFound !== undefined && (
        <>
          <Card className="bg-zinc-900 border-zinc-800">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="bg-zinc-800 p-2 rounded-lg">
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <CardDescription className="text-zinc-500 text-xs">Matches</CardDescription>
                  <CardTitle className="text-white text-2xl">{stats.matchesFound}</CardTitle>
                </div>
              </div>
            </CardHeader>
          </Card>

          <Card className="bg-gradient-to-br from-green-900/30 to-green-950/20 border-green-800">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="bg-green-900/50 p-2 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-green-400" />
                </div>
                <div>
                  <CardDescription className="text-green-300 text-xs">Avg. match</CardDescription>
                  <CardTitle className="text-white text-2xl">87%</CardTitle>
                </div>
              </div>
            </CardHeader>
          </Card>
        </>
      )}
    </div>
  )
}

