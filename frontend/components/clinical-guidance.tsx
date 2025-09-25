"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { caseService, type Case } from "@/lib/case-service"
import {
  Search,
  ExternalLink,
  AlertTriangle,
  CheckCircle,
  Brain,
  FileText,
  Copy,
  Filter,
  TrendingUp,
  Users,
  Calendar,
  Shield,
} from "lucide-react"

interface Guideline {
  id: string
  title: string
  society: string
  year: number
  relevance: number
  strength: "Strong" | "Moderate" | "Weak"
  snippets: string[]
  url: string
}

interface Recommendation {
  step: string
  rationale: string
  strength: "Strong" | "Moderate" | "Weak"
  alternatives?: string[]
  contraindications?: string[]
}

interface GraniteSummary {
  summary: string
  recommendations: Recommendation[]
  uncertainties: string[]
  version: string
  latencyMs: number
  confidence: number
}

export function ClinicalGuidance() {
  const [selectedCase, setSelectedCase] = useState<Case | null>(null)
  
  useEffect(() => {
    const cases = caseService.getAllCases()
    if (cases.length > 0) {
      setSelectedCase(cases[0])
    }
  }, [])
  const [activeTab, setActiveTab] = useState("evidence")

  const mockGuidelines: Guideline[] = [
    {
      id: "AHA-ICH-2022",
      title: "AHA/ASA Guideline for Spontaneous Intracerebral Hemorrhage 2022",
      society: "AHA/ASA",
      year: 2022,
      relevance: 0.94,
      strength: "Strong",
      snippets: [
        "Blood pressure should be lowered to <140 mmHg systolic within 1 hour",
        "CT angiography is recommended to identify underlying vascular abnormalities",
        "Surgical evacuation may be considered for cerebellar hemorrhages >3cm",
      ],
      url: "https://ahajournals.org/ich-guidelines",
    },
    {
      id: "ESMO-ICH-2021",
      title: "European Guidelines for Intracerebral Hemorrhage Management",
      society: "ESMO",
      year: 2021,
      relevance: 0.87,
      strength: "Strong",
      snippets: [
        "Immediate reversal of anticoagulation is critical",
        "Hematoma expansion occurs in 20-30% of patients within 24 hours",
        "Glasgow Coma Scale should be monitored continuously",
      ],
      url: "https://esmo.org/ich-management",
    },
    {
      id: "NICE-ICH-2020",
      title: "NICE Guidelines: Stroke and Transient Ischaemic Attack",
      society: "NICE",
      year: 2020,
      relevance: 0.82,
      strength: "Moderate",
      snippets: [
        "Specialist stroke unit care reduces mortality and morbidity",
        "Early mobilization within 24-48 hours when clinically stable",
        "Multidisciplinary team approach is essential",
      ],
      url: "https://nice.org.uk/stroke-guidelines",
    },
  ]

  const mockSummary: GraniteSummary = {
    summary:
      "Non-contrast head CT demonstrates acute intraparenchymal hemorrhage in the left basal ganglia region, measuring approximately 2.1 x 1.8 cm. The hemorrhage shows high attenuation consistent with acute blood products. There is mild surrounding edema and no significant midline shift. No evidence of intraventricular extension or hydrocephalus.",
    recommendations: [
      {
        step: "Immediate blood pressure control",
        rationale: "Per AHA/ASA 2022 guidelines for ICH management",
        strength: "Strong",
        alternatives: ["Nicardipine", "Clevidipine", "Labetalol"],
        contraindications: ["Hypotension", "Cardiogenic shock"],
      },
      {
        step: "CT angiography evaluation",
        rationale: "To exclude underlying vascular malformation",
        strength: "Strong",
        alternatives: ["MR angiography if CT contraindicated"],
      },
      {
        step: "Neurosurgical consultation",
        rationale: "Hemorrhage size and location warrant specialist evaluation",
        strength: "Moderate",
      },
    ],
    uncertainties: [
      "CT artifact may mimic small bleeds in posterior fossa",
      "Timing of hemorrhage onset affects treatment decisions",
      "Patient's baseline functional status not available",
    ],
    version: "granite-med-1.1",
    latencyMs: 850,
    confidence: 0.89,
  }

  const getStrengthColor = (strength: string) => {
    switch (strength) {
      case "Strong":
        return "text-green-600 border-green-600"
      case "Moderate":
        return "text-yellow-600 border-yellow-600"
      case "Weak":
        return "text-orange-600 border-orange-600"
      default:
        return "text-muted-foreground"
    }
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-balance">Clinical Guidance & Recommendations</h1>
          <p className="text-muted-foreground">
            Evidence-based guidance for {selectedCase.modality} - {selectedCase.bodyPart} |{" "}
            {selectedCase.patient.display}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="flex items-center gap-1">
            <Brain className="h-3 w-3" />
            AI Confidence: {(mockSummary.confidence * 100).toFixed(0)}%
          </Badge>
          <Button variant="outline" size="sm">
            <Copy className="h-4 w-4 mr-2" />
            Export Summary
          </Button>
        </div>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="evidence" className="flex items-center gap-2">
            <Search className="h-4 w-4" />
            Evidence
          </TabsTrigger>
          <TabsTrigger value="summary" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            AI Summary
          </TabsTrigger>
        </TabsList>

        <TabsContent value="evidence" className="space-y-6">
          {/* Search & Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Clinical Guidelines ({mockGuidelines.length})</span>
                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  Filter
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 mb-4">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Search className="h-4 w-4" />
                  <span>Query: "intracerebral hemorrhage non-contrast CT adult"</span>
                </div>
                <Separator orientation="vertical" className="h-4" />
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full" />
                    <span>Strong (2)</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full" />
                    <span>Moderate (1)</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                {mockGuidelines.map((guideline) => (
                  <Card key={guideline.id} className="border-l-4 border-l-primary">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="font-semibold text-balance">{guideline.title}</h3>
                          <div className="flex items-center gap-4 mt-1 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Users className="h-3 w-3" />
                              {guideline.society}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {guideline.year}
                            </span>
                            <span className="flex items-center gap-1">
                              <TrendingUp className="h-3 w-3" />
                              {(guideline.relevance * 100).toFixed(0)}% relevance
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className={getStrengthColor(guideline.strength)}>
                            {guideline.strength}
                          </Badge>
                          <Button variant="ghost" size="sm">
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <h4 className="text-sm font-medium">Key Evidence:</h4>
                        <ul className="space-y-1">
                          {guideline.snippets.map((snippet, index) => (
                            <li key={index} className="text-sm text-muted-foreground flex items-start gap-2">
                              <div className="w-1 h-1 bg-primary rounded-full mt-2 flex-shrink-0" />
                              <span>{snippet}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="summary" className="space-y-6">
          {/* AI Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Brain className="h-5 w-5" />
                  AI-Generated Summary
                </span>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="text-xs">
                    {mockSummary.version}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {mockSummary.latencyMs}ms
                  </Badge>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium mb-2">Clinical Summary</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{mockSummary.summary}</p>
                </div>

                <Separator />

                <div>
                  <h3 className="font-medium mb-3 flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    Recommended Actions
                  </h3>
                  <div className="space-y-4">
                    {mockSummary.recommendations.map((rec, index) => (
                      <Card key={index} className="border-l-4 border-l-green-500">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between mb-2">
                            <h4 className="font-medium">{rec.step}</h4>
                            <Badge variant="outline" className={getStrengthColor(rec.strength)}>
                              {rec.strength}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mb-3">{rec.rationale}</p>

                          {rec.alternatives && (
                            <div className="mb-2">
                              <span className="text-xs font-medium text-muted-foreground">Alternatives:</span>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {rec.alternatives.map((alt, i) => (
                                  <Badge key={i} variant="secondary" className="text-xs">
                                    {alt}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}

                          {rec.contraindications && (
                            <div>
                              <span className="text-xs font-medium text-red-600">Contraindications:</span>
                              <div className="flex flex-wrap gap-1 mt-1">
                                {rec.contraindications.map((contra, i) => (
                                  <Badge key={i} variant="destructive" className="text-xs">
                                    {contra}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>

                <Separator />

                <div>
                  <h3 className="font-medium mb-3 flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-yellow-500" />
                    Uncertainties & Caveats
                  </h3>
                  <div className="space-y-2">
                    {mockSummary.uncertainties.map((uncertainty, index) => (
                      <div key={index} className="flex items-start gap-2 text-sm">
                        <AlertTriangle className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                        <span className="text-muted-foreground">{uncertainty}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Actionables */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="border-dashed">
                  <CardContent className="p-4 text-center">
                    <FileText className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                    <h4 className="font-medium mb-1">Orders</h4>
                    <p className="text-xs text-muted-foreground mb-3">Generate order sets</p>
                    <Button variant="outline" size="sm" className="w-full bg-transparent">
                      Create Orders
                    </Button>
                  </CardContent>
                </Card>

                <Card className="border-dashed">
                  <CardContent className="p-4 text-center">
                    <Users className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                    <h4 className="font-medium mb-1">Consults</h4>
                    <p className="text-xs text-muted-foreground mb-3">Request specialist input</p>
                    <Button variant="outline" size="sm" className="w-full bg-transparent">
                      Request Consult
                    </Button>
                  </CardContent>
                </Card>

                <Card className="border-dashed">
                  <CardContent className="p-4 text-center">
                    <Copy className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                    <h4 className="font-medium mb-1">Smart Phrases</h4>
                    <p className="text-xs text-muted-foreground mb-3">Copy to EHR</p>
                    <Button variant="outline" size="sm" className="w-full bg-transparent">
                      Copy Text
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>

          {/* Provenance */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Provenance Chain
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <Brain className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">AI Finding Detection</div>
                    <div className="text-xs text-muted-foreground">SageMaker model: {selectedCase.ai.modelVersion}</div>
                  </div>
                  <Badge variant="outline">0.91 confidence</Badge>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center">
                    <Search className="h-4 w-4 text-blue-500" />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">Evidence Retrieval</div>
                    <div className="text-xs text-muted-foreground">
                      OpenSearch: {selectedCase.evidence.openSearchHits} guideline matches
                    </div>
                  </div>
                  <Badge variant="outline">94% relevance</Badge>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center">
                    <FileText className="h-4 w-4 text-green-500" />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">LLM Synthesis</div>
                    <div className="text-xs text-muted-foreground">IBM Granite: {mockSummary.version}</div>
                  </div>
                  <Badge variant="outline">{mockSummary.latencyMs}ms</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
