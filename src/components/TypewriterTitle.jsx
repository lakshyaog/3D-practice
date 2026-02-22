/**
 * @author: @dorianbaffier
 * @description: Typewriter (adapted to JSX for Vite)
 * @version: 1.0.0
 * @license: MIT
 * @website: https://kokonutui.com
 * @github: https://github.com/kokonut-labs/kokonutui
 */

import { motion } from "motion/react";
import { useEffect, useRef, useState } from "react";

const DEFAULT_SEQUENCES = [
    { text: "Typewriter", deleteAfter: true },
    { text: "Multiple Words", deleteAfter: true },
    { text: "Auto Loop", deleteAfter: false },
];

export default function TypewriterTitle({
    sequences = DEFAULT_SEQUENCES,
    typingSpeed = 50,
    startDelay = 200,
    autoLoop = true,
    loopDelay = 1000,
    deleteSpeed = 30,
    pauseBeforeDelete = 1000,
    naturalVariance = true,
    className = "",
}) {
    const [displayText, setDisplayText] = useState("");
    const sequenceIndexRef = useRef(0);
    const charIndexRef = useRef(0);
    const isDeletingRef = useRef(false);
    const timeoutRef = useRef(null);

    const sequencesRef = useRef(sequences);
    useEffect(() => {
        sequencesRef.current = sequences;
    }, [sequences]);

    useEffect(() => {
        const getTypingDelay = () => {
            if (!naturalVariance) {
                return typingSpeed;
            }
            const random = Math.random();
            if (random < 0.1) return typingSpeed * 2;
            if (random > 0.9) return typingSpeed * 0.5;
            const variance = 0.4;
            const min = typingSpeed * (1 - variance);
            const max = typingSpeed * (1 + variance);
            return Math.random() * (max - min) + min;
        };

        const runTypewriter = () => {
            const currentSequence = sequencesRef.current[sequenceIndexRef.current];
            if (!currentSequence) return;

            if (isDeletingRef.current) {
                if (charIndexRef.current > 0) {
                    charIndexRef.current -= 1;
                    setDisplayText(currentSequence.text.slice(0, charIndexRef.current));
                    timeoutRef.current = setTimeout(runTypewriter, deleteSpeed);
                } else {
                    isDeletingRef.current = false;
                    const isLastSequence =
                        sequenceIndexRef.current === sequencesRef.current.length - 1;

                    if (isLastSequence && autoLoop) {
                        timeoutRef.current = setTimeout(() => {
                            sequenceIndexRef.current = 0;
                            runTypewriter();
                        }, loopDelay);
                    } else if (!isLastSequence) {
                        timeoutRef.current = setTimeout(() => {
                            sequenceIndexRef.current += 1;
                            runTypewriter();
                        }, 100);
                    }
                }
            } else if (charIndexRef.current < currentSequence.text.length) {
                charIndexRef.current += 1;
                setDisplayText(currentSequence.text.slice(0, charIndexRef.current));
                timeoutRef.current = setTimeout(runTypewriter, getTypingDelay());
            } else {
                const pauseDuration = currentSequence.pauseAfter ?? pauseBeforeDelete;

                if (currentSequence.deleteAfter) {
                    timeoutRef.current = setTimeout(() => {
                        isDeletingRef.current = true;
                        runTypewriter();
                    }, pauseDuration);
                } else {
                    const isLastSequence =
                        sequenceIndexRef.current === sequencesRef.current.length - 1;

                    if (isLastSequence && autoLoop) {
                        timeoutRef.current = setTimeout(() => {
                            sequenceIndexRef.current = 0;
                            charIndexRef.current = 0;
                            setDisplayText("");
                            runTypewriter();
                        }, loopDelay);
                    } else if (!isLastSequence) {
                        timeoutRef.current = setTimeout(() => {
                            sequenceIndexRef.current += 1;
                            charIndexRef.current = 0;
                            setDisplayText("");
                            runTypewriter();
                        }, pauseDuration);
                    }
                }
            }
        };

        timeoutRef.current = setTimeout(runTypewriter, startDelay);

        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current);
            }
        };
    }, [
        typingSpeed,
        deleteSpeed,
        pauseBeforeDelete,
        autoLoop,
        loopDelay,
        startDelay,
        naturalVariance,
    ]);

    return (
        <div className={`typewriter-container ${className}`}>
            <div className="typewriter-inner">
                <motion.div
                    animate={{ opacity: 1 }}
                    className="typewriter-text"
                    initial={{ opacity: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <span className="typewriter-display">
                        {displayText}
                    </span>
                    <motion.span
                        animate={{
                            opacity: [1, 1, 0, 0],
                        }}
                        className="typewriter-cursor"
                        transition={{
                            duration: 1,
                            repeat: Infinity,
                            repeatType: "loop",
                            ease: "linear",
                        }}
                    />
                </motion.div>
            </div>
        </div>
    );
}
