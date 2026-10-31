import { useState, useRef, useEffect } from "react"
import { useAdvisor } from "../context/AdvisorContext"

function formatMarkdown(text: string) {
    return text.split("\n").map((line, lineIndex) => {
        const parts = line.split(/(\*\*.*?\*\*)/g)

        return (
            <p key={lineIndex} className="min-h-[1.2em]">
                {parts.map((part, partIndex) => {
                    if (part.startsWith("**") && part.endsWith("**")) {
                        return (
                            <strong key={partIndex} className="font-semibold text-pri">
                                {part.slice(2, -2)}
                            </strong>
                        )
                    }
                    return part
                })}
            </p>
        )
    })
}

export function AdvisorChat() {
    const { messages, sendMessage, isStreaming } = useAdvisor()
    const [input, setInput] = useState<string>("")
    const messagesEndRef = useRef<HTMLDivElement | null>(null)

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }, [messages])

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (!input.trim() || isStreaming) return
        sendMessage(input)
        setInput("")
    }

    return (
        <div className="flex flex-col h-full min-h-0">
            <div className="flex-1 py-4 text-xs font-mono text-sec overflow-y-auto space-y-3 pr-1">
                {messages.map((msg) => (
                    <div
                        key={msg.id}
                        className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
                    >
                        <div
                            className={
                                msg.sender === "user"
                                    ? "bg-surface border border-dim rounded-lg px-3.5 py-2 text-pri max-w-[85%] whitespace-pre-wrap"
                                    : msg.text.startsWith("Error:")
                                        ? "text-accent-red/90 border border-accent-red/20 bg-accent-red/5 rounded-lg px-3 py-2 max-w-[95%] text-[11px]"
                                        : "text-pri leading-relaxed max-w-[95%] whitespace-pre-wrap"
                            }
                        >
                            {msg.text ? (
                                formatMarkdown(msg.text)
                            ) : isStreaming ? (
                                <span className="inline-flex items-center gap-1 py-1">
                                    <span className="w-1 h-1 rounded-full bg-sec animate-bounce [animation-delay:-0.3s]" />
                                    <span className="w-1 h-1 rounded-full bg-sec animate-bounce [animation-delay:-0.15s]" />
                                    <span className="w-1 h-1 rounded-full bg-sec animate-bounce" />
                                </span>
                            ) : (
                                <span className="text-sec/60 italic text-[11px]">No response received</span>
                            )}
                        </div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSubmit} className="pt-2 border-t border-dim shrink-0">
                <div className="relative flex items-center bg-surface border border-dim rounded-lg focus-within:border-sec transition-colors">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        placeholder="Ask academic advisor..."
                        className="w-full bg-transparent px-3.5 py-2.5 pr-10 text-xs text-pri placeholder:text-sec/50 focus:outline-none"
                    />
                    <div className="absolute right-2.5 flex items-center justify-center w-7 h-7">
                        {input.trim() && (
                            <button
                                type="submit"
                                title="Send message"
                                aria-label="Send message"
                                className="w-7 h-7 flex items-center justify-center text-sec/70 hover:text-pri cursor-pointer transition-colors"
                            >
                                <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                                </svg>
                            </button>
                        )}
                    </div>
                </div>
            </form>
        </div>
    )
}
