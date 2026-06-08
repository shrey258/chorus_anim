import './App.css'
import { useEffect, useRef } from 'react'
import { animate } from 'framer-motion'

// Shared path data — reused verbatim by the base stroke, the glowing comet
// head, and the end-pulse layer (the geometry is never modified).
const CHORUS_D =
  'M28.04 36.81 C32.6 74.15 110.25 62.96 135.08 52.16 C146.25 47.31 162.81 33.84 159.72 19.86 C154.51 -3.78 114.23 2.68 97.67 7.07 C53.62 18.74 -18.84 71.07 8.12 124.5 C36.84 181.44 105.63 141 134.28 109.49 C140.92 102.19 140.41 84.02 148.84 78.37 C160.5 70.57 213.39 32.06 204.47 14.38 C198.68 2.9 176.38 25.84 172.21 31.33 C149.69 60.88 141.38 96.1 129.8 129.9 C131.86 124.81 132.77 116.35 135.77 111.57 C141.13 103.03 185.09 61.34 196.34 67.79 C204.45 72.45 146.94 134.23 177.31 134.79 C201.54 135.25 219.11 87.04 230.49 74.17 C237.97 65.71 258.27 63.01 265.01 73.36 C278.2 93.63 245.08 142.27 222.59 137.87 C203.34 134.09 221.11 86.9 230.11 81.36 C237.41 88.6 212.57 101.12 218.21 109.69 C253.1 162.68 291.4 93.33 308.23 69.55 C308.57 69.1 307.15 71.26 305.93 74.08 C304.35 77.76 304.09 82.51 306.77 85.82 C311.44 91.6 324.07 89.29 328.87 85.5 C324.15 89.29 291.85 130.92 307.98 136.36 C326.41 142.58 356.08 87.74 363.04 75.83 C358.31 83.75 331.09 127.08 342.41 132.84 C347.56 135.47 358.14 126.68 361.51 123.34 C376.72 108.27 391.12 95.27 403.23 77.56 C399.66 82.78 366.5 132.67 381.82 137.44 C389.83 139.93 394.76 130.2 400.14 126.6 C417.5 115.01 432.82 79.91 444.11 61.74 C444.49 60.81 440.38 67.2 439.93 67.86 C437.2 71.94 433.99 75.01 435.39 80.31 C439.54 96.03 445.75 109.18 449.45 125.12 C439.73 127.68 435.21 135.45 423.77 136 C418.63 136.25 404.28 133.61 406.31 126.39 C410.09 112.98 433.24 126.02 441.81 126.28 C460.99 126.88 469.82 115.29 479.31 100.43'

const DRAW_MS = 4500 // total writing time
const HOLD_MS = 1000 // pause before the settling glow pulse
const HEAD = 40 // arc-length of the brighter comet section behind the tip

function App() {
  const baseRef = useRef(null) // settled stroke, revealed as the pen passes
  const headRef = useRef(null) // glowing comet section trailing the writing tip
  const tipRef = useRef(null) // luminous writing tip (the moving light source)
  const pulseRef = useRef(null) // duplicate stroke for the final glow breath

  useEffect(() => {
    const base = baseRef.current
    const head = headRef.current
    const tip = tipRef.current
    const pulse = pulseRef.current
    if (!base) return

    const L = base.getTotalLength()

    // start hidden
    base.style.strokeDasharray = `${L} ${L}`
    base.style.strokeDashoffset = `${L}`
    head.style.strokeDasharray = `${HEAD} ${L + HEAD}`
    head.style.strokeDashoffset = `${HEAD}`
    head.style.opacity = '0'
    tip.style.opacity = '0'
    pulse.style.opacity = '0'

    // reduced motion: present the finished word, skip the writing
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      base.style.strokeDashoffset = '0'
      return
    }

    // ---- sample the path + analyse curvature ------------------------------
    const N = 1000
    const px = new Float64Array(N + 1)
    const py = new Float64Array(N + 1)
    const arc = new Float64Array(N + 1)
    for (let i = 0; i <= N; i++) {
      const s = (i / N) * L
      const p = base.getPointAtLength(s)
      px[i] = p.x
      py[i] = p.y
      arc[i] = s
    }
    // turning rate (rad/px) over a window — broad for curves/loops, tight for cusps
    const curvature = (W) => {
      const k = new Float64Array(N + 1)
      for (let i = 0; i <= N; i++) {
        const a = Math.max(0, i - W)
        const c = Math.min(N, i + W)
        const v1x = px[i] - px[a]
        const v1y = py[i] - py[a]
        const v2x = px[c] - px[i]
        const v2y = py[c] - py[i]
        const n1 = Math.hypot(v1x, v1y) || 1e-6
        const n2 = Math.hypot(v2x, v2y) || 1e-6
        let dot = (v1x * v2x + v1y * v2y) / (n1 * n2)
        dot = Math.max(-1, Math.min(1, dot))
        k[i] = Math.acos(dot) / Math.max((n1 + n2) / 2, 1e-3)
      }
      return k
    }
    const kBroad = curvature(6) // sweeping curves vs tight loops
    const kSharp = curvature(2) // abrupt direction changes / cusps

    // ---- speed profile -----------------------------------------------------
    // fast on gentle sweeps, slower through loops, with a brief extra dip at
    // sharp direction changes. Tuned so sweeps run ~19% above the mean pace.
    const raw = new Float64Array(N + 1)
    for (let i = 0; i <= N; i++) {
      let v = 1 / (1 + 60 * Math.pow(kBroad[i], 1.2))
      if (kSharp[i] > 0.04) {
        v *= 1 - 0.5 * Math.min(1, (kSharp[i] - 0.04) / 0.04)
      }
      raw[i] = Math.max(0.35, Math.min(1, v))
    }
    // Gaussian-smooth the profile so speed changes glide — no jumps, no stop-start
    const SIGMA = 9
    const RAD = SIGMA * 3
    const speed = new Float64Array(N + 1)
    for (let i = 0; i <= N; i++) {
      let num = 0
      let den = 0
      for (let j = -RAD; j <= RAD; j++) {
        const m = i + j
        if (m < 0 || m > N) continue
        const w = Math.exp(-(j * j) / (2 * SIGMA * SIGMA))
        num += w * raw[m]
        den += w
      }
      speed[i] = num / den
    }

    // ---- timing map: cumulative time = ∫ ds / speed, normalised -----------
    const cum = new Float64Array(N + 1)
    for (let i = 1; i <= N; i++) {
      cum[i] = cum[i - 1] + (arc[i] - arc[i - 1]) / ((speed[i] + speed[i - 1]) / 2)
    }
    const totalCost = cum[N]
    for (let i = 0; i <= N; i++) cum[i] /= totalCost

    // invert: normalised time fraction -> arc length
    const lengthAt = (u) => {
      if (u <= 0) return 0
      if (u >= 1) return L
      let lo = 0
      let hi = N
      while (lo < hi) {
        const m = (lo + hi) >> 1
        if (cum[m] < u) lo = m + 1
        else hi = m
      }
      const i = lo === 0 ? 1 : lo
      const f = (u - cum[i - 1]) / Math.max(cum[i] - cum[i - 1], 1e-9)
      return arc[i - 1] + (arc[i] - arc[i - 1]) * f
    }

    // gentle global envelope so the pen eases off from rest and settles
    const ease = (t) => (1 - Math.cos(Math.PI * t)) / 2

    let raf = 0
    let startT = 0
    let pulseTimer = 0
    let finished = false

    const tick = (now) => {
      if (!startT) startT = now
      const t = (now - startT) / DRAW_MS
      const len = lengthAt(ease(Math.min(t, 1)))

      // stroke reveal and the writing tip share the SAME length → always in sync
      base.style.strokeDashoffset = `${L - len}`
      head.style.strokeDashoffset = `${HEAD - len}`
      const p = base.getPointAtLength(Math.min(len, L))
      tip.setAttribute('transform', `translate(${p.x.toFixed(2)} ${p.y.toFixed(2)})`)

      const appear = Math.min(1, (now - startT) / 160)
      head.style.opacity = `${0.9 * appear}`
      tip.style.opacity = `${appear}`

      if (t < 1) {
        raf = requestAnimationFrame(tick)
      } else if (!finished) {
        finished = true
        base.style.strokeDashoffset = '0'
        // the writing light settles into the finished word (softer base glow)
        animate(head, { opacity: 0 }, { duration: 0.6, ease: 'easeOut' })
        animate(tip, { opacity: 0 }, { duration: 0.5, ease: 'easeOut' })
        // hold ~1s, then one subtle glow breath; the word stays lit
        pulseTimer = setTimeout(() => {
          animate(pulse, { opacity: [0, 0.55, 0] }, { duration: 1.5, ease: 'easeInOut' })
        }, HOLD_MS)
      }
    }
    raf = requestAnimationFrame(tick)

    return () => {
      cancelAnimationFrame(raf)
      clearTimeout(pulseTimer)
    }
  }, [])

  return (
    <div>
      <div className="glass-outer">
        <div className="glass-inner">
          <svg
            className="chorus-etch"
            width="483"
            height="156"
            viewBox="0 0 483 156"
            fill="none"
            role="img"
            aria-label="Chorus"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              {/* EXISTING soft bloom for the settled stroke — unchanged */}
              <filter
                id="chorus-glow"
                x="-40%"
                y="-140%"
                width="180%"
                height="380%"
                colorInterpolationFilters="sRGB"
              >
                <feColorMatrix
                  in="SourceAlpha"
                  type="matrix"
                  values="0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 1 0"
                  result="white"
                />

                <feGaussianBlur in="white" stdDeviation="1.2" result="b1" />
                <feGaussianBlur in="white" stdDeviation="3" result="b2" />
                <feGaussianBlur in="white" stdDeviation="7" result="b3" />
                <feGaussianBlur in="white" stdDeviation="14" result="b4" />
                <feGaussianBlur in="white" stdDeviation="24" result="b5" />

                <feComponentTransfer in="b1" result="g1">
                  <feFuncA type="linear" slope="0.9" />
                </feComponentTransfer>
                <feComponentTransfer in="b2" result="g2">
                  <feFuncA type="linear" slope="0.5" />
                </feComponentTransfer>
                <feComponentTransfer in="b3" result="g3">
                  <feFuncA type="linear" slope="0.3" />
                </feComponentTransfer>
                <feComponentTransfer in="b4" result="g4">
                  <feFuncA type="linear" slope="0.18" />
                </feComponentTransfer>
                <feComponentTransfer in="b5" result="g5">
                  <feFuncA type="linear" slope="0.09" />
                </feComponentTransfer>

                <feMerge>
                  <feMergeNode in="g5" />
                  <feMergeNode in="g4" />
                  <feMergeNode in="g3" />
                  <feMergeNode in="g2" />
                  <feMergeNode in="g1" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>

              {/* Writing tip glow — tighter, brighter and more intense than the
                  settled stroke: dominant tight blur + a stronger bloom, with the
                  core doubled so it reads as a hot light source. */}
              <filter
                id="chorus-tip-glow"
                x="-600%"
                y="-600%"
                width="1300%"
                height="1300%"
                colorInterpolationFilters="sRGB"
              >
                <feGaussianBlur in="SourceGraphic" stdDeviation="1.6" result="t1" />
                <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="t2" />
                <feGaussianBlur in="SourceGraphic" stdDeviation="9" result="t3" />
                <feMerge>
                  <feMergeNode in="t3" />
                  <feMergeNode in="t2" />
                  <feMergeNode in="t2" />
                  <feMergeNode in="t1" />
                  <feMergeNode in="t1" />
                  <feMergeNode in="SourceGraphic" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
            </defs>

            {/* settled stroke — revealed as the pen passes. Starts hidden (dash
                guard) so there's no full-word flash before the effect runs. */}
            <path
              ref={baseRef}
              d={CHORUS_D}
              stroke="#ffffff"
              filter="url(#chorus-glow)"
              style={{ strokeDasharray: 9999, strokeDashoffset: 9999 }}
            />

            {/* duplicate stroke used only for the final glow pulse */}
            <path
              ref={pulseRef}
              d={CHORUS_D}
              stroke="#ffffff"
              filter="url(#chorus-glow)"
              style={{ opacity: 0 }}
            />

            {/* brighter comet section trailing the tip — the freshly written light */}
            <path
              ref={headRef}
              d={CHORUS_D}
              stroke="#ffffff"
              filter="url(#chorus-glow)"
              style={{ opacity: 0 }}
            />

            {/* luminous writing tip — brighter core, tighter + stronger glow,
                radius slightly larger than the finished stroke (≈4.4 vs 3.25). */}
            <g ref={tipRef} filter="url(#chorus-tip-glow)" style={{ opacity: 0 }}>
              <circle r="4.4" fill="#ffffff" />
            </g>
          </svg>
        </div>
      </div>
    </div>
  )
}

export default App
