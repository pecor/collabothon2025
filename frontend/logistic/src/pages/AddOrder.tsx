import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Truck, ArrowLeft } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { OrderForm } from '@/components/orders/OrderForm'
import { EmailUpload } from '@/components/orders/EmailUpload'
import { RequirementsSummary } from '@/components/orders/RequirementsSummary'

type InputMode = 'manual' | 'email'

export function AddOrder() {
  const navigate = useNavigate()
  const [inputMode, setInputMode] = useState<InputMode>('manual')

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header - Fixed */}
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
                <p className="text-xs text-zinc-500">Dodaj nowe zlecenie</p>
              </div>
            </div>
          </div>
          <Button variant="outline" className="border-zinc-700 text-white hover:bg-zinc-900">
            Zapisz jako szkic
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="pt-24 pb-12 px-8">
        <div className="max-w-7xl mx-auto">
          {/* Page Title */}
          <div className="mb-8">
            <h2 className="text-4xl font-bold text-white mb-3">
              Dodaj / Pobierz Zlecenie
            </h2>
            <p className="text-zinc-400 text-lg">
              Wprowadź dane ręcznie lub pozwól AI wyodrębnić je z maila
            </p>
          </div>

          {/* Input Mode Toggle */}
          <div className="flex gap-3 mb-8">
            <Button
              onClick={() => setInputMode('manual')}
              variant={inputMode === 'manual' ? 'default' : 'outline'}
              className={
                inputMode === 'manual'
                  ? 'bg-red-600 hover:bg-red-700 text-white'
                  : 'border-zinc-700 text-white hover:bg-zinc-900'
              }
              size="lg"
            >
              Formularz ręczny
            </Button>
            <Button
              onClick={() => setInputMode('email')}
              variant={inputMode === 'email' ? 'default' : 'outline'}
              className={
                inputMode === 'email'
                  ? 'bg-red-600 hover:bg-red-700 text-white'
                  : 'border-zinc-700 text-white hover:bg-zinc-900'
              }
              size="lg"
            >
              Upload / Email AI
            </Button>
          </div>

          {/* Two Column Layout */}
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Left Column - Input */}
            <div className="lg:col-span-2 space-y-8">
              {inputMode === 'manual' ? (
                <OrderForm />
              ) : (
                <EmailUpload />
              )}
            </div>

            {/* Right Column - Summary */}
            <div className="lg:col-span-1">
              <div className="sticky top-28">
                <RequirementsSummary />
              </div>
            </div>
          </div>
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

