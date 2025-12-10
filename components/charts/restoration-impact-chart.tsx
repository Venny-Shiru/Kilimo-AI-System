"use client"

import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid, Legend } from "recharts"

const data = [
  { project: "Project A", before: 0.28, after: 0.62 },
  { project: "Project B", before: 0.32, after: 0.58 },
  { project: "Project C", before: 0.25, after: 0.55 },
  { project: "Project D", before: 0.35, after: 0.68 },
  { project: "Project E", before: 0.3, after: 0.65 },
]

export function RestorationImpactChart({ projects, envData }: { projects?: any[]; envData?: any[] }) {
  const chartData =
    projects && projects.length
      ? projects.map((p) => ({
          project: p.id || p.project || `Project ${p.id ?? ""}`,
          before: (p.before_ndvi as number) ?? 0,
          after: (p.after_ndvi as number) ?? (p.success_rate_estimate ? p.success_rate_estimate / 100 : 0),
        }))
      : data

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData}>
        <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
        <XAxis dataKey="project" className="text-xs" tick={{ fill: "hsl(var(--muted-foreground))" }} />
        <YAxis className="text-xs" tick={{ fill: "hsl(var(--muted-foreground))" }} domain={[0, 1]} />
        <Tooltip
          contentStyle={{
            backgroundColor: "hsl(var(--card))",
            border: "1px solid hsl(var(--border))",
            borderRadius: "8px",
          }}
        />
        <Legend />
        <Bar dataKey="before" fill="hsl(var(--destructive))" name="Before NDVI" />
        <Bar dataKey="after" fill="hsl(var(--primary))" name="After NDVI" />
      </BarChart>
    </ResponsiveContainer>
  )
}
