import { Card, CardHeader } from '@/components/ui/card'
import { Navigation } from 'lucide-react'

interface MapPlaceholderProps {
  from: string
  to: string
}

export function MapPlaceholder({ from, to }: MapPlaceholderProps) {
  return (
    <Card className="bg-zinc-900 border-zinc-800">
      <CardHeader>
        <div className="aspect-video bg-zinc-800 rounded-lg flex items-center justify-center border border-zinc-700">
          <div className="text-center">
            <Navigation className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <p className="text-white text-lg font-semibold mb-2">Interactive Map</p>
            <p className="text-zinc-400 text-sm">
              Route map {from} → {to} will be displayed here
            </p>
            <p className="text-zinc-500 text-xs mt-2">(Integration: Google Maps / OpenStreetMap API)</p>
          </div>
        </div>
      </CardHeader>
    </Card>
  )
}

