import { NextRequest, NextResponse } from 'next/server'
import { getRace, getPaceBands } from '@/lib/coaching-engine'

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const race = await getRace(id)
    return NextResponse.json(race)
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    const status = msg.includes('404') ? 404 : 502
    return NextResponse.json({ detail: msg }, { status })
  }
}
