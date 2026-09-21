import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect } from 'vitest'
import ToastContainer from '../ui/ToastContainer'
import { ErrorContextProvider, useError } from '../../context/ErrorContext'

function TestTrigger() {
    const { showSuccess, showError } = useError()
    return (
        <div>
            <button onClick={() => showSuccess("Course saved successfully")}>
                Trigger Success
            </button>
            <button onClick={() => showError("Failed to save course")}>
                Trigger Error
            </button>
        </div>
    )
}

describe("ToastContainer", () => {
    it("renders nothing when there are no active toasts", () => {
        render(
            <ErrorContextProvider>
                <ToastContainer />
            </ErrorContextProvider>
        )

        expect(screen.queryByRole('status')).not.toBeInTheDocument()
    })

    it("displays toast message with status role and dismisses upon clicking close button", async () => {
        const user = userEvent.setup()

        render(
            <ErrorContextProvider>
                <ToastContainer />
                <TestTrigger />
            </ErrorContextProvider>
        )
        
        await user.click(screen.getByText('Trigger Success'))

        expect(screen.getByText('Course saved successfully')).toBeInTheDocument()
        const toast = screen.getByRole('status')
        expect(toast).toHaveAttribute('aria-live', 'polite')

        const dismissButton = screen.getByRole('button', { name: /dismiss notification/i })
        await user.click(dismissButton)

        await waitFor(() => {
            expect(screen.queryByText('Course saved successfully')).not.toBeInTheDocument()
        })
    })
})