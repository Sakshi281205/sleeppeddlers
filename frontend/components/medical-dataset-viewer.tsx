"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { medicalDatasetService, type MedicalDataset } from "@/lib/medical-dataset-service"
import { caseService } from "@/lib/case-service"
import { 
  Database, 
  Filter, 
  Search, 
  Eye, 
  Download, 
  Brain, 
  Heart, 
  Bone,
  Activity,
  TrendingUp,
  Users,
  Calendar
} from "lucide-react"

export function MedicalDatasetViewer() {
  const [datasets, setDatasets] = useState<MedicalDataset[]>([])
  const [filteredDatasets, setFilteredDatasets] = useState<MedicalDataset[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [typeFilter, setTypeFilter] = useState("all")
  const [bodyPartFilter, setBodyPartFilter] = useState("all")
  const [selectedDataset, setSelectedDataset] = useState<MedicalDataset | null>(null)
  const [stats, setStats] = useState<any>(null)

  useEffect(() => {
    loadDatasets()
    loadStats()
  }, [])

  useEffect(() => {
    filterDatasets()
  }, [datasets, searchTerm, typeFilter, bodyPartFilter])

  const loadDatasets = () => {
    const allDatasets = medicalDatasetService.getDatasets()
    setDatasets(allDatasets)
  }

  const loadStats = () => {
    const datasetStats = medicalDatasetService.getDatasetStats()
    setStats(datasetStats)
  }

  const filterDatasets = () => {
    let filtered = datasets

    if (searchTerm) {
      filtered = filtered.filter(dataset => 
        dataset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        dataset.findings.some(finding => 
          finding.toLowerCase().includes(searchTerm.toLowerCase())
        ) ||
        dataset.bodyPart.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (typeFilter !== "all") {
      filtered = filtered.filter(dataset => dataset.type === typeFilter)
    }

    if (bodyPartFilter !== "all") {
      filtered = filtered.filter(dataset => 
        dataset.bodyPart.toLowerCase().includes(bodyPartFilter.toLowerCase())
      )
    }

    setFilteredDatasets(filtered)
  }

  const addDatasetToCases = (dataset: MedicalDataset) => {
    const case_ = medicalDatasetService.datasetToCase(dataset)
    caseService.cases.set(case_.caseId, case_)
    caseService.saveToStorage()
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'MRI':
        return <Brain className="h-4 w-4 text-blue-500" />
      case 'CT':
        return <Activity className="h-4 w-4 text-green-500" />
      case 'X-Ray':
        return <Bone className="h-4 w-4 text-orange-500" />
      case 'Ultrasound':
        return <Heart className="h-4 w-4 text-red-500" />
      default:
        return <Database className="h-4 w-4" />
    }
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.9) return "text-green-600 bg-green-50"
    if (confidence >= 0.8) return "text-yellow-600 bg-yellow-50"
    return "text-red-600 bg-red-50"
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Medical Dataset Viewer</h1>
          <p className="text-muted-foreground">Browse and analyze real medical imaging datasets</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="flex items-center gap-1">
            <Database className="h-3 w-3" />
            {datasets.length} datasets
          </Badge>
        </div>
      </div>

      {/* Statistics */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Datasets</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-xs text-muted-foreground">Available for analysis</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Average Confidence</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{(stats.averageConfidence * 100).toFixed(1)}%</div>
              <p className="text-xs text-muted-foreground">AI analysis accuracy</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Recent Studies</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.recentCount}</div>
              <p className="text-xs text-muted-foreground">Last 7 days</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Most Common</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {Object.entries(stats.byType).sort(([,a], [,b]) => b - a)[0]?.[0] || 'MRI'}
              </div>
              <p className="text-xs text-muted-foreground">Imaging type</p>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Filters and Dataset List */}
        <div className="lg:col-span-2 space-y-4">
          {/* Filters */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search datasets..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="MRI">MRI</SelectItem>
                    <SelectItem value="CT">CT</SelectItem>
                    <SelectItem value="X-Ray">X-Ray</SelectItem>
                    <SelectItem value="Ultrasound">Ultrasound</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={bodyPartFilter} onValueChange={setBodyPartFilter}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Body Part" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Parts</SelectItem>
                    <SelectItem value="brain">Brain</SelectItem>
                    <SelectItem value="chest">Chest</SelectItem>
                    <SelectItem value="spine">Spine</SelectItem>
                    <SelectItem value="knee">Knee</SelectItem>
                    <SelectItem value="head">Head</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Dataset List */}
          <div className="space-y-3">
            {filteredDatasets.map((dataset) => (
              <Card
                key={dataset.id}
                className={`cursor-pointer transition-colors hover:bg-accent/50 ${
                  selectedDataset?.id === dataset.id ? "bg-accent" : ""
                }`}
                onClick={() => setSelectedDataset(dataset)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      {getTypeIcon(dataset.type)}
                      <div>
                        <h3 className="font-medium">{dataset.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {dataset.type} - {dataset.bodyPart} • {dataset.patientGender}, {dataset.patientAge}y
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline" className="text-xs">
                            {dataset.type}
                          </Badge>
                          <Badge variant="outline" className="text-xs">
                            {dataset.bodyPart}
                          </Badge>
                          <Badge 
                            variant="outline" 
                            className={`text-xs ${getConfidenceColor(dataset.confidence)}`}
                          >
                            {(dataset.confidence * 100).toFixed(0)}% confidence
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          addDatasetToCases(dataset)
                        }}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Add to Cases
                      </Button>
                    </div>
                  </div>
                  
                  {dataset.findings.length > 0 && (
                    <div className="mt-3">
                      <p className="text-sm font-medium">Findings:</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {dataset.findings.map((finding, index) => (
                          <Badge key={index} variant="secondary" className="text-xs">
                            {finding}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}

            {filteredDatasets.length === 0 && (
              <Card>
                <CardContent className="p-8 text-center">
                  <Database className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-muted-foreground">No datasets match your filters</p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Dataset Details */}
        <div className="lg:col-span-1">
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle>Dataset Details</CardTitle>
            </CardHeader>
            <CardContent>
              {selectedDataset ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      {getTypeIcon(selectedDataset.type)}
                      <Badge variant="outline">{selectedDataset.type}</Badge>
                    </div>
                    <h3 className="font-semibold">{selectedDataset.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {selectedDataset.bodyPart} • {selectedDataset.patientGender}, {selectedDataset.patientAge}y
                    </p>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-medium">Findings</h4>
                    <div className="space-y-1">
                      {selectedDataset.findings.map((finding, index) => (
                        <div key={index} className="text-sm bg-muted p-2 rounded">
                          {finding}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-medium">Metadata</h4>
                    <div className="text-xs space-y-1">
                      <div>Study: {selectedDataset.metadata.studyDescription}</div>
                      <div>Series: {selectedDataset.metadata.seriesDescription}</div>
                      <div>Slice Thickness: {selectedDataset.metadata.sliceThickness}mm</div>
                      <div>Pixel Spacing: {selectedDataset.metadata.pixelSpacing.join(' x ')}mm</div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-medium">Actions</h4>
                    <div className="space-y-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={() => addDatasetToCases(selectedDataset)}
                      >
                        <Eye className="h-4 w-4 mr-2" />
                        Add to Cases
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                        onClick={() => window.open(selectedDataset.imageUrl, '_blank')}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        View Image
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Database className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">Select a dataset to view details</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
