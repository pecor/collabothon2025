import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Truck, ArrowLeft, Package, MapPin, Calendar, Weight, Plus, Search } from 'lucide-react'
import { useNavigate } from 'react-router-dom'

interface Order {
  id: string
  cargoType: string
  weight: string
  length: string
  width: string
  height: string
  temperature: string
  loadingAddress: string
  unloadingAddress: string
  loadingDate: string
  unloadingDate: string
  specialRequirements: string
  status: 'pending' | 'matched' | 'in_transit' | 'completed'
  createdAt: string
}

export function Orders() {
  const navigate = useNavigate()
  const [orders, setOrders] = useState<Order[]>([])
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    // Load orders from localStorage
    const storedOrders = JSON.parse(localStorage.getItem('orders') || '[]')
    setOrders(storedOrders)
  }, [])

  const filteredOrders = orders.filter(order =>
    order.cargoType.toLowerCase().includes(searchQuery.toLowerCase()) ||
    order.loadingAddress.toLowerCase().includes(searchQuery.toLowerCase()) ||
    order.unloadingAddress.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-900/30 border-yellow-800 text-yellow-400'
      case 'matched':
        return 'bg-blue-900/30 border-blue-800 text-blue-400'
      case 'in_transit':
        return 'bg-green-900/30 border-green-800 text-green-400'
      case 'completed':
        return 'bg-zinc-800 border-zinc-700 text-zinc-400'
      default:
        return 'bg-zinc-800 border-zinc-700 text-zinc-400'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Oczekuje na dopasowanie'
      case 'matched':
        return 'Dopasowano kierowcę'
      case 'in_transit':
        return 'W transporcie'
      case 'completed':
        return 'Zakończone'
      default:
        return status
    }
  }

  const handleOrderClick = (orderId: string) => {
    // Store selected order ID and navigate to matching
    sessionStorage.setItem('selectedOrderId', orderId)
    navigate(`/matching?orderId=${orderId}`)
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-zinc-800 bg-black/80 backdrop-blur-sm">
        <div className="w-full px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Button
              variant="outline"
              size="icon"
              className="border-zinc-700 text-white hover:bg-zinc-900"
              onClick={() => navigate('/')}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div 
              className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => navigate('/')}
            >
              <div className="bg-red-600 p-2 rounded-lg">
                <Truck className="h-7 w-7 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">TruckAI</h1>
                <p className="text-xs text-zinc-500">Lista zleceń</p>
              </div>
            </div>
          </div>
          <Button 
            className="bg-red-600 hover:bg-red-700 text-white"
            onClick={() => navigate('/add-order')}
          >
            <Plus className="h-4 w-4 mr-2" />
            Dodaj zlecenie
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-24 pb-12 px-8">
        <div className="max-w-7xl mx-auto">
          {/* Page Title */}
          <div className="mb-8">
            <h2 className="text-4xl font-bold text-white mb-3">
              Lista Zleceń
            </h2>
            <p className="text-zinc-400 text-lg">
              Kliknij na zlecenie, aby dopasować kierowcę i pojazd
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-4 gap-4 mb-8">
            <div className="bg-yellow-900/20 border border-yellow-800 rounded-lg p-4">
              <p className="text-yellow-400 text-sm mb-1">Oczekujące</p>
              <p className="text-white text-2xl font-bold">
                {orders.filter(o => o.status === 'pending').length}
              </p>
            </div>
            <div className="bg-blue-900/20 border border-blue-800 rounded-lg p-4">
              <p className="text-blue-400 text-sm mb-1">Dopasowane</p>
              <p className="text-white text-2xl font-bold">
                {orders.filter(o => o.status === 'matched').length}
              </p>
            </div>
            <div className="bg-green-900/20 border border-green-800 rounded-lg p-4">
              <p className="text-green-400 text-sm mb-1">W transporcie</p>
              <p className="text-white text-2xl font-bold">
                {orders.filter(o => o.status === 'in_transit').length}
              </p>
            </div>
            <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-4">
              <p className="text-zinc-400 text-sm mb-1">Wszystkie</p>
              <p className="text-white text-2xl font-bold">{orders.length}</p>
            </div>
          </div>

          {/* Search */}
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
              <input
                type="text"
                placeholder="Szukaj po typie ładunku, adresie..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-lg pl-10 pr-4 py-3 text-white placeholder:text-zinc-500 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20"
              />
            </div>
          </div>

          {/* Orders List */}
          {filteredOrders.length === 0 ? (
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-12 text-center">
              <Package className="h-16 w-16 text-zinc-600 mx-auto mb-4" />
              <h3 className="text-white text-xl font-semibold mb-2">
                Brak zleceń
              </h3>
              <p className="text-zinc-400 mb-6">
                Dodaj pierwsze zlecenie, aby rozpocząć dopasowanie kierowców
              </p>
              <Button
                className="bg-red-600 hover:bg-red-700 text-white"
                onClick={() => navigate('/add-order')}
              >
                <Plus className="h-4 w-4 mr-2" />
                Dodaj zlecenie
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredOrders.map((order) => (
                <div
                  key={order.id}
                  onClick={() => handleOrderClick(order.id)}
                  className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 hover:border-zinc-700 hover:bg-zinc-800/50 transition-all cursor-pointer"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="bg-zinc-800 p-3 rounded-lg">
                        <Package className="h-6 w-6 text-red-500" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-white text-xl font-bold">
                            {order.cargoType || 'Brak opisu'}
                          </h3>
                          <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(order.status)}`}>
                            {getStatusText(order.status)}
                          </span>
                        </div>
                        <p className="text-zinc-500 text-sm">
                          Dodano: {new Date(order.createdAt).toLocaleString('pl-PL')}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      className="border-zinc-700 text-white hover:bg-red-600 hover:border-red-600"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleOrderClick(order.id)
                      }}
                    >
                      Dopasuj kierowcę
                    </Button>
                  </div>

                  <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Route */}
                    <div className="bg-zinc-800/50 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <MapPin className="h-4 w-4 text-green-500" />
                        <span className="text-zinc-400 text-xs">Trasa</span>
                      </div>
                      <p className="text-white text-sm font-medium">
                        {order.loadingAddress || 'Brak'} → {order.unloadingAddress || 'Brak'}
                      </p>
                    </div>

                    {/* Weight */}
                    <div className="bg-zinc-800/50 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <Weight className="h-4 w-4 text-blue-500" />
                        <span className="text-zinc-400 text-xs">Waga</span>
                      </div>
                      <p className="text-white text-sm font-medium">
                        {order.weight ? `${order.weight} kg` : 'Nie podano'}
                      </p>
                    </div>

                    {/* Dates */}
                    <div className="bg-zinc-800/50 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <Calendar className="h-4 w-4 text-yellow-500" />
                        <span className="text-zinc-400 text-xs">Załadunek</span>
                      </div>
                      <p className="text-white text-sm font-medium">
                        {order.loadingDate ? new Date(order.loadingDate).toLocaleString('pl-PL', { 
                          day: '2-digit', 
                          month: '2-digit', 
                          hour: '2-digit', 
                          minute: '2-digit' 
                        }) : 'Nie podano'}
                      </p>
                    </div>

                    {/* Special Requirements */}
                    <div className="bg-zinc-800/50 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <Truck className="h-4 w-4 text-red-500" />
                        <span className="text-zinc-400 text-xs">Wymagania</span>
                      </div>
                      <p className="text-white text-sm font-medium">
                        {order.specialRequirements || 'Brak'}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
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

