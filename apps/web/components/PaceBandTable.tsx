import { formatPace } from '@/lib/mapbox'
import type { PaceBand } from '@/lib/types'

interface PaceBandTableProps {
  bands: PaceBand[]
}

const ZONE_COLOURS: Record<number, string> = {
  1: 'bg-blue-100 text-blue-700',
  2: 'bg-emerald-100 text-emerald-700',
  3: 'bg-amber-100 text-amber-700',
  4: 'bg-orange-100 text-orange-700',
  5: 'bg-red-100 text-red-700',
}

export function PaceBandTable({ bands }: PaceBandTableProps) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-xs text-gray-500 uppercase tracking-wider border-b border-gray-100">
            <th className="py-2 pr-4">Segment</th>
            <th className="py-2 pr-4">Distance</th>
            <th className="py-2 pr-4">Target pace</th>
            <th className="py-2 pr-4">Zone</th>
            <th className="py-2">Note</th>
          </tr>
        </thead>
        <tbody>
          {bands.map((band, i) => (
            <tr key={i} className="border-b border-gray-50 last:border-0">
              <td className="py-3 pr-4 font-medium text-gray-900">{band.label}</td>
              <td className="py-3 pr-4 text-gray-600">
                {band.start_km}–{band.end_km} km
              </td>
              <td className="py-3 pr-4 font-mono font-semibold text-gray-900">
                {formatPace(band.target_pace_sec_per_km)} /km
              </td>
              <td className="py-3 pr-4">
                <span className={`text-xs px-2 py-0.5 rounded font-medium ${ZONE_COLOURS[band.zone] ?? 'bg-gray-100 text-gray-600'}`}>
                  Z{band.zone}
                </span>
              </td>
              <td className="py-3 text-xs text-gray-500">{band.note}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
