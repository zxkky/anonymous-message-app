const express = require('express');
const cookieParser = require('cookie-parser');
const mysql = require('mysql');
const bcrypt = require('bcrypt');

const app = express();
const SALT_ROUNDS = 10;

// Middleware
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use('/assets', express.static('public'));
app.set('view engine', 'ejs');

// Database
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'telsanonim'
});

// Helper: promisify connection.query
function queryAsync(sql, params = []) {
    return new Promise((resolve, reject) => {
        connection.query(sql, params, (err, results) => {
            if (err) return reject(err);
            resolve(results);
        });
    });
}

// Middleware: cek login + attach user ke req
const isLogin = (req, res, next) => {
    if (!req.cookies.userSession) return res.redirect('/login');
    try {
        req.user = JSON.parse(req.cookies.userSession);
        next();
    } catch (e) {
        res.clearCookie('userSession');
        return res.redirect('/login');
    }
};

// ==================== ROOT REDIRECT ====================

app.get('/', (req, res) => {
    if (req.cookies.userSession) return res.redirect('/beranda');
    res.render('home');
});

// ==================== AUTH ROUTES ====================

app.get('/login', (req, res) => {
    res.render('login', { error: req.query.error || null, success: req.query.success || null });
});

app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const results = await queryAsync('SELECT * FROM user WHERE username = ?', [username]);
        if (results.length === 0 || !bcrypt.compareSync(password, results[0].password)) {
            return res.redirect('/login?error=invalid');
        }
        // Simpan hanya id & username di cookie (jangan simpan password)
        const user = { id: results[0].id, username: results[0].username };
        res.cookie('userSession', JSON.stringify(user), { maxAge: 30 * 24 * 60 * 60 * 1000, httpOnly: true });
        res.redirect('/beranda');
    } catch (err) {
        console.error(err);
        res.redirect('/login?error=invalid');
    }
});

app.get('/register', (req, res) => {
    res.render('register', { error: req.query.error || null });
});

app.post('/register', async (req, res) => {
    const { username, password } = req.body;
    try {
        const existing = await queryAsync('SELECT id FROM user WHERE username = ?', [username]);
        if (existing.length !== 0) {
            return res.redirect('/register?error=taken');
        }
        const hashed = await bcrypt.hash(password, SALT_ROUNDS);
        await queryAsync('INSERT INTO user (username, password) VALUES (?, ?)', [username, hashed]);
        res.redirect('/login?success=1');
    } catch (err) {
        console.error(err);
        res.redirect('/register');
    }
});

app.post('/logout', (req, res) => {
    res.clearCookie('userSession');
    res.redirect('/login');
});

// ==================== DASHBOARD ====================

app.get('/beranda', isLogin, async (req, res) => {
    try {
        const messages = await queryAsync(
            'SELECT pesan, timestamp FROM chat WHERE username = ? ORDER BY timestamp DESC',
            [req.user.username]
        );
        res.render('beranda', { user: req.user, messages, messageCount: messages.length });
    } catch (err) {
        console.error(err);
        res.render('beranda', { user: req.user, messages: [], messageCount: 0 });
    }
});

// ==================== PROFILE ====================

app.get('/profile', isLogin, async (req, res) => {
    try {
        const results = await queryAsync(
            'SELECT COUNT(*) as total FROM chat WHERE username = ?',
            [req.user.username]
        );
        res.render('profile', { user: req.user, totalMessages: results[0].total });
    } catch (err) {
        console.error(err);
        res.render('profile', { user: req.user, totalMessages: 0 });
    }
});

// ==================== ANONYMOUS MESSAGES ( wildcard route — paling akhir! ) ====================

app.get('/:username', async (req, res) => {
    const username = req.params.username.replace('@', '');
    try {
        const results = await queryAsync('SELECT id FROM user WHERE username = ? LIMIT 1', [username]);
        if (results.length === 0) return res.redirect('/register');
        res.render('send', { username, sent: req.query.sent === '1' });
    } catch (err) {
        console.error(err);
        res.redirect('/login');
    }
});

app.post('/:username', async (req, res) => {
    const username = req.params.username.replace('@', '');
    const { message } = req.body;
    try {
        const results = await queryAsync('SELECT id FROM user WHERE username = ? LIMIT 1', [username]);
        if (results.length === 0) return res.redirect('/register');
        await queryAsync('INSERT INTO chat (username, pesan, timestamp) VALUES (?, ?, NOW())', [username, message]);
        res.redirect(`/${req.params.username}?sent=1`);
    } catch (err) {
        console.error(err);
        res.redirect(`/${req.params.username}`);
    }
});

// ==================== START SERVER ====================

app.listen(3000, () => {
    console.log('Web Telah Siap — http://localhost:3000');
});
     if (err) throw err;
            res.redirect(`/${username}`);
        });
    });
});

app.listen(3000, () => {
    console.log('Web Telah Siap');
});