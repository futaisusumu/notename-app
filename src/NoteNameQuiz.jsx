import { useEffect, useState } from 'react'
import { Renderer, Stave, StaveNote, Formatter } from 'vexflow'

const LEVEL_RANGES = {
    1: [
      { note: 'c', octave: 4, jp: 'ド' },
      { note: 'd', octave: 4, jp: 'レ' },
      { note: 'e', octave: 4, jp: 'ミ' },
      { note: 'f', octave: 4, jp: 'ファ' },
      { note: 'g', octave: 4, jp: 'ソ' },
      { note: 'a', octave: 4, jp: 'ラ' },
      { note: 'b', octave: 4, jp: 'シ' },
      { note: 'c', octave: 5, jp: 'ド' },
    ],
    2: [
      { note: 'a', octave: 3, jp: 'ラ' },
      { note: 'b', octave: 3, jp: 'シ' },
      { note: 'c', octave: 4, jp: 'ド' },
      { note: 'd', octave: 4, jp: 'レ' },
      { note: 'e', octave: 4, jp: 'ミ' },
      { note: 'f', octave: 4, jp: 'ファ' },
      { note: 'g', octave: 4, jp: 'ソ' },
      { note: 'a', octave: 4, jp: 'ラ' },
      { note: 'b', octave: 4, jp: 'シ' },
      { note: 'c', octave: 5, jp: 'ド' },
      { note: 'd', octave: 5, jp: 'レ' },
      { note: 'e', octave: 5, jp: 'ミ' },
    ],
    3: [
      { note: 'g', octave: 3, jp: 'ソ' },
      { note: 'a', octave: 3, jp: 'ラ' },
      { note: 'b', octave: 3, jp: 'シ' },
      { note: 'c', octave: 4, jp: 'ド' },
      { note: 'd', octave: 4, jp: 'レ' },
      { note: 'e', octave: 4, jp: 'ミ' },
      { note: 'f', octave: 4, jp: 'ファ' },
      { note: 'g', octave: 4, jp: 'ソ' },
      { note: 'a', octave: 4, jp: 'ラ' },
      { note: 'b', octave: 4, jp: 'シ' },
      { note: 'c', octave: 5, jp: 'ド' },
      { note: 'd', octave: 5, jp: 'レ' },
      { note: 'e', octave: 5, jp: 'ミ' },
      { note: 'f', octave: 5, jp: 'ファ' },
      { note: 'g', octave: 5, jp: 'ソ' },
      { note: 'a', octave: 5, jp: 'ラ' },
    ],
    4: [
      { note: 'g', octave: 3, jp: 'ソ' },
      { note: 'a', octave: 3, jp: 'ラ' },
      { note: 'b', octave: 3, jp: 'シ' },
      { note: 'c', octave: 4, jp: 'ド' },
      { note: 'd', octave: 4, jp: 'レ' },
      { note: 'e', octave: 4, jp: 'ミ' },
      { note: 'f', octave: 4, jp: 'ファ' },
      { note: 'g', octave: 4, jp: 'ソ' },
      { note: 'a', octave: 4, jp: 'ラ' },
      { note: 'b', octave: 4, jp: 'シ' },
      { note: 'c', octave: 5, jp: 'ド' },
      { note: 'd', octave: 5, jp: 'レ' },
      { note: 'e', octave: 5, jp: 'ミ' },
      { note: 'f', octave: 5, jp: 'ファ' },
      { note: 'g', octave: 5, jp: 'ソ' },
      { note: 'a', octave: 5, jp: 'ラ' },
      { note: 'b', octave: 5, jp: 'シ' },
      { note: 'c', octave: 6, jp: 'ド' },
    ],
  }

const BUTTONS = ['C', 'D', 'E', 'F', 'G', 'A', 'B']
const JP_MAP = { C: 'ド', D: 'レ', E: 'ミ', F: 'ファ', G: 'ソ', A: 'ラ', B: 'シ' }

// ✅ 関数名を NoteNameQuiz に修正
function NoteNameQuiz({ onBack }) {
  const [level, setLevel] = useState(null)
  const [noteList, setNoteList] = useState([])
  const [currentNote, setCurrentNote] = useState(null)
  const [questionNumber, setQuestionNumber] = useState(0)
  const [score, setScore] = useState(0)
  const [message, setMessage] = useState('')

  const nextNote = (prevKey = null) => {
    let next
    do {
      const n = noteList[Math.floor(Math.random() * noteList.length)]
      next = { ...n, key: `${n.note}/${n.octave}`, letter: n.note.toUpperCase() }
    } while (prevKey && next.key === prevKey)
    setCurrentNote(next)
  }

  useEffect(() => {
    if (!currentNote) return
    const div = document.getElementById('staff')
    div.innerHTML = ''
    const renderer = new Renderer(div, Renderer.Backends.SVG)
    renderer.resize(250, 150)
    const context = renderer.getContext()
    const stave = new Stave(10, 40, 230)
    stave.addClef('treble').setContext(context).draw()
    const note = new StaveNote({ keys: [currentNote.key], duration: 'q' })
    Formatter.FormatAndDraw(context, stave, [note])
  }, [currentNote])

  const handleAnswer = (letter) => {
    const correct = letter === currentNote.letter
    if (correct) {
      setScore(score + 1)
      setMessage('⭕ 正解！')
    } else {
      setMessage(`❌ 不正解… 正解は「${currentNote.jp}」`)
    }

    if (questionNumber < 9) {
      setTimeout(() => {
        nextNote(currentNote.key)
        setQuestionNumber(questionNumber + 1)
        setMessage('')
      }, 1000)
    } else {
      setMessage(`🎉 終了！スコア：${score + (correct ? 1 : 0)} / 10`)
    }
  }

  const startLevel = (lv) => {
    const notes = LEVEL_RANGES[lv]
    setLevel(lv)
    setNoteList(notes)
    setScore(0)
    setQuestionNumber(0)
    setMessage('')
    const first = notes[Math.floor(Math.random() * notes.length)]
    setCurrentNote({ ...first, key: `${first.note}/${first.octave}`, letter: first.note.toUpperCase() })
  }

  return (
    <div style={{ textAlign: 'center' }}>
      <button onClick={onBack}>← 戻る</button>

      {!level ? (
        <>
          <h2>レベルを選んでください</h2>
          {[1, 2, 3, 4].map((lv) => (
            <button key={lv} onClick={() => startLevel(lv)} style={{ margin: '10px' }}>
              レベル{lv}
            </button>
          ))}
        </>
      ) : (
        <>
          <h2>音名クイズ（{questionNumber + 1} / 10）</h2>
          <div id="staff" style={{ margin: '20px auto' }}></div>
          {BUTTONS.map((n) => (
            <button
              key={n}
              onClick={() => handleAnswer(n)}
              style={{ margin: '5px', padding: '10px 15px' }}
            >
              {JP_MAP[n]}
            </button>
          ))}
          <div style={{ marginTop: '20px', fontSize: '1.2em' }}>{message}</div>
        </>
      )}
    </div>
  )
}

export default NoteNameQuiz
