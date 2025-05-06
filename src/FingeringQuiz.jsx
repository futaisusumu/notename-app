import { useEffect, useState } from 'react'
import { Renderer } from 'vexflow'
import { Stave, StaveNote, Formatter, Accidental } from 'vexflow'
import { TREBLE_RANGES, BASS_RANGES, BASS_TUBA_RANGES } from './data/fingeringRanges'


function FingeringQuiz({ onBack }) {
  const [clef, setClef] = useState(null)
  const [bassMode, setBassMode] = useState('normal')
  const [level, setLevel] = useState(null)
  const [noteList, setNoteList] = useState([])
  const [currentNote, setCurrentNote] = useState(null)
  const [questionNumber, setQuestionNumber] = useState(0)
  const [score, setScore] = useState(0)
  const [message, setMessage] = useState('')



  const FINGERING_DATA = {
    'c/4': '0', 'd/4': '13', 'e/4': '12', 'f/4': '1', 'g/4': '0',
    'a/4': '12', 'b/4': '2', 'c/5': '0',
    'f#/4': '2', 'bb/4': '1',
    'c#/4': '123', 'eb/4': '23',
    'g#/4': '23', 'd#/4': '2', 'ab/4': '23',
    'a#/4': '1'
  }

  const BUTTONS = ['0', '1', '2', '3', '12', '13', '23', '123']

  const startLevel = (lv) => {
    let range = []
    if (clef === 'treble') {
      for (let i = 1; i <= lv; i++) {
        if (TREBLE_RANGES[i]) range = range.concat(TREBLE_RANGES[i])
      }
    } else if (clef === 'bass' && bassMode === 'normal') {
      for (let i = 1; i <= lv; i++) {
        if (BASS_RANGES[i]) range = range.concat(BASS_RANGES[i])
      }
    } else if (clef === 'bass' && bassMode === 'tuba') {
      for (let i = 1; i <= lv; i++) {
        if (BASS_TUBA_RANGES[i]) range = range.concat(BASS_TUBA_RANGES[i])
      }
    }
    setNoteList(range)
    setLevel(lv)
    setScore(0)
    setQuestionNumber(0)
    setMessage('')
    const first = getRandomNote(range, null)
    setCurrentNote(first)
  }

  const getRandomNote = (range, prevKey) => {
    let next
    do {
      const n = range[Math.floor(Math.random() * range.length)]
      const key = `${n.note}/${n.octave}`
      const fingering = FINGERING_DATA[key]
      next = { ...n, key, fingering }
    } while (!next.fingering || next.key === prevKey)
    return next
  }

  useEffect(() => {
    if (!currentNote) return
    const div = document.getElementById('staff')
    div.innerHTML = ''
    const renderer = new Renderer(div, Renderer.Backends.SVG)
    renderer.resize(250, 150)
    const context = renderer.getContext()
    const stave = new Stave(10, 40, 230)
    stave.addClef(clef).setContext(context).draw()
    const note = new StaveNote({ keys: [currentNote.key], duration: 'q', clef })
    if (currentNote.note.includes('#') || currentNote.note.includes('b')) {
      note.addModifier(new Accidental(currentNote.note.includes('#') ? '#' : 'b'))
    }
    Formatter.FormatAndDraw(context, stave, [note])
  }, [currentNote])

  const handleAnswer = (ans) => {
    const correct = ans === currentNote.fingering
    if (correct) {
      setScore(score + 1)
      setMessage('⭕ 正解！')
    } else {
      setMessage(`❌ 不正解… 正解は「${currentNote.fingering}」`)
    }
    if (questionNumber < 9) {
      setTimeout(() => {
        const next = getRandomNote(noteList, currentNote.key)
        setCurrentNote(next)
        setQuestionNumber(questionNumber + 1)
        setMessage('')
      }, 1000)
    } else {
      setMessage(`🎉 終了！スコア：${score + (correct ? 1 : 0)} / 10`)
    }
  }

  if (!clef) {
    return (
      <div style={{ textAlign: 'center', marginTop: '50px' }}>
        <h2>記号を選んでください</h2>
        <button onClick={() => setClef('treble')}>🎼 ト音記号</button>
        <button onClick={() => setClef('bass')}>𝄢 ヘ音記号</button>
        <button onClick={onBack}>← 戻る</button>
      </div>
    )
  }

  if (clef === 'bass' && !bassMode) {
    return (
      <div style={{ textAlign: 'center', marginTop: '50px' }}>
        <h2>ヘ音記号の種類を選んでください</h2>
        <button onClick={() => setBassMode('normal')}>ユーフォ／トロンボーン</button>
        <button onClick={() => setBassMode('tuba')}>チューバ</button>
        <button onClick={() => setClef(null)}>← 記号選択に戻る</button>
      </div>
    )
  }

  if (!level) {
    return (
      <div style={{ textAlign: 'center', marginTop: '50px' }}>
        <h2>レベルを選んでください</h2>
        {[1, 2, 3, 4, 5].map((lv) => (
          <button key={lv} onClick={() => startLevel(lv)} style={{ margin: '5px' }}>レベル {lv}</button>
        ))}
        <br /><br />
        <button onClick={() => setClef(null)}>← 記号選択に戻る</button>
      </div>
    )
  }

  return (
    <div style={{ textAlign: 'center' }}>
      <button onClick={() => setLevel(null)}>← レベル選択に戻る</button>
      <div id="staff" style={{ margin: '20px auto' }}></div>
      {BUTTONS.map((b) => (
        <button key={b} onClick={() => handleAnswer(b)} style={{ display: 'block', margin: '5px auto' }}>{b.split('').join('\n')}</button>
      ))}
      <p>{message}</p>
    </div>
  )
}

export default FingeringQuiz
