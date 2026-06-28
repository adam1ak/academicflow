import { Component, ErrorInfo, ReactNode } from "react"

interface Props {
    children: ReactNode
}

interface State {
    hasError: boolean
}

class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false
    }

    public static getDerivedStateFromError(_: Error): State {
        return { hasError: true }
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error("Uncaught error caught by AcademicFlow ErrorBoundary:", error, errorInfo)
    }

    public render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen flex flex-col justify-center items-center bg-bg p-6 text-center select-none">
                    <div className="max-w-md p-8 bg-card-bg border border-card-border rounded-xl shadow-lg">
                        <div className="w-12 h-12 rounded-full bg-accent-red/10 flex items-center justify-center text-accent-red mx-auto mb-4 font-semibold text-lg">
                            !
                        </div>
                        <h1 className="text-lg font-semibold text-slate-100 mb-2 font-sf">
                            Something went wrong
                        </h1>
                        <p className="text-text-secondary text-xs mb-6 font-mono leading-relaxed">
                            The application encountered an unexpected runtime exception. Your data and plan progress remain safe.
                        </p>
                        <button
                            onClick={() => window.location.reload()}
                            className="w-full py-2.5 bg-btn-blue hover:bg-btn-blue-hover text-white text-sm font-semibold rounded-lg transition-colors cursor-pointer font-sans outline-none"
                        >
                            Reload Application
                        </button>
                    </div>
                </div>
            )
        }

        return this.props.children
    }
}
export default ErrorBoundary