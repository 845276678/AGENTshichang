import { render, screen } from '@testing-library/react'
import { AgentCard, Agent } from '@/components/ui/agent-card'


// Mock Next.js components
jest.mock('next/link', () => {
  return ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  )
})

jest.mock('next/image', () => {
  return ({ src, alt, ...props }: any) => (
    <img src={src} alt={alt} {...props} />
  )
})

describe('AgentCard', () => {
  const mockAgent: Agent = {
    id: '1',
    name: 'Test Agent',
    description: 'This is a test agent description for testing purposes.',
    category: 'AI Assistant',
    price: 29.99,
    rating: 4.5,
    reviewCount: 150,
    downloads: 1250,
    image: '/test-agent.jpg',
    tags: ['ai', 'assistant', 'productivity', 'automation'],
    author: {
      id: 'author1',
      name: 'Test Author',
      avatar: '/test-author.jpg',
      verified: true,
    },
    createdAt: '2024-01-01T00:00:00.000Z',
    updatedAt: '2024-01-15T00:00:00.000Z',
    featured: false,
    trending: false,
  }

  it('renders agent card with all information', () => {
    render(<AgentCard agent={mockAgent} />)

    expect(screen.getByText('Test Agent')).toBeInTheDocument()
    expect(screen.getByText(/This is a test agent description/)).toBeInTheDocument()
    expect(screen.getByText('AI Assistant')).toBeInTheDocument()
    expect(screen.getByText('$29.99')).toBeInTheDocument()
    expect(screen.getByText('/month')).toBeInTheDocument()
    expect(screen.getByText('1.3k')).toBeInTheDocument() // downloads formatted
    expect(screen.getByText('150')).toBeInTheDocument() // review count
  })

  it('renders free badge for zero price', () => {
    const freeAgent = { ...mockAgent, price: 0 }
    render(<AgentCard agent={freeAgent} />)

    expect(screen.getByText('Free')).toBeInTheDocument()
    expect(screen.queryByText('$0')).not.toBeInTheDocument()
  })

  it('hides price when showPrice is false', () => {
    render(<AgentCard agent={mockAgent} showPrice={false} />)

    expect(screen.queryByText('$29.99')).not.toBeInTheDocument()
    expect(screen.queryByText('/month')).not.toBeInTheDocument()
    expect(screen.queryByText('Free')).not.toBeInTheDocument()
  })

  it('hides stats when showStats is false', () => {
    render(<AgentCard agent={mockAgent} showStats={false} />)

    expect(screen.queryByText('1.3k')).not.toBeInTheDocument()
    expect(screen.queryByText('150')).not.toBeInTheDocument()
  })

  it('renders agent image when provided', () => {
    render(<AgentCard agent={mockAgent} />)

    const image = screen.getByAltText('Test Agent')
    expect(image).toBeInTheDocument()
    expect(image).toHaveAttribute('src', '/test-agent.jpg')
  })

  it('renders default icon when no image provided', () => {
    const agentWithoutImage = { ...mockAgent, image: undefined }
    render(<AgentCard agent={agentWithoutImage} />)

    // The Zap icon should be rendered instead of an image
    expect(screen.queryByAltText('Test Agent')).not.toBeInTheDocument()
  })

  it('displays only first 2 tags', () => {
    render(<AgentCard agent={mockAgent} />)

    expect(screen.getByText('ai')).toBeInTheDocument()
    expect(screen.getByText('assistant')).toBeInTheDocument()
    expect(screen.queryByText('productivity')).not.toBeInTheDocument()
    expect(screen.queryByText('automation')).not.toBeInTheDocument()
  })

  it('formats downloads correctly for large numbers', () => {
    const agentWithManyDownloads = { ...mockAgent, downloads: 12500 }
    render(<AgentCard agent={agentWithManyDownloads} />)

    expect(screen.getByText('12.5k')).toBeInTheDocument()
  })

  it('shows raw number for downloads under 1000', () => {
    const agentWithFewDownloads = { ...mockAgent, downloads: 250 }
    render(<AgentCard agent={agentWithFewDownloads} />)

    expect(screen.getByText('250')).toBeInTheDocument()
  })

  it('creates correct link to agent detail page', () => {
    render(<AgentCard agent={mockAgent} />)

    const link = screen.getByRole('link')
    expect(link).toHaveAttribute('href', '/agents/1')
  })

  it('applies custom className', () => {
    const { container } = render(<AgentCard agent={mockAgent} className="custom-class" />)
    expect(container.firstChild).toHaveClass('custom-class')
  })

  it('displays rating component', () => {
    render(<AgentCard agent={mockAgent} />)

    // Assuming the Rating component renders something identifiable
    // This might need adjustment based on the actual Rating component implementation
    expect(screen.getByText('4.5')).toBeInTheDocument()
  })

  it('truncates long descriptions', () => {
    const agentWithLongDescription = {
      ...mockAgent,
      description: 'This is a very long description that should be truncated when displayed in the card component because it exceeds the expected length for proper display.'
    }
    render(<AgentCard agent={agentWithLongDescription} />)

    const description = screen.getByText(/This is a very long description/)
    expect(description).toHaveClass('line-clamp-3')
  })

  it('renders different variants correctly', () => {
    const { container: defaultContainer } = render(<AgentCard agent={mockAgent} variant="default" />)
    const { container: compactContainer } = render(<AgentCard agent={mockAgent} variant="compact" />)
    const { container: featuredContainer } = render(<AgentCard agent={mockAgent} variant="featured" />)

    // These tests would need to be adjusted based on actual variant implementations
    // For now, we're just ensuring the component renders without error
    expect(defaultContainer.firstChild).toBeInTheDocument()
    expect(compactContainer.firstChild).toBeInTheDocument()
    expect(featuredContainer.firstChild).toBeInTheDocument()
  })

  it('handles missing optional properties gracefully', () => {
    const minimalAgent: Agent = {
      id: '2',
      name: 'Minimal Agent',
      description: 'Minimal description',
      category: 'Test',
      price: 0,
      rating: 0,
      reviewCount: 0,
      downloads: 0,
      tags: [],
      author: {
        id: 'minimal-author',
        name: 'Minimal Author',
        verified: false,
      },
      createdAt: '2024-01-01T00:00:00.000Z',
      updatedAt: '2024-01-01T00:00:00.000Z',
    }

    render(<AgentCard agent={minimalAgent} />)

    expect(screen.getByText('Minimal Agent')).toBeInTheDocument()
    expect(screen.getByText('Minimal description')).toBeInTheDocument()
    expect(screen.getByText('Free')).toBeInTheDocument()
  })

  it('has proper accessibility attributes', () => {
    render(<AgentCard agent={mockAgent} />)

    const link = screen.getByRole('link')
    expect(link).toBeInTheDocument()

    // Card should be keyboard accessible through the link
    expect(link).toHaveAttribute('href', '/agents/1')
  })
})