"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Search,
  Filter,
  Bookmark,
  History,
  Eye,
  FileText,
  Users,
  Shield,
  Brain,
  Activity,
  TrendingUp,
} from "lucide-react"

interface SearchResult {
  id: string
  type: "case" | "finding" | "guideline" | "person" | "audit"
  title: string
  description: string
  relevance: number
  metadata: Record<string, any>
}

export function SemanticSearch() {
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState("cases")
  const [isSearching, setIsSearching] = useState(false)

  const mockSearchResults: SearchResult[] = [
    {
      id: "case-1",
      type: "case",
      title: "CT Head - ICH Suspected",
      description: "64-year-old male with acute intracerebral hemorrhage, high confidence AI detection",
      relevance: 0.95,
      metadata: {
        caseId: "ACC-2025-09-25-12345",
        modality: "CT",
        bodyPart: "Head",
        confidence: 0.91,
        status: "AI_COMPLETE",
      },
    },
    {
      id: "finding-1",
      type: "finding",
      title: "Intracerebral Hemorrhage",
      description: "AI-detected hemorrhage with 91% confidence in left basal ganglia region",
      relevance: 0.92,
      metadata: {
        confidence: 0.91,
        location: "Left basal ganglia",
        size: "2.1 x 1.8 cm",
        model: "ct-brain-3.2.1",
      },
    },
    {
      id: "guideline-1",
      type: "guideline",
      title: "AHA/ASA ICH Guidelines 2022",
      description: "American Heart Association guidelines for spontaneous intracerebral hemorrhage management",
      relevance: 0.89,
      metadata: {
        society: "AHA/ASA",
        year: 2022,
        strength: "Strong",
        topics: ["Blood pressure", "Surgical intervention", "Monitoring"],
      },
    },
    {
      id: "person-1",
      type: "person",
      title: "Dr. Robert Kapoor",
      description: "Neuroradiologist specializing in emergency imaging and stroke protocols",
      relevance: 0.87,
      metadata: {
        role: "Radiologist",
        specialty: "Neuroradiology",
        cases: 45,
        availability: "Available",
      },
    },
  ]

  const savedSearches = ["brain hemorrhage CT", "STAT cases last 24h", "pending AI review", "high confidence findings"]

  const handleSearch = () => {
    if (!searchQuery.trim()) return
    setIsSearching(true)
    // Simulate search delay
    setTimeout(() => {
      setIsSearching(false)
    }, 1000)
  }

  const getResultIcon = (type: string) => {
    switch (type) {
      case "case":
        return <FileText className="h-4 w-4 text-blue-500" />
      case "finding":
        return <Brain className="h-4 w-4 text-purple-500" />
      case "guideline":
        return <Activity className="h-4 w-4 text-green-500" />
      case "person":
        return <Users className="h-4 w-4 text-orange-500" />
      case "audit":
        return <Shield className="h-4 w-4 text-red-500" />
      default:
        return <Search className="h-4 w-4" />
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case "case":
        return "text-blue-500 border-blue-500"
      case "finding":
        return "text-purple-500 border-purple-500"
      case "guideline":
        return "text-green-500 border-green-500"
      case "person":
        return "text-orange-500 border-orange-500"
      case "audit":
        return "text-red-500 border-red-500"
      default:
        return "text-muted-foreground"
    }
  }

  const filteredResults = mockSearchResults.filter((result) => {
    if (activeTab === "all") return true
    if (activeTab === "cases") return result.type === "case"
    if (activeTab === "findings") return result.type === "finding"
    if (activeTab === "guidelines") return result.type === "guideline"
    if (activeTab === "people") return result.type === "person"
    if (activeTab === "audit") return result.type === "audit"
    return true
  })

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-balance">Semantic Search</h1>
          <p className="text-muted-foreground">Search across cases, findings, guidelines, and team members</p>
        </div>
        <Button variant="outline" size="sm">
          <Filter className="h-4 w-4 mr-2" />
          Advanced Filters
        </Button>
      </div>

      {/* Search Bar */}
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search for cases, findings, guidelines, or team members..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  className="pl-10"
                />
              </div>
              <Button onClick={handleSearch} disabled={isSearching}>
                {isSearching ? "Searching..." : "Search"}
              </Button>
            </div>

            {/* Query Helpers */}
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <History className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium text-muted-foreground">Saved Searches:</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {savedSearches.map((search, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={() => setSearchQuery(search)}
                    className="text-xs bg-transparent"
                  >
                    {search}
                  </Button>
                ))}
              </div>
            </div>

            {/* Search Suggestions */}
            <div className="text-xs text-muted-foreground">
              <span className="font-medium">Try:</span> "brain bleed", "STAT cases", "Dr. Smith", "AHA guidelines"
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="all">All Results</TabsTrigger>
            <TabsTrigger value="cases">Cases</TabsTrigger>
            <TabsTrigger value="findings">Findings</TabsTrigger>
            <TabsTrigger value="guidelines">Guidelines</TabsTrigger>
            <TabsTrigger value="people">People</TabsTrigger>
            <TabsTrigger value="audit">Audit</TabsTrigger>
          </TabsList>
          <Badge variant="outline">{filteredResults.length} results</Badge>
        </div>

        <TabsContent value={activeTab} className="space-y-4">
          {filteredResults.length > 0 ? (
            <div className="space-y-4">
              {filteredResults.map((result) => (
                <Card key={result.id} className="hover:bg-accent/50 transition-colors cursor-pointer">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="flex items-center gap-2">
                        {getResultIcon(result.type)}
                        <Badge variant="outline" className={getTypeColor(result.type)}>
                          {result.type}
                        </Badge>
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <h3 className="font-semibold text-balance">{result.title}</h3>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              <TrendingUp className="h-3 w-3 mr-1" />
                              {(result.relevance * 100).toFixed(0)}%
                            </Badge>
                          </div>
                        </div>

                        <p className="text-sm text-muted-foreground mb-3">{result.description}</p>

                        {/* Type-specific metadata */}
                        {result.type === "case" && (
                          <div className="flex items-center gap-4 text-xs text-muted-foreground mb-2">
                            <span>Case: {result.metadata.caseId}</span>
                            <span>
                              {result.metadata.modality} - {result.metadata.bodyPart}
                            </span>
                            <span>Confidence: {(result.metadata.confidence * 100).toFixed(0)}%</span>
                            <Badge variant="secondary" className="text-xs">
                              {result.metadata.status}
                            </Badge>
                          </div>
                        )}

                        {result.type === "finding" && (
                          <div className="flex items-center gap-4 text-xs text-muted-foreground mb-2">
                            <span>Location: {result.metadata.location}</span>
                            <span>Size: {result.metadata.size}</span>
                            <span>Model: {result.metadata.model}</span>
                          </div>
                        )}

                        {result.type === "guideline" && (
                          <div className="flex items-center gap-4 text-xs text-muted-foreground mb-2">
                            <span>{result.metadata.society}</span>
                            <span>{result.metadata.year}</span>
                            <Badge variant="outline" className="text-xs">
                              {result.metadata.strength}
                            </Badge>
                          </div>
                        )}

                        {result.type === "person" && (
                          <div className="flex items-center gap-4 text-xs text-muted-foreground mb-2">
                            <span>{result.metadata.specialty}</span>
                            <span>{result.metadata.cases} cases</span>
                            <Badge
                              variant="outline"
                              className={`text-xs ${
                                result.metadata.availability === "Available"
                                  ? "text-green-500 border-green-500"
                                  : "text-red-500 border-red-500"
                              }`}
                            >
                              {result.metadata.availability}
                            </Badge>
                          </div>
                        )}

                        <div className="flex items-center gap-2">
                          <Button variant="outline" size="sm">
                            <Eye className="h-3 w-3 mr-1" />
                            View
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Bookmark className="h-3 w-3 mr-1" />
                            Save
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <Search className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                <p className="text-muted-foreground">
                  {searchQuery ? "No results found for your search" : "Enter a search query to get started"}
                </p>
                {searchQuery && (
                  <div className="mt-4 space-y-2">
                    <p className="text-sm text-muted-foreground">Try:</p>
                    <div className="flex flex-wrap justify-center gap-2">
                      <Button variant="outline" size="sm" onClick={() => setSearchQuery("brain hemorrhage")}>
                        brain hemorrhage
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => setSearchQuery("STAT cases")}>
                        STAT cases
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => setSearchQuery("CT head")}>
                        CT head
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
