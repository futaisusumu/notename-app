import { useEffect, useState } from 'react'
import { Renderer, Stave, StaveNote, Formatter, Accidental } from 'vexflow'

const FINGERING_DATA = {
    'g/3': { jp: 'ソ', fingering: '13' },
    'g#/3': { jp: 'ソ♯', fingering: '23' },
    'a/3': { jp: 'ラ', fingering: '12' },
    'a#/3': { jp: 'ラ♯', fingering: '1' },
    'bb/3': { jp: 'シ♭', fingering: '1' },
    'b/3': { jp: 'シ', fingering: '2' },
    'c/4': { jp: 'ド', fingering: '0' },
    'c#/4': { jp: 'ド♯', fingering: '123' },
    'd/4': { jp: 'レ', fingering: '13' },
    'd#/4': { jp: 'レ♯', fingering: '23' },
    'eb/4': { jp: 'ミ♭', fingering: '23' },
    'e/4': { jp: 'ミ', fingering: '12' },
    'f/4': { jp: 'ファ', fingering: '1' },
    'f#/4': { jp: 'ファ♯', fingering: '2' },
    'g/4': { jp: 'ソ', fingering: '0' },
    'g#/4': { jp: 'ソ♯', fingering: '23' },
    'a/4': { jp: 'ラ', fingering: '12' },
    'a#/4': { jp: 'ラ♯', fingering: '1' },
    'bb/4': { jp: 'シ♭', fingering: '1' },
    'b/4': { jp: 'シ', fingering: '2' },
    'c/5': { jp: 'ド', fingering: '0' },
    'c#/5': { jp: 'ド♯', fingering: '12' },
    'd/5': { jp: 'レ', fingering: '1' },
    'd#/5': { jp: 'レ♯', fingering: '2' },
    'eb/5': { jp: 'ミ♭', fingering: '2' },
    'e/5': { jp: 'ミ', fingering: '0' },
    'f/5': { jp: 'ファ', fingering: '1' },
    'f#/5': { jp: 'ファ♯', fingering: '2' },
    'g/5': { jp: 'ソ', fingering: '0' },
    'g#/5': { jp: 'ソ♯', fingering: '23' },
    'a/5': { jp: 'ラ', fingering: '12' },
    'a#/5': { jp: 'ラ♯', fingering: '1' },
    'bb/5': { jp: 'シ♭', fingering: '1' },
    'b/5': { jp: 'シ', fingering: '2' },
    'c/6': { jp: 'ド', fingering: '0' },
    'd/6': { jp: 'レ', fingering: '1' },
    'e/6': { jp: 'ミ', fingering: '0' },
  }
  
  const LEVEL_KEYS = {
    1: [
      'g/4', 'a/4', 'b/4', 'c/5', 'd/5', 'e/5', 'f/5'
    ],
    2: [
      'g/4', 'a/4', 'b/4', 'bb/4', 'c/5', 'd/5', 'e/5', 'f/5', 'f#/4'
    ],
    3: [
      'g/4', 'a/4', 'b/4', 'bb/4', 'c/5', 'd/5', 'e/5', 'f/5', 'f#/4',
      'c#/4', 'd#/4', 'eb/4'
    ],
    4: [
      'g/4', 'a/4', 'b/4', 'bb/4', 'c/5', 'd/5', 'e/5', 'f/5', 'f#/4',
      'c#/4', 'd#/4', 'eb/4', 'g#/4', 'a#/4', 'd#/5'
    ],
    5: Object.keys(FINGERING_DATA),
  }
  

const FINGERINGS = ['0', '1', '2', '3', '12', '13', '23', '123']

function FingeringQuiz({ onBack }) {
  const [level, setLevel] = useState(null)
  const [noteKeys, setNoteKeys] = useState([])
  const [question, setQuestion] = useState(null)
  const [questionNumber, setQuestionNumber] = useState(1)
  const [score, setScore] = useState(0)
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (level) {
      const keys = LEVEL_KEYS[level] || []
      setNoteKeys(keys)
      const first = getRandomNote(null, keys)
      setQuestion(first)
    }
  }, [level])

  useEffect(() => {
    if (!question) return
    const div = document.getElementById('staff-fingering')
    div.innerHTML = ''
    const renderer = new Renderer(div, Renderer.Backends.SVG)
    renderer.resize(250, 150)
    const context = renderer.getContext()
    const stave = new Stave(10, 40, 230)
    stave.addClef('treble').setContext(context).draw()

    const note = new StaveNote({ keys: [question.key], duration: 'q', clef: 'treble' })

    const noteName = question.key.split('/')[0] // 'b', 'bb', etc.
    if (noteName.includes('#')) {
      note.addModifier(new Accidental('#'), 0)
    } else if (noteName.endsWith('b') && noteName.length > 1) {
      note.addModifier(new Accidental('b'), 0)
    }
    

    Formatter.FormatAndDraw(context, stave, [note])
  }, [question])

  const getRandomNote = (prevKey, keys) => {
    let nextKey
    do {
      nextKey = keys[Math.floor(Math.random() * keys.length)]
    } while (prevKey && nextKey === prevKey)

        const { jp, fingering } = FINGERING_DATA[nextKey]
        return { key: nextKey, jp, fingering }
  }

  const handleAnswer = (input) => {
    console.log("🎯 出題キー:", question.key, "→ 表示名:", question.jp, "→ 運指:", question.fingering)

    const isCorrect = String(input) === String(question.fingering)
    if (isCorrect) {
      setScore(score + 1)
      setMessage('⭕ 正解！')
    } else {
      setMessage(`❌ 不正解… 正解は ${formatFingering(question.fingering)}`)
    }

    if (questionNumber < 10) {
      setTimeout(() => {
        setQuestion(getRandomNote(question.key, noteKeys))
        setQuestionNumber(questionNumber + 1)
        setMessage('')
      }, 1000)
    } else {
      setMessage(`🎉 終了！スコア：${score + (isCorrect ? 1 : 0)} / 10`)
    }
  }

  const formatFingering = (fingering) => {
    if (fingering === '0') return '（開放）'
    return fingering.split('').join('\n')
  }

  return (
    <div style={{ textAlign: 'center' }}>
      <button onClick={onBack}>← 戻る</button>

      {!level ? (
        <>
          <h2>レベルを選んでください</h2>
          {[1, 2, 3, 4, 5].map((lv) => (
            <button key={lv} onClick={() => setLevel(lv)} style={{ margin: '10px', padding: '10px 20px' }}>
              レベル{lv}
            </button>
          ))}
        </>
      ) : (
        <>
          <h2>運指クイズ（{questionNumber} / 10） レベル{level}</h2>
          <div id="staff-fingering" style={{ margin: '20px auto' }}></div>
          <div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap' }}>
            {FINGERINGS.map((f) => (
              <button
                key={f}
                onClick={() => handleAnswer(f)}
                style={{
                  margin: '10px',
                  padding: '5px 10px',
                  fontSize: '1.1em',
                  whiteSpace: 'pre-line',
                  lineHeight: '1.2em',
                  minWidth: '40px',
                  minHeight: '50px',
                }}
              >
                {f === '0' ? '開放' : f.split('').join('\n')}
              </button>
            ))}
          </div>
          <div style={{ marginTop: '20px', fontSize: '1.2em' }}>{message}</div>
        </>
      )}
    </div>
  )
}

export default FingeringQuiz
