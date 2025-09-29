'use client'

import React, { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import { Layout } from "@/components/layout"

interface SubmitIdeaLayoutProps {
  children: React.ReactNode
}

export default function SubmitIdeaLayout({ children }: SubmitIdeaLayoutProps) {
  const router = useRouter()
  const { isAuthenticated, isInitialized } = useAuth()

  useEffect(() => {
    if (!isInitialized) {return}
    if (!isAuthenticated) {
      const redirectUrl = `/auth/login?redirect=${encodeURIComponent('/marketplace')}`
      router.replace(redirectUrl)
    }
  }, [isInitialized, isAuthenticated, router])

  if (!isInitialized) {
    return (
      <Layout>
        <div className="container py-24 text-center text-muted-foreground">
          Checking authentication...
        </div>
      </Layout>
    )
  }

  if (!isAuthenticated) {
    return (
      <Layout>
        <div className="container py-24 text-center text-muted-foreground">
          Redirecting to login...
        </div>
      </Layout>
    )
  }

  return <>{children}</>
}