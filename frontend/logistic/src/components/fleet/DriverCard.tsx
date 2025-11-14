import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { User, CheckCircle2, XCircle, Award } from 'lucide-react'

interface DriverCardProps {
  driver: {
    id: string
    name: string
    licenses: string[]
    available: boolean
    experience: number
    rating: number
    matchScore?: number
  }
}

export function DriverCard({ driver }: DriverCardProps) {
  const getScoreColor = (score?: number) => {
    if (!score) return 'text-zinc-500'
    if (score >= 80) return 'text-green-400'
    if (score >= 60) return 'text-yellow-400'
    return 'text-red-400'
  }

  const getScoreBg = (score?: number) => {
    if (!score) return 'bg-zinc-800'
    if (score >= 80) return 'bg-green-900/30 border-green-800'
    if (score >= 60) return 'bg-yellow-900/30 border-yellow-800'
    return 'bg-red-900/30 border-red-800'
  }

  return (
    <Card className="bg-zinc-900 border-zinc-800 hover:border-zinc-700 transition-all">
      <CardHeader>
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="bg-zinc-800 p-3 rounded-lg">
              <User className="h-6 w-6 text-red-500" />
            </div>
            <div>
              <CardTitle className="text-white text-lg">{driver.name}</CardTitle>
              <CardDescription className="text-zinc-500 text-sm flex items-center gap-2">
                <Award className="h-3 w-3" />
                {driver.experience} lat doświadczenia
              </CardDescription>
            </div>
          </div>
          
          {driver.matchScore !== undefined && (
            <div className={`px-3 py-1.5 rounded-lg border ${getScoreBg(driver.matchScore)}`}>
              <span className={`text-lg font-bold ${getScoreColor(driver.matchScore)}`}>
                {driver.matchScore}%
              </span>
            </div>
          )}
        </div>

        <div className="space-y-3">
          <div>
            <span className="text-zinc-500 text-sm block mb-2">Uprawnienia:</span>
            <div className="flex flex-wrap gap-2">
              {driver.licenses.map((license, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-zinc-800 border border-zinc-700 rounded text-xs text-zinc-300 font-medium"
                >
                  {license}
                </span>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-sm pt-2">
            <div>
              <span className="text-zinc-500">Ocena:</span>
              <p className="text-white font-medium flex items-center gap-1">
                ⭐ {driver.rating.toFixed(1)} / 5.0
              </p>
            </div>
            <div className="flex items-center gap-2">
              {driver.available ? (
                <>
                  <CheckCircle2 className="h-4 w-4 text-green-500" />
                  <span className="text-green-400 text-sm font-medium">Dostępny</span>
                </>
              ) : (
                <>
                  <XCircle className="h-4 w-4 text-red-500" />
                  <span className="text-red-400 text-sm font-medium">Niedostępny</span>
                </>
              )}
            </div>
          </div>
        </div>
      </CardHeader>
    </Card>
  )
}

