import { NextResponse } from 'next/server'
import { listRaces } from '@/lib/coaching-engine'

export async function GET() {
  try {
    const races = await listRaces()
    return NextResponse.json(races)
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    return NextResponse.json({ detail: msg }, { status: 502 })
  }
}
