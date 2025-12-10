"use client"

import { RadialBar, RadialBarChart, ResponsiveContainer, Legend, PolarAngleAxis } from "recharts"

const data = [
  { name: "Northern Plains", value: 68, fill: "hsl(var(--chart-1))" },
  { name: "Eastern Valley", value: 52, fill: "hsl(var(--chart-2))" },
  { name: "Southern Hills", value: 78, fill: "hsl(var(--chart-4))" },
  { name: "Western Range", value: 45, fill: "hsl(var(--chart-3))" },
]

export function RegionalComparisonChart({ data: inputData }: { data?: any[] }) {
  const chartData =
    inputData && inputData.length
      ? inputData.map((d) => ({ name: d.region_name || d.name || "Region", value: d.value ?? d.ndvi_value ?? 0, fill: d.fill }))
      : data

  return (
    <ResponsiveContainer width="100%" height={300}>
      <RadialBarChart cx="50%" cy="50%" innerRadius="20%" outerRadius="90%" data={chartData} startAngle={90} endAngle={-270}>
        <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
        <RadialBar
          background
          dataKey="value"
          cornerRadius={10}
          label={{ position: "insideStart", fill: "#fff", fontSize: 12 }}
        />
        <Legend
          iconSize={10}
          layout="vertical"
          verticalAlign="middle"
          align="right"
          wrapperStyle={{ fontSize: "12px" }}
        />
      </RadialBarChart>
    </ResponsiveContainer>
  )
}
