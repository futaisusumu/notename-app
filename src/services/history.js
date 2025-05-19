// src/services/history.js
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { db, auth } from '../firebase'

/**
 * 学習履歴を Firestore に記録
 * @param {'note'|'fingering'} quizType
 * @param {number} level
 * @param {number} score
 * @param {number} total
 */
export async function recordHistory(quizType, level, score, total) {
  const user = auth.currentUser
  if (!user) throw new Error('ログインしていません')

  const col = collection(db, 'users', user.uid, 'history')
  await addDoc(col, {
    quizType,
    level,
    score,
    total,
    timestamp: serverTimestamp()
  })
}
