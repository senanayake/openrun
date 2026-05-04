'use client'

import { useRef, useEffect } from 'react'
import { ElevationChart } from './ElevationChart'
import { buildCourseGeoJson, courseBounds } from '@/lib/mapbox'
import type { Race } from '@/lib/types'

interface CourseMapProps {
  race: Race
}

export default function CourseMap({ race }: CourseMapProps) {
  const mapToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!mapToken || !containerRef.current) return

    let map: { remove: () => void } | null = null

    import('mapbox-gl').then(({ default: mapboxgl }) => {
      if (!containerRef.current) return
      mapboxgl.accessToken = mapToken

      const bounds = courseBounds(race)
      map = new mapboxgl.Map({
        container: containerRef.current,
        style: 'mapbox://styles/mapbox/light-v11',
        bounds,
        fitBoundsOptions: { padding: 40 },
      })

      map.on('load', () => {
        const geojson = buildCourseGeoJson(race)
        ;(map as unknown as mapboxgl.Map).addSource('course', { type: 'geojson', data: geojson as GeoJSON.FeatureCollection })

        ;(map as unknown as mapboxgl.Map).addLayer({
          id: 'course-line',
          type: 'line',
          source: 'course',
          paint: {
            'line-color': ['get', 'color'],
            'line-width': 4,
            'line-opacity': 0.9,
          },
        })

        // Start/finish markers
        ;[
          { lngLat: [race.start.lng, race.start.lat], label: 'S', color: '#1D9E75' },
          { lngLat: [race.finish.lng, race.finish.lat], label: 'F', color: '#E24B4A' },
        ].forEach(({ lngLat, label, color }) => {
          const el = document.createElement('div')
          el.style.cssText = `width:24px;height:24px;border-radius:50%;background:${color};color:#fff;font-size:11px;font-weight:700;display:flex;align-items:center;justify-content:center;border:2px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,0.3)`
          el.textContent = label
          new mapboxgl.Marker({ element: el })
            .setLngLat(lngLat as [number, number])
            .addTo(map as unknown as mapboxgl.Map)
        })
      })
    })

    return () => { map?.remove() }
  }, [race, mapToken])

  if (!mapToken) {
    return (
      <div className="p-5">
        <p className="text-xs text-gray-400 mb-3">Map unavailable — showing elevation profile</p>
        <ElevationChart profile={race.elevation_profile} />
      </div>
    )
  }

  return <div ref={containerRef} className="w-full h-full" />
}
