import { useEffect, useState } from 'react'
import { Renderer } from 'vexflow'
import { Stave, StaveNote, Formatter, Accidental } from 'vexflow'
import { TREBLE_RANGES, BASS_RANGES, BASS_TUBA_RANGES, TROMBONE_RANGES } from './data/fingeringRanges'
import { TREBLE_FINGERING_DATA } from './data/fingeringRanges'
import { BASS_FINGERING_DATA } from './data/fingeringRanges'
import { TUBA_FINGERING_DATA } from './data/fingeringRanges'
import { TROMBONE_FINGERING_DATA } from './data/fingeringRanges'
import { db, auth } from './firebase'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'

function FingeringQuiz({ onBack }) {
  const [instrument, setInstrument] = useState(null); // 'euphonium', 'trombone', 'tuba'
  const [level, setLevel] = useState(null)
  const [noteList, setNoteList] = useState([])
  const [currentNote, setCurrentNote] = useState(null)
  const [questionNumber, setQuestionNumber] = useState(0)
  const [score, setScore] = useState(0)
  const [message, setMessage] = useState('')
  const [usedKeys, setUsedKeys] = useState([])

  const SLIDE_BUTTONS = ['1', '2', '3', '4', '5', '6', '7']
  const VALVE_BUTTONS = ['0', '1', '2', '3', '12', '13', '23', '123']
  const BUTTONS = (instrument === 'trombone') ? SLIDE_BUTTONS : VALVE_BUTTONS

  const getFingeringData = () => {
    if (instrument === 'trumpet') return TREBLE_FINGERING_DATA
    if (instrument === 'euphonium') return BASS_FINGERING_DATA
    if (instrument === 'tuba') return TUBA_FINGERING_DATA
    if (instrument === 'trombone') return TROMBONE_FINGERING_DATA
    return {}
  }

  const startLevel = (lv) => {
    let range = []

    if (instrument === 'trumpet') {
      for (let i = 1; i <= lv; i++) {
        if (TREBLE_RANGES[i]) range = range.concat(TREBLE_RANGES[i])
      }
    } else if (instrument === 'euphonium') {
      for (let i = 1; i <= lv; i++) {
        if (BASS_RANGES[i]) range = range.concat(BASS_RANGES[i])
      }
    } else if (instrument === 'tuba') {
      for (let i = 1; i <= lv; i++) {
        if (BASS_TUBA_RANGES[i]) range = range.concat(BASS_TUBA_RANGES[i])
      }
    } else if (instrument === 'trombone') {
      for (let i = 1; i <= lv; i++) {
        if (TROMBONE_RANGES[i]) range = range.concat(TROMBONE_RANGES[i])
      }
    }


    // Firebaseに記録
    const user = auth.currentUser
    if (user) {
      addDoc(collection(db, 'users', user.uid, 'history'), {
        quizType: 'fingering',
        instrument,
        level: lv,
        score: null,
        timestamp: serverTimestamp()
      })
    }

    setNoteList(range)
    setLevel(lv)
    setScore(0)
    setQuestionNumber(0)
    setMessage('')
    const first = getRandomNote(range, null)
    setCurrentNote(first)
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


    console.log('🎺 instrument:', instrument)
    console.log('🎯 level:', level)
    console.log('🎲 range:', range)

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

    return next
  }

  useEffect(() => {
    if (!currentNote) return
    const div = document.getElementById('staff')
    if (!div) {
      console.warn('⚠️ staff 要素が見つかりません')
      return
    }

    div.innerHTML = ''
    const renderer = new Renderer(div, Renderer.Backends.SVG)
    renderer.resize(250, 180)
    const context = renderer.getContext()
    const stave = new Stave(10, 40, 230)
    const clefToUse = (instrument === 'trumpet') ? 'treble' : 'bass'

    stave.addClef(clefToUse)

    if (clefToUse === 'bass') {
      stave.addKeySignature('Bb')
    }


    stave.setContext(context).draw()

    const note = new StaveNote({
      keys: [currentNote.key],
      duration: 'q',
      clef: clefToUse
    })

    const KEY_SIGNATURE_FLATS = clefToUse === 'bass' ? ['bb', 'eb'] : []

    const isAccidentalNote =
      currentNote.note.length === 2 &&
      (currentNote.note[1] === '#' || currentNote.note[1] === 'b')

    if (clefToUse === 'bass') {
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
    if (questionNumber < 19) {
      setTimeout(() => {
        const next = getRandomNote(noteList, currentNote.key)
        setCurrentNote(next)
        setQuestionNumber(questionNumber + 1)
        setMessage('')
      }, 1000)
    } else {
      setMessage(`🎉 終了！スコア：${score + (correct ? 1 : 0)} / 20`)
      const user = auth.currentUser
      if (user) {
        addDoc(collection(db, 'users', user.uid, 'history'), {
          quizType: 'fingering',
          instrument,
          level: level,
          score: null,
          timestamp: serverTimestamp()
        })
      }
    }
  }

  if (!instrument) {
    return (
      <div style={{ textAlign: 'center', marginTop: '50px' }}>
        <h2>楽器を選んでください</h2>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px', marginTop: '24px' }}>
          <button onClick={() => setInstrument('trumpet')}>
            🎼 ト音記号（トランペットなど）
          </button>

          <button onClick={() => setInstrument('euphonium')}>
            𝄢 ヘ音記号（ユーフォニアム）
          </button>

          <button onClick={() => setInstrument('trombone')}>
            𝄢 ヘ音記号（トロンボーン）
          </button>

          <button onClick={() => setInstrument('tuba')}>
            𝄢 ヘ音記号（チューバ）
          </button>

          <button onClick={onBack}>← 戻る</button>
        </div>
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
        <button onClick={() => {
          setInstrument(null)
          
        }}>← 記号選択に戻る</button>
      </div>
    )
  }

  return (
    <div style={{ textAlign: 'center' }}>
      <button onClick={() => setLevel(null)}>← レベル選択に戻る</button>
      <div id="staff" style={{ margin: '20px auto' }}></div>

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

      <p>{message}</p>
    </div>
  )
}

export default FingeringQuiz
