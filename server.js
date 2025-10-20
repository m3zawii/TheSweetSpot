/*
    ملف الخادم (server.js)
    --------------------------
    الغرض: هذا هو العقل المدبر للتطبيق. يعمل باستمرار في الخلفية، يستقبل الطلبات
    من أي جهاز، يعالجها، يتحدث مع قاعدة البيانات، ويرسل الرد.
*/

// 1. استيراد الأدوات اللازمة.
const express = require('express'); // لبناء الخادم.
const cors = require('cors');       // للسماح للواجهة بالتحدث مع الخادم.
const bcrypt = require('bcrypt');   // لتشفير كلمات المرور.
const db = require('./database.js'); // لاستيراد اتصال قاعدة البيانات.

// 2. إعداد تطبيق الخادم.
const app = express();
const PORT = 3000;
const saltRounds = 10;

// 3. Middleware (برامج وسيطة).
app.use(cors()); // تفعيل cors.
app.use(express.json()); // لتعليم الخادم كيفية قراءة بيانات JSON.

/* ================================================================== */
/* --- 4. نقاط النهاية (API Endpoints) --- */
/* ================================================================== */

// --- نقطة نهاية لإنشاء حساب جديد ---
app.post('/api/signup', async (req, res) => {
    const { name, email, password, address } = req.body;
    if (!name || !email || !password || !address) {
        return res.status(400).json({ error: 'جميع الحقول مطلوبة.' });
    }
    try {
        const hashedPassword = await bcrypt.hash(password, saltRounds);
        const sql = `INSERT INTO users (name, email, password, address) VALUES (?, ?, ?, ?)`;
        db.run(sql, [name, email, hashedPassword, address], function (err) {
            if (err) {
                return res.status(400).json({ error: 'هذا البريد الإلكتروني مستخدم بالفعل.' });
            }
            res.status(201).json({ message: 'تم إنشاء الحساب بنجاح!', userId: this.lastID });
        });
    } catch (error) {
        res.status(500).json({ error: 'حدث خطأ أثناء إنشاء الحساب.' });
    }
});

// --- نقطة نهاية لتسجيل الدخول ---
app.post('/api/login', (req, res) => {
    const { email, password } = req.body;
    const sql = `SELECT * FROM users WHERE email = ?`;
    db.get(sql, [email], async (err, user) => {
        if (err || !user) {
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
    });
});

// --- نقطة نهاية لإنشاء طلب جديد ---
app.post('/api/orders', (req, res) => {
    const { userId, items, total } = req.body;
    const itemsJson = JSON.stringify(items);
    const createdAt = new Date().toISOString();
    const sql = `INSERT INTO orders (userId, items, total, createdAt) VALUES (?, ?, ?, ?)`;
    db.run(sql, [userId, itemsJson, total, createdAt], function (err) {
        if (err) {
            return res.status(500).json({ error: 'تعذر إتمام الطلب.' });
        }
        res.status(201).json({ message: 'تم إرسال الطلب بنجاح!', orderId: this.lastID });
    });
});

// --- نقطة نهاية لجلب طلبات مستخدم معين ---
app.get('/api/orders/:userId', (req, res) => {
    const sql = `SELECT * FROM orders WHERE userId = ? ORDER BY createdAt DESC`;
    db.all(sql, [req.params.userId], (err, rows) => {
        if (err) {
            return res.status(500).json({ error: 'تعذر جلب الطلبات.' });
        }
        const orders = rows.map(order => ({ ...order, items: JSON.parse(order.items) }));
        res.status(200).json(orders);
    });
});


// --- **جديد**: نقطة نهاية للوحة تحكم المدير ---
app.get('/api/admin/data', (req, res) => {
    // في تطبيق حقيقي، يجب تأمين هذه النقطة بشكل أفضل.
    // هنا، سنقوم بجلب كل البيانات.
    const usersSql = `SELECT id, name, email, address FROM users`; // لا نرسل كلمة المرور
    const ordersSql = `SELECT * FROM orders`;

    db.all(usersSql, [], (err, users) => {
        if (err) return res.status(500).json({ error: 'تعذر جلب المستخدمين.' });

        db.all(ordersSql, [], (err, orders) => {
            if (err) return res.status(500).json({ error: 'تعذر جلب الطلبات.' });
            
            // نفس فكرة الطلبات، نحول حقل items من نص إلى كائن
            const parsedOrders = orders.map(order => ({ ...order, items: JSON.parse(order.items) }));

            res.status(200).json({ users, orders: parsedOrders });
        });
    });
});


// 5. بدء تشغيل الخادم.
app.listen(PORT, () => {
    console.log(`الخادم يعمل على http://localhost:${PORT}`);
});


