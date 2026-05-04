import { NextRequest, NextResponse } from 'next/server'
import { runsStore } from '../route'

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const run = runsStore.get(id)
  if (!run) {
    return NextResponse.json({ detail: 'Run not found' }, { status: 404 })
  }
  return NextResponse.json(run)
}
