// generate-users-json.js
const fs = require('fs')
const { parse } = require('csv-parse/sync')
const bcrypt = require('bcrypt')

// users.csv のフォーマット:
// uid,email,displayName,password
const input = fs.readFileSync('users.csv', 'utf8')
const users = parse(input, {
  bom: true,                  // ← これで先頭の BOM を自動除去
  columns: true,
  skip_empty_lines: true,
})
async function main() {
  const out = []

  for (const { uid, email, displayName, password } of users) {
    // bcrypt でソルト＆ハッシュ化
    const salt = await bcrypt.genSalt(10)
    const hash = await bcrypt.hash(password, salt)

    // Base64 エンコード
    const passwordHash = Buffer.from(hash, 'utf8').toString('base64')
    const passwordSalt = Buffer.from(salt, 'utf8').toString('base64')

    // Firebase CLI JSON フォーマット
    out.push({
      localId:     uid,
      email:       email,
      emailVerified: false,
      passwordHash,
      passwordSalt,
      displayName: displayName
    })
  }

  fs.writeFileSync('users-hashed.json', JSON.stringify(out, null, 2), 'utf8')
  console.log('✔️ users-hashed.json を生成しました')
}

main().catch(console.error)
