"use client"

import { Card } from "@/components/ui/card"
import { useEffect, useState } from "react"

const monitoringSlides = [
  {
    image: "/real-time-land-monitoring-dashboard.jpg",
    title: "Real-Time Satellite Monitoring",
    description: "AI-powered analysis of vegetation health using NDVI indices from satellite imagery",
  },
  {
    image: "/drone-aerial-view-of-land-restoration-project.jpg",
    title: "Restoration Progress Tracking",
    description: "Monitor the impact of restoration efforts with before-and-after comparisons",
  },
  {
    image: "/soil-erosion-detection-heat-map.jpg",
    title: "Erosion Risk Detection",
    description: "Identify high-risk areas for soil erosion and water stress in real-time",
  },
]

export function DashboardSlideshow() {
  const [currentSlide, setCurrentSlide] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % monitoringSlides.length)
    }, 5000)

    return () => clearInterval(timer)
  }, [])

  return (
    <Card className="overflow-hidden group">
      <div className="relative h-[300px] md:h-[400px]">
        {monitoringSlides.map((slide, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === currentSlide ? "opacity-100" : "opacity-0"
            }`}
          >
            <img src={slide.image || "/placeholder.svg"} alt={slide.title} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
              <h3 className="text-2xl font-bold mb-2">{slide.title}</h3>
              <p className="text-sm text-white/90">{slide.description}</p>
            </div>
          </div>
        ))}

        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2 z-10">
          {monitoringSlides.map((_, index) => (
            <button
              key={index}
              className={`w-3 h-3 rounded-full transition-colors ${
                index === currentSlide ? "bg-white" : "bg-white/50"
              }`}
              onClick={() => setCurrentSlide(index)}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </Card>
  )
}
