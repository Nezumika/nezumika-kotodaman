const express = require("express");
const path = require("path");
const mysql = require("mysql2/promise");

const app = express();
const PORT = process.env.PORT || 3000;

const db = mysql.createPool({
  host: process.env.MYSQLHOST,
  user: process.env.MYSQLUSER,
  password: process.env.MYSQLPASSWORD,
  database: process.env.MYSQLDATABASE,
  port: process.env.MYSQLPORT
});


app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "inquiry.html"));
});

app.listen(PORT, () => {
  console.log(`サーバー起動：http://localhost:${PORT}`);
});

app.post("/inquiry", async (req, res) => {

  const { name, comment } = req.body;

  // 最新バージョンを取得
  const [versionRows] = await db.query(
    `
    SELECT id
    FROM versions
    ORDER BY release_date DESC
    LIMIT 1
    `
  );

  const latestVersionId = versionRows[0].id;


  // 問い合わせを保存
  await db.query(
    `
    INSERT INTO inquiries
    (name, comment, date, version_id)
    VALUES (?, ?, NOW(), ?)
    `,
    [name, comment, latestVersionId]
  );

  res.send("保存しました！");
});

app.get("/version", async (req, res) => {

  const [rows] = await db.query(
    `
    SELECT version
    FROM versions
    ORDER BY release_date DESC
    LIMIT 1
    `
  );

  res.json(rows[0]);
});

// 問い合わせ一覧を取得する管理者用API
app.get('/api/admin/inquiries', async (req, res) => {
    const adminPassword = req.headers['x-admin-password'];

    // 🔒 簡易パスワードチェック（「secret123」の部分は好きなパスワードに変えてください！）
    if (adminPassword !== 'UtoKun1313') {
        return res.status(401).json({ error: 'パスワードが違います！' });
    }

    try {
        // 新しい順（DESC）で問い合わせを取得！
        const [rows] = await db.query('SELECT * FROM inquires ORDER BY id DESC');
        res.json(rows);
    } catch (error) {
        console.error('データ取得エラー:', error);
        res.status(500).json({ error: 'サーバーエラーが発生しました' });
    }
});