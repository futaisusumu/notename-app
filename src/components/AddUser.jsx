import { useState } from 'react'
import { initializeApp, deleteApp } from 'firebase/app'
import { getAuth, createUserWithEmailAndPassword, updateProfile, signOut } from 'firebase/auth'
import { doc, setDoc } from 'firebase/firestore'
import { db } from '../firebase'
import { firebaseConfig } from '../firebase'

function AddUser({ onBack }) {
  const [email, setEmail] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const secondaryApp = initializeApp(firebaseConfig, 'Secondary')
      const secondaryAuth = getAuth(secondaryApp)

      const cred = await createUserWithEmailAndPassword(secondaryAuth, email, password)
      if (displayName) {
        await updateProfile(cred.user, { displayName })
      }
      await setDoc(doc(db, 'users', cred.user.uid), { email, displayName })
      await signOut(secondaryAuth)
      await deleteApp(secondaryApp)
      alert('ユーザーを追加しました')
      onBack()
    } catch (err) {
      console.error(err)
      setError('ユーザー作成に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <h2>ユーザー追加</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="メール"
            style={{ padding: '8px', width: '250px' }}
            autoComplete="off"
          />
        </div>
        <div style={{ marginTop: '10px' }}>
          <input
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
            placeholder="表示名"
            style={{ padding: '8px', width: '250px' }}
          />
        </div>
        <div style={{ marginTop: '10px' }}>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="パスワード"
            style={{ padding: '8px', width: '250px' }}
            autoComplete="new-password"
          />
        </div>
        <div style={{ marginTop: '15px' }}>
          <button type="submit" disabled={loading} style={{ padding: '8px 16px', marginRight: '10px' }}>作成</button>
          <button type="button" onClick={onBack} style={{ padding: '8px 16px' }} disabled={loading}>戻る</button>
        </div>
        {error && <p style={{ color: 'red' }}>{error}</p>}
      </form>
    </div>
  )
}

export default AddUser
