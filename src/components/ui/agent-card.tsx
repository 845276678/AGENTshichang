import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { cn } from '@/lib/utils'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Rating } from '@/components/ui/rating'
import { Download, Users, Zap } from 'lucide-react'

export interface Agent {
  id: string
  name: string
  description: string
  category: string
  price: number
  rating: number
  reviewCount: number
  downloads: number
  image?: string
  tags: string[]
  author: {
    id: string
    name: string
    avatar?: string
    verified: boolean
  }
  createdAt: string
  updatedAt: string
  featured?: boolean
  trending?: boolean
}

interface AgentCardProps {
  agent: Agent
  variant?: 'default' | 'compact' | 'featured'
  className?: string
  showPrice?: boolean
  showStats?: boolean
  animationDelay?: number
}

export const AgentCard: React.FC<AgentCardProps> = ({
  agent,
  className,
  showPrice = true,
  showStats = true,
}) => {
  const renderPrice = () => {
    if (agent.price === 0) {
      return <Badge variant="success">Free</Badge>
    }
    return (
      <div className="flex items-center gap-1">
        <span className="text-lg font-bold text-primary">
          ${agent.price}
        </span>
        <span className="text-xs text-muted-foreground">/month</span>
      </div>
    )
  }

  return (
    <div className={cn(className)}>
      <Card className="h-full group cursor-pointer border-0 shadow-md hover:shadow-xl transition-all duration-300">
        <Link href={`/agents/${agent.id}`}>
          <CardHeader className="pb-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-primary/20 to-agent-500/20 flex items-center justify-center border group-hover:scale-110 transition-transform">
                  {agent.image ? (
                    <Image 
                      src={agent.image} 
                      alt={agent.name}
                      width={32}
                      height={32}
                      className="rounded object-cover"
                    />
                  ) : (
                    <Zap className="h-6 w-6 text-primary" />
                  )}
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">
                    {agent.name}
                  </h3>
                  <Badge variant="outline" className="text-xs mt-1">
                    {agent.category}
                  </Badge>
                </div>
              </div>
              {showPrice && <div className="flex-shrink-0">{renderPrice()}</div>}
            </div>
          </CardHeader>

          <CardContent className="pt-0">
            <p className="text-muted-foreground text-sm line-clamp-3 mb-4">
              {agent.description}
            </p>

            <div className="flex flex-wrap gap-1 mb-4">
              {agent.tags.slice(0, 2).map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>

            {showStats && (
              <div className="flex items-center justify-between">
                <Rating value={agent.rating} size="sm" showText />
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <Download className="h-3 w-3" />
                    {agent.downloads > 1000 
                      ? `${(agent.downloads / 1000).toFixed(1)}k` 
                      : agent.downloads}
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    {agent.reviewCount}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Link>
      </Card>
    </div>
  )
}

export default AgentCard