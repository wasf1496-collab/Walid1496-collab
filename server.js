const path = require('path');
const fs = require('fs');
const express = require('express');
const session = require('express-session');

const authStore = require('./authStore');
const { requireLogin, requireAdmin } = require('./middleware');

const BOT_API_URL = process.env.BOT_API_URL; // مثال: https://your-bot-host.example.com:4000
const BOT_API_KEY = process.env.BOT_API_KEY; // لازم يطابق نفس المفتاح المحطوط بجهة البوت

if (!BOT_API_URL || !BOT_API_KEY) {
    console.error('❌ لازم تحط BOT_API_URL و BOT_API_KEY بملف .env (نفس المفتاح المحطوط بجهة البوت)');
    process.exit(1);
}

const app = express();
app.use(express.json());
app.use(
    session({
        secret: process.env.DASHBOARD_SESSION_SECRET || 'change-this-secret-please',
        resave: false,
        saveUninitialized: false,
        cookie: { maxAge: 1000 * 60 * 60 * 12 },
    })
);
app.use(express.static(path.join(__dirname, 'public')));

// ---------------------- أداة الاتصال بالـ Bot API ----------------------
async function callBotApi(method, urlPath, body) {
    const res = await fetch(`${BOT_API_URL}${urlPath}`, {
        method,
        headers: {
            'Content-Type': 'application/json',
            'x-bot-api-key': BOT_API_KEY,
        },
        body: body !== undefined ? JSON.stringify(body) : undefined,
    });
    const data = await res.json().catch(() => ({}));
    return { status: res.status, data };
}

function proxy(method, path) {
    return async (req, res) => {
        try {
            const query = req.originalUrl.includes('?') ? '?' + req.originalUrl.split('?')[1] : '';
            const resolvedPath = path(req) + query;
            const { status, data } = await callBotApi(method, resolvedPath, method === 'GET' ? undefined : req.body);
            res.status(status).json(data);
        } catch (err) {
            console.error(err);
            res.status(502).json({ error: 'تعذر الاتصال بجهة البوت — تأكد إن البوت شغال والمنفذ مفتوح' });
        }
    };
}

// ---------------------- تسجيل الدخول (محلي بالكامل، ما يحتاج البوت) ----------------------
app.post('/api/auth/login', (req, res) => {
    const { username, password } = req.body || {};
    const user = authStore.checkLogin(username, password);
    if (!user) return res.status(401).json({ error: 'اسم المستخدم أو كلمة المرور غير صحيحة' });
    req.session.user = user;
    res.json(user);
});

app.post('/api/auth/logout', (req, res) => {
    req.session.destroy(() => res.json({ ok: true }));
});

app.get('/api/auth/me', (req, res) => {
    if (req.session && req.session.user) return res.json(req.session.user);
    res.status(401).json({ error: 'غير مسجل دخول' });
});

// ---------------------- الأوامر المرجعية (محلي، ما يحتاج البوت) ----------------------
app.get('/api/commands', requireLogin, (req, res) => {
    res.sendFile(path.join(__dirname, 'commands_reference.json'));
});

// ---------------------- إدارة المستخدمين (محلي بالكامل) ----------------------
app.get('/api/users', requireAdmin, (req, res) => {
    res.json(authStore.listUsers());
});

app.post('/api/users', requireAdmin, (req, res) => {
    try {
        const { username, password, role } = req.body || {};
        authStore.createUser(username, password, role);
        res.json({ ok: true });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

app.put('/api/users/:username', requireAdmin, (req, res) => {
    try {
        authStore.updateUser(req.params.username, req.body || {});
        res.json({ ok: true });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

app.delete('/api/users/:username', requireAdmin, (req, res) => {
    try {
        if (req.session.user.username === req.params.username) {
            return res.status(400).json({ error: 'لا يمكنك حذف حسابك الحالي' });
        }
        authStore.deleteUser(req.params.username);
        res.json({ ok: true });
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

// ---------------------- كل شي يخص ديسكورد يمر عبر البوت (Proxy) ----------------------
app.get('/api/guilds', requireLogin, proxy('GET', () => '/api/guilds'));
app.get('/api/guilds/:id/channels', requireLogin, proxy('GET', (req) => `/api/guilds/${req.params.id}/channels`));
app.get('/api/guilds/:id/roles', requireLogin, proxy('GET', (req) => `/api/guilds/${req.params.id}/roles`));

app.get('/api/guilds/:id/welcome', requireLogin, proxy('GET', (req) => `/api/guilds/${req.params.id}/welcome`));
app.post('/api/guilds/:id/welcome', requireLogin, proxy('POST', (req) => `/api/guilds/${req.params.id}/welcome`));

app.get('/api/guilds/:id/tickets', requireLogin, proxy('GET', (req) => `/api/guilds/${req.params.id}/tickets`));
app.post('/api/guilds/:id/tickets/panel', requireLogin, proxy('POST', (req) => `/api/guilds/${req.params.id}/tickets/panel`));
app.post(
    '/api/guilds/:id/tickets/panel/:channelId/:messageId/button',
    requireLogin,
    proxy('POST', (req) => `/api/guilds/${req.params.id}/tickets/panel/${req.params.channelId}/${req.params.messageId}/button`)
);
app.post(
    '/api/guilds/:id/tickets/panel/:channelId/:messageId/select',
    requireLogin,
    proxy('POST', (req) => `/api/guilds/${req.params.id}/tickets/panel/${req.params.channelId}/${req.params.messageId}/select`)
);

// أي مسار غير معروف (وليس API) يرجع لواجهة الموقع (SPA)
app.get('*', (req, res) => {
    if (req.path.startsWith('/api/')) return res.status(404).json({ error: 'غير موجود' });
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || process.env.DASHBOARD_PORT || 3000;
app.listen(PORT, () => {
    console.log(`[موقع الداش بورد] شغال على المنفذ ${PORT}`);
});
