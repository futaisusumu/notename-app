import { useState, useEffect } from 'react'
import { auth, db } from './firebase'
import { updateProfile } from 'firebase/auth'
import { doc, setDoc } from 'firebase/firestore'

function Profile({ onBack }) {
  const user = auth.currentUser
  const [displayName, setDisplayName] = useState('')

  useEffect(() => {
    if (user) {
      setDisplayName(user.displayName || '')
    }
  }, [user])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!user) return
    try {
      await updateProfile(user, { displayName })
      await setDoc(doc(db, 'users', user.uid), { displayName }, { merge: true })
      alert('プロフィールを更新しました')
      onBack()
    } catch (err) {
      console.error(err)
      alert('更新に失敗しました')
    }
  }

  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <h2>プロフィール編集</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <input
            type="text"
            value={displayName}
            placeholder="表示名"
            onChange={(e) => setDisplayName(e.target.value)}
            style={{ padding: '8px', width: '250px' }}
          />
        </div>
        <div style={{ marginTop: '15px' }}>
          <button type="submit" style={{ padding: '8px 16px', marginRight: '10px' }}>
            保存
          </button>
          <button type="button" onClick={onBack} style={{ padding: '8px 16px' }}>
            戻る
          </button>
        </div>
      </form>
    </div>
  )
}

export default Profile
