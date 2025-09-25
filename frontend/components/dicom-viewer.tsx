"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { mockCases, type Case } from "@/components/mock-services"
import {
  ZoomIn,
  ZoomOut,
  RotateCw,
  Move,
  Ruler,
  Square,
  Circle,
  Bookmark,
  Eye,
  Brain,
  Layers,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Settings,
  Maximize,
  Grid3X3,
  Info,
} from "lucide-react"

interface AIOverlay {
  id: string
  type: "MASK" | "BBOX" | "HEATMAP"
  label: string
  confidence: number
  visible: boolean
  color: string
}

interface Measurement {
  id: string
  type: "LINEAR" | "AREA" | "VOLUME"
  value: string
  unit: string
}

export function DicomViewer() {
  const [selectedCase] = useState<Case>(mockCases[0])
  const [currentSeries, setCurrentSeries] = useState(1)
  const [currentImage, setCurrentImage] = useState(1)
  const [windowLevel, setWindowLevel] = useState([40])
  const [windowWidth, setWindowWidth] = useState([400])
  const [zoom, setZoom] = useState([100])
  const [isPlaying, setIsPlaying] = useState(false)
  const [showOverlays, setShowOverlays] = useState(true)
  const [selectedTool, setSelectedTool] = useState("move")

  const [aiOverlays] = useState<AIOverlay[]>([
    {
      id: "overlay-1",
      type: "MASK",
      label: "ICH Suspected",
      confidence: 0.91,
      visible: true,
      color: "#ef4444",
    },
    {
      id: "overlay-2",
      type: "BBOX",
      label: "Hemorrhage Region",
      confidence: 0.87,
      visible: true,
      color: "#f97316",
    },
    {
      id: "overlay-3",
      type: "HEATMAP",
      label: "Confidence Map",
      confidence: 0.78,
      visible: false,
      color: "#8b5cf6",
    },
  ])

  const [measurements] = useState<Measurement[]>([
    { id: "m1", type: "LINEAR", value: "12.4", unit: "mm" },
    { id: "m2", type: "AREA", value: "45.2", unit: "mm²" },
  ])

  const tools = [
    { id: "move", icon: Move, label: "Pan" },
    { id: "zoom", icon: ZoomIn, label: "Zoom" },
    { id: "ruler", icon: Ruler, label: "Measure" },
    { id: "square", icon: Square, label: "Rectangle" },
    { id: "circle", icon: Circle, label: "Circle" },
  ]

  const toggleOverlay = (overlayId: string) => {
    // In real implementation, this would update overlay visibility
    console.log("Toggle overlay:", overlayId)
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-balance">DICOM Viewer</h1>
          <p className="text-muted-foreground">
            {selectedCase.modality} - {selectedCase.bodyPart} | {selectedCase.patient.display}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline">Series {currentSeries} of 3</Badge>
          <Badge variant="outline">Image {currentImage} of 24</Badge>
          <Button variant="outline" size="sm">
            <Maximize className="h-4 w-4 mr-2" />
            Fullscreen
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Tools Panel */}
        <div className="lg:col-span-1 space-y-4">
          {/* Viewer Tools */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Tools</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                {tools.map((tool) => {
                  const Icon = tool.icon
                  return (
                    <Button
                      key={tool.id}
                      variant={selectedTool === tool.id ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedTool(tool.id)}
                      className="flex flex-col gap-1 h-auto py-2"
                    >
                      <Icon className="h-4 w-4" />
                      <span className="text-xs">{tool.label}</span>
                    </Button>
                  )
                })}
              </div>

              <Separator />

              {/* Window/Level Controls */}
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium">Window Level</label>
                  <Slider
                    value={windowLevel}
                    onValueChange={setWindowLevel}
                    max={100}
                    min={-100}
                    step={1}
                    className="mt-2"
                  />
                  <div className="text-xs text-muted-foreground mt-1">Level: {windowLevel[0]}</div>
                </div>

                <div>
                  <label className="text-sm font-medium">Window Width</label>
                  <Slider
                    value={windowWidth}
                    onValueChange={setWindowWidth}
                    max={2000}
                    min={1}
                    step={1}
                    className="mt-2"
                  />
                  <div className="text-xs text-muted-foreground mt-1">Width: {windowWidth[0]}</div>
                </div>

                <div>
                  <label className="text-sm font-medium">Zoom</label>
                  <Slider value={zoom} onValueChange={setZoom} max={500} min={25} step={25} className="mt-2" />
                  <div className="text-xs text-muted-foreground mt-1">{zoom[0]}%</div>
                </div>
              </div>

              <Separator />

              {/* Playback Controls */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Cine Controls</label>
                <div className="flex items-center justify-center gap-1">
                  <Button variant="outline" size="sm">
                    <SkipBack className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setIsPlaying(!isPlaying)}>
                    {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                  </Button>
                  <Button variant="outline" size="sm">
                    <SkipForward className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* AI Overlays */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Brain className="h-5 w-5" />
                AI Overlays
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Show Overlays</span>
                <Switch checked={showOverlays} onCheckedChange={setShowOverlays} />
              </div>

              <Separator />

              <div className="space-y-3">
                {aiOverlays.map((overlay) => (
                  <div key={overlay.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: overlay.color }} />
                        <span className="text-sm font-medium">{overlay.label}</span>
                      </div>
                      <Switch
                        checked={overlay.visible && showOverlays}
                        onCheckedChange={() => toggleOverlay(overlay.id)}
                        disabled={!showOverlays}
                      />
                    </div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{overlay.type}</span>
                      <Badge variant="outline" className="text-xs">
                        {(overlay.confidence * 100).toFixed(0)}%
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>

              <Separator />

              <div className="text-xs text-muted-foreground">
                <div className="flex items-center gap-1 mb-1">
                  <Info className="h-3 w-3" />
                  Model: {selectedCase.ai.modelVersion}
                </div>
                <div>Inference time: 420ms</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Viewer */}
        <div className="lg:col-span-2">
          <Card className="h-[600px]">
            <CardContent className="p-0 h-full">
              <div className="relative h-full bg-black rounded-lg overflow-hidden">
                {/* DICOM Image Placeholder */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center text-white/70">
                    <div className="w-64 h-64 mx-auto mb-4 bg-gray-800 rounded-lg flex items-center justify-center">
                      <div className="text-center">
                        <Layers className="h-12 w-12 mx-auto mb-2" />
                        <p className="text-sm">DICOM Image</p>
                        <p className="text-xs opacity-70">CT Head - Axial</p>
                      </div>
                    </div>
                    <div className="text-xs space-y-1">
                      <div>
                        WL: {windowLevel[0]} WW: {windowWidth[0]}
                      </div>
                      <div>Zoom: {zoom[0]}%</div>
                      <div>Slice: {currentImage}/24</div>
                    </div>
                  </div>
                </div>

                {/* AI Overlay Indicators */}
                {showOverlays && (
                  <div className="absolute top-4 left-4 space-y-2">
                    {aiOverlays
                      .filter((overlay) => overlay.visible)
                      .map((overlay) => (
                        <div
                          key={overlay.id}
                          className="flex items-center gap-2 bg-black/50 backdrop-blur-sm rounded px-2 py-1 text-white text-xs"
                        >
                          <div className="w-2 h-2 rounded-sm" style={{ backgroundColor: overlay.color }} />
                          <span>{overlay.label}</span>
                          <Badge variant="secondary" className="text-xs">
                            {(overlay.confidence * 100).toFixed(0)}%
                          </Badge>
                        </div>
                      ))}
                  </div>
                )}

                {/* Viewer Controls Overlay */}
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
                  <div className="flex items-center gap-2 bg-black/50 backdrop-blur-sm rounded-lg px-3 py-2">
                    <Button variant="ghost" size="sm" className="text-white hover:bg-white/20">
                      <ZoomOut className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="text-white hover:bg-white/20">
                      <ZoomIn className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="text-white hover:bg-white/20">
                      <RotateCw className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="text-white hover:bg-white/20">
                      <Grid3X3 className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="text-white hover:bg-white/20">
                      <Settings className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Series Selector */}
          <Card className="mt-4">
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium">Series:</span>
                <div className="flex gap-2">
                  {[1, 2, 3].map((series) => (
                    <Button
                      key={series}
                      variant={currentSeries === series ? "default" : "outline"}
                      size="sm"
                      onClick={() => setCurrentSeries(series)}
                    >
                      {series}
                    </Button>
                  ))}
                </div>
                <Separator orientation="vertical" className="h-6" />
                <span className="text-sm text-muted-foreground">Image {currentImage} of 24</span>
                <div className="flex-1">
                  <Slider
                    value={[currentImage]}
                    onValueChange={(value) => setCurrentImage(value[0])}
                    max={24}
                    min={1}
                    step={1}
                    className="w-full"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Findings & Measurements Panel */}
        <div className="lg:col-span-1 space-y-4">
          {/* AI Findings */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Findings</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-48">
                <div className="space-y-3">
                  {selectedCase.ai.findings.map((finding, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{finding.replace("_", " ")}</span>
                        <Badge variant="outline">{(selectedCase.ai.confidenceTop * 100).toFixed(0)}%</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Detected in series 1, slice 12-15. High confidence region identified.
                      </p>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="text-xs bg-transparent">
                          <Eye className="h-3 w-3 mr-1" />
                          Show
                        </Button>
                        <Button variant="outline" size="sm" className="text-xs bg-transparent">
                          <Bookmark className="h-3 w-3 mr-1" />
                          Key Image
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Measurements */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Measurements</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {measurements.map((measurement) => (
                  <div key={measurement.id} className="flex items-center justify-between">
                    <div>
                      <div className="text-sm font-medium">{measurement.type}</div>
                      <div className="text-xs text-muted-foreground">Slice 12</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">
                        {measurement.value} {measurement.unit}
                      </div>
                      <Button variant="ghost" size="sm" className="text-xs h-auto p-0">
                        Delete
                      </Button>
                    </div>
                  </div>
                ))}
                <Button variant="outline" size="sm" className="w-full bg-transparent">
                  <Ruler className="h-4 w-4 mr-2" />
                  Add Measurement
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Key Images */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Key Images</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2">
                {[1, 2].map((img) => (
                  <div key={img} className="aspect-square bg-muted rounded border cursor-pointer hover:bg-accent">
                    <div className="h-full flex items-center justify-center">
                      <div className="text-center">
                        <Bookmark className="h-4 w-4 mx-auto mb-1" />
                        <div className="text-xs">Slice {img * 6}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <Button variant="outline" size="sm" className="w-full mt-2 bg-transparent">
                <Bookmark className="h-4 w-4 mr-2" />
                Save Current
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
