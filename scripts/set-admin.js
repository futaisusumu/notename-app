// scripts/set-admin.js
const admin = require('firebase-admin')
admin.initializeApp({
  credential: admin.credential.cert(require('../serviceAccountKey.json')),
})

async function grantAdmin(uid) {
  await admin.auth().setCustomUserClaims(uid, { admin: true })
  console.log(`✅ ${uid} に admin クレームを付与しました`)
}

grantAdmin('YJCTI5E9fOWRblYC8mjXjsrmv7y1').catch(console.error)
