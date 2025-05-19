// scripts/backfill-users.js
const admin = require('firebase-admin')

// サービスアカウントキー JSON のパス
const serviceAccount = require('../serviceAccountKey.json')

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
})

const db = admin.firestore()
const auth = admin.auth()

async function backfill() {
  console.log('🚀 Backfill start')

  let nextPageToken = undefined
  do {
    // ユーザーを 1000 件ずつ取得
    const listUsersResult = await auth.listUsers(1000, nextPageToken)
    console.log(`📝 Fetched ${listUsersResult.users.length} users`)

    for (const u of listUsersResult.users) {
      const data = {
        email: u.email || '',
        displayName: u.displayName || '',
        // lastSignInTime があれば Date に変換、なければサーバータイム
        updatedAt: u.metadata.lastSignInTime
          ? admin.firestore.Timestamp.fromDate(new Date(u.metadata.lastSignInTime))
          : admin.firestore.FieldValue.serverTimestamp(),
      }

      // Firestore ドキュメントの参照を取得
      const userDocRef = db.collection('users').doc(u.uid)
      await userDocRef.set(data, { merge: true })
      console.log(`✔️ Upserted ${u.uid}`)
    }

    nextPageToken = listUsersResult.pageToken
  } while (nextPageToken)

  console.log('✅ Backfill complete')
}

backfill().catch(err => {
  console.error('🔥 Backfill failed:', err)
  process.exit(1)
})
