import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { OrderForm } from '@/components/orders/OrderForm'
import { EmailUpload } from '@/components/orders/EmailUpload'
import { RequirementsSummary } from '@/components/orders/RequirementsSummary'
import { Navbar } from '@/components/layout'

type InputMode = 'manual' | 'email'

export function AddOrder() {
  const [inputMode, setInputMode] = useState<InputMode>('email')

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />

      {/* Main Content */}
      <main className="pt-24 pb-12 px-8">
        <div className="max-w-7xl mx-auto">
          {/* Page Title */}
          <div className="mb-8">
            <h2 className="text-4xl font-bold text-white mb-3">
              Add / Import Order
            </h2>
            <p className="text-zinc-400 text-lg">
              Enter data manually or let AI extract it from email
            </p>
          </div>

          {/* Input Mode Toggle */}
          <div className="flex gap-3 mb-8">
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
              Manual Form
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

