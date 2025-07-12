const admin = require('firebase-admin')

admin.initializeApp({
  credential: admin.credential.cert(require('../serviceAccountKey.json')),
})

async function removeUser(uid) {
  await admin.auth().deleteUser(uid)
  const userDocRef = admin.firestore().doc(`users/${uid}`)
  await admin.firestore().recursiveDelete(userDocRef)
  console.log(`✅ Deleted user ${uid}`)
}

const uid = process.argv[2]
if (!uid) {
  console.error('Usage: node delete-user.js <uid>')
  process.exit(1)
}

removeUser(uid).catch(err => {
  console.error('🔥 Failed to delete user:', err)
  process.exit(1)
})
