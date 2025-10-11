"use client"

import type React from "react"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Database, Upload, Download, RefreshCw, FileText } from "lucide-react"
import { useState, useEffect, useRef } from "react"
import { useToast } from "@/hooks/use-toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface UploadedFile {
  id: string
  file_name: string
  file_url: string
  file_size: number
  file_type: string
  category: string
  created_at: string
}

export default function DataManagementPage() {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [category, setCategory] = useState("environmental")
  const [description, setDescription] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  useEffect(() => {
    fetchUploadedFiles()
  }, [])

  const fetchUploadedFiles = async () => {
    try {
      const response = await fetch("/api/upload")
      const data = await response.json()
      if (data.files) {
        setUploadedFiles(data.files)
      }
    } catch (error) {
      console.error("[v0] Error fetching files:", error)
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setIsUploading(true)
    const formData = new FormData()
    formData.append("file", file)
    formData.append("category", category)
    formData.append("description", description)

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: "File uploaded successfully",
          description: `${file.name} has been uploaded.`,
        })
        setDescription("")
        fetchUploadedFiles()
      } else {
        throw new Error(data.error || "Upload failed")
      }
    } catch (error) {
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Failed to upload file",
        variant: "destructive",
      })
    } finally {
      setIsUploading(false)
      if (fileInputRef.current) {
        fileInputRef.current.value = ""
      }
    }
  }

  const handleExport = async (type: string, format: string) => {
    setIsExporting(true)
    try {
      const response = await fetch(`/api/export?type=${type}&format=${format}`)

      if (!response.ok) {
        throw new Error("Export failed")
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `${type}_${new Date().toISOString().split("T")[0]}.${format}`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      toast({
        title: "Export successful",
        description: `${type} data has been downloaded.`,
      })
    } catch (error) {
      toast({
        title: "Export failed",
        description: "Failed to export data",
        variant: "destructive",
      })
    } finally {
      setIsExporting(false)
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return bytes + " B"
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + " KB"
    return (bytes / (1024 * 1024)).toFixed(2) + " MB"
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground mb-2">Data Management</h2>
        <p className="text-muted-foreground">Manage data sources and integrations</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Data Sources
            </CardTitle>
            <CardDescription>Connected external data providers</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {[
              { name: "Sentinel-2 Satellite", status: "Active", lastSync: "2 hours ago" },
              { name: "Landsat 8/9", status: "Active", lastSync: "5 hours ago" },
              { name: "IoT Sensor Network", status: "Active", lastSync: "15 min ago" },
              { name: "Weather API", status: "Active", lastSync: "1 hour ago" },
            ].map((source) => (
              <div key={source.name} className="flex items-center justify-between p-3 rounded-lg bg-muted">
                <div>
                  <p className="font-medium text-sm">{source.name}</p>
                  <p className="text-xs text-muted-foreground">Last sync: {source.lastSync}</p>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Manual Data Upload
            </CardTitle>
            <CardDescription>Upload custom datasets</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="grid gap-2">
                <Label htmlFor="category">Category</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger id="category">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="environmental">Environmental Data</SelectItem>
                    <SelectItem value="satellite">Satellite Imagery</SelectItem>
                    <SelectItem value="sensor">Sensor Data</SelectItem>
                    <SelectItem value="report">Reports</SelectItem>
                    <SelectItem value="general">General</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Input
                  id="description"
                  placeholder="Brief description of the file"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>
            </div>
            <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
              <Upload className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground mb-2">
                {isUploading ? "Uploading..." : "Click to select file"}
              </p>
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                onChange={handleFileUpload}
                disabled={isUploading}
              />
              <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()} disabled={isUploading}>
                {isUploading ? "Uploading..." : "Select File"}
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">Supported formats: CSV, GeoJSON, Shapefile, TIFF, PDF</p>
          </CardContent>
        </Card>
      </div>

      {uploadedFiles.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Uploaded Files
            </CardTitle>
            <CardDescription>Your recently uploaded files</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {uploadedFiles.map((file) => (
                <div key={file.id} className="flex items-center justify-between p-3 rounded-lg bg-muted">
                  <div className="flex-1">
                    <p className="font-medium text-sm">{file.file_name}</p>
                    <p className="text-xs text-muted-foreground">
                      {file.category} • {formatFileSize(file.file_size)} •{" "}
                      {new Date(file.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => window.open(file.file_url, "_blank")}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Export Data
          </CardTitle>
          <CardDescription>Download datasets and reports</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-3">
            <Button
              variant="outline"
              className="justify-start bg-transparent"
              onClick={() => handleExport("environmental", "csv")}
              disabled={isExporting}
            >
              <Download className="h-4 w-4 mr-2" />
              Environmental Data (CSV)
            </Button>
            <Button
              variant="outline"
              className="justify-start bg-transparent"
              onClick={() => handleExport("environmental", "json")}
              disabled={isExporting}
            >
              <Download className="h-4 w-4 mr-2" />
              Environmental Data (JSON)
            </Button>
            <Button
              variant="outline"
              className="justify-start bg-transparent"
              onClick={() => handleExport("projects", "csv")}
              disabled={isExporting}
            >
              <Download className="h-4 w-4 mr-2" />
              Projects Report (CSV)
            </Button>
            <Button
              variant="outline"
              className="justify-start bg-transparent"
              onClick={() => handleExport("projects", "json")}
              disabled={isExporting}
            >
              <Download className="h-4 w-4 mr-2" />
              Projects Report (JSON)
            </Button>
            <Button
              variant="outline"
              className="justify-start bg-transparent"
              onClick={() => handleExport("notifications", "csv")}
              disabled={isExporting}
            >
              <Download className="h-4 w-4 mr-2" />
              Notifications (CSV)
            </Button>
            <Button
              variant="outline"
              className="justify-start bg-transparent"
              onClick={() => handleExport("notifications", "json")}
              disabled={isExporting}
            >
              <Download className="h-4 w-4 mr-2" />
              Notifications (JSON)
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
