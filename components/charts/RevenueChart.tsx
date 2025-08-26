'use client'

import { Line } from 'react-chartjs-2'
import {
  Chart,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Tooltip,
  Legend,
} from 'chart.js'

// Enregistre les éléments requis une seule fois côté client
Chart.register(LineElement, PointElement, LinearScale, CategoryScale, Tooltip, Legend)

export default function RevenueChart({ data }: { data: any }) {
  return <Line data={data} />
}
