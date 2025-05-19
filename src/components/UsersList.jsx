import { useEffect, useState, useMemo } from 'react'
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore'
import { db } from '../firebase'

/**
 * ユーザー一覧コンポーネント
 * 管理者向けに全ユーザーを表示し、最後の問題取り組み時間・内容・成績でソート表示
 */
export default function UsersList({ onSelect, onBack }) {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [sortField, setSortField] = useState('lastActivity')
  const [sortAsc, setSortAsc] = useState(false)

  useEffect(() => {
    async function fetchUsers() {
      const snap = await getDocs(collection(db, 'users'))
      const list = await Promise.all(
        snap.docs.map(async docSnap => {
          const data = docSnap.data()
          const histQuery = query(
            collection(db, 'users', docSnap.id, 'history'),
            orderBy('timestamp', 'desc'),
            limit(5)
          )
          const histSnap = await getDocs(histQuery)
          const historyItems = histSnap.docs.map(d => d.data())

          const last = historyItems[0]?.timestamp?.toDate() || null

          // クイズの種類ごとの最新スコアを抽出
          const notename = historyItems.find(h => h.quizType === 'notename')
          const fingering = historyItems.find(h => h.quizType === 'fingering')

          return {
            uid: docSnap.id,
            email: data.email || '',
            displayName: data.displayName || '',
            lastActivity: last,
            notenameSummary: notename ? `Lv${notename.level}:Score${notename.score}` : '—',
            fingeringSummary: fingering ? `Lv${fingering.level}:Score${fingering.score}` : '—'
          }
        })
      )
      setUsers(list)
      setLoading(false)
    }
    fetchUsers()
  }, [])

  const sortedUsers = useMemo(() => {
    const arr = [...users]
    arr.sort((a, b) => {
      let av = a[sortField]
      let bv = b[sortField]
      if (sortField === 'lastActivity') {
        av = av ? av.getTime() : 0
        bv = bv ? bv.getTime() : 0
      } else {
        av = av.toString().toLowerCase()
        bv = bv.toString().toLowerCase()
      }
      if (av < bv) return sortAsc ? -1 : 1
      if (av > bv) return sortAsc ? 1 : -1
      return 0
    })
    return arr
  }, [users, sortField, sortAsc])

  const handleSort = (field) => {
    if (sortField === field) {
      setSortAsc(!sortAsc)
    } else {
      setSortField(field)
      setSortAsc(true)
    }
  }

  if (loading) return <p style={{ textAlign: 'center' }}>読み込み中…</p>

  return (
    <div style={{ maxWidth: 800, margin: '20px auto', textAlign: 'center' }}>
      <button onClick={onBack} style={{ marginBottom: 10 }}>← 戻る</button>
      <h2>ユーザー一覧</h2>
      <table style={{ width: '100%', borderCollapse: 'collapse', cursor: 'pointer' }}>
        <thead>
          <tr>
            <th style={{ border: '1px solid #ccc', padding: 8 }} onClick={() => handleSort('email')}>
              メール {sortField === 'email' ? (sortAsc ? '▲' : '▼') : ''}
            </th>
            <th style={{ border: '1px solid #ccc', padding: 8 }} onClick={() => handleSort('displayName')}>
              名前 {sortField === 'displayName' ? (sortAsc ? '▲' : '▼') : ''}
            </th>
            <th style={{ border: '1px solid #ccc', padding: 8 }} onClick={() => handleSort('lastActivity')}>
              最終取り組み {sortField === 'lastActivity' ? (sortAsc ? '▲' : '▼') : ''}
            </th>
            <th style={{ border: '1px solid #ccc', padding: 8 }}>音名クイズ</th>
            <th style={{ border: '1px solid #ccc', padding: 8 }}>運指クイズ</th>
            <th style={{ border: '1px solid #ccc', padding: 8 }}>詳細</th>
          </tr>
        </thead>
        <tbody>
          {sortedUsers.map(u => (
            <tr key={u.uid}>
              <td style={{ border: '1px solid #ccc', padding: 8 }}>{u.email}</td>
              <td style={{ border: '1px solid #ccc', padding: 8 }}>{u.displayName}</td>

              <td style={{ border: '1px solid #ccc', padding: 8 }}>
               {u.lastActivity
                   ? u.lastActivity.toLocaleString('ja-JP', {
                      // year: 'numeric',
                       month: '2-digit',
                       day: '2-digit',
                       hour: '2-digit',
                       minute: '2-digit',
                       hour12: false,
                    }).replace(/^20/, '') // 必要なら「2025年」を「25年」に省略も可
                : '—'}
              </td>

              <td style={{ border: '1px solid #ccc', padding: 8 }}>{u.notenameSummary}</td>
              <td style={{ border: '1px solid #ccc', padding: 8 }}>{u.fingeringSummary}</td>
              <td style={{ border: '1px solid #ccc', padding: 8 }}>
                <button onClick={() => onSelect(u.uid)}>履歴を見る</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
