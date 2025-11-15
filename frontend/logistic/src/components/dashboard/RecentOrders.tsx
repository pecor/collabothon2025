import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import { type Order as ApiOrder } from '@/lib/api'
import { useState } from 'react'
import { OrderModal } from './OrderModal'

interface Order {
  id: number
  route: string
  status: 'completed' | 'in-progress'
  profit: number
  loadingDate: string
  unloadingDate: string
  driver: string
  vehicle: string
  fullOrder: ApiOrder
}

interface RecentOrdersProps {
  orders: Order[]
}

export function RecentOrders({ orders }: RecentOrdersProps) {
  const [selectedOrder, setSelectedOrder] = useState<ApiOrder | null>(null)

  const handleOrderClick = (order: Order) => {
    setSelectedOrder(order.fullOrder)
  }

  return (
    <>
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-white text-xl mb-4">Active Orders</CardTitle>
          <div className="space-y-3">
            {orders.map((order, idx) => (
              <div 
                key={idx} 
                className="bg-zinc-800 border border-zinc-700 rounded-lg p-4 cursor-pointer hover:border-red-500 hover:bg-zinc-700/50 transition-all animate-in fade-in slide-in-from-bottom-4 duration-500"
                style={{ animationDelay: `${idx * 100}ms`, animationFillMode: 'backwards' }}
                onClick={() => handleOrderClick(order)}
              >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
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
                <span className="text-green-400 font-bold">+{order.profit.toLocaleString()} PLN</span>
              </div>
              <p className="text-white font-medium mb-3">{order.route}</p>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <span className="text-zinc-400">Loading: </span>
                  <span className="text-white">{new Date(order.loadingDate).toLocaleDateString()}</span>
                </div>
                <div>
                  <span className="text-zinc-400">Unloading: </span>
                  <span className="text-white">{new Date(order.unloadingDate).toLocaleDateString()}</span>
                </div>
                <div>
                  <span className="text-zinc-400">Driver: </span>
                  <span className="text-white">{order.driver}</span>
                </div>
                <div>
                  <span className="text-zinc-400">Vehicle: </span>
                  <span className="text-white">{order.vehicle}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardHeader>
    </Card>
    
    {/* Order Modal */}
    {selectedOrder && (
      <OrderModal
        order={selectedOrder}
        isOpen={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
      />
    )}
    </>
  )
}

