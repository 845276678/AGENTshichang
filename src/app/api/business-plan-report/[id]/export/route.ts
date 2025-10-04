import { NextRequest, NextResponse } from "next/server"
import { authenticateRequest, handleApiError } from "@/lib/auth"
import { BusinessPlanSessionService } from "@/lib/business-plan/session-service"
import { exportBusinessPlanGuide, type BusinessPlanExportFormat } from "@/lib/business-plan/exporter"
import type { BusinessPlanGuide } from "@/lib/business-plan/types"

export const dynamic = "force-dynamic"

const SUPPORTED_FORMATS: Record<string, BusinessPlanExportFormat> = {
  markdown: "markdown",
  md: "markdown",
  pdf: "pdf"
}

function resolveFormat(value: string | null): BusinessPlanExportFormat {
  const key = (value ?? "markdown").toLowerCase()
  const format = SUPPORTED_FORMATS[key]
  if (!format) {
    throw new Error(`Unsupported export format: ${value}`)
  }
  return format
}

function ensureGuideMetadata(guide: BusinessPlanGuide): BusinessPlanGuide {
  if (!guide.metadata) {
    guide.metadata = {
      ideaTitle: "Business Plan",
      generatedAt: new Date().toISOString(),
      implementationTimeframe: "90 days",
      confidenceLevel: 50
    } as any
  } else {
    guide.metadata.ideaTitle = guide.metadata.ideaTitle ?? "Business Plan"
    guide.metadata.generatedAt = guide.metadata.generatedAt ?? new Date().toISOString()
    guide.metadata.implementationTimeframe = guide.metadata.implementationTimeframe ?? "90 days"
    guide.metadata.confidenceLevel = guide.metadata.confidenceLevel ?? 50
  }
  return guide
}

function buildFileName(rawTitle: string, extension: string) {
  const fallback = "business-plan"
  const safe = rawTitle
    .toLowerCase()
    .replace(/[^a-z0-9]+/gi, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
  const base = safe || fallback
  return `${base}.${extension}`
}

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const format = resolveFormat(new URL(request.url).searchParams.get("format"))

    // 先获取报告
    const report = await BusinessPlanSessionService.getReportById(params.id)
    if (!report) {
      return NextResponse.json({ success: false, error: "Report not found" }, { status: 404 })
    }

    // 检查报告是否刚创建（5分钟内）
    const isRecentReport = report.createdAt && (Date.now() - report.createdAt.getTime()) < 5 * 60 * 1000

    // 如果不是近期报告或报告有userId，则需要认证和权限检查
    if (!isRecentReport || report.userId) {
      try {
        const user = await authenticateRequest(request)

        // 权限检查
        if (report.userId && report.userId !== user.id) {
          return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 })
        }

        // 记录审计日志
        await BusinessPlanSessionService.recordAudit({
          sessionId: report.sessionId,
          action: "REPORT_EXPORTED",
          createdBy: user.id,
          payload: { format }
        })
      } catch (authError) {
        // 如果是近期报告，允许免认证导出
        if (!isRecentReport) {
          return NextResponse.json({ success: false, error: "Authentication required" }, { status: 401 })
        }
        // 近期报告免认证，但不记录审计
        console.log(`Recent report ${params.id} exported without authentication`)
      }
    }

    const guide = ensureGuideMetadata(report.guide as unknown as BusinessPlanGuide)
    const exportResult = await exportBusinessPlanGuide(guide, format)

    const fileName = buildFileName(guide.metadata.ideaTitle ?? "business-plan", exportResult.fileExtension)

    const headers = new Headers()
    headers.set("Content-Type", exportResult.contentType)
    headers.set("Cache-Control", "no-store")
    headers.set("Content-Disposition", `attachment; filename="${fileName}"`)

    const body =
      typeof exportResult.data === "string"
        ? exportResult.data
        : new Uint8Array(exportResult.data)

    return new NextResponse(body, { status: 200, headers })
  } catch (error) {
    return handleApiError(error)
  }
}


