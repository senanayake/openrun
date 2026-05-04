'use client'

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js'
import { Chart } from 'react-chartjs-2'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip, Legend, Filler)

interface DailyLoad {
  date: string
  tss: number
  ctl: number
  atl: number
  tsb: number
}

interface TrainingLoadChartProps {
  data: DailyLoad[]
}

export function TrainingLoadChart({ data }: TrainingLoadChartProps) {
  const labels = data.map(d => {
    const dt = new Date(d.date)
    return dt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  })

  const chartData = {
    labels,
    datasets: [
      {
        type: 'bar' as const,
        label: 'TSS',
        data: data.map(d => d.tss),
        backgroundColor: 'rgba(99, 102, 241, 0.2)',
        borderColor: 'rgba(99, 102, 241, 0.4)',
        borderWidth: 1,
        yAxisID: 'y',
      },
      {
        type: 'line' as const,
        label: 'CTL (fitness)',
        data: data.map(d => d.ctl),
        borderColor: '#3b82f6',
        backgroundColor: 'transparent',
        borderWidth: 2,
        pointRadius: 0,
        tension: 0.3,
        yAxisID: 'y',
      },
      {
        type: 'line' as const,
        label: 'ATL (fatigue)',
        data: data.map(d => d.atl),
        borderColor: '#f97316',
        backgroundColor: 'transparent',
        borderWidth: 2,
        pointRadius: 0,
        tension: 0.3,
        yAxisID: 'y',
      },
      {
        type: 'line' as const,
        label: 'TSB (form)',
        data: data.map(d => d.tsb),
        borderColor: '#10b981',
        backgroundColor: 'transparent',
        borderWidth: 1.5,
        borderDash: [4, 4],
        pointRadius: 0,
        tension: 0.3,
        yAxisID: 'y2',
      },
    ],
  }

  const options = {
    responsive: true,
    interaction: { mode: 'index' as const, intersect: false },
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: { boxWidth: 12, font: { size: 11 } },
      },
      tooltip: {
        callbacks: {
          label: (ctx: { dataset: { label?: string }; parsed: { y: number } }) =>
            `${ctx.dataset.label}: ${ctx.parsed.y.toFixed(1)}`,
        },
      },
    },
    scales: {
      x: { grid: { display: false }, ticks: { font: { size: 10 } } },
      y: {
        position: 'left' as const,
        ticks: { font: { size: 10 } },
        grid: { color: 'rgba(0,0,0,0.05)' },
      },
      y2: {
        position: 'right' as const,
        ticks: { font: { size: 10 } },
        grid: { display: false },
      },
    },
  }

  return <Chart type="bar" data={chartData} options={options} />
}
