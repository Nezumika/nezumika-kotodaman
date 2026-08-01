const express = require("express");
const path = require("path");
const mysql = require("mysql2/promise");

const app = express();
const PORT = process.env.PORT || 3000;

// データベース接続設定
const db = mysql.createPool({
  host: process.env.MYSQLHOST,
  user: process.env.MYSQLUSER,
  password: process.env.MYSQLPASSWORD,
  database: process.env.MYSQLDATABASE,
  port: process.env.MYSQLPORT
});

// 💡 CORS設定（OPTIONSリクエストを含むすべての通信を完全許可）
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, x-admin-password');
    
    // 事前確認（OPTIONS）には即座に 200 OK を返す
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    next();
});

// リクエスト解析用ミドルウェア
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// ルーティング設定
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "inquiry.html"));
});

app.post("/inquiry", async (req, res) => {
  try {
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
  } catch (error) {
    console.error("保存エラー:", error);
    res.status(500).send("エラーが発生しました");
  }
});

app.get("/version", async (req, res) => {
  try {
    const [rows] = await db.query(
      `
      SELECT version
      FROM versions
      ORDER BY release_date DESC
      LIMIT 1
      `
    );
    res.json(rows[0]);
  } catch (error) {
    console.error("バージョン取得エラー:", error);
    res.status(500).json({ error: "エラーが発生しました" });
  }
});

// 🔒 問い合わせ一覧を取得する管理者用API
app.get('/api/admin/inquiries', async (req, res) => {
    const adminPassword = req.headers['x-admin-password'];

    // パスワードチェック（※ご自身の設定したいパスワードに変更してくださいね！）
    if (adminPassword !== 'UtoKun1313') {
        return res.status(401).json({ error: 'パスワードが違います！' });
    }

    try {
        // テーブル名を 'inquiries' に修正しました！
        const [rows] = await db.query('SELECT * FROM inquiries ORDER BY id DESC');
        res.json(rows);
    } catch (error) {
        console.error('データ取得エラー:', error);
        res.status(500).json({ error: 'サーバーエラーが発生しました' });
  }
});

// 🔒 問い合わせ一覧を取得する管理者用API（非表示でないものだけ取得）
app.get('/api/admin/inquiries', async (req, res) => {
    const adminPassword = req.headers['x-admin-password'];
    if (adminPassword !== '***') { // 設定したパスワード
        return res.status(401).json({ error: 'パスワードが違います！' });
    }

    try {
        // is_hidden が FALSE（または 0）のデータだけを取得！
        const [rows] = await db.query('SELECT * FROM inquiries WHERE is_hidden = FALSE OR is_hidden IS NULL ORDER BY id DESC');
        res.json(rows);
    } catch (error) {
        console.error('データ取得エラー:', error);
        res.status(500).json({ error: 'サーバーエラーが発生しました' });
    }
});

// 🔒 問い合わせを非表示にするAPI
app.post('/api/admin/inquiries/:id/hide', async (req, res) => {
    const adminPassword = req.headers['x-admin-password'];
    if (adminPassword !== '***') { // 設定したパスワード
        return res.status(401).json({ error: 'パスワードが違います！' });
    }

    const { id } = req.params;

    try {
        await db.query('UPDATE inquiries SET is_hidden = TRUE WHERE id = ?', [id]);
        res.json({ message: '非表示にしました！' });
    } catch (error) {
        console.error('非表示エラー:', error);
        res.status(500).json({ error: 'サーバーエラーが発生しました' });
    }
});

// サーバー起動（コードの一番下に移動させています）
app.listen(PORT, () => {
  console.log(`サーバー起動：http://localhost:${PORT}`);
});