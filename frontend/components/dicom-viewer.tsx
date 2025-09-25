"use client"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Badge } from "@/components/ui/badge"
import { 
  ZoomIn, 
  ZoomOut, 
  RotateCw, 
  RotateCcw, 
  Maximize, 
  Download,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Settings
} from "lucide-react"

interface DicomViewerProps {
  caseId: string
  imageUrl?: string
  onClose?: () => void
}

export function DicomViewer({ caseId, imageUrl, onClose }: DicomViewerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [zoom, setZoom] = useState(1)
  const [rotation, setRotation] = useState(0)
  const [brightness, setBrightness] = useState(50)
  const [contrast, setContrast] = useState(50)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentSlice, setCurrentSlice] = useState(0)
  const [totalSlices, setTotalSlices] = useState(100)

  // Mock DICOM data - in real implementation, this would come from the API
  const mockDicomData = {
    slices: Array.from({ length: 100 }, (_, i) => ({
      id: i,
      url: `/api/dicom/${caseId}/slice/${i}`,
      annotations: i % 10 === 0 ? [`Annotation ${i}`] : []
    })),
    metadata: {
      patientId: caseId,
      studyDate: new Date().toISOString(),
      modality: "CT",
      bodyPart: "Head",
      sliceThickness: 1.0,
      pixelSpacing: [0.5, 0.5]
    }
  }

  useEffect(() => {
    setTotalSlices(mockDicomData.slices.length)
  }, [])

  const handleZoom = (newZoom: number) => {
    setZoom(Math.max(0.1, Math.min(5, newZoom)))
  }

  const handleRotation = (newRotation: number) => {
    setRotation(newRotation % 360)
  }

  const handleSliceChange = (slice: number) => {
    setCurrentSlice(Math.max(0, Math.min(totalSlices - 1, slice)))
  }

  const togglePlay = () => {
    setIsPlaying(!isPlaying)
  }

  const resetView = () => {
    setZoom(1)
    setRotation(0)
    setBrightness(50)
    setContrast(50)
  }

  const downloadImage = () => {
    const canvas = canvasRef.current
    if (canvas) {
      const link = document.createElement('a')
      link.download = `dicom-${caseId}-slice-${currentSlice}.png`
      link.href = canvas.toDataURL()
      link.click()
    }
  }

  // Auto-play functionality
  useEffect(() => {
    if (isPlaying) {
      const interval = setInterval(() => {
        setCurrentSlice(prev => (prev + 1) % totalSlices)
      }, 200)
      return () => clearInterval(interval)
    }
  }, [isPlaying, totalSlices])

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {/* Header */}
      <div className="bg-gray-900 text-white p-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-lg font-semibold">DICOM Viewer - {caseId}</h2>
          <Badge variant="secondary">{mockDicomData.metadata.modality}</Badge>
          <Badge variant="outline">{mockDicomData.metadata.bodyPart}</Badge>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={downloadImage}>
            <Download className="h-4 w-4 mr-2" />
            Download
          </Button>
          <Button variant="outline" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>

      <div className="flex-1 flex">
        {/* Main Viewer */}
        <div className="flex-1 flex flex-col items-center justify-center bg-gray-800 p-4">
          <div className="relative">
            <canvas
              ref={canvasRef}
              width={512}
              height={512}
              className="border border-gray-600 rounded"
              style={{
                transform: `scale(${zoom}) rotate(${rotation}deg)`,
                filter: `brightness(${brightness}%) contrast(${contrast}%)`
              }}
            />
            
            {/* Overlay annotations */}
            {mockDicomData.slices[currentSlice]?.annotations.map((annotation, index) => (
              <div
                key={index}
                className="absolute bg-red-500 text-white text-xs px-2 py-1 rounded"
                style={{
                  top: `${20 + index * 30}px`,
                  left: `${20 + index * 20}px`
                }}
              >
                {annotation}
              </div>
            ))}
          </div>

          {/* Slice navigation */}
          <div className="mt-4 flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleSliceChange(currentSlice - 1)}
              disabled={currentSlice === 0}
            >
              <SkipBack className="h-4 w-4" />
            </Button>
            
            <div className="flex items-center gap-2">
              <span className="text-white text-sm">
                {currentSlice + 1} / {totalSlices}
              </span>
              <Slider
                value={[currentSlice]}
                onValueChange={([value]) => handleSliceChange(value)}
                max={totalSlices - 1}
                step={1}
                className="w-32"
              />
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleSliceChange(currentSlice + 1)}
              disabled={currentSlice === totalSlices - 1}
            >
              <SkipForward className="h-4 w-4" />
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={togglePlay}
            >
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {/* Controls Panel */}
        <div className="w-80 bg-gray-900 text-white p-4 space-y-6">
          {/* Zoom Controls */}
          <Card className="bg-gray-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Zoom & Rotation</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs text-gray-300">Zoom: {Math.round(zoom * 100)}%</label>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleZoom(zoom * 0.8)}
                  >
                    <ZoomOut className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleZoom(zoom * 1.2)}
                  >
                    <ZoomIn className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="text-xs text-gray-300">Rotation: {rotation}°</label>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleRotation(rotation - 90)}
                  >
                    <RotateCcw className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleRotation(rotation + 90)}
                  >
                    <RotateCw className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Image Adjustments */}
          <Card className="bg-gray-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Image Adjustments</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs text-gray-300">Brightness: {brightness}%</label>
                <Slider
                  value={[brightness]}
                  onValueChange={([value]) => setBrightness(value)}
                  max={100}
                  step={1}
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-xs text-gray-300">Contrast: {contrast}%</label>
                <Slider
                  value={[contrast]}
                  onValueChange={([value]) => setContrast(value)}
                  max={100}
                  step={1}
                />
              </div>
              
              <Button
                variant="outline"
                size="sm"
                onClick={resetView}
                className="w-full"
              >
                Reset View
              </Button>
            </CardContent>
          </Card>

          {/* Metadata */}
          <Card className="bg-gray-800">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm">Study Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-gray-300">Patient ID:</span>
                <span>{mockDicomData.metadata.patientId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Study Date:</span>
                <span>{new Date(mockDicomData.metadata.studyDate).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Modality:</span>
                <span>{mockDicomData.metadata.modality}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Body Part:</span>
                <span>{mockDicomData.metadata.bodyPart}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Slice Thickness:</span>
                <span>{mockDicomData.metadata.sliceThickness}mm</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-300">Pixel Spacing:</span>
                <span>{mockDicomData.metadata.pixelSpacing.join(' x ')}mm</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}