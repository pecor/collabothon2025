import { Card, CardHeader, CardTitle } from '@/components/ui/card'

interface Order {
  id: string
  route: string
  status: 'completed' | 'in-progress'
  profit: number
  time: string
  score: number
}

interface RecentOrdersProps {
  orders: Order[]
}

export function RecentOrders({ orders }: RecentOrdersProps) {
  return (
    <Card className="bg-zinc-900 border-zinc-800">
      <CardHeader>
        <CardTitle className="text-white text-xl mb-4">Recent Orders</CardTitle>
        <div className="space-y-3">
          {orders.map(order => (
            <div key={order.id} className="bg-zinc-800 border border-zinc-700 rounded-lg p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <span className="text-zinc-400 font-mono text-sm">{order.id}</span>
                  <span
                    className={`px-2 py-0.5 rounded text-xs ${
                      order.status === 'completed'
                        ? 'bg-green-900/30 text-green-400'
                        : 'bg-blue-900/30 text-blue-400'
                    }`}
                  >
                    {order.status === 'completed' ? 'Completed' : 'In Transit'}
                  </span>
                </div>
                <span className="text-green-400 font-bold">+{order.profit} PLN</span>
              </div>
              <p className="text-white font-medium mb-2">{order.route}</p>
              <div className="flex items-center gap-4 text-sm text-zinc-400">
                <span>⏱ {order.time}</span>
                <span>📊 {order.score}% match</span>
              </div>
            </div>
          ))}
        </div>
      </CardHeader>
    </Card>
  )
}

