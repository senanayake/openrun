export type WorkoutType = 'easy' | 'tempo' | 'interval' | 'long' | 'race' | 'rest'
export type TrainingPhase = 'base' | 'support' | 'specific' | 'taper'
export type CourseDifficulty = 'easy' | 'moderate' | 'hard'

export interface PaceZone {
  zone: number
  name: string
  min_pace_sec_per_km: number
  max_pace_sec_per_km: number
  color: string
}

export interface VdotApiResponse {
  vdot: number
  vo2max: number
  marathon_seconds: number
  half_marathon_seconds: number
  k10_seconds: number
  k5_seconds: number
  pace_zones: PaceZone[]
}

export interface ElevationPoint {
  mile: number
  elevation_ft: number
  grade_pct: number
  lat?: number
  lng?: number
  segment_note: string
}

export interface RaceSegment {
  name: string
  start_km: number
  end_km: number
  difficulty: CourseDifficulty
  description: string
}

export interface RaceLocation {
  name: string
  city: string
  lat: number
  lng: number
}

export interface Race {
  id: string
  name: string
  distance_km: number
  date: string
  start: RaceLocation
  finish: RaceLocation
  course_type: string
  bq_qualifier: boolean
  elevation_gain_m: number
  elevation_loss_m: number
  elevation_adjustment_factor: number
  elevation_profile: ElevationPoint[]
  segments: RaceSegment[]
}

export interface PaceBand {
  label: string
  start_km: number
  end_km: number
  target_pace_sec_per_km: number
  zone: number
  note: string
}

export interface PaceBandsResponse {
  bands: PaceBand[]
}

export interface WorkoutSummary {
  id: string
  type: WorkoutType
  date: string
  distance_km: number
  target_pace_sec_per_km: number
  target_hr_zone: number
  estimated_duration_min: number
  description: string
  phase: TrainingPhase
  week_number: number
}

export interface PlanWeek {
  week_number: number
  phase: TrainingPhase
  total_km: number
  workouts: WorkoutSummary[]
}

export interface TrainingPlan {
  id: string
  race_id: string
  weeks: PlanWeek[]
}

export interface CoachMessage {
  role: 'user' | 'assistant'
  content: string
}

export interface RunLog {
  id: string
  date: string
  planned_workout_id: string | null
  distance_km: number
  duration_seconds: number
  avg_hr?: number
  perceived_effort: number
  notes: string
  tss: number
}

export interface RunLogRequest {
  date: string
  distance_km: number
  duration_seconds: number
  avg_hr?: number
  perceived_effort: number
  notes?: string
  planned_workout_id?: string
}
