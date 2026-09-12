// إدارة مستخدمي لوحة التحكم (منفصلة تماماً عن حسابات ديسكورد)
// نستخدم crypto المدمجة في Node.js لتشفير كلمات المرور (scrypt) بدون أي مكتبة خارجية

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const USERS_FILE = path.join(__dirname, 'users.json');

function hashPassword(password, salt = crypto.randomBytes(16).toString('hex')) {
    const hash = crypto.scryptSync(password, salt, 64).toString('hex');
    return `${salt}:${hash}`;
}

function verifyPassword(password, stored) {
    try {
        const [salt, hash] = stored.split(':');
        const attempt = crypto.scryptSync(password, salt, 64).toString('hex');
        const a = Buffer.from(hash, 'hex');
        const b = Buffer.from(attempt, 'hex');
        if (a.length !== b.length) return false;
        return crypto.timingSafeEqual(a, b);
    } catch (e) {
        return false;
    }
}

function ensureFile() {
    if (!fs.existsSync(USERS_FILE)) {
        const defaultUser = process.env.DASHBOARD_ADMIN_USER || 'admin';
        const defaultPass = process.env.DASHBOARD_ADMIN_PASS || 'admin123';
        const users = {
            [defaultUser]: { password: hashPassword(defaultPass), role: 'admin' }
        };
        fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
        console.log('========================================');
        console.log('[لوحة التحكم] تم إنشاء حساب أدمن افتراضي:');
        console.log(`  اسم المستخدم: ${defaultUser}`);
        console.log(`  كلمة المرور : ${defaultPass}`);
        console.log('  غيّر كلمة المرور فوراً بعد أول دخول من صفحة "المستخدمين"');
        console.log('========================================');
    }
}

function loadUsers() {
    ensureFile();
    return JSON.parse(fs.readFileSync(USERS_FILE, 'utf8'));
}

function saveUsers(users) {
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
}

function findUser(username) {
    const users = loadUsers();
    return users[username] ? { username, ...users[username] } : null;
}

function checkLogin(username, password) {
    const user = findUser(username);
    if (!user) return null;
    if (!verifyPassword(password, user.password)) return null;
    return { username: user.username, role: user.role };
}

function listUsers() {
    const users = loadUsers();
    return Object.keys(users).map((u) => ({ username: u, role: users[u].role }));
}

function createUser(username, password, role = 'user') {
    if (!username || !password) throw new Error('اسم المستخدم وكلمة المرور مطلوبين');
    const users = loadUsers();
    if (users[username]) throw new Error('اسم المستخدم موجود مسبقاً');
    users[username] = { password: hashPassword(password), role: role === 'admin' ? 'admin' : 'user' };
    saveUsers(users);
}

function updateUser(username, { password, role } = {}) {
    const users = loadUsers();
    if (!users[username]) throw new Error('المستخدم غير موجود');
    if (password) users[username].password = hashPassword(password);
    if (role) users[username].role = role === 'admin' ? 'admin' : 'user';
    saveUsers(users);
}

function countAdmins() {
    const users = loadUsers();
    return Object.values(users).filter((u) => u.role === 'admin').length;
}

function deleteUser(username) {
    const users = loadUsers();
    if (!users[username]) throw new Error('المستخدم غير موجود');
    if (users[username].role === 'admin' && countAdmins() <= 1) {
        throw new Error('لا يمكن حذف آخر حساب أدمن بالنظام');
    }
    delete users[username];
    saveUsers(users);
}

module.exports = {
    checkLogin,
    listUsers,
    createUser,
    updateUser,
    deleteUser,
    findUser,
    countAdmins,
};
