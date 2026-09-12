function requireLogin(req, res, next) {
    if (req.session && req.session.user) return next();
    return res.status(401).json({ error: 'يجب تسجيل الدخول أولاً' });
}

function requireAdmin(req, res, next) {
    if (req.session && req.session.user && req.session.user.role === 'admin') return next();
    return res.status(403).json({ error: 'هذا الإجراء يتطلب صلاحية أدمن' });
}

module.exports = { requireLogin, requireAdmin };
