import { useEffect, useState } from 'react'
import { Renderer } from 'vexflow'
import { Stave, StaveNote, Formatter, Accidental } from 'vexflow'
import { TREBLE_NOTE_RANGES, BASS_NOTE_RANGES, BASS_TUBA_NOTE_RANGES } from './data/noteNameRanges'

function NoteNameQuiz({ onBack }) {
  const [clef, setClef] = useState(null)
  const [bassMode, setBassMode] = useState('normal')
  const [level, setLevel] = useState(null)
  const [noteList, setNoteList] = useState([])
  const [currentNote, setCurrentNote] = useState(null)
  const [questionNumber, setQuestionNumber] = useState(0)
  const [score, setScore] = useState(0)
  const [message, setMessage] = useState('')
 
  

  const BUTTONS = clef === 'bass'
    ? ['ド', 'レ', 'ミ', 'ファ', 'ファ♯', 'ソ', 'ラ', 'シ', 'シ♭']
    : ['ド', 'レ', 'ミ', 'ファ', 'ソ', 'ラ', 'シ']

  const nextNote = (prevKey = null) => {
    let next
    do {
      const n = noteList[Math.floor(Math.random() * noteList.length)]
      next = {
        ...n,
        key: `${n.note}/${n.octave}`,
        letter: n.jp
      }
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
    stave.addClef(clef)
    if (clef === 'bass') {
      stave.addKeySignature('Bb')
    }
    stave.setContext(context).draw()
    const note = new StaveNote({
      keys: [currentNote.key],
      duration: 'q',
      clef: clef
    })
    if (currentNote.accidental) {
      note.addModifier(new Accidental(currentNote.accidental), 0)
    }
    Formatter.FormatAndDraw(context, stave, [note])
  }, [currentNote])

  const handleAnswer = (letter) => {
    const correct = letter === currentNote.jp
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
    let notes
    if (clef === 'bass') {
      notes = bassMode === 'tuba' ? BASS_TUBA_NOTE_RANGES[lv] : BASS_NOTE_RANGES[lv]
    } else {
      notes = TREBLE_NOTE_RANGES[lv]
    }
    setLevel(lv)
    setNoteList(notes)
    setScore(0)
    setQuestionNumber(0)
    setMessage('')
    const first = notes[Math.floor(Math.random() * notes.length)]
    setCurrentNote({ ...first, key: `${first.note}/${first.octave}`, letter: first.jp })
  }

  if (!clef) {
    return (
      <div style={{ textAlign: 'center', marginTop: '50px' }}>
        <h2>記号を選んでください</h2>
        <button onClick={() => setClef('treble')}>🎼 ト音記号</button>
        <button onClick={() => { setClef('bass'); setBassMode('normal') }}>𝄢 ヘ音記号（ユーフォ）</button>
        <button onClick={() => { setClef('bass'); setBassMode('tuba') }}>𝄢 ヘ音記号（チューバ）</button>
        <br /><br />
        <button onClick={onBack}>← 戻る</button>
      </div>
    )
  }

  if (!level) {
    return (
      <div style={{ textAlign: 'center', marginTop: '50px' }}>
        <h2>レベルを選んでください</h2>
        {[1, 2, 3, 4, 5].map(lv => (
          <button key={lv} onClick={() => startLevel(lv)} style={{ margin: '5px' }}>レベル {lv}</button>
        ))}
        <br /><br />
        {clef === 'bass' && <p>※ ヘ音記号では「べー読み」で表示されます（例：シ♭＝ド）</p>}
        <button onClick={() => setClef(null)}>← 記号選択に戻る</button>
      </div>
    )
  }

  return (
    <div style={{ textAlign: 'center' }}>
      <button onClick={() => setLevel(null)}>← レベル選択に戻る</button>
      <div id="staff" style={{ margin: '20px auto' }}></div>
      {BUTTONS.map((l) => (
        <button key={l} onClick={() => handleAnswer(l)}>{l}</button>
      ))}
      <p>{message}</p>
    </div>
  )
  
}

export default NoteNameQuiz
