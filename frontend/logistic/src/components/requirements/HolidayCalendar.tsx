import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import { Calendar } from 'lucide-react'

interface Holiday {
  date: string
  country: string
  name: string
  restriction: string
  severity: 'critical' | 'high' | 'medium' | 'low'
}

interface HolidayCalendarProps {
  holidays: Holiday[]
}

export function HolidayCalendar({ holidays }: HolidayCalendarProps) {
  return (
    <Card className="bg-zinc-900 border-zinc-800 sticky top-28">
      <CardHeader>
        <CardTitle className="text-white text-xl flex items-center gap-2 mb-4">
          <Calendar className="h-5 w-5 text-red-500" />
          Restrictions Calendar
        </CardTitle>
        <div className="space-y-3">
          {holidays.map((holiday, idx) => (
            <div
              key={idx}
              className={`p-3 rounded-lg border ${
                holiday.severity === 'critical'
                  ? 'bg-red-900/20 border-red-800'
                  : holiday.severity === 'high'
                  ? 'bg-orange-900/20 border-orange-800'
                  : 'bg-yellow-900/20 border-yellow-800'
              }`}
            >
              <div className="text-white font-medium text-sm mb-1">{holiday.date}</div>
              <div className="text-xs text-zinc-400 mb-1">{holiday.country}</div>
              <div className="text-white text-sm font-semibold mb-1">{holiday.name}</div>
              <div className="text-xs text-zinc-300">{holiday.restriction}</div>
            </div>
          ))}
        </div>
      </CardHeader>
    </Card>
  )
}

