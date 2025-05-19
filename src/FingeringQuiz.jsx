import { useEffect, useState } from 'react'
import { Renderer } from 'vexflow'
import { Stave, StaveNote, Formatter, Accidental } from 'vexflow'
import { TREBLE_RANGES, BASS_RANGES, BASS_TUBA_RANGES } from './data/fingeringRanges'
<<<<<<< HEAD


function FingeringQuiz({ onBack }) {
  const [clef, setClef] = useState(null)
  const [bassMode, setBassMode] = useState('normal')
=======
import { TREBLE_FINGERING_DATA } from './data/fingeringRanges'
import { BASS_FINGERING_DATA } from './data/fingeringRanges'
import { TUBA_FINGERING_DATA } from './data/fingeringRanges'
import { db, auth } from './firebase'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'

function FingeringQuiz({ onBack }) {
  const [clef, setClef] = useState(null);         // 'treble' or 'bass'
  const [instrument, setInstrument] = useState(null); // 'euphonium', 'trombone', 'tuba'
  const [bassMode, setBassMode] = useState(null)
>>>>>>> 61b7f86 (5/19--)
  const [level, setLevel] = useState(null)
  const [noteList, setNoteList] = useState([])
  const [currentNote, setCurrentNote] = useState(null)
  const [questionNumber, setQuestionNumber] = useState(0)
  const [score, setScore] = useState(0)
  const [message, setMessage] = useState('')
<<<<<<< HEAD



  const FINGERING_DATA = {
    'c/4': '0', 'd/4': '13', 'e/4': '12', 'f/4': '1', 'g/4': '0',
    'a/4': '12', 'b/4': '2', 'c/5': '0',
    'f#/4': '2', 'bb/4': '1',
    'c#/4': '123', 'eb/4': '23',
    'g#/4': '23', 'd#/4': '2', 'ab/4': '23',
    'a#/4': '1'
  }

  const BUTTONS = ['0', '1', '2', '3', '12', '13', '23', '123']

=======
  const [usedKeys, setUsedKeys] = useState([])

  const SLIDE_BUTTONS = ['1', '2', '3', '4', '5', '6', '7']
  const VALVE_BUTTONS = ['0', '1', '2', '3', '12', '13', '23', '123']
  const BUTTONS = (clef === 'bass' && bassMode === 'trombone') ? SLIDE_BUTTONS : VALVE_BUTTONS

  const getFingeringData = () => {
    if (clef === 'treble') return TREBLE_FINGERING_DATA
    if (clef === 'bass' && bassMode === 'normal') return BASS_FINGERING_DATA
    if (clef === 'bass' && bassMode === 'tuba') return TUBA_FINGERING_DATA
    return {}
  }

>>>>>>> 61b7f86 (5/19--)
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
<<<<<<< HEAD
=======

    // Firebaseに記録
    const user = auth.currentUser
    if (user) {
      addDoc(collection(db, 'users', user.uid, 'history'), {
        quizType: 'fingering',
        clef,
        bassMode: clef === 'bass' ? bassMode : null,
        level: lv,
        score: null,
        timestamp: serverTimestamp()
      })
    }

>>>>>>> 61b7f86 (5/19--)
    setNoteList(range)
    setLevel(lv)
    setScore(0)
    setQuestionNumber(0)
    setMessage('')
    const first = getRandomNote(range, null)
    setCurrentNote(first)
<<<<<<< HEAD
  }

  const getRandomNote = (range, prevKey) => {
    let next
    do {
      const n = range[Math.floor(Math.random() * range.length)]
      const key = `${n.note}/${n.octave}`
      const fingering = FINGERING_DATA[key]
      next = { ...n, key, fingering }
    } while (!next.fingering || next.key === prevKey)
=======
    setUsedKeys([])
  }

  const getRandomNote = (range, prevKey) => {
    const data = getFingeringData()
    const candidates = range
      .map(n => {
        const key = `${n.note}/${n.octave}`
        const fingering = data[key]

        let accidental = null
        if (n.note.includes('#')) accidental = '#'
        else if (n.note.includes('b') && n.note.length > 1) accidental = 'b'

        return fingering ? { ...n, key, fingering, accidental } : null
      })
      .filter(Boolean)

    if (candidates.length === 0) {
      console.error('⚠️ 出題候補がありません')
      return null
    }

    // usedKeys は出題済みの key（例: 'c/4'）のリスト
    const unused = candidates.filter(n => !usedKeys.includes(n.key))
    const pool = unused.length > 0 ? unused : candidates

    let next, tries = 0
    do {
      next = pool[Math.floor(Math.random() * pool.length)]
      tries++
    } while (next.key === prevKey && tries < 20)

    // 🔽 出題済みとして記録
    setUsedKeys(prev => [...prev, next.key])

>>>>>>> 61b7f86 (5/19--)
    return next
  }

  useEffect(() => {
    if (!currentNote) return
    const div = document.getElementById('staff')
    div.innerHTML = ''
    const renderer = new Renderer(div, Renderer.Backends.SVG)
<<<<<<< HEAD
    renderer.resize(250, 150)
    const context = renderer.getContext()
    const stave = new Stave(10, 40, 230)
    stave.addClef(clef).setContext(context).draw()
    const note = new StaveNote({ keys: [currentNote.key], duration: 'q', clef })
    if (currentNote.note.includes('#') || currentNote.note.includes('b')) {
      note.addModifier(new Accidental(currentNote.note.includes('#') ? '#' : 'b'))
    }
=======
    renderer.resize(250, 180)
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

    const KEY_SIGNATURE_FLATS = clef === 'bass' ? ['bb', 'eb'] : []

    const isAccidentalNote =
      currentNote.note.length === 2 &&
      (currentNote.note[1] === '#' || currentNote.note[1] === 'b')

    if (clef === 'bass') {
      if (currentNote.note === 'b' || currentNote.note === 'e') {
        note.addModifier(new Accidental('n'))
      } else if (isAccidentalNote && !KEY_SIGNATURE_FLATS.includes(currentNote.note)) {
        const accidentalChar = currentNote.note.includes('#') ? '#' : 'b'
        note.addModifier(new Accidental(accidentalChar))
      }
    } else {
      if (isAccidentalNote) {
        const accidentalChar = currentNote.note.includes('#') ? '#' : 'b'
        note.addModifier(new Accidental(accidentalChar))
      }
    }

>>>>>>> 61b7f86 (5/19--)
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
<<<<<<< HEAD
    if (questionNumber < 9) {
=======
    if (questionNumber < 19) {
>>>>>>> 61b7f86 (5/19--)
      setTimeout(() => {
        const next = getRandomNote(noteList, currentNote.key)
        setCurrentNote(next)
        setQuestionNumber(questionNumber + 1)
        setMessage('')
      }, 1000)
    } else {
<<<<<<< HEAD
      setMessage(`🎉 終了！スコア：${score + (correct ? 1 : 0)} / 10`)
=======
      setMessage(`🎉 終了！スコア：${score + (correct ? 1 : 0)} / 20`)
      const user = auth.currentUser
      if (user) {
        addDoc(collection(db, 'users', user.uid, 'history'), {
          quizType: 'fingering',
          clef,
          bassMode: clef === 'bass' ? bassMode : null,
          level,
          score: score + (correct ? 1 : 0),
          timestamp: serverTimestamp()
        })
      }
>>>>>>> 61b7f86 (5/19--)
    }
  }

  if (!clef) {
    return (
      <div style={{ textAlign: 'center', marginTop: '50px' }}>
        <h2>記号を選んでください</h2>
<<<<<<< HEAD
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
=======
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', marginTop: '24px' }}>
          <button onClick={() => {
            setClef('treble');
            setInstrument('trumpet');
          }}>
            🎼 ト音記号（トランペットなど）
          </button>

          <button onClick={() => {
            setClef('bass');
            setInstrument('euphonium');
          }}>
            𝄢 ヘ音記号（ユーフォニアム）
          </button>

          <button onClick={() => {
            setClef('bass');
            setInstrument('trombone');
          }}>
            𝄢 ヘ音記号（トロンボーン）
          </button>

          <button onClick={() => {
            setClef('bass');
            setInstrument('tuba');
          }}>
            𝄢 ヘ音記号（チューバ）
          </button>

          <button onClick={onBack}>← 戻る</button>
        </div>
>>>>>>> 61b7f86 (5/19--)
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
<<<<<<< HEAD
        <button onClick={() => setClef(null)}>← 記号選択に戻る</button>
=======
        <button onClick={() => {
          setBassMode(null)
          setClef(null)
        }}>← 記号選択に戻る</button>
>>>>>>> 61b7f86 (5/19--)
      </div>
    )
  }

  return (
    <div style={{ textAlign: 'center' }}>
      <button onClick={() => setLevel(null)}>← レベル選択に戻る</button>
      <div id="staff" style={{ margin: '20px auto' }}></div>
<<<<<<< HEAD
      {BUTTONS.map((b) => (
        <button key={b} onClick={() => handleAnswer(b)} style={{ display: 'block', margin: '5px auto' }}>{b.split('').join('\n')}</button>
      ))}
=======

      <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: '10px', marginBottom: '20px' }}>
        {BUTTONS.map((b) => (
          <button key={b} onClick={() => handleAnswer(b)}>
            {b.split('').map((digit, idx) => (
              <span key={idx}>
                {digit}
                <br />
              </span>
            ))}
          </button>
        ))}
      </div>

>>>>>>> 61b7f86 (5/19--)
      <p>{message}</p>
    </div>
  )
}

export default FingeringQuiz
