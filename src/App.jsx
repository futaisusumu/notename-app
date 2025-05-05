import { useState } from 'react'
import NoteNameQuiz from './NoteNameQuiz'
import FingeringQuiz from './FingeringQuiz'

function App() {
  const [mode, setMode] = useState(null)

  if (mode === 'note') return <NoteNameQuiz onBack={() => setMode(null)} />
  if (mode === 'fingering') return <FingeringQuiz onBack={() => setMode(null)} />

  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <h1>クイズを選んでください</h1>
      <button onClick={() => setMode('note')}>音名クイズ</button>
      <button onClick={() => setMode('fingering')}>運指クイズ</button>
    </div>
  )
}

export default App
