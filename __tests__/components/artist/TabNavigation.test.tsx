import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { TabNavigation } from '@/components/artist/TabNavigation'

describe('TabNavigation', () => {
  const mockTabs = [
    {
      id: 'tab1',
      label: 'Tab 1',
      content: <div>Content 1</div>
    },
    {
      id: 'tab2',
      label: 'Tab 2',
      content: <div>Content 2</div>
    },
    {
      id: 'tab3',
      label: 'Tab 3',
      content: <div>Content 3</div>
    }
  ]

  it('renders all tabs', () => {
    render(<TabNavigation tabs={mockTabs} />)

    expect(screen.getByText('Tab 1')).toBeInTheDocument()
    expect(screen.getByText('Tab 2')).toBeInTheDocument()
    expect(screen.getByText('Tab 3')).toBeInTheDocument()
  })

  it('shows first tab content by default', () => {
    render(<TabNavigation tabs={mockTabs} />)

    expect(screen.getByText('Content 1')).toBeInTheDocument()
    expect(screen.queryByText('Content 2')).not.toBeInTheDocument()
    expect(screen.queryByText('Content 3')).not.toBeInTheDocument()
  })

  it('switches tabs when clicked', () => {
    render(<TabNavigation tabs={mockTabs} />)

    // Click on Tab 2
    fireEvent.click(screen.getByText('Tab 2'))

    expect(screen.queryByText('Content 1')).not.toBeInTheDocument()
    expect(screen.getByText('Content 2')).toBeInTheDocument()
    expect(screen.queryByText('Content 3')).not.toBeInTheDocument()

    // Click on Tab 3
    fireEvent.click(screen.getByText('Tab 3'))

    expect(screen.queryByText('Content 1')).not.toBeInTheDocument()
    expect(screen.queryByText('Content 2')).not.toBeInTheDocument()
    expect(screen.getByText('Content 3')).toBeInTheDocument()
  })

  it('respects defaultTab prop', () => {
    render(<TabNavigation tabs={mockTabs} defaultTab="tab2" />)

    expect(screen.queryByText('Content 1')).not.toBeInTheDocument()
    expect(screen.getByText('Content 2')).toBeInTheDocument()
    expect(screen.queryByText('Content 3')).not.toBeInTheDocument()
  })

  it('applies active styles to selected tab', () => {
    render(<TabNavigation tabs={mockTabs} />)

    const tab1Button = screen.getByText('Tab 1')
    const tab2Button = screen.getByText('Tab 2')

    // Tab 1 should be active by default
    expect(tab1Button).toHaveClass('border-blue-500', 'text-blue-600')
    expect(tab2Button).toHaveClass('border-transparent', 'text-gray-500')

    // Click Tab 2
    fireEvent.click(tab2Button)

    // Tab 2 should now be active
    expect(tab1Button).toHaveClass('border-transparent', 'text-gray-500')
    expect(tab2Button).toHaveClass('border-blue-500', 'text-blue-600')
  })

  it('handles empty tabs array', () => {
    render(<TabNavigation tabs={[]} />)

    // Should render without crashing
    expect(screen.getByRole('navigation')).toBeInTheDocument()
  })

  it('handles tabs with complex content', () => {
    const complexTabs = [
      {
        id: 'complex1',
        label: 'Complex Tab',
        content: (
          <div>
            <h1>Complex Content</h1>
            <button>Click me</button>
            <p>Some text</p>
          </div>
        )
      }
    ]

    render(<TabNavigation tabs={complexTabs} />)

    expect(screen.getByText('Complex Content')).toBeInTheDocument()
    expect(screen.getByText('Click me')).toBeInTheDocument()
    expect(screen.getByText('Some text')).toBeInTheDocument()
  })

  it('maintains tab state when content changes', () => {
    const { rerender } = render(<TabNavigation tabs={mockTabs} />)

    // Click Tab 2
    fireEvent.click(screen.getByText('Tab 2'))
    expect(screen.getByText('Content 2')).toBeInTheDocument()

    // Update tabs with new content
    const updatedTabs = mockTabs.map(tab => ({
      ...tab,
      content: <div>Updated {tab.label} Content</div>
    }))

    rerender(<TabNavigation tabs={updatedTabs} />)

    // Tab 2 should still be active with updated content
    expect(screen.getByText('Updated Tab 2 Content')).toBeInTheDocument()
    expect(screen.queryByText('Updated Tab 1 Content')).not.toBeInTheDocument()
  })
})