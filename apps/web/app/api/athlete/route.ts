import { NextResponse } from 'next/server'

// Stub athlete — replace with Supabase in production
const STUB_ATHLETE = {
  id: '00000000-0000-0000-0000-000000000001',
  name: 'Test Runner',
  age: 35,
  resting_hr: 55,
  max_hr: 185,
  vdot: 45.0,
  weekly_mileage: 30.0,
  goal_race_id: 'tcm-2026',
  goal_time_seconds: 13500,
  goal_race_date: '2026-10-04',
  plan_start_date: '2026-05-04',
  current_ctl: 48.2,
  current_atl: 52.1,
  current_tsb: -3.9,
}

export async function GET() {
  return NextResponse.json(STUB_ATHLETE)
}
