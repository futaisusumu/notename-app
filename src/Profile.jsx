import { useState, useEffect } from 'react'
import { auth, db } from './firebase'
import { updateProfile } from 'firebase/auth'
import { doc, setDoc, getDoc } from 'firebase/firestore'

function Profile({ onBack, uid, isAdmin }) {
  const current = auth.currentUser
  const targetUid = isAdmin && uid ? uid : current?.uid
  const isSelf = targetUid === current?.uid
  const [displayName, setDisplayName] = useState('')

  useEffect(() => {
    if (!targetUid) return
    async function fetchName() {
      if (isSelf) {
        setDisplayName(current?.displayName || '')
      } else {
        const snap = await getDoc(doc(db, 'users', targetUid))
        setDisplayName(snap.exists() ? snap.data().displayName || '' : '')
      }
    }
    fetchName()
  }, [targetUid, isSelf, current])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!targetUid) return
    try {
      if (isSelf && current) {
        await updateProfile(current, { displayName })
      }
      await setDoc(doc(db, 'users', targetUid), { displayName }, { merge: true })
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
