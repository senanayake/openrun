import { formatPace } from '@/lib/mapbox'
import type { PaceZone } from '@/lib/types'

interface PaceZoneBarProps {
  zones: PaceZone[]
  currentPaceSecPerKm?: number
}

export function PaceZoneBar({ zones, currentPaceSecPerKm }: PaceZoneBarProps) {
  if (!zones || zones.length === 0) return null

  const fastest = Math.min(...zones.map(z => z.min_pace_sec_per_km))
  const slowest = Math.max(...zones.map(z => z.max_pace_sec_per_km))
  const range = slowest - fastest

  return (
    <div data-testid="pace-zone-bar">
      <div className="flex rounded-lg overflow-hidden h-6 w-full">
        {zones.map(zone => {
          const width = ((zone.max_pace_sec_per_km - zone.min_pace_sec_per_km) / range) * 100
          const isActive = currentPaceSecPerKm !== undefined &&
            currentPaceSecPerKm >= zone.min_pace_sec_per_km &&
            currentPaceSecPerKm < zone.max_pace_sec_per_km
          return (
            <div
              key={zone.zone}
              title={`Zone ${zone.zone}: ${zone.name} (${formatPace(zone.min_pace_sec_per_km)}–${formatPace(zone.max_pace_sec_per_km)} /km)`}
              style={{ width: `${width}%`, backgroundColor: zone.color, opacity: isActive ? 1 : 0.65 }}
              className={`transition-opacity ${isActive ? 'ring-2 ring-gray-900 ring-inset' : ''}`}
            />
          )
        })}
      </div>
      <div className="flex mt-1">
        {zones.map(zone => {
          const width = ((zone.max_pace_sec_per_km - zone.min_pace_sec_per_km) / range) * 100
          return (
            <div key={zone.zone} style={{ width: `${width}%` }} className="text-center">
              <p className="text-xs text-gray-500 truncate px-0.5">Z{zone.zone}</p>
            </div>
          )
        })}
      </div>
      <div className="flex justify-between text-xs text-gray-400 mt-1">
        <span>{formatPace(fastest)} /km (fast)</span>
        <span>(slow) {formatPace(slowest)} /km</span>
      </div>
    </div>
  )
}
