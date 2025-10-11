"use client"

import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts"

const data = [
  { region: "North", organic: 65, ph: 72, moisture: 58 },
  { region: "East", organic: 78, ph: 68, moisture: 82 },
  { region: "South", organic: 42, ph: 55, moisture: 38 },
  { region: "West", organic: 70, ph: 75, moisture: 65 },
]

export function SoilHealthChart() {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
        <XAxis dataKey="region" className="text-xs" tick={{ fill: "hsl(var(--muted-foreground))" }} />
        <YAxis className="text-xs" tick={{ fill: "hsl(var(--muted-foreground))" }} />
        <Tooltip
          contentStyle={{
            backgroundColor: "hsl(var(--card))",
            border: "1px solid hsl(var(--border))",
            borderRadius: "8px",
          }}
        />
        <Bar dataKey="organic" fill="hsl(var(--chart-2))" name="Organic Matter %" />
        <Bar dataKey="ph" fill="hsl(var(--chart-3))" name="pH Level %" />
        <Bar dataKey="moisture" fill="hsl(var(--chart-1))" name="Moisture %" />
      </BarChart>
    </ResponsiveContainer>
  )
}
