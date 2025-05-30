import { useState } from 'react'
import UsersList from './UsersList'
import Dashboard from './Dashboard'

export default function AdminPage() {
  const [selectedUid, setSelectedUid] = useState(null)  // 選択されたユーザーID

  return (
    <div>
      {selectedUid ? (
        <Dashboard
          selectedUid={selectedUid}
          onBack={() => setSelectedUid(null)} // 戻るときにユーザー選択をクリア
        />
      ) : (
        <UsersList
          onSelect={(uid) => setSelectedUid(uid)} // 「履歴を見る」でIDを受け取る
        />
      )}
    </div>
  )
}
