import { Button } from '@/components/ui/button'
import { Card, CardHeader } from '@/components/ui/card'
import { Truck, User, DollarSign, TrendingUp, Clock, Sparkles } from 'lucide-react'

interface Match {
  id: number
  score: number
  vehicle: { name: string; plate: string; type: string }
  driver: { name: string; licenses: string[] }
  profit: number
  cost: number
  eta: string
  reasons: string[]
}

interface MatchCardProps {
  match: Match
  index: number
}

export function MatchCard({ match, index }: MatchCardProps) {
  return (
    <Card
      className={`${
        index === 0
          ? 'bg-gradient-to-r from-green-900/20 to-green-950/10 border-green-800'
          : 'bg-zinc-900 border-zinc-800'
      }`}
    >
      <CardHeader>
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-4">
            {index === 0 && (
              <div className="bg-green-600 px-3 py-1 rounded-full text-white text-sm font-bold">
                Rekomendowane
              </div>
            )}
            <div
              className={`text-3xl font-bold ${
                match.score >= 90 ? 'text-green-400' : match.score >= 80 ? 'text-yellow-400' : 'text-orange-400'
              }`}
            >
              {match.score}%
            </div>
          </div>
          <Button variant={index === 0 ? 'default' : 'outline'}>Wybierz ten zestaw</Button>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-4">
            <div className="flex items-center gap-3 mb-3">
              <Truck className="h-5 w-5 text-red-500" />
              <h3 className="text-white font-semibold">Pojazd</h3>
            </div>
            <p className="text-white text-lg font-medium mb-1">{match.vehicle.name}</p>
            <p className="text-zinc-400 text-sm mb-2">{match.vehicle.plate}</p>
            <span className="px-2 py-1 bg-zinc-700 rounded text-xs text-zinc-300">{match.vehicle.type}</span>
          </div>

          <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-4">
            <div className="flex items-center gap-3 mb-3">
              <User className="h-5 w-5 text-red-500" />
              <h3 className="text-white font-semibold">Kierowca</h3>
            </div>
            <p className="text-white text-lg font-medium mb-2">{match.driver.name}</p>
            <div className="flex gap-2">
              {match.driver.licenses.map(lic => (
                <span key={lic} className="px-2 py-1 bg-zinc-700 rounded text-xs text-zinc-300 font-medium">
                  {lic}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="bg-zinc-800 rounded-lg p-4 text-center">
            <DollarSign className="h-5 w-5 text-green-500 mx-auto mb-2" />
            <p className="text-zinc-400 text-xs mb-1">Zysk netto</p>
            <p className="text-white text-xl font-bold">{match.profit} PLN</p>
          </div>
          <div className="bg-zinc-800 rounded-lg p-4 text-center">
            <TrendingUp className="h-5 w-5 text-red-500 mx-auto mb-2" />
            <p className="text-zinc-400 text-xs mb-1">Koszt</p>
            <p className="text-white text-xl font-bold">{match.cost} PLN</p>
          </div>
          <div className="bg-zinc-800 rounded-lg p-4 text-center">
            <Clock className="h-5 w-5 text-blue-500 mx-auto mb-2" />
            <p className="text-zinc-400 text-xs mb-1">ETA</p>
            <p className="text-white text-xl font-bold">{match.eta}</p>
          </div>
        </div>

        <div className="bg-zinc-800 border border-zinc-700 rounded-lg p-4">
          <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-red-500" />
            Uzasadnienie AI
          </h4>
          <ul className="space-y-2">
            {match.reasons.map((reason, idx) => (
              <li key={idx} className="flex items-start gap-2 text-zinc-300 text-sm">
                <span className="text-red-500 mt-1">•</span>
                <span>{reason}</span>
              </li>
            ))}
          </ul>
        </div>
      </CardHeader>
    </Card>
  )
}

