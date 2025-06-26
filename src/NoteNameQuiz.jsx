import { useEffect, useState } from 'react'
import { recordHistory } from './services/history'
import { Renderer } from 'vexflow'
import { Stave, StaveNote, Formatter, Accidental } from 'vexflow'
import { TREBLE_NOTE_RANGES, BASS_NOTE_RANGES, BASS_TUBA_NOTE_RANGES } from './data/noteNameRanges'

// Firebase は recordHistory 内で使用


function NoteNameQuiz({ onBack }) {
  const [clef, setClef] = useState(null)
  const [bassMode, setBassMode] = useState('normal')
  const [level, setLevel] = useState(null)
  const [noteList, setNoteList] = useState([])
  const [currentNote, setCurrentNote] = useState(null)
  const [questionNumber, setQuestionNumber] = useState(0)
  const [score, setScore] = useState(0)
  const [message, setMessage] = useState('')
  const [usedKeys, setUsedKeys] = useState([])
 
  

  const BUTTONS = clef === 'bass'
    ? ['ド','ド♯', 'レ', 'ミ', 'ファ', 'ファ♯', 'ソ', 'ラ', 'シ'
    ]
    : ['ド', 'レ', 'ミ', 'ファ', 'ソ', 'ラ', 'シ']

  const nextNote = (prevKey = null) => {
    // 🔍 未出題の候補を優先
    const unused = noteList.filter(n => !usedKeys.includes(`${n.note}/${n.octave}`))
    const pool = unused.length > 0 ? unused : noteList

    let next
    
    do {
      const n = pool[Math.floor(Math.random() * pool.length)]
      next = {
        ...n,
        key: `${n.note}/${n.octave}`,
        letter: n.jp
      }
    } while (prevKey && next.key === prevKey)

    // ✅ 出題済みとして記録
    setUsedKeys(prev => [...prev, next.key])
     
    setCurrentNote(next)
  }

  useEffect(() => {
    if (!currentNote) return
    const div = document.getElementById('staff')
    div.innerHTML = ''
    const renderer = new Renderer(div, Renderer.Backends.SVG)
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

   // 🎯 臨時記号処理（ヘ音記号では調号b-dur＝bb, eb）
    const KEY_SIGNATURE_FLATS = clef === 'bass' ? ['bb', 'eb'] : []
    const isAccidentalNote =
    currentNote.note.length === 2 &&
    (currentNote.note[1] === '#' || currentNote.note[1] === 'b')


    if (clef === 'bass') {
      if (currentNote.note === 'b' || currentNote.note === 'e') {
        // 調号で♭が付くのでナチュラルを表示
        note.addModifier(new Accidental('n'))
      } else if (isAccidentalNote && !KEY_SIGNATURE_FLATS.includes(currentNote.note)) {
        // 調号で付かない ♯ or ♭ は表示
        const accidentalChar = currentNote.note.includes('#') ? '#' : 'b'
        note.addModifier(new Accidental(accidentalChar))
      }
    } else {
      
     // ト音記号など調号のない場合はすべて表示
      if (isAccidentalNote) {
        const accidentalChar = currentNote.note.includes('#') ? '#' : 'b'
        note.addModifier(new Accidental(accidentalChar))
     }
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
    if (questionNumber < 19) {
      setTimeout(() => {
        nextNote(currentNote.key)
        setQuestionNumber(questionNumber + 1)
        setMessage('')
      }, 1000)
    } else {
       const finalScore = score + (correct ? 1 : 0)
       setMessage(`🎉 終了！スコア：${finalScore} / 20`)
      // Firestore に記録（全20問）
      recordHistory('note', level, finalScore, 20).catch(console.error)
    }

    // フィニッシュ時のみ記録するため上記以外では何もしない

  }

  const startLevel = (lv) => {
    let notes = []
  
    if (clef === 'bass') {
      const source = bassMode === 'tuba' ? BASS_TUBA_NOTE_RANGES : BASS_NOTE_RANGES
      for (let i = 1; i <= lv; i++) {
        if (source[i]) notes = notes.concat(source[i])
      }
    } else {
      for (let i = 1; i <= lv; i++) {
        if (TREBLE_NOTE_RANGES[i]) notes = notes.concat(TREBLE_NOTE_RANGES[i])
      }
    }

    setUsedKeys([])
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
  
      <div id="staff" style={{ margin: '20px auto', minHeight: '140px' }}></div>  
  
      <div style={{ marginTop: '40px' }}> 
        {BUTTONS.map((b) => (
          <button key={b} onClick={() => handleAnswer(b)} style={{ margin: '5px' }}>
            {b.split('').join('\n')}
          </button>
        ))}
      </div>
  
      <p>{message}</p>
    </div>
  )
  
  
}

export default NoteNameQuiz
