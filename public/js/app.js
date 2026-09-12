let currentGuildId = null;
let currentUser = null;
let rolesCache = [];
let categoriesCache = [];

// ---------------------- أدوات مساعدة ----------------------
async function api(method, url, body) {
    const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: body ? JSON.stringify(body) : undefined,
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || 'صار خطأ');
    return data;
}

function showStatus(elId, message, ok = true) {
    const el = document.getElementById(elId);
    el.textContent = message;
    el.className = 'status-msg ' + (ok ? 'ok' : 'err');
    setTimeout(() => { el.textContent = ''; }, 4000);
}

// ---------------------- تسجيل الدخول ----------------------
document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = document.getElementById('login-username').value.trim();
    const password = document.getElementById('login-password').value;
    try {
        const user = await api('POST', '/api/auth/login', { username, password });
        currentUser = user;
        await startApp();
    } catch (err) {
        document.getElementById('login-error').textContent = err.message;
    }
});

document.getElementById('logout-btn').addEventListener('click', async () => {
    await api('POST', '/api/auth/logout');
    location.reload();
});

async function checkSession() {
    try {
        currentUser = await api('GET', '/api/auth/me');
        return true;
    } catch (e) {
        return false;
    }
}

// ---------------------- بدء التطبيق ----------------------
async function startApp() {
    document.getElementById('login-screen').classList.add('hidden');
    document.getElementById('app').classList.remove('hidden');
    document.getElementById('current-user').textContent = `${currentUser.username} (${currentUser.role === 'admin' ? 'أدمن' : 'مستخدم'})`;

    if (currentUser.role !== 'admin') {
        document.getElementById('nav-users').style.display = 'none';
    }

    await loadGuilds();
    setupNav();
    await loadWelcomePage();
}

function setupNav() {
    document.querySelectorAll('.nav-btn').forEach((btn) => {
        btn.addEventListener('click', async () => {
            document.querySelectorAll('.nav-btn').forEach((b) => b.classList.remove('active'));
            btn.classList.add('active');
            document.querySelectorAll('.page').forEach((p) => p.classList.add('hidden'));
            const page = btn.dataset.page;
            document.getElementById('page-' + page).classList.remove('hidden');

            if (page === 'welcome') await loadWelcomePage();
            if (page === 'tickets') await loadTicketsPage();
            if (page === 'commands') await loadCommandsPage();
            if (page === 'users') await loadUsersPage();
        });
    });
}

// ---------------------- السيرفرات ----------------------
async function loadGuilds() {
    const guilds = await api('GET', '/api/guilds');
    const select = document.getElementById('guild-select');
    select.innerHTML = guilds.map((g) => `<option value="${g.id}">${escapeHtml(g.name)}</option>`).join('');
    currentGuildId = guilds[0]?.id || null;
    select.addEventListener('change', async () => {
        currentGuildId = select.value;
        const activePage = document.querySelector('.nav-btn.active').dataset.page;
        if (activePage === 'welcome') await loadWelcomePage();
        if (activePage === 'tickets') await loadTicketsPage();
    });
}

async function loadChannelsInto(selectEl, type) {
    if (!currentGuildId) return;
    const channels = await api('GET', `/api/guilds/${currentGuildId}/channels?type=${type || 'text'}`);
    selectEl.innerHTML = channels.map((c) => `<option value="${c.id}">#${escapeHtml(c.name)}</option>`).join('');
    return channels;
}

async function loadRoles() {
    if (!currentGuildId) return [];
    rolesCache = await api('GET', `/api/guilds/${currentGuildId}/roles`);
    return rolesCache;
}

async function loadCategories() {
    if (!currentGuildId) return [];
    categoriesCache = await api('GET', `/api/guilds/${currentGuildId}/channels?type=category`);
    return categoriesCache;
}

function escapeHtml(str) {
    return String(str).replace(/[&<>"']/g, (m) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]));
}

// ---------------------- صفحة الترحيب ----------------------
async function loadWelcomePage() {
    if (!currentGuildId) return;
    const channelSelect = document.getElementById('welcome-channel');
    await loadChannelsInto(channelSelect, 'text');

    const roles = await loadRoles();
    const roleSelect = document.getElementById('welcome-role');
    roleSelect.innerHTML = '<option value="">بدون رتبة</option>' + roles.map((r) => `<option value="${r.id}">${escapeHtml(r.name)}</option>`).join('');

    const settings = await api('GET', `/api/guilds/${currentGuildId}/welcome`);
    if (settings.channelId) channelSelect.value = settings.channelId;
    if (settings.roleId) roleSelect.value = settings.roleId;
    document.getElementById('welcome-image').value = settings.image || '';
    document.getElementById('welcome-message').value = settings.message || '';
}

document.getElementById('save-welcome').addEventListener('click', async () => {
    try {
        await api('POST', `/api/guilds/${currentGuildId}/welcome`, {
            channelId: document.getElementById('welcome-channel').value,
            roleId: document.getElementById('welcome-role').value,
            image: document.getElementById('welcome-image').value.trim(),
            message: document.getElementById('welcome-message').value.trim(),
        });
        showStatus('welcome-status', '✅ تم حفظ إعدادات الترحيب', true);
    } catch (err) {
        showStatus('welcome-status', '❌ ' + err.message, false);
    }
});

// ---------------------- صفحة التذاكر ----------------------
function buttonConfigTemplate(prefix) {
    return `
        <label>اسم الزر</label>
        <input type="text" id="${prefix}-label" placeholder="افتح تذكرة">

        <label>لون الزر</label>
        <select id="${prefix}-color">
            <option value="blue">أزرق</option>
            <option value="green">أخضر</option>
            <option value="red">أحمر</option>
            <option value="gray">رمادي</option>
        </select>

        <label>إيموجي (اختياري)</label>
        <input type="text" id="${prefix}-emoji" placeholder="🎫">

        <label>رتبة الدعم</label>
        <select id="${prefix}-role"></select>

        <label>الكاتيجوري</label>
        <select id="${prefix}-category"></select>

        <label>نوع رسالة الداخل</label>
        <select id="${prefix}-type">
            <option value="embed">Embed</option>
            <option value="message">رسالة عادية</option>
        </select>

        <label>سؤال سبب فتح التذكرة؟</label>
        <select id="${prefix}-ask">
            <option value="off">بدون سؤال</option>
            <option value="on">اسأل عن السبب</option>
        </select>

        <label>رسالة الترحيب داخل التذكرة</label>
        <textarea id="${prefix}-internal" rows="2" placeholder="أهلاً بك، فريق الدعم راح يجاوبك قريباً"></textarea>
    `;
}

function fillButtonSelects(prefix) {
    document.getElementById(`${prefix}-role`).innerHTML = rolesCache.map((r) => `<option value="${r.id}">${escapeHtml(r.name)}</option>`).join('');
    document.getElementById(`${prefix}-category`).innerHTML = categoriesCache.map((c) => `<option value="${c.id}">${escapeHtml(c.name)}</option>`).join('');
}

function readButtonConfig(prefix) {
    return {
        label: document.getElementById(`${prefix}-label`).value.trim(),
        color: document.getElementById(`${prefix}-color`).value,
        emoji: document.getElementById(`${prefix}-emoji`).value.trim(),
        supportRoleId: document.getElementById(`${prefix}-role`).value,
        categoryId: document.getElementById(`${prefix}-category`).value,
        type: document.getElementById(`${prefix}-type`).value,
        ask: document.getElementById(`${prefix}-ask`).value,
        internal: document.getElementById(`${prefix}-internal`).value.trim(),
    };
}

async function loadTicketsPage() {
    if (!currentGuildId) return;
    await loadChannelsInto(document.getElementById('ticket-panel-channel'), 'text');
    await loadRoles();
    await loadCategories();

    document.getElementById('ticket-first-button').innerHTML = buttonConfigTemplate('first-btn');
    fillButtonSelects('first-btn');

    await renderTicketPanelsList();
}

document.getElementById('create-ticket-panel').addEventListener('click', async () => {
    try {
        const button = readButtonConfig('first-btn');
        await api('POST', `/api/guilds/${currentGuildId}/tickets/panel`, {
            channelId: document.getElementById('ticket-panel-channel').value,
            embed: {
                title: document.getElementById('ticket-panel-title').value.trim(),
                description: document.getElementById('ticket-panel-desc').value.trim(),
                color: document.getElementById('ticket-panel-color').value.trim() || '#808080',
                image: document.getElementById('ticket-panel-image').value.trim(),
                thumbnail: document.getElementById('ticket-panel-thumb').checked,
            },
            button,
        });
        showStatus('ticket-create-status', '✅ تم إنشاء اللوحة بنجاح', true);
        await renderTicketPanelsList();
    } catch (err) {
        showStatus('ticket-create-status', '❌ ' + err.message, false);
    }
});

async function renderTicketPanelsList() {
    const panels = await api('GET', `/api/guilds/${currentGuildId}/tickets`);
    const container = document.getElementById('ticket-panels-list');
    if (panels.length === 0) {
        container.innerHTML = '<p class="hint">ما فيه لوحات تذاكر منشأة من الموقع بعد.</p>';
        return;
    }
    container.innerHTML = panels.map((p, idx) => `
        <div class="ticket-panel-item">
            <h4>#${escapeHtml(p.channelName)} ${p.isSelect ? '(قائمة اختيار)' : ''}</h4>
            <div>${p.buttons.map((b) => `<span class="ticket-btn-chip">${escapeHtml(b.label)}</span>`).join('')}</div>
            <div style="margin-top:12px; display:flex; gap:10px;">
                ${!p.isSelect ? `<button class="secondary-btn" data-action="add-btn" data-idx="${idx}">+ إضافة زر</button>` : ''}
                ${!p.isSelect ? `<button class="secondary-btn" data-action="to-select" data-idx="${idx}">تحويل لقائمة اختيار</button>` : ''}
            </div>
            <div id="panel-extra-${idx}"></div>
        </div>
    `).join('');

    container.querySelectorAll('[data-action="add-btn"]').forEach((btn) => {
        btn.addEventListener('click', () => showAddButtonForm(panels[+btn.dataset.idx], +btn.dataset.idx));
    });
    container.querySelectorAll('[data-action="to-select"]').forEach((btn) => {
        btn.addEventListener('click', () => convertToSelect(panels[+btn.dataset.idx]));
    });
}

function showAddButtonForm(panel, idx) {
    const holder = document.getElementById(`panel-extra-${idx}`);
    const prefix = `add-btn-${idx}`;
    holder.innerHTML = `<hr>${buttonConfigTemplate(prefix)}<button class="primary-btn" id="submit-${prefix}">إضافة الزر</button><div class="status-msg" id="status-${prefix}"></div>`;
    fillButtonSelects(prefix);
    document.getElementById(`submit-${prefix}`).addEventListener('click', async () => {
        try {
            const button = readButtonConfig(prefix);
            await api('POST', `/api/guilds/${currentGuildId}/tickets/panel/${panel.channelId}/${panel.messageId}/button`, button);
            showStatus(`status-${prefix}`, '✅ تمت الإضافة', true);
            await renderTicketPanelsList();
        } catch (err) {
            showStatus(`status-${prefix}`, '❌ ' + err.message, false);
        }
    });
}

async function convertToSelect(panel) {
    if (!confirm('تحويل هذي اللوحة لقائمة اختيار؟ ما تقدر ترجعها زر بعدها من الموقع.')) return;
    try {
        await api('POST', `/api/guilds/${currentGuildId}/tickets/panel/${panel.channelId}/${panel.messageId}/select`, { descriptions: [] });
        await renderTicketPanelsList();
    } catch (err) {
        alert(err.message);
    }
}

// ---------------------- صفحة الأوامر ----------------------
async function loadCommandsPage() {
    const commands = await api('GET', '/api/commands');
    const container = document.getElementById('commands-list');
    container.innerHTML = Object.entries(commands).map(([category, cmds]) => `
        <div class="commands-category">
            <h3>${escapeHtml(category)}</h3>
            ${cmds.map((c) => `<div class="command-row"><span class="cmd-name">/${escapeHtml(c.name)}</span><span class="cmd-desc">${escapeHtml(c.description)}</span></div>`).join('')}
        </div>
    `).join('');
}

// ---------------------- صفحة المستخدمين ----------------------
async function loadUsersPage() {
    const users = await api('GET', '/api/users');
    const body = document.getElementById('users-table-body');
    body.innerHTML = users.map((u) => `
        <tr>
            <td>${escapeHtml(u.username)}</td>
            <td>${u.role === 'admin' ? 'أدمن' : 'مستخدم عادي'}</td>
            <td><button data-username="${escapeHtml(u.username)}">حذف</button></td>
        </tr>
    `).join('');
    body.querySelectorAll('button').forEach((btn) => {
        btn.addEventListener('click', async () => {
            if (!confirm(`حذف المستخدم ${btn.dataset.username}؟`)) return;
            try {
                await api('DELETE', `/api/users/${btn.dataset.username}`);
                await loadUsersPage();
            } catch (err) {
                alert(err.message);
            }
        });
    });
}

document.getElementById('create-user-btn').addEventListener('click', async () => {
    try {
        await api('POST', '/api/users', {
            username: document.getElementById('new-username').value.trim(),
            password: document.getElementById('new-password').value,
            role: document.getElementById('new-role').value,
        });
        document.getElementById('new-username').value = '';
        document.getElementById('new-password').value = '';
        showStatus('user-create-status', '✅ تمت الإضافة', true);
        await loadUsersPage();
    } catch (err) {
        showStatus('user-create-status', '❌ ' + err.message, false);
    }
});

// ---------------------- الإقلاع ----------------------
(async () => {
    const loggedIn = await checkSession();
    if (loggedIn) await startApp();
})();
