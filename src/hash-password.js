// hash-passwords.js
// ユーザーCSV(users.csv)を読み込み、bcryptでハッシュ化して
// Firebase CLIインポート用のCSV(users-hashed.csv)を生成します。

const fs = require('fs')
const { parse } = require('csv-parse/sync')
const { stringify } = require('csv-stringify/sync')
const bcrypt = require('bcrypt')

// input CSV: uid,email,displayName,password
const inputCsv = fs.readFileSync('users.csv', 'utf8')
const users = parse(inputCsv, { columns: true, skip_empty_lines: true })

async function main() {
  const out = []
  for (const { uid, email, displayName, password } of users) {
    // bcryptでソルト生成・ハッシュ化
    const salt = await bcrypt.genSalt(10)
    const hash = await bcrypt.hash(password, salt)
    // 生成されたハッシュとソルトをBase64にエンコード
    const passwordHash = Buffer.from(hash, 'utf8').toString('base64')
    const passwordSalt = Buffer.from(salt, 'utf8').toString('base64')

    out.push({ uid, email, displayName, passwordHash, passwordSalt })
  }

  // ヘッダ付きCSVで出力
  const outputCsv = stringify(out, { header: true })
  fs.writeFileSync('users-hashed.csv', outputCsv)
  console.log('✔️ users-hashed.csv を生成しました')
}

main().catch(console.error)
