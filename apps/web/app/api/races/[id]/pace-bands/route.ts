import { NextRequest, NextResponse } from 'next/server'
import { getPaceBands } from '@/lib/coaching-engine'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const goalTime = req.nextUrl.searchParams.get('goal_time_seconds')
  if (!goalTime) {
    return NextResponse.json({ detail: 'goal_time_seconds is required' }, { status: 400 })
  }
  try {
    const bands = await getPaceBands(id, parseInt(goalTime, 10))
    return NextResponse.json(bands)
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    const status = msg.includes('404') ? 404 : 502
    return NextResponse.json({ detail: msg }, { status })
  }
}
