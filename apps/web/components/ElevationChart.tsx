'use client'

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
} from 'chart.js'
import { Line } from 'react-chartjs-2'
import type { ElevationPoint } from '@/lib/types'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Filler, Tooltip)

interface ElevationChartProps {
  profile: ElevationPoint[]
}

export function ElevationChart({ profile }: ElevationChartProps) {
  const labels = profile.map(p => `${p.mile.toFixed(1)} mi`)
  const elevations = profile.map(p => p.elevation_ft)

  const data = {
    labels,
    datasets: [
      {
        label: 'Elevation (ft)',
        data: elevations,
        fill: true,
        borderColor: '#6366f1',
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        borderWidth: 2,
        pointRadius: 0,
        tension: 0.3,
      },
    ],
  }

  const options = {
    responsive: true,
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx: { raw: unknown; dataIndex: number }) => {
            const pt = profile[ctx.dataIndex]
            return [`${ctx.raw} ft`, pt.segment_note ? `↳ ${pt.segment_note}` : ''].filter(Boolean)
          },
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { font: { size: 10 }, maxTicksLimit: 8 },
      },
      y: {
        ticks: { font: { size: 10 } },
        grid: { color: 'rgba(0,0,0,0.05)' },
      },
    },
  }

  return <Line data={data} options={options} />
}
