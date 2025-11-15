import { Button } from '@/components/ui/button'
import { Truck } from 'lucide-react'
import { useNavigate, useLocation } from 'react-router-dom'

export function Navbar() {
  const navigate = useNavigate()
  const location = useLocation()

  const isActive = (path: string) => {
    return location.pathname === path
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b border-zinc-800 bg-black/80 backdrop-blur-sm">
      <div className="w-full px-4 md:px-8 py-3 md:py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-2 md:gap-0">
        <div 
          className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity mb-2 md:mb-0"
          onClick={() => navigate('/')}
        >
          <div className="bg-white px-4 py-2 rounded-lg">
            <img src="/logo2.png" alt="TruckAI Logo" className="h-10 w-16 object-contain" />
          </div>
          <h1 className="text-2xl font-bold text-white">TruckAI</h1>
        </div>
        <div className="flex items-center gap-2 md:gap-3 overflow-x-auto pb-1 md:pb-0">
          <Button 
            variant={isActive('/orders') ? 'default' : 'outline'}
            className={
              isActive('/orders')
                ? 'bg-red-600 hover:bg-red-700 text-white'
                : 'border-zinc-700 text-white hover:bg-zinc-900'
            }
            onClick={() => navigate('/orders')}
          >
            Orders
          </Button>
          <Button 
            variant={isActive('/fleet') ? 'default' : 'outline'}
            className={
              isActive('/fleet')
                ? 'bg-red-600 hover:bg-red-700 text-white'
                : 'border-zinc-700 text-white hover:bg-zinc-900'
            }
            onClick={() => navigate('/fleet')}
          >
            Fleet
          </Button>
          <Button 
            variant={isActive('/dashboard') ? 'default' : 'outline'}
            className={
              isActive('/dashboard')
                ? 'bg-red-600 hover:bg-red-700 text-white'
                : 'border-zinc-700 text-white hover:bg-zinc-900'
            }
            onClick={() => navigate('/dashboard')}
          >
            Dashboard
          </Button>
          <Button 
            variant={isActive('/docs') ? 'default' : 'outline'}
            className={
              isActive('/docs')
                ? 'bg-red-600 hover:bg-red-700 text-white'
                : 'border-zinc-700 text-white hover:bg-zinc-900'
            }
            onClick={() => navigate('/docs')}
          >
            API Docs
          </Button>
        </div>
      </div>
    </header>
  )
}

