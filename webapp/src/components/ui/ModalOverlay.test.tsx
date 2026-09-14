import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expoect, vi } from 'vitest'
import ModalOverlay from './ModalOverlay'

describe('ModalOverlay', () => {
    it('renders children and sets accessible ARIA attributes', () => {
        const handleClose = vi.fn()

        render(
            <ModalOverlay onClose={handleClose} ariaLabel="Test Dialog">
                <p>Modal Content</p>
            </ModalOverlay>
        )

        expect(screen.getByText('Modal Content')).toBeInTheDocument()
        const dialog = screen.getByRole('dialog')
        expect(dialog).toHaveAttribute('aria-modal', 'true')
        expect(dialog).toHaveAttribute('aria-label', 'Test Dialog')
    })


    it('triggers onClose when Escape key is pressed', () => {
        const handleClose = vi.fn()

        render(
            <ModalOverlay onClose={handleClose}>
                <p>Modal Content</p>
            </ModalOverlay>
        )

        fireEvent.keyDown(window, { key: 'Escape' })
        expect(handleClose).toHaveBeenCalledTimes(1)
    })

    it('triggers onClose when backdrop is clicked, but not when container is clicked', () => {
        const handleClose = vi.fn()

        render(
            <ModalOverlay onClose={handleClose}>
                <p>Modal Content</p>
            </ModalOverlay>
        )

        fireEvent.click(screen.getByText('Modal Content'))
        expect(handleClose).not.toHaveBeenCalled()

        const backdrop = screen.getByRole('dialog')
        fireEvent.click(backdrop)
        expect(handleClose).toHaveBeenCalledTimes(1)
    })
})