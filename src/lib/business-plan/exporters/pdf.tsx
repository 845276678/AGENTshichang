import React from "react"
import { Document, Page, Text, View, StyleSheet, pdf } from "@react-pdf/renderer"
import type { BusinessPlanGuide } from "../types"

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 11,
    fontFamily: "Helvetica",
    lineHeight: 1.45,
    color: "#1F2933"
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 12
  },
  meta: {
    fontSize: 10,
    color: "#52606D",
    marginBottom: 4
  },
  section: {
    marginTop: 14,
    marginBottom: 12
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 6
  },
  paragraph: {
    marginBottom: 6
  },
  listItem: {
    marginLeft: 12,
    marginBottom: 3
  },
  subheading: {
    fontSize: 12,
    fontWeight: "bold",
    marginTop: 4,
    marginBottom: 4
  }
})

const formatPercent = (value: number) => {
  const percent = value > 1 ? value : value * 100
  return `${Math.round(percent)}%`
}

const renderList = (items?: string[]) => {
  if (!items || !items.length) {
    return null
  }

  return (
    <>
      {items.map((item, idx) => (
        <Text key={`${item}-${idx}`} style={styles.listItem}>
          • {item}
        </Text>
      ))}
    </>
  )
}

const renderKeyValue = (label: string, value?: string) => {
  if (!value) return null
  return (
    <Text style={styles.paragraph}>
      {label}: {value}
    </Text>
  )
}

export async function renderGuidePdf(guide: BusinessPlanGuide): Promise<Buffer> {
  const generatedAt = guide.metadata?.generatedAt ? new Date(guide.metadata.generatedAt) : new Date()
  const document = (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>{guide.metadata?.ideaTitle ?? "Business Plan"}</Text>
        <Text style={styles.meta}>Generated: {generatedAt.toLocaleString()}</Text>
        <Text style={styles.meta}>Execution window: {guide.metadata?.implementationTimeframe ?? "90 days"}</Text>
        {typeof guide.metadata?.confidenceLevel === "number" && (
          <Text style={styles.meta}>Confidence: {formatPercent(guide.metadata.confidenceLevel)}</Text>
        )}
        {guide.metadata?.winner && <Text style={styles.meta}>Winning persona: {guide.metadata.winner}</Text>}
        {typeof guide.metadata?.winningBid === "number" && (
          <Text style={styles.meta}>Winning bid: ¥{guide.metadata.winningBid}</Text>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>1. Current Situation & Alignment</Text>
          <Text style={styles.paragraph}>{guide.currentSituation.summary}</Text>
          <Text style={styles.subheading}>Key insights</Text>
          {renderList(guide.currentSituation.keyInsights)}
          <Text style={styles.subheading}>Market reality</Text>
          {renderKeyValue("Market size", guide.currentSituation.marketReality.marketSize)}
          {renderKeyValue("Competition", guide.currentSituation.marketReality.competition)}
          <Text style={styles.subheading}>Opportunities</Text>
          {renderList(guide.currentSituation.marketReality.opportunities)}
          <Text style={styles.subheading}>Challenges</Text>
          {renderList(guide.currentSituation.marketReality.challenges)}
          {renderKeyValue("Target users", guide.currentSituation.userNeeds.targetUsers)}
          <Text style={styles.subheading}>Pain points</Text>
          {renderList(guide.currentSituation.userNeeds.painPoints)}
          <Text style={styles.subheading}>Proposed solutions</Text>
          {renderList(guide.currentSituation.userNeeds.solutions)}
          <Text style={styles.subheading}>Immediate actions</Text>
          {renderList(guide.currentSituation.actionItems)}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>2. MVP Definition & Validation</Text>
          {renderKeyValue("Product focus", guide.mvpDefinition.productConcept.uniqueValue)}
          <Text style={styles.subheading}>Core capabilities</Text>
          {renderList(guide.mvpDefinition.productConcept.coreFeatures)}
          {renderKeyValue("Minimum scope", guide.mvpDefinition.productConcept.minimumScope)}
          <Text style={styles.subheading}>Development plan</Text>
          {guide.mvpDefinition.developmentPlan.phases.map((phase, idx) => (
            <View key={`${phase.name}-${idx}`} style={{ marginBottom: 4, marginLeft: 4 }}>
              <Text style={{ fontWeight: "bold" }}>
                {phase.name} ({phase.duration})
              </Text>
              <Text style={styles.paragraph}>Deliverables: {phase.deliverables.join(", ")}</Text>
              {phase.resources.length > 0 && (
                <Text style={styles.paragraph}>Resources: {phase.resources.join(", ")}</Text>
              )}
            </View>
          ))}
          {renderKeyValue("Tech stack", guide.mvpDefinition.developmentPlan.techStack.join(", "))}
          {renderKeyValue("Estimated cost", guide.mvpDefinition.developmentPlan.estimatedCost)}
          <Text style={styles.subheading}>Validation hypotheses</Text>
          {renderList(guide.mvpDefinition.validationStrategy.hypotheses)}
          <Text style={styles.subheading}>Experiments</Text>
          {renderList(guide.mvpDefinition.validationStrategy.experiments)}
          <Text style={styles.subheading}>Success metrics</Text>
          {renderList(guide.mvpDefinition.validationStrategy.successMetrics)}
          {renderKeyValue("Validation timeline", guide.mvpDefinition.validationStrategy.timeline)}
          <Text style={styles.subheading}>Near-term actions</Text>
          {renderList(guide.mvpDefinition.actionItems)}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>3. Business Model & Operations</Text>
          <Text style={styles.subheading}>Business model</Text>
          {renderKeyValue("Revenue streams", guide.businessExecution.businessModel.revenueStreams.join(", "))}
          {renderKeyValue("Cost structure", guide.businessExecution.businessModel.costStructure.join(", "))}
          {renderKeyValue("Pricing strategy", guide.businessExecution.businessModel.pricingStrategy)}
          {renderKeyValue("Scalability", guide.businessExecution.businessModel.scalability)}
          <Text style={styles.subheading}>Launch plan</Text>
          {guide.businessExecution.launchStrategy.phases.map((phase, idx) => (
            <View key={`${phase.name}-${idx}`} style={{ marginBottom: 4, marginLeft: 4 }}>
              <Text style={{ fontWeight: "bold" }}>
                {phase.name} ({phase.timeline})
              </Text>
              <Text style={styles.paragraph}>Goals: {phase.goals.join(", ")}</Text>
              {phase.tactics.length > 0 && (
                <Text style={styles.paragraph}>Tactics: {phase.tactics.join(", ")}</Text>
              )}
            </View>
          ))}
          {renderKeyValue("Marketing channels", guide.businessExecution.launchStrategy.marketingChannels.join(", "))}
          {renderKeyValue("Budget allocation", guide.businessExecution.launchStrategy.budgetAllocation.join(", "))}
          <Text style={styles.subheading}>Operations</Text>
          {renderKeyValue("Team structure", guide.businessExecution.operationalPlan.teamStructure.join(", "))}
          {renderKeyValue("Processes", guide.businessExecution.operationalPlan.processes.join(", "))}
          {renderKeyValue("Infrastructure", guide.businessExecution.operationalPlan.infrastructure.join(", "))}
          {renderKeyValue("Risk management", guide.businessExecution.operationalPlan.riskManagement.join(", "))}
          <Text style={styles.subheading}>Operational priorities</Text>
          {renderList(guide.businessExecution.actionItems)}
        </View>

        {guide.executionPlan && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>4. 90-Day Execution Plan</Text>
            {renderKeyValue("Mission", guide.executionPlan.mission)}
            {renderKeyValue("Summary", guide.executionPlan.summary)}
            <Text style={styles.subheading}>Phases</Text>
            {guide.executionPlan.phases.map((phase, idx) => (
              <View key={`${phase.name}-${idx}`} style={{ marginBottom: 4, marginLeft: 4 }}>
                <Text style={{ fontWeight: "bold" }}>
                  {phase.name} ({phase.timeline})
                </Text>
                <Text style={styles.paragraph}>Focus: {phase.focus}</Text>
                <Text style={styles.paragraph}>Key outcomes: {phase.keyOutcomes.join(", ")}</Text>
                <Text style={styles.paragraph}>Metrics: {phase.metrics.join(", ")}</Text>
              </View>
            ))}
            <Text style={styles.subheading}>Weekly sprints</Text>
            {guide.executionPlan.weeklySprints.map((sprint, idx) => (
              <View key={`${sprint.name}-${idx}`} style={{ marginBottom: 4, marginLeft: 4 }}>
                <Text style={{ fontWeight: "bold" }}>{sprint.name}</Text>
                <Text style={styles.paragraph}>Focus: {sprint.focus}</Text>
                <Text style={styles.paragraph}>Objectives: {sprint.objectives.join(", ")}</Text>
                <Text style={styles.paragraph}>Feedback hooks: {sprint.feedbackHooks.join(", ")}</Text>
              </View>
            ))}
            <Text style={styles.subheading}>Feedback loop</Text>
            {renderKeyValue("Cadence", guide.executionPlan.feedbackLoop.cadence.join(", "))}
            {renderKeyValue("Channels", guide.executionPlan.feedbackLoop.channels.join(", "))}
            {renderKeyValue("Decision gates", guide.executionPlan.feedbackLoop.decisionGates.join(", "))}
            {renderKeyValue("Tooling", guide.executionPlan.feedbackLoop.tooling.join(", "))}
            <Text style={styles.subheading}>Daily routines</Text>
            {renderList(guide.executionPlan.dailyRoutines)}
            <Text style={styles.subheading}>Review framework</Text>
            {renderKeyValue("Weekly review", guide.executionPlan.reviewFramework.weekly.join(", "))}
            {renderKeyValue("Monthly calibration", guide.executionPlan.reviewFramework.monthly.join(", "))}
            {renderKeyValue("Metrics to watch", guide.executionPlan.reviewFramework.dataWatch.join(", "))}
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.subheading}>Notes</Text>
          <Text style={styles.paragraph}>
            Generated by the landing coach AI. Validate with customer feedback and operational data before major investment.
          </Text>
        </View>
      </Page>
    </Document>
  )

  const instance = pdf(document)
  const buffer = await instance.toBuffer()
  return buffer
}
