/**
 * TypewriterText — lightweight typewriter animation for inline text.
 * Respects the user's `prefers-reduced-motion` setting.
 */
import { useEffect, useRef, useState } from "react"

function useReducedMotion() {
    const [shouldReduceMotion, setShouldReduceMotion] = useState(false)
    useEffect(() => {
        const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)")
        setShouldReduceMotion(mediaQuery.matches)
        const handleChange = (e) => {
            setShouldReduceMotion(e.matches)
        }
        mediaQuery.addEventListener("change", handleChange)
        return () => mediaQuery.removeEventListener("change", handleChange)
    }, [])
    return shouldReduceMotion
}

const LOOP_RESTART_DELAY_MS = 1500

const TypewriterText = ({
    children,
    speed = 50,
    deletingSpeed = 30,
    loop = false,
    className = "",
}) => {
    const [displayed, setDisplayed] = useState("")
    const index = useRef(0)
    const timeout = useRef(null)
    const shouldReduceMotion = useReducedMotion()

    useEffect(() => {
        if (shouldReduceMotion) {
            setDisplayed(children)
            return
        }
        setDisplayed("")
        index.current = 0

        function type() {
            setDisplayed(children.slice(0, index.current + 1))
            if (index.current < children.length - 1) {
                index.current++
                timeout.current = setTimeout(type, speed)
            } else if (loop) {
                // Pause, then erase character by character before restarting
                timeout.current = setTimeout(() => {
                    function erase() {
                        if (index.current > 0) {
                            index.current--
                            setDisplayed(children.slice(0, index.current))
                            timeout.current = setTimeout(erase, deletingSpeed)
                        } else {
                            setDisplayed("")
                            type()
                        }
                    }
                    erase()
                }, LOOP_RESTART_DELAY_MS)
            }
        }
        type()

        return () => {
            if (timeout.current) {
                clearTimeout(timeout.current)
            }
        }
    }, [children, speed, deletingSpeed, loop, shouldReduceMotion])

    return <span className={className}>{displayed}</span>
}

export default TypewriterText
