import { NextRequest } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { formatPace, formatTime } from '@/lib/mapbox'

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

const RATE_LIMIT_MAP = new Map<string, { count: number; resetAt: number }>()
const DAILY_LIMIT = 20

function checkRateLimit(userId: string): boolean {
  const now = Date.now()
  const entry = RATE_LIMIT_MAP.get(userId)
  if (!entry || entry.resetAt < now) {
    RATE_LIMIT_MAP.set(userId, { count: 1, resetAt: now + 24 * 3600 * 1000 })
    return true
  }
  if (entry.count >= DAILY_LIMIT) return false
  entry.count++
  return true
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json() as {
      message: string
      conversation_history?: Array<{ role: 'user' | 'assistant'; content: string }>
      athlete_context?: {
        vdot: number
        phase: string
        week_number: number
        ctl: number
        atl: number
        tsb: number
        race_name: string
        race_date: string
        weeks_remaining: number
        goal_time_seconds: number
        recent_workouts_summary: string
      }
    }

    const userId = req.headers.get('x-user-id') ?? 'anonymous'
    if (!checkRateLimit(userId)) {
      return new Response(
        JSON.stringify({ error: 'Daily limit of 20 messages reached. Resets at midnight.' }),
        { status: 429, headers: { 'Content-Type': 'application/json' } }
      )
    }

    const ctx = body.athlete_context
    const systemPrompt = ctx
      ? `You are an elite running coach. Your athlete:
- VDOT: ${ctx.vdot} (current fitness equivalent to a ${formatTime(Math.round(ctx.vdot * 60 * 2.8))} marathoner)
- Goal: ${formatTime(ctx.goal_time_seconds)} at ${ctx.race_name} on ${ctx.race_date} (${ctx.weeks_remaining} weeks away)
- Current phase: ${ctx.phase} (week ${ctx.week_number})
- Training load: CTL=${ctx.ctl.toFixed(1)}, ATL=${ctx.atl.toFixed(1)}, TSB=${ctx.tsb.toFixed(1)}
- Recent 7 days: ${ctx.recent_workouts_summary}

Coaching style:
- Lead with the practical insight, then the science
- Reference specific paces from their training zones
- When relevant, cite the research behind your recommendation
- Be direct. Elite coaches don't hedge.
- Max 3 paragraphs unless asked for more detail.`
      : `You are an elite running coach. Answer clearly, cite relevant sports science where applicable, and be direct.`

    const messages = [
      ...(body.conversation_history ?? []),
      { role: 'user' as const, content: body.message },
    ]

    const stream = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1000,
      system: systemPrompt,
      messages,
      stream: true,
    })

    const encoder = new TextEncoder()
    const readable = new ReadableStream({
      async start(controller) {
        for await (const chunk of stream) {
          if (
            chunk.type === 'content_block_delta' &&
            chunk.delta.type === 'text_delta'
          ) {
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ text: chunk.delta.text })}\n\n`)
            )
          }
        }
        controller.enqueue(encoder.encode('data: [DONE]\n\n'))
        controller.close()
      },
    })

    return new Response(readable, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    })
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
