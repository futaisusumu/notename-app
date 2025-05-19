// import-users.js
const admin = require('firebase-admin')
const fs    = require('fs')
const { parse } = require('csv-parse/sync')

// サービスアカウントキーのパス
admin.initializeApp({
  credential: admin.credential.cert(require('./serviceAccountKey.json')),
})

async function main() {
  // users.csv のフォーマット: uid,email,displayName,password
  const input = fs.readFileSync('users.csv', 'utf8')
  const records = parse(input, { columns: true, skip_empty_lines: true })

  for (const { uid, email, displayName, password } of records) {
    try {
      await admin.auth().createUser({
        uid,
        email,
        displayName,
        password
      })
      console.log(`✔️  Created ${uid} (${email})`)
    } catch (err) {
      console.error(`❌  Failed ${uid}: ${err.code} ${err.message}`)
    }
  }
}

main().catch(console.error)
