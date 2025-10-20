const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
// استيراد الـ pool من ملف قاعدة البيانات الجديد
const pool = require('./database.js');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const saltRounds = 10;

app.use(cors());
app.use(express.json());

// --- تقديم الواجهة الأمامية ---
app.use(express.static(__dirname));
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// --- نقاط النهاية (API Endpoints) - تم تحديثها لـ PostgreSQL ---

// إنشاء حساب
app.post('/api/signup', async (req, res) => {
    const { name, email, password, address } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        // طريقة الاستعلام في pg مختلفة قليلاً ($1, $2 هي placeholders)
        const sql = `INSERT INTO users (name, email, password, address) VALUES ($1, $2, $3, $4) RETURNING id`;
        const result = await pool.query(sql, [name, email, hashedPassword, address]);
        res.status(201).json({ message: 'تم إنشاء الحساب بنجاح!', userId: result.rows[0].id });
    } catch (err) {
        res.status(400).json({ error: 'هذا البريد الإلكتروني مستخدم بالفعل أو حدث خطأ.' });
    }
});

// تسجيل الدخول
app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const sql = `SELECT * FROM users WHERE email = $1`;
        const result = await pool.query(sql, [email]);
        const user = result.rows[0];

        if (!user) {
            return res.status(401).json({ error: 'البريد الإلكتروني أو كلمة المرور غير صحيحة.' });
        }

        const match = await bcrypt.compare(password, user.password);
        if (match) {
            res.status(200).json({
                message: 'تم تسجيل الدخول بنجاح!',
                user: { id: user.id, name: user.name, email: user.email, address: user.address }
            });
        } else {
            res.status(401).json({ error: 'البريد الإلكتروني أو كلمة المرور غير صحيحة.' });
        }
    } catch (err) {
        res.status(500).json({ error: 'حدث خطأ في الخادم.' });
    }
});

// ... (يمكن تحديث بقية نقاط النهاية بنفس الطريقة) ...


app.listen(PORT, () => {
    console.log(`الخادم يعمل على المنفذ: ${PORT}`);
});
```

#### الخطوة الخامسة: تحديث `package.json`

تأكد من أن ملف `package.json` الخاص بك يحتوي على `pg` في قسم `dependencies` ولا يحتوي على `sqlite3`.

#### الخطوة السادسة والأخيرة: الدفع إلى GitHub

الآن بعد إجراء كل هذه التحديثات، قم بدفعها إلى GitHub:
```bash
git add .
git commit -m "Upgrade database to PostgreSQL for production"
git push

