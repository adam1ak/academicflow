import { RefObject, useCallback, useEffect, useState } from "react"

interface UseFullscreenReturn {
    isFullscreen: boolean;
    toggle: () => Promise<void>;
}

export function useFullscreen<T extends HTMLElement>(ref: RefObject<T | null>) : UseFullscreenReturn {

    const [isFullscreen, setIsFullscreen] = useState<boolean>(false)

    useEffect(() => {
        const handleFullscreenChange = () => {
            setIsFullscreen(document.fullscreenElement === ref.current)
        }
        document.addEventListener("fullscreenchange", handleFullscreenChange)

        return () => {
            document.removeEventListener("fullscreenchange", handleFullscreenChange)
        }

    }, [ref])

    const toggle = useCallback(async () => {
        if (!ref.current) return

        try {
            if(document.fullscreenElement === ref.current){
                await document.exitFullscreen()
            } else {
                await ref.current.requestFullscreen()
            }
        } catch (error) {
            console.error("Failed to toggle fullscreen: ", error)
        }
    }, [ref])

    return {
        isFullscreen,
        toggle
    }
}