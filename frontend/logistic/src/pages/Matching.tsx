import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Truck, ArrowLeft, Sparkles, Eye, EyeOff, User, Package } from 'lucide-react'
import { useNavigate, useSearchParams } from 'react-router-dom'

interface TruckerMatch {
  id: string
  score: number
  vehicle: {
    name: string
    plate: string
    type: string
    capacity: number
    features: string[]
  }
  driver: {
    name: string
    licenses: string[]
    experience: number
    rating: number
  }
  profit: number
  cost: number
  eta: string
  reasons: string[]
}

export function Matching() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [showLowMatches, setShowLowMatches] = useState(false)
  const [currentOrder, setCurrentOrder] = useState<any>(null)

  useEffect(() => {
    // Get order ID from URL
    const orderId = searchParams.get('orderId')
    if (orderId) {
      // Load order from localStorage
      const orders = JSON.parse(localStorage.getItem('orders') || '[]')
      const order = orders.find((o: any) => o.id === orderId)
      if (order) {
        setCurrentOrder(order)
      }
    }
  }, [searchParams])

  // Mock data - In production, this would come from AI scoring based on order requirements
  const allMatches: TruckerMatch[] = [
    {
      id: '1',
      score: 98,
      vehicle: {
        name: 'Mercedes Actros',
        plate: 'WA 12345',
        type: 'Plandeka',
        capacity: 24000,
        features: ['Pasy mocujące', 'GPS', 'Klimatyzacja']
      },
      driver: {
        name: 'Jan Kowalski',
        licenses: ['C+E', 'ADR', 'Wózek widłowy'],
        experience: 12,
        rating: 4.8
      },
      profit: 3400,
      cost: 1800,
      eta: '12h 20min',
      reasons: [
        'Pełna zgodność z wymaganiami zlecenia',
        'Optymalna ładowność 24t',
        'Kierowca z certyfikatem ADR i 12 lat doświadczenia',
        'Pojazd dostępny od zaraz',
        'Najwyższy szacowany zysk'
      ]
    },
    {
      id: '2',
      score: 92,
      vehicle: {
        name: 'Scania R450',
        plate: 'WA 11111',
        type: 'Plandeka',
        capacity: 24000,
        features: ['Pasy mocujące', 'GPS']
      },
      driver: {
        name: 'Maria Lewandowska',
        licenses: ['C+E', 'ADR', 'Wózek widłowy'],
        experience: 10,
        rating: 5.0
      },
      profit: 3200,
      cost: 1900,
      eta: '12h 35min',
      reasons: [
        'Wszystkie wymagania spełnione',
        'Kierowca z najwyższą oceną (5.0)',
        'Dodatkowe uprawnienie wózka widłowego',
        'Bardzo dobra relacja zysk/koszt'
      ]
    },
    {
      id: '3',
      score: 85,
      vehicle: {
        name: 'Volvo FH16',
        plate: 'WA 67890',
        type: 'Chłodnia',
        capacity: 22000,
        features: ['Chłodnia -25°C', 'Multi-temp', 'Wózek widłowy']
      },
      driver: {
        name: 'Anna Nowak',
        licenses: ['C+E', 'Wózek widłowy'],
        experience: 8,
        rating: 4.9
      },
      profit: 2900,
      cost: 2100,
      eta: '13h 10min',
      reasons: [
        'Podstawowe wymagania spełnione',
        'Nadmiarowa funkcja chłodni (może być przydatna)',
        'Bardzo wysoka ocena kierowcy',
        'Nieznacznie wyższe koszty eksploatacji'
      ]
    },
    {
      id: '4',
      score: 78,
      vehicle: {
        name: 'MAN TGX',
        plate: 'WA 22222',
        type: 'Box',
        capacity: 20000,
        features: ['Winda załadowcza', 'GPS']
      },
      driver: {
        name: 'Piotr Wiśniewski',
        licenses: ['C', 'ADR'],
        experience: 15,
        rating: 4.7
      },
      profit: 2600,
      cost: 2000,
      eta: '13h 45min',
      reasons: [
        'Dopuszczalna ładowność (20t)',
        'Doświadczony kierowca (15 lat)',
        'Dłuższy czas realizacji',
        'Brak licencji C+E (może być wymagana)'
      ]
    },
    {
      id: '5',
      score: 55,
      vehicle: {
        name: 'DAF XF',
        plate: 'WA 33333',
        type: 'Plandeka',
        capacity: 18000,
        features: ['GPS']
      },
      driver: {
        name: 'Tomasz Kamiński',
        licenses: ['C'],
        experience: 5,
        rating: 4.3
      },
      profit: 2100,
      cost: 1700,
      eta: '14h 30min',
      reasons: [
        'Za mała ładowność (18t)',
        'Brak kluczowych certyfikatów',
        'Niskie doświadczenie kierowcy',
        'Długi czas realizacji'
      ]
    },
    {
      id: '6',
      score: 42,
      vehicle: {
        name: 'Iveco Stralis',
        plate: 'WA 44444',
        type: 'Furgon',
        capacity: 16000,
        features: ['GPS']
      },
      driver: {
        name: 'Paweł Nowicki',
        licenses: ['C'],
        experience: 3,
        rating: 4.1
      },
      profit: 1800,
      cost: 1900,
      eta: '15h 20min',
      reasons: [
        'Niewystarczająca ładowność',
        'Brak wymaganych certyfikatów',
        'Mało doświadczony kierowca',
        'Niska rentowność'
      ]
    }
  ]

  // Sort by score descending
  const sortedMatches = [...allMatches].sort((a, b) => b.score - a.score)
  
  // Filter matches based on threshold
  const highMatches = sortedMatches.filter(m => m.score >= 60)
  const lowMatches = sortedMatches.filter(m => m.score < 60)

  const displayedMatches = showLowMatches ? sortedMatches : highMatches

  const getMatchCardBg = (score: number) => {
    if (score >= 90) return 'bg-gradient-to-br from-green-900/30 to-green-950/20 border-green-800'
    if (score >= 75) return 'bg-gradient-to-br from-blue-900/30 to-blue-950/20 border-blue-800'
    if (score >= 60) return 'bg-gradient-to-br from-yellow-900/30 to-yellow-950/20 border-yellow-800'
    return 'bg-gradient-to-br from-red-900/30 to-red-950/20 border-red-800'
  }

  const getScoreBadge = (score: number) => {
    if (score >= 90) return { text: 'IDEALNY', color: 'bg-green-600 text-white' }
    if (score >= 75) return { text: 'BARDZO DOBRY', color: 'bg-blue-600 text-white' }
    if (score >= 60) return { text: 'AKCEPTOWALNY', color: 'bg-yellow-600 text-black' }
    return { text: 'NIE POLECANY', color: 'bg-red-600 text-white' }
  }

  const handleSelectMatch = (match: TruckerMatch) => {
    const orderId = searchParams.get('orderId')
    if (!orderId || !currentOrder) {
      alert('Brak danych zlecenia!')
      return
    }

    // Update order status to 'matched' and add trucker info
    const orders = JSON.parse(localStorage.getItem('orders') || '[]')
    const updatedOrders = orders.map((order: any) => {
      if (order.id === orderId) {
        return {
          ...order,
          status: 'matched',
          matchedTrucker: {
            vehicle: match.vehicle,
            driver: match.driver,
            score: match.score,
            profit: match.profit,
            cost: match.cost,
            eta: match.eta
          },
          matchedAt: new Date().toISOString()
        }
      }
      return order
    })

    localStorage.setItem('orders', JSON.stringify(updatedOrders))
    
    // Show success message and redirect
    alert(`✅ Zlecenie dopasowane!\n\nKierowca: ${match.driver.name}\nPojazd: ${match.vehicle.name}\nDopasowanie: ${match.score}%`)
    navigate('/orders')
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-zinc-800 bg-black/80 backdrop-blur-sm">
        <div className="w-full px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-6">
            <Button 
              variant="outline" 
              size="icon"
              className="border-zinc-700 text-white hover:bg-zinc-900"
              onClick={() => navigate('/add-order')}
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
              <div className="bg-red-600 p-2 rounded-lg">
                <Truck className="h-7 w-7 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">TruckAI</h1>
                <p className="text-xs text-zinc-500">Dopasowanie AI</p>
              </div>
            </div>
          </div>
          <div className="flex gap-3">
            <Button 
              variant="outline"
              className="border-zinc-700 text-white hover:bg-zinc-900"
              onClick={() => navigate('/fleet')}
            >
              Zobacz całą flotę
            </Button>
            <Button 
              className="bg-red-600 hover:bg-red-700 text-white"
              onClick={() => navigate('/route')}
            >
              Zobacz trasę
            </Button>
          </div>
        </div>
      </header>

      <main className="pt-24 pb-12 px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-3 mb-3">
            <Sparkles className="h-8 w-8 text-red-500" />
            <h2 className="text-4xl font-bold text-white">Dopasowani Truckerzy</h2>
          </div>
          <p className="text-zinc-400 text-lg mb-8">
            Najlepsze zestawy pojazd + kierowca dla Twojego zlecenia • Znaleziono {allMatches.length} dopasowań
          </p>

          {/* Current Order Info */}
          {currentOrder && (
            <div className="bg-gradient-to-r from-red-900/30 to-red-950/20 border border-red-800 rounded-xl p-6 mb-8">
              <div className="flex items-start gap-4">
                <div className="bg-red-600 p-3 rounded-lg">
                  <Package className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-white text-xl font-bold mb-2">
                    Zlecenie: {currentOrder.cargoType || 'Bez opisu'}
                  </h3>
                  <div className="grid md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-red-300">Trasa:</span>
                      <p className="text-white font-medium">{currentOrder.loadingAddress} → {currentOrder.unloadingAddress}</p>
                    </div>
                    <div>
                      <span className="text-red-300">Waga:</span>
                      <p className="text-white font-medium">{currentOrder.weight} kg</p>
                    </div>
                    <div>
                      <span className="text-red-300">Wymiary:</span>
                      <p className="text-white font-medium">{currentOrder.length} × {currentOrder.width} × {currentOrder.height} cm</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Stats Summary */}
          <div className="grid grid-cols-4 gap-4 mb-8">
            <div className="bg-green-900/20 border border-green-800 rounded-lg p-4">
              <p className="text-green-400 text-sm mb-1">Idealny match</p>
              <p className="text-white text-2xl font-bold">{allMatches.filter(m => m.score >= 90).length}</p>
            </div>
            <div className="bg-blue-900/20 border border-blue-800 rounded-lg p-4">
              <p className="text-blue-400 text-sm mb-1">Bardzo dobry</p>
              <p className="text-white text-2xl font-bold">{allMatches.filter(m => m.score >= 75 && m.score < 90).length}</p>
            </div>
            <div className="bg-yellow-900/20 border border-yellow-800 rounded-lg p-4">
              <p className="text-yellow-400 text-sm mb-1">Akceptowalny</p>
              <p className="text-white text-2xl font-bold">{allMatches.filter(m => m.score >= 60 && m.score < 75).length}</p>
            </div>
            <div className="bg-red-900/20 border border-red-800 rounded-lg p-4">
              <p className="text-red-400 text-sm mb-1">Niska zgodność</p>
              <p className="text-white text-2xl font-bold">{lowMatches.length}</p>
            </div>
          </div>

          {/* Toggle low matches */}
          {lowMatches.length > 0 && (
            <div className="mb-6">
              <Button
                variant="outline"
                className="border-zinc-700 text-white hover:bg-zinc-900"
                onClick={() => setShowLowMatches(!showLowMatches)}
              >
                {showLowMatches ? (
                  <>
                    <EyeOff className="h-4 w-4 mr-2" />
                    Ukryj niskie dopasowania
                  </>
                ) : (
                  <>
                    <Eye className="h-4 w-4 mr-2" />
                    Pokaż wszystkie ({lowMatches.length} ukrytych)
                  </>
                )}
              </Button>
            </div>
          )}

          {/* Matches List */}
          <div className="space-y-6">
            {displayedMatches.map((match, index) => {
              const badge = getScoreBadge(match.score)
              
              return (
                <div
                  key={match.id}
                  className={`border rounded-xl p-6 ${getMatchCardBg(match.score)} hover:scale-[1.01] transition-all`}
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center gap-4">
                      <div className="bg-black/30 rounded-full w-12 h-12 flex items-center justify-center text-2xl font-bold text-white border border-zinc-700">
                        #{index + 1}
                      </div>
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-2xl font-bold text-white">
                            {match.score}% Dopasowanie
                          </h3>
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${badge.color}`}>
                            {badge.text}
                          </span>
                        </div>
                        <p className="text-zinc-400">Szacowany zysk: <span className="text-green-400 font-bold">{match.profit} PLN</span> • Koszt: {match.cost} PLN • ETA: {match.eta}</p>
                      </div>
                    </div>
                  </div>

                  {/* Vehicle + Driver Grid */}
                  <div className="grid md:grid-cols-2 gap-6 mb-6">
                    {/* Vehicle */}
                    <div className="bg-black/30 rounded-lg p-5 border border-zinc-700">
                      <div className="flex items-center gap-3 mb-4">
                        <Truck className="h-6 w-6 text-red-500" />
                        <div>
                          <h4 className="text-white font-bold text-lg">{match.vehicle.name}</h4>
                          <p className="text-zinc-400 text-sm">{match.vehicle.plate}</p>
                        </div>
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-zinc-400">Typ:</span>
                          <span className="text-white font-medium">{match.vehicle.type}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-zinc-400">Ładowność:</span>
                          <span className="text-white font-medium">{match.vehicle.capacity} kg</span>
                        </div>
                        <div className="mt-3">
                          <span className="text-zinc-400 text-xs block mb-2">Cechy:</span>
                          <div className="flex flex-wrap gap-2">
                            {match.vehicle.features.map((feat, i) => (
                              <span key={i} className="px-2 py-1 bg-zinc-800 rounded text-xs text-zinc-300">
                                {feat}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Driver */}
                    <div className="bg-black/30 rounded-lg p-5 border border-zinc-700">
                      <div className="flex items-center gap-3 mb-4">
                        <User className="h-6 w-6 text-red-500" />
                        <div>
                          <h4 className="text-white font-bold text-lg">{match.driver.name}</h4>
                          <p className="text-zinc-400 text-sm">{match.driver.experience} lat doświadczenia</p>
                        </div>
                      </div>
                      <div className="space-y-2 text-sm mb-3">
                        <div className="flex justify-between">
                          <span className="text-zinc-400">Ocena:</span>
                          <span className="text-white font-medium">⭐ {match.driver.rating.toFixed(1)} / 5.0</span>
                        </div>
                      </div>
                      <div>
                        <span className="text-zinc-400 text-xs block mb-2">Uprawnienia:</span>
                        <div className="flex flex-wrap gap-2">
                          {match.driver.licenses.map((lic, i) => (
                            <span key={i} className="px-2 py-1 bg-zinc-800 rounded text-xs text-zinc-300 font-medium">
                              {lic}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Reasons */}
                  <div className="bg-black/30 rounded-lg p-5 border border-zinc-700">
                    <h5 className="text-white font-semibold mb-3 flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-red-500" />
                      Dlaczego ten zestaw?
                    </h5>
                    <ul className="space-y-2">
                      {match.reasons.map((reason, i) => (
                        <li key={i} className="text-zinc-300 text-sm flex items-start gap-2">
                          <span className="text-red-500 mt-0.5">•</span>
                          {reason}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Action */}
                  <div className="mt-6 flex gap-3">
                    <Button 
                      className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                      size="lg"
                      onClick={() => handleSelectMatch(match)}
                    >
                      Wybierz ten zestaw
                    </Button>
                    <Button 
                      variant="outline"
                      className="border-zinc-700 text-white hover:bg-zinc-800"
                      size="lg"
                      onClick={() => navigate(`/route?orderId=${searchParams.get('orderId')}`)}
                    >
                      Zobacz trasę
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>

          {!showLowMatches && lowMatches.length > 0 && (
            <div className="mt-8 p-6 bg-zinc-900 border border-zinc-800 rounded-lg text-center">
              <p className="text-zinc-400 mb-3">
                Ukryto {lowMatches.length} dopasowań z niską zgodnością (&lt;60%)
              </p>
              <Button
                variant="outline"
                className="border-zinc-700 text-white hover:bg-zinc-900"
                onClick={() => setShowLowMatches(true)}
              >
                Pokaż wszystkie dopasowania
              </Button>
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


