import React, { useState } from 'react'
import { signOut } from 'firebase/auth'
import { auth } from './firebase'
import NoteNameQuiz from './NoteNameQuiz'
import FingeringQuiz from './FingeringQuiz'
import UsersList from './components/UsersList'
import Dashboard from './components/Dashboard'
import Profile from './Profile'

/**
 * App コンポーネント
 * @param {{ isAdmin: boolean }} props
 */
function App({ isAdmin }) {
  const [mode, setMode] = useState('menu')
  const [selectedUid, setSelectedUid] = useState(null)

  // ログアウト処理
  const handleLogout = async () => {
    try {
      await signOut(auth)
    } catch (err) {
      console.error('ログアウトに失敗しました', err)
    }
  }

  // クイズ：音名
  if (mode === 'note') {
    return <NoteNameQuiz onBack={() => setMode('menu')} />
  }

  // クイズ：運指
  if (mode === 'fingering') {
    return <FingeringQuiz onBack={() => setMode('menu')} />
  }

  // プロフィール編集
  if (mode === 'profile') {
    return <Profile onBack={() => setMode('menu')} />
  }

  // 管理：ユーザー一覧
  if (mode === 'usersList') {
    return (
      <UsersList
        onSelect={(uid) => {
          setSelectedUid(uid)
          setMode('userHistory')
        }}
        onBack={() => setMode('menu')}
      />
    )
  }

  // 管理：選択ユーザーの履歴
  if (mode === 'userHistory') {
    return <Dashboard userId={selectedUid} onBack={() => setMode('usersList')} />
  }

  // メインメニュー
  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <h1>クイズを選んでください</h1>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', alignItems: 'center' }}>
        <button onClick={() => setMode('note')}>音名クイズ</button>
        <button onClick={() => setMode('fingering')}>運指クイズ</button>
        {isAdmin && <button onClick={() => setMode('usersList')}>ユーザー管理</button>}
        <button onClick={() => setMode('profile')}>プロフィール</button>
        <button onClick={handleLogout}>ログアウト</button>
      </div>
    </div>
  )
}

export default App
