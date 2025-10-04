import type { BusinessPlanGuide } from "./types"
import { generateGuideMarkdown } from "@/lib/utils/transformReportToGuide"

type ExportFormat = 'markdown' | 'pdf'

export interface ExportResult {
  data: string | Uint8Array
  contentType: string
  fileExtension: string
}

export async function exportBusinessPlanGuide(
  guide: BusinessPlanGuide,
  format: ExportFormat = 'markdown'
): Promise<ExportResult> {
  switch (format) {
    case 'markdown': {
      const markdown = generateGuideMarkdown(guide)
      return {
        data: markdown,
        contentType: 'text/markdown; charset=utf-8',
        fileExtension: 'md'
      }
    }
    case 'pdf': {
      const { renderGuidePdf } = await import('./exporters/pdf')
      const binary = await renderGuidePdf(guide)
      return {
        data: binary,
        contentType: 'application/pdf',
        fileExtension: 'pdf'
      }
    }
    default:
      throw new Error(`Unsupported export format: ${format}`)
  }
}

export type { ExportFormat as BusinessPlanExportFormat }
