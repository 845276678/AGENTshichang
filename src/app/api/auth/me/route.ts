import { NextRequest, NextResponse } from "next/server"

import { getUserFromToken } from "@/lib/auth-helper"

export const dynamic = "force-dynamic"

export async function GET(request: NextRequest) {
  try {
    const authResult = await getUserFromToken(request)

    if (!authResult.success || !authResult.user) {
      return NextResponse.json(
        {
          success: false,
          message: authResult.error ?? "Unauthorized"
        },
        { status: 401 }
      )
    }

    return NextResponse.json({
      success: true,
      data: authResult.user,
      message: "User information retrieved"
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        message: "Internal server error",
        ...(process.env.NODE_ENV === "development" && {
          error: error instanceof Error ? error.message : "Unknown error"
        })
      },
      { status: 500 }
    )
  }
}
