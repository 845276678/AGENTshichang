'use client'

import { useMemo } from 'react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Download, Eye, FileText, CheckCircle } from 'lucide-react'

interface BusinessPlanResultProps {
  params: {
    id: string
  }
}

const BASE_PLAN = {
  title: 'Smart Fridge Ingredient Assistant',
  category: 'Lifestyle idea',
  generatedAt: '2024-01-15T10:30:00Z',
  status: 'completed',
  overallScore: 8.7,
  overview: {
    valueIncrease: '16x',
    marketSize: '$1.2B',
    roi: '35%',
    timeline: '18 months',
    fundingNeeded: '$8M'
  },
  stages: [
    {
      id: 'concept_review',
      name: 'Concept review',
      aiProvider: 'Vertex AI',
      status: 'completed',
      score: 8.5,
      keyFindings: [
        'Food waste remains above 30% without smart tracking.',
        'Target users: busy families (25-45) who value healthy meals.',
        'Innovation: computer vision ingredient detection plus tailored recipes.'
      ],
      deliverables: ['Concept summary', 'User personas', 'Problem statement']
    },
    {
      id: 'market_research',
      name: 'Market research',
      aiProvider: 'Gemini Advanced',
      status: 'completed',
      score: 9.1,
      keyFindings: [
        'Total addressable market about $1.2B within smart kitchen solutions.',
        'Eight direct competitors identified; differentiation via hardware and AI bundle.',
        'Average willingness to pay is $299 per year subscription.'
      ],
      deliverables: ['Market size report', 'Competitor analysis', 'Customer profiles']
    }
  ],
  documents: [
    {
      name: 'Full Business Plan',
      type: 'PDF',
      pages: 120,
      size: '12.5MB',
      description: 'Complete go-to-market, technical and operational playbook.'
    },
    {
      name: 'Investor Pitch Deck',
      type: 'PPTX',
      pages: 35,
      size: '9.2MB',
      description: 'Growth story, traction metrics and fundraising ask.'
    }
  ]
}

export default function BusinessPlanResultPage({ params }: BusinessPlanResultProps) {
  const businessPlan = useMemo(() => ({ ...BASE_PLAN, id: params.id }), [params.id])

  return (
    <div className="container py-10 space-y-6">
      <div>
        <Badge variant="outline" className="mb-4">
          Business Plan Report
        </Badge>
        <h1 className="text-3xl font-bold mb-2">{businessPlan.title}</h1>
        <p className="text-sm text-muted-foreground">
          Generated on {new Date(businessPlan.generatedAt).toLocaleDateString()} · Status: {businessPlan.status}
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <StatCard title="Value uplift" value={businessPlan.overview.valueIncrease} />
        <StatCard title="Market size" value={businessPlan.overview.marketSize} />
        <StatCard title="ROI" value={businessPlan.overview.roi} />
        <StatCard title="Timeline" value={businessPlan.overview.timeline} />
        <StatCard title="Funding need" value={businessPlan.overview.fundingNeeded} />
      </div>

      <Tabs defaultValue="analysis" className="space-y-6">
        <TabsList className="w-full md:w-[320px]">
          <TabsTrigger value="analysis">AI Analysis</TabsTrigger>
          <TabsTrigger value="documents">Deliverables</TabsTrigger>
        </TabsList>

        <TabsContent value="analysis" className="space-y-4">
          {businessPlan.stages.map((stage) => (
            <Card key={stage.id}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  {stage.name}
                  <Badge variant="outline" className="ml-auto">
                    Score {stage.score}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">Provider: {stage.aiProvider}</p>
                <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
                  {stage.keyFindings.map((finding, index) => (
                    <li key={index}>{finding}</li>
                  ))}
                </ul>
                <div className="flex flex-wrap gap-2">
                  {stage.deliverables.map((item) => (
                    <Badge key={item} variant="secondary">
                      {item}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="documents" className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {businessPlan.documents.map((doc) => (
            <Card key={doc.name}>
              <CardContent className="flex flex-col gap-3 pt-6">
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <FileText className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{doc.name}</h3>
                    <p className="text-sm text-muted-foreground">{doc.description}</p>
                    <p className="text-xs text-muted-foreground">
                      {doc.type} · {doc.pages} pages · {doc.size}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Eye className="w-4 h-4 mr-1" /> Preview
                  </Button>
                  <Button size="sm">
                    <Download className="w-4 h-4 mr-1" /> Download
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  )
}

function StatCard({ title, value }: { title: string; value: string }) {
  return (
    <Card>
      <CardContent className="text-center space-y-1 pt-6">
        <div className="text-2xl font-bold">{value}</div>
        <div className="text-sm text-muted-foreground">{title}</div>
      </CardContent>
    </Card>
  )
}
