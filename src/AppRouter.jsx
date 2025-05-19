import { useEffect, useState } from 'react'
import { onAuthStateChanged, getIdTokenResult } from 'firebase/auth'
import { auth } from './firebase'
import App from './App'
import Login from './Login'

function AppRouter() {
  const [user, setUser]     = useState(null)
  const [isAdmin, setIsAdmin] = useState(false)

  useEffect(() => {
    return onAuthStateChanged(auth, async (u) => {
      setUser(u)
      if (u) {
        const idTokenResult = await getIdTokenResult(u, /* forceRefresh */ true)
        setIsAdmin(!!idTokenResult.claims.admin)
      }
    })
  }, [])

  if (!user) return <Login onLogin={() => {}} />
  return <App isAdmin={isAdmin} />
}

export default AppRouter
