import { Card, CardHeader, CardTitle } from '@/components/ui/card'

interface Route {
  route: string
  count: number
  avgProfit: number
  avgScore: number
}

interface TopRoutesProps {
  routes: Route[]
}

export function TopRoutes({ routes }: TopRoutesProps) {
  return (
    <Card className="bg-zinc-900 border-zinc-800">
      <CardHeader>
        <CardTitle className="text-white text-xl mb-4">Top Routes (Case Study)</CardTitle>
        <div className="space-y-3">
          {routes.map((route, idx) => (
            <div key={idx} className="bg-zinc-800 border border-zinc-700 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <p className="text-white font-semibold">{route.route}</p>
                <span className="text-zinc-400 text-sm">{route.count} trips</span>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-zinc-400 text-xs">Avg Profit</p>
                  <p className="text-green-400 font-bold">{route.avgProfit} PLN</p>
                </div>
                <div>
                  <p className="text-zinc-400 text-xs">Avg Match</p>
                  <p className="text-blue-400 font-bold">{route.avgScore}%</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardHeader>
    </Card>
  )
}

