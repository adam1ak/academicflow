import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import StatisticCard from './StatisticCard'

describe('StatisticCard', () => {
    it('renders title, value and description correctly', () => {
        render (
            <StatisticCard
                title="Active Courses"
                value="6"
                description="All courses unlocked"
                statBar="bg-accent-blue"
                textColor="text-accent-blue"
            />
        )

        expect(screen.getByText('Active Courses')).toBeInTheDocument()
        expect(screen.getByText(6)).toBeInTheDocument()
        expect(screen.getByText('All courses unlocked')).toBeInTheDocument()
    })
})