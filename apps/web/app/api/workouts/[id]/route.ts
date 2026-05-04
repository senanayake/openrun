import { NextRequest, NextResponse } from 'next/server'
import { formatPace } from '@/lib/mapbox'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  // Stub workout — replace with plan lookup in production
  return NextResponse.json({
    id,
    type: 'easy',
    date: new Date().toISOString().split('T')[0],
    distance_km: 12.0,
    target_pace_sec_per_km: 370,
    target_hr_zone: 2,
    estimated_duration_min: 74,
    description: 'Easy 12km. Keep the effort genuinely conversational throughout.',
    steps: [
      { label: 'Warm-up', distance_km: 2, pace_sec_per_km: 390, zone: 1 },
      { label: 'Main set', distance_km: 8, pace_sec_per_km: 370, zone: 2 },
      { label: 'Cool-down', distance_km: 2, pace_sec_per_km: 400, zone: 1 },
    ],
    research_citation: {
      title: 'Biochemical adaptations in muscle',
      authors: 'Holloszy, J.O.',
      year: 1967,
      key_finding: 'Easy running at 65–79% VO2max builds mitochondrial density without accumulating significant fatigue.',
    },
    phase: 'base',
    week_number: 3,
  })
}
