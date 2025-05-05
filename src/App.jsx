import { useEffect, useState } from 'react';
import { Renderer, Stave, StaveNote, Formatter } from 'vexflow';

const NOTES = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];
const NOTE_NAMES_JP = ['ド', 'レ', 'ミ', 'ファ', 'ソ', 'ラ', 'シ'];

function getRandomNote() {
  const options = ['c/4', 'd/4', 'e/4', 'f/4', 'g/4', 'a/4', 'b/4'];
  const index = Math.floor(Math.random() * options.length);
  return { notation: options[index], name: NOTES[index], jp: NOTE_NAMES_JP[index] };
}

function App() {
  const [currentNote, setCurrentNote] = useState(getRandomNote());
  const [message, setMessage] = useState('');
  const [questionCount, setQuestionCount] = useState(1);
  const [score, setScore] = useState(0);

  useEffect(() => {
    const div = document.getElementById('staff');
    div.innerHTML = ''; // clear
    const renderer = new Renderer(div, Renderer.Backends.SVG);
    renderer.resize(200, 100);
    const context = renderer.getContext();
    const stave = new Stave(10, 10, 180);
    stave.addClef('treble').setContext(context).draw();

    const note = new StaveNote({ keys: [currentNote.notation], duration: 'q' });
    Formatter.FormatAndDraw(context, stave, [note]);
  }, [currentNote]);

  const handleAnswer = (note) => {
    if (note === currentNote.name) {
      setMessage('⭕ 正解！');
      setScore(score + 1);
    } else {
      setMessage(`❌ 不正解…（正解：${currentNote.jp}）`);
    }

    if (questionCount < 10) {
      setTimeout(() => {
        setQuestionCount(questionCount + 1);
        setCurrentNote(getRandomNote());
        setMessage('');
      }, 1000);
    } else {
      setMessage(`🎉 おわり！スコア：${score + (note === currentNote.name ? 1 : 0)} / 10`);
    }
  };

  return (
    <div className="App" style={{ textAlign: 'center' }}>
      <h1>音名クイズ🎵（{questionCount} / 10）</h1>
      <div id="staff" style={{ margin: '20px auto' }}></div>
      {NOTES.map((n, i) => (
        <button key={n} onClick={() => handleAnswer(n)} style={{ margin: '5px', fontSize: '1.2em' }}>
          {NOTE_NAMES_JP[i]}
        </button>
      ))}
      <div style={{ marginTop: '20px', fontSize: '1.2em' }}>{message}</div>
    </div>
  );
}

export default App;
