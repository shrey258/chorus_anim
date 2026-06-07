import './App.css'

function App() {
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
            </defs>
            <path
              d="M28.04 36.81 C32.6 74.15 110.25 62.96 135.08 52.16 C146.25 47.31 162.81 33.84 159.72 19.86 C154.51 -3.78 114.23 2.68 97.67 7.07 C53.62 18.74 -18.84 71.07 8.12 124.5 C36.84 181.44 105.63 141 134.28 109.49 C140.92 102.19 140.41 84.02 148.84 78.37 C160.5 70.57 213.39 32.06 204.47 14.38 C198.68 2.9 176.38 25.84 172.21 31.33 C149.69 60.88 141.38 96.1 129.8 129.9 C131.86 124.81 132.77 116.35 135.77 111.57 C141.13 103.03 185.09 61.34 196.34 67.79 C204.45 72.45 146.94 134.23 177.31 134.79 C201.54 135.25 219.11 87.04 230.49 74.17 C237.97 65.71 258.27 63.01 265.01 73.36 C278.2 93.63 245.08 142.27 222.59 137.87 C203.34 134.09 221.11 86.9 230.11 81.36 C237.41 88.6 212.57 101.12 218.21 109.69 C253.1 162.68 291.4 93.33 308.23 69.55 C308.57 69.1 307.15 71.26 305.93 74.08 C304.35 77.76 304.09 82.51 306.77 85.82 C311.44 91.6 324.07 89.29 328.87 85.5 C324.15 89.29 291.85 130.92 307.98 136.36 C326.41 142.58 356.08 87.74 363.04 75.83 C358.31 83.75 331.09 127.08 342.41 132.84 C347.56 135.47 358.14 126.68 361.51 123.34 C376.72 108.27 391.12 95.27 403.23 77.56 C399.66 82.78 366.5 132.67 381.82 137.44 C389.83 139.93 394.76 130.2 400.14 126.6 C417.5 115.01 432.82 79.91 444.11 61.74 C444.49 60.81 440.38 67.2 439.93 67.86 C437.2 71.94 433.99 75.01 435.39 80.31 C439.54 96.03 445.75 109.18 449.45 125.12 C439.73 127.68 435.21 135.45 423.77 136 C418.63 136.25 404.28 133.61 406.31 126.39 C410.09 112.98 433.24 126.02 441.81 126.28 C460.99 126.88 469.82 115.29 479.31 100.43"
              stroke="#ffffff"
              filter="url(#chorus-glow)"
            />
          </svg>
        </div>
      </div>
    </div>
  )
}

export default App
