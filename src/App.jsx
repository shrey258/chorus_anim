import './App.css'
import { CHORUS_VIEWBOX, CHORUS_WIDTH, CHORUS_HEIGHT, CHORUS_PATH } from './chorusOutline'

function App() {
  return (
    <div>
      <div className="glass-outer">
        <div className="glass-inner">
          <span className="chorus">Chorus</span>
          <svg
            className="chorus-etch"
            width={CHORUS_WIDTH}
            height={CHORUS_HEIGHT}
            viewBox={CHORUS_VIEWBOX}
            role="img"
            aria-label="Chorus"
          >
            <path d={CHORUS_PATH} />
          </svg>
        </div>
      </div>
    </div>
  )
}

export default App
