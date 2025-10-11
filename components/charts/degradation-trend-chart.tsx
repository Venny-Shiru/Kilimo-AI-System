"use client"

import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts"

const data = [
  { month: "Jan", degraded: 2100, restored: 450 },
  { month: "Feb", degraded: 2150, restored: 520 },
  { month: "Mar", degraded: 2200, restored: 580 },
  { month: "Apr", degraded: 2280, restored: 640 },
  { month: "May", degraded: 2320, restored: 720 },
  { month: "Jun", degraded: 2340, restored: 800 },
]

export function DegradationTrendChart() {
  return (
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
        <XAxis dataKey="month" className="text-xs" tick={{ fill: "hsl(var(--muted-foreground))" }} />
        <YAxis className="text-xs" tick={{ fill: "hsl(var(--muted-foreground))" }} />
        <Tooltip
          contentStyle={{
            backgroundColor: "hsl(var(--card))",
            border: "1px solid hsl(var(--border))",
            borderRadius: "8px",
          }}
        />
        <Line
          type="monotone"
          dataKey="degraded"
          stroke="hsl(var(--destructive))"
          strokeWidth={2}
          name="Degraded Area (km²)"
        />
        <Line
          type="monotone"
          dataKey="restored"
          stroke="hsl(var(--primary))"
          strokeWidth={2}
          name="Restored Area (km²)"
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
