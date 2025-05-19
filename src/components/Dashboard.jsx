import React, { useEffect, useState } from 'react'
import { collection, query, orderBy, getDocs } from 'firebase/firestore'
import { db, auth } from '../firebase'

function Dashboard({ onBack }) {
  const [userList, setUserList] = useState([])
  const [selectedUser, setSelectedUser] = useState(auth.currentUser.uid)
  const [history, setHistory] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  // ユーザー一覧を取得
  useEffect(() => {
    async function fetchUsers() {
      try {
        const usersSnap = await getDocs(collection(db, 'users'))
        const users = usersSnap.docs.map(doc => doc.id)
        setUserList(users)
      } catch (err) {
        console.error(err)
        setError('ユーザー一覧の取得に失敗しました')
      }
    }
    fetchUsers()
  }, [])

  // 選択ユーザーの履歴を取得
  useEffect(() => {
    if (!selectedUser) return
    async function fetchHistory() {
      setLoading(true)
      setError(null)
      try {
        const histQuery = query(
          collection(db, 'users', selectedUser, 'history'),
          orderBy('timestamp', 'desc')
        )
        const snap = await getDocs(histQuery)
        const data = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }))
        setHistory(data)
      } catch (err) {
        console.error(err)
        setError('履歴の取得に失敗しました')
      } finally {
        setLoading(false)
      }
    }
    fetchHistory()
  }, [selectedUser])

  if (error) return <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>

  return (
    <div style={{ maxWidth: 600, margin: '20px auto', textAlign: 'center' }}>
      <button onClick={onBack} style={{ marginBottom: 20 }}>← 戻る</button>
      <h2>ユーザーの学習履歴</h2>
      <div style={{ marginBottom: 20 }}>
        <label>
          ユーザーID: 
          <select
            value={selectedUser}
            onChange={(e) => setSelectedUser(e.target.value)}
            style={{ marginLeft: 10 }}
          >
            {userList.map(uid => (
              <option key={uid} value={uid}>{uid}</option>
            ))}
          </select>
        </label>
      </div>
      {loading ? (
        <p>読み込み中…</p>
      ) : history.length === 0 ? (
        <p>このユーザーの履歴はありません</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={{ border: '1px solid #ccc', padding: '8px' }}>日時</th>
              <th style={{ border: '1px solid #ccc', padding: '8px' }}>タイプ</th>
              <th style={{ border: '1px solid #ccc', padding: '8px' }}>レベル</th>
              <th style={{ border: '1px solid #ccc', padding: '8px' }}>スコア</th>
            </tr>
          </thead>
          <tbody>
            {history.map(item => (
              <tr key={item.id}>
                <td style={{ border: '1px solid #ccc', padding: '8px' }}>
                  {item.timestamp?.toDate().toLocaleString()}
                </td>
                <td style={{ border: '1px solid #ccc', padding: '8px' }}>
                  {item.quizType === 'note' ? '音名' : '運指'}
                </td>
                <td style={{ border: '1px solid #ccc', padding: '8px' }}>
                  {item.level}
                </td>
                <td style={{ border: '1px solid #ccc', padding: '8px' }}>
                  {item.score} / {item.total}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}

export default Dashboard
