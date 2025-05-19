import { useState, useEffect } from 'react'
import { signInWithEmailAndPassword } from 'firebase/auth'
import { auth } from './firebase'

function Login({ onLogin }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(false)
  const [error, setError] = useState('')

  // ローカルストレージから保存情報を読み込む
  useEffect(() => {
    const storedEmail = localStorage.getItem('rememberEmail')
    const storedPassword = localStorage.getItem('rememberPassword')
    if (storedEmail && storedPassword) {
      setEmail(storedEmail)
      setPassword(storedPassword)
      setRemember(true)
    }
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await signInWithEmailAndPassword(auth, email, password)
      setError('')
      // 保存チェックボックスの状態に応じてローカルストレージに保持
      if (remember) {
        localStorage.setItem('rememberEmail', email)
        localStorage.setItem('rememberPassword', password)
      } else {
        localStorage.removeItem('rememberEmail')
        localStorage.removeItem('rememberPassword')
      }
      onLogin()
    } catch (err) {
      console.error(err)
      setError('ログインに失敗しました。IDとパスワードを確認してください。')
    }
  }

  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <h2>ログイン</h2>
      <form onSubmit={handleSubmit} autoComplete="on">
        <div>
          <input
            type="email"
            name="email"
            placeholder="ユーザーID（メール）"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ padding: '8px', width: '250px' }}
            autoComplete="username"
          />
        </div>
        <div style={{ marginTop: '10px' }}>
          <input
            type="password"
            name="password"
            placeholder="パスワード"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ padding: '8px', width: '250px' }}
            autoComplete="current-password"
          />
        </div>
        <div style={{ marginTop: '10px', textAlign: 'left', display: 'inline-block' }}>
          <label>
            <input
              type="checkbox"
              checked={remember}
              onChange={(e) => setRemember(e.target.checked)}
            />
            ログイン情報を保存する
          </label>
        </div>
        <div style={{ marginTop: '15px' }}>
          <button type="submit" style={{ padding: '8px 16px' }}>ログイン</button>
        </div>
        {error && <p style={{ color: 'red', marginTop: '10px' }}>{error}</p>}
      </form>
    </div>
  )
}

export default Login
