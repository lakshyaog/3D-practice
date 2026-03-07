import './App.css'
import BmwModel from './components/BmwModel'
import TypewriterTitle from './components/TypewriterTitle'
import TypewriterText from './components/TypewriterText'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Environment, ContactShadows, MeshReflectorMaterial } from '@react-three/drei'
import { Suspense, useRef, useEffect, useState } from 'react'
import { motion } from 'motion/react'
import * as THREE from 'three'
import { RectAreaLightUniformsLib } from 'three/examples/jsm/lights/RectAreaLightUniformsLib'

// Required for rectAreaLight to work in Three.js
RectAreaLightUniformsLib.init()

// ===== WELCOME SCREEN LINES =====
const WELCOME_LINES = [
  'Welcome to the future of driving',
  'Where precision meets passion',
  'Engineered for those who lead',
  'Designed for those who dare',
  "Performance you don't just drive",
  'You feel it',
  'Every curve',
  'Every acceleration',
  'Every moment',
  'Crafted with German excellence',
  'Powered by innovation',
  'Driven by intelligence',
  'Luxury without compromise',
  'Speed with purpose',
  'Control in every detail',
  'Where technology becomes emotion',
  'Where roads become experiences',
  'Built for the bold',
  'Made for the visionary',
  'A legacy of performance',
  'A promise of perfection',
  'This is not just a car',
  "It's a statement",
  "It's confidence",
  "It's control",
  "It's evolution",
  "It's ambition in motion",
  "It's the ultimate driving machine",
  'Welcome to BMW',
]

// ===== CAMERA KEYFRAMES =====
// Full exterior orbit — camera stays outside the car at all times
const CAMERA_KEYFRAMES = [
  // --- Wide establishing shots ---
  { pos: [12, 4, 10], target: [0, 0, 0] },       // 0%  - front-right wide establishing
  { pos: [0, 3.5, 14], target: [0, 0, 0] },      // 20% - pure right side
  { pos: [-12, 3.5, 6], target: [0, 0, 0] },     // 40% - front-left angle
  { pos: [-8, 3, -10], target: [0, 0, 0] },      // 60% - rear-left quarter

  // --- Closer exterior angles (no interior) ---
  { pos: [6, 2, -8], target: [0, 0.3, 0] },      // 80% - rear-right low angle
  { pos: [10, 3, 4], target: [0, 0.2, 0] },      // 100% - front-right dramatic close
]

// ===== SCROLL-DRIVEN CAMERA CONTROLLER =====
function ScrollCamera({ scrollRef }) {
  const { camera } = useThree()
  const targetPos = useRef(new THREE.Vector3(...CAMERA_KEYFRAMES[0].pos))
  const targetLookAt = useRef(new THREE.Vector3(...CAMERA_KEYFRAMES[0].target))
  const time = useRef(0)

  useFrame((_, delta) => {
    time.current += delta
    const progress = scrollRef.current

    // Determine which keyframe segment we're in
    const segmentCount = CAMERA_KEYFRAMES.length - 1
    const rawSegment = progress * segmentCount
    const segment = Math.min(Math.floor(rawSegment), segmentCount - 1)
    const segmentProgress = rawSegment - segment

    // Smooth easing for segment progress
    const eased = segmentProgress * segmentProgress * (3 - 2 * segmentProgress) // smoothstep

    const from = CAMERA_KEYFRAMES[segment]
    const to = CAMERA_KEYFRAMES[Math.min(segment + 1, segmentCount)]

    // Lerp position between keyframes
    const newX = THREE.MathUtils.lerp(from.pos[0], to.pos[0], eased)
    const newY = THREE.MathUtils.lerp(from.pos[1], to.pos[1], eased)
    const newZ = THREE.MathUtils.lerp(from.pos[2], to.pos[2], eased)

    // Subtle orbital drift (decreases as we zoom in)
    const driftAmount = 0.15 * (1 - progress * 0.9)
    const driftX = Math.sin(time.current * 0.25) * driftAmount
    const driftZ = Math.cos(time.current * 0.25) * driftAmount

    targetPos.current.set(newX + driftX, newY, newZ + driftZ)

    // Lerp lookAt target
    targetLookAt.current.set(
      THREE.MathUtils.lerp(from.target[0], to.target[0], eased),
      THREE.MathUtils.lerp(from.target[1], to.target[1], eased),
      THREE.MathUtils.lerp(from.target[2], to.target[2], eased)
    )

    // Smooth camera movement (damped follow)
    camera.position.lerp(targetPos.current, 0.06)
    camera.lookAt(targetLookAt.current)
  })

  return null
}

// ===== SHOWROOM ENVIRONMENT =====
function Showroom() {
  return (
    <group>
      {/* ── Polished Reflective Floor ── */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.51, 0]} receiveShadow>
        <planeGeometry args={[80, 80]} />
        <MeshReflectorMaterial
          blur={[300, 80]}
          resolution={512}
          mixBlur={0.9}
          mixStrength={60}
          roughness={0.85}
          depthScale={1.0}
          minDepthThreshold={0.4}
          maxDepthThreshold={1.4}
          color="#0d0d14"
          metalness={0.9}
        />
      </mesh>

      {/* ── Back Wall ── */}
      <mesh position={[0, 9, -22]} receiveShadow>
        <planeGeometry args={[80, 24]} />
        <meshStandardMaterial color="#0b0b14" roughness={0.95} metalness={0.05} />
      </mesh>

      {/* ── Left Wall ── */}
      <mesh rotation={[0, Math.PI / 2, 0]} position={[-22, 9, 0]} receiveShadow>
        <planeGeometry args={[80, 24]} />
        <meshStandardMaterial color="#090910" roughness={0.95} metalness={0.05} />
      </mesh>

      {/* ── Right Wall ── */}
      <mesh rotation={[0, -Math.PI / 2, 0]} position={[22, 9, 0]} receiveShadow>
        <planeGeometry args={[80, 24]} />
        <meshStandardMaterial color="#090910" roughness={0.95} metalness={0.05} />
      </mesh>

      {/* ── Ceiling ── */}
      <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 13, 0]}>
        <planeGeometry args={[80, 80]} />
        <meshStandardMaterial color="#07070e" roughness={1} />
      </mesh>

      {/* ── LED Strip Lights (emissive bars) ── */}
      {[-4, -1.3, 1.3, 4].map((x, i) => (
        <mesh key={i} position={[x, 12.85, 0]}>
          <boxGeometry args={[0.18, 0.06, 28]} />
          <meshStandardMaterial
            color="#ffffff"
            emissive="#5599ff"
            emissiveIntensity={3.5}
            toneMapped={false}
          />
        </mesh>
      ))}

      {/* ── Overhead rect-area lights aimed at car ── */}
      <rectAreaLight
        width={8} height={1}
        intensity={12}
        color="#aabbff"
        position={[0, 12, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
      />
      <rectAreaLight
        width={4} height={1}
        intensity={8}
        color="#ffffff"
        position={[0, 11, 5]}
        rotation={[-Math.PI / 2.5, 0, 0]}
      />
    </group>
  )
}

// ===== WELCOME TYPEWRITER (cycles through lines) =====
function WelcomeTypewriter({ lines }) {
  const [lineIndex, setLineIndex] = useState(0)
  const [fade, setFade] = useState(true)

  useEffect(() => {
    const lineLength = lines[lineIndex].length
    const typingTime = lineLength * 40 // 40ms per character
    const displayTime = typingTime + 1200 // typing + 1.2s pause

    const timer = setTimeout(() => {
      setFade(false) // fade out
      setTimeout(() => {
        setLineIndex((prev) => (prev + 1) % lines.length)
        setFade(true) // fade in next
      }, 500) // 500ms fade transition
    }, displayTime)

    return () => clearTimeout(timer)
  }, [lineIndex, lines])

  return (
    <div className={`welcome-line ${fade ? 'visible' : ''}`}>
      <TypewriterText key={lineIndex} speed={40}>
        {lines[lineIndex]}
      </TypewriterText>
    </div>
  )
}

// ===== TYPEWRITER SEQUENCES =====
const BMW_SEQUENCES = [
  { text: 'The New BMW M4 Competition', deleteAfter: true, pauseAfter: 2500 },
  { text: '530 HP · S58 Engine', deleteAfter: true, pauseAfter: 2000 },
  { text: 'Born on the Racetrack', deleteAfter: false, pauseAfter: 3000 },
]

// ===== MAIN APP =====
function App() {
  const [modelLoaded, setModelLoaded] = useState(false)
  const scrollRef = useRef(0)
  const containerRef = useRef(null)
  const audioRef = useRef(null)
  const audioStarted = useRef(false)
  const audioUnlocked = useRef(false)
  const scrollTimeout = useRef(null)


  // Initialize audio + unlock on first user click
  useEffect(() => {
    const audio = new Audio('/car-start.wav')
    audio.volume = 0.6
    audio.preload = 'auto'
    audio.currentTime = 7
    audioRef.current = audio

    // Stop at 14s
    const handleTimeUpdate = () => {
      if (audio.currentTime >= 14) {
        audio.pause()
        audio.currentTime = 7
        audioStarted.current = false
      }
    }
    audio.addEventListener('timeupdate', handleTimeUpdate)

    // Unlock audio on first click (required by browser autoplay policy)
    const unlockAudio = () => {
      audio.play().then(() => {
        audio.pause()
        audio.currentTime = 7
        audioUnlocked.current = true

      }).catch(() => { })
      document.removeEventListener('click', unlockAudio)
    }
    document.addEventListener('click', unlockAudio)

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate)
      document.removeEventListener('click', unlockAudio)
      audio.pause()
    }
  }, [])

  // ===== SMOOTH SCROLL + AUDIO CONTROL =====
  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    let targetScroll = 0
    let currentScroll = 0
    let rafId = null
    const EASE = 0.09 // 0.05 = silky butter | 0.09 = responsive | 0.15 = snappy

    // Cache layout dimensions — only recalculate on resize (avoids forced layout every RAF)
    let maxScroll = Math.max(0, container.scrollHeight - container.clientHeight)
    const resizeObserver = new ResizeObserver(() => {
      maxScroll = Math.max(0, container.scrollHeight - container.clientHeight)
      targetScroll = Math.min(targetScroll, maxScroll)
    })
    resizeObserver.observe(container)

    const stopAudio = () => {
      const audio = audioRef.current
      if (!audio) return
      audio.pause()
      audio.currentTime = 7
      audioStarted.current = false
      if (scrollTimeout.current) clearTimeout(scrollTimeout.current)
    }

    const updateAudio = (progress, isAtBottom) => {
      const audio = audioRef.current
      if (!audio || !audioUnlocked.current) return

      if (progress <= 0.01 || isAtBottom) {
        stopAudio()
        return
      }

      if (!audioStarted.current) {
        audio.currentTime = 7
        audio.play().catch(() => { })
        audioStarted.current = true
      }
      if (audio.paused && audioStarted.current) {
        audio.play().catch(() => { })
      }
      if (scrollTimeout.current) clearTimeout(scrollTimeout.current)
      scrollTimeout.current = setTimeout(() => {
        if (audio && !audio.paused) audio.pause()
      }, 500)
    }

    const tick = () => {
      const diff = targetScroll - currentScroll
      if (Math.abs(diff) < 0.5) {
        currentScroll = targetScroll
        container.scrollTop = currentScroll
      } else {
        currentScroll += diff * EASE
        container.scrollTop = currentScroll
      }

      const progress = maxScroll > 0 ? Math.max(0, Math.min(1, currentScroll / maxScroll)) : 0
      const isAtBottom = maxScroll > 0 && targetScroll >= maxScroll - 1
      scrollRef.current = progress
      updateAudio(progress, isAtBottom)

      rafId = requestAnimationFrame(tick)
    }

    const handleWheel = (e) => {
      e.preventDefault()
      targetScroll = Math.max(0, Math.min(maxScroll, targetScroll + e.deltaY))
    }

    container.addEventListener('wheel', handleWheel, { passive: false })
    rafId = requestAnimationFrame(tick)

    return () => {
      container.removeEventListener('wheel', handleWheel)
      cancelAnimationFrame(rafId)
      resizeObserver.disconnect()
    }
  }, [])

  return (
    <div className="app-root">
      {/* ===== FIXED 3D CANVAS ===== */}
      <div className="canvas-fixed">
        <Canvas
          camera={{ position: [12, 4, 10], fov: 45 }}
          dpr={[1, 1.5]}
          onCreated={() => {
            setTimeout(() => setModelLoaded(true), 20000)
          }}
        >
          <Suspense fallback={null}>
            {/* Showroom ambient — low so spotlights pop */}
            <ambientLight intensity={0.15} />

            {/* Key spotlight — no castShadow; ContactShadows handles floor shadow */}
            <spotLight
              position={[8, 12, 8]}
              angle={0.28}
              penumbra={0.6}
              intensity={4}
              color="#ffffff"
            />
            {/* Fill spotlight — no shadow (visual only) */}
            <spotLight
              position={[-8, 11, 4]}
              angle={0.3}
              penumbra={0.8}
              intensity={2.5}
              color="#cce0ff"
            />
            {/* Rear rim light — no shadow */}
            <spotLight
              position={[0, 10, -10]}
              angle={0.35}
              penumbra={1}
              intensity={2}
              color="#8ab4ff"
            />
            {/* Top-down showroom beam — no shadow */}
            <spotLight
              position={[0, 14, 0]}
              angle={0.22}
              penumbra={0.5}
              intensity={5}
              color="#ffffff"
            />

            {/* Studio HDRI for reflections (no background) */}
            <Environment preset="studio" />

            {/* Showroom room geometry */}
            <Showroom />

            {/* The Car */}
            <BmwModel scale={1} position={[0, -0.5, 0]} />

            {/* Baked shadow beneath the car — frames=1 renders once, not every frame */}
            <ContactShadows
              position={[0, -0.49, 0]}
              opacity={0.8}
              scale={14}
              blur={3}
              far={5}
              frames={1}
              color="#000010"
            />
            <ScrollCamera scrollRef={scrollRef} />
          </Suspense>
        </Canvas>
      </div>

      {/* ===== SCROLLABLE CONTENT ===== */}
      <div className="scroll-container" ref={containerRef}>

        {/* ---- SECTION 1: HERO ---- */}
        <section className="scroll-section section-hero">
          <motion.div
            className="section-content section-left"
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: modelLoaded ? 1 : 0, y: modelLoaded ? 0 : 60 }}
            transition={{ duration: 1.2, ease: 'easeOut', delay: 0.5 }}
          >
            <div className="badge">
              <span className="badge-dot"></span>
              M PERFORMANCE
            </div>

            <TypewriterTitle
              sequences={BMW_SEQUENCES}
              typingSpeed={55}
              startDelay={1000}
              autoLoop={true}
              loopDelay={2000}
              deleteSpeed={30}
              pauseBeforeDelete={2500}
              naturalVariance={true}
              className="hero-typewriter"
            />

            <p className="hero-description">
              The New M4 Competition M xDrive combines aesthetics and the sportiness
              you expect from BMW M.
            </p>

            <div className="scroll-hint">
              <span className="scroll-hint-text">Scroll to explore</span>
              <div className="scroll-hint-line">
                <div className="scroll-hint-dot"></div>
              </div>
            </div>
          </motion.div>
        </section>

        {/* ---- SECTION 2: SIDE PROFILE (Exterior) ---- */}
        <section className="scroll-section section-engine">
          <motion.div
            className="section-content section-right"
            initial={{ opacity: 0, x: 80 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.9, ease: 'easeOut' }}
            viewport={{ once: false, amount: 0.4 }}
          >
            <span className="section-tag">EXTERIOR · SIDE PROFILE</span>
            <h2 className="section-title">Sculpted for Speed</h2>
            <p className="section-text">
              The muscular side profile reveals the M4's widebody stance —
              flared fenders house massive 19" forged wheels, while the carbon-fiber
              roof line drops aggressively toward the rear. Every crease is
              aerodynamically optimized for <span className="highlight">maximum downforce</span>.
            </p>
            <div className="spec-grid">
              <div className="spec-item">
                <span className="spec-value">19"</span>
                <span className="spec-unit">Forged Wheels</span>
              </div>
              <div className="spec-item">
                <span className="spec-value">CFRP</span>
                <span className="spec-unit">Carbon Roof</span>
              </div>
            </div>
          </motion.div>
        </section>

        {/* ---- SECTION 3: REAR VIEW (Exterior) ---- */}
        <section className="scroll-section section-design">
          <motion.div
            className="section-content section-left"
            initial={{ opacity: 0, x: -80 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.9, ease: 'easeOut' }}
            viewport={{ once: false, amount: 0.4 }}
          >
            <span className="section-tag">EXTERIOR · REAR</span>
            <h2 className="section-title">Aerodynamic Precision</h2>
            <p className="section-text">
              The rear diffuser and quad exhaust tips are pure M DNA. A subtle
              lip spoiler and aggressive bumper design channel airflow for
              stability at <span className="highlight">290 km/h</span>. The iconic
              L-shaped taillights complete the unmistakable M4 signature.
            </p>
            <div className="spec-grid">
              <div className="spec-item">
                <span className="spec-value">0.36</span>
                <span className="spec-unit">Cd Drag</span>
              </div>
              <div className="spec-item">
                <span className="spec-value">290</span>
                <span className="spec-unit">km/h Top Speed</span>
              </div>
            </div>
          </motion.div>
        </section>

        {/* ---- SECTION 4: REAR-RIGHT LOW ANGLE ---- */}
        <section className="scroll-section section-performance">
          <motion.div
            className="section-content section-right"
            initial={{ opacity: 0, x: 80 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.9, ease: 'easeOut' }}
            viewport={{ once: false, amount: 0.4 }}
          >
            <span className="section-tag">POWERTRAIN · HEART</span>
            <h2 className="section-title">The Iconic S58</h2>
            <p className="section-text">
              Step closer. The iconic S58 inline-6 engine pushes out a mighty
              <span className="highlight"> 390 kW (530 hp)</span>. The M xDrive
              all-wheel-drive distributes power for maximum traction — 0-100 km/h
              in just <span className="highlight">3.4 seconds</span>.
            </p>
            <div className="spec-grid spec-grid-3">
              <div className="spec-item">
                <span className="spec-value">530</span>
                <span className="spec-unit">HP</span>
              </div>
              <div className="spec-item">
                <span className="spec-value">650</span>
                <span className="spec-unit">Nm Torque</span>
              </div>
              <div className="spec-item">
                <span className="spec-value">3.4s</span>
                <span className="spec-unit">0-100 km/h</span>
              </div>
            </div>
          </motion.div>
        </section>

        {/* ---- SECTION 5: FRONT DRAMATIC CLOSE ---- */}
        <section className="scroll-section section-cta">
          <motion.div
            className="section-content section-center"
            initial={{ opacity: 0, y: 60, scale: 0.95 }}
            whileInView={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 1, ease: 'easeOut' }}
            viewport={{ once: false, amount: 0.4 }}
          >
            <span className="section-tag">EXPERIENCE · DRIVE</span>
            <h2 className="section-title cta-title">Own the Road</h2>
            <p className="section-text cta-text">
              You're inside. M Sport bucket seats, a 14.9" curved display,
              M carbon-fiber trim, and the iconic M steering wheel with
              shift paddles. Every detail is built for the driver. Configure yours now.
            </p>
            <div className="cta-buttons">
              <button className="btn-primary" id="discover-btn">
                Configure Yours
                <span className="btn-arrow">→</span>
              </button>
              <button className="btn-secondary" id="configure-btn">
                Explore Interior
              </button>
            </div>
          </motion.div>
        </section>
      </div>

      {/* ===== FIXED NAVBAR ===== */}
      <motion.header
        className="fixed-nav"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: modelLoaded ? 1 : 0, y: modelLoaded ? 0 : -20 }}
        transition={{ duration: 0.8, delay: 0.3 }}
      >
        <div className="logo">
          <img src="/bmw.jpeg" alt="BMW Logo" className="bmw-logo" />
        </div>
        <nav className="nav-links">
          <a href="#" className="nav-link active">Overview</a>
        </nav>
      </motion.header>


      {/* ===== LOADING / WELCOME SCREEN ===== */}
      {!modelLoaded && (
        <div className="loading-screen">
          <img
            src="/bmw-m4-splash.jpg"
            alt="BMW M4 Competition"
            className="loading-image"
          />
          <div className="welcome-overlay">
            {/* Skip Intro button — top right */}
            <button
              id="skip-intro-btn"
              className="skip-intro-btn"
              onClick={() => setModelLoaded(true)}
            >
              Skip Intro
              <svg className="skip-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6" />
                <polyline points="15 18 21 12 15 6" />
              </svg>
            </button>

            <div className="welcome-text-wrapper">
              <WelcomeTypewriter lines={WELCOME_LINES} />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
