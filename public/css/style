* { box-sizing: border-box; }
body {
    margin: 0;
    font-family: 'Segoe UI', Tahoma, Arial, sans-serif;
    background: #0f1117;
    color: #e6e6e6;
}
.hidden { display: none !important; }

/* شاشة الدخول */
.login-screen {
    height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: radial-gradient(circle at top, #1a1d29, #0f1117);
}
.login-box {
    background: #171a24;
    padding: 40px;
    border-radius: 16px;
    width: 320px;
    text-align: center;
    box-shadow: 0 10px 40px rgba(0,0,0,0.5);
}
.login-box h1 { font-size: 20px; margin-bottom: 4px; }
.login-box .sub { color: #8b8fa3; font-size: 13px; margin-bottom: 20px; }
.login-box input {
    width: 100%;
    padding: 12px;
    margin-bottom: 12px;
    border-radius: 8px;
    border: 1px solid #2a2e3d;
    background: #0f1117;
    color: #fff;
    font-size: 14px;
}
.login-box button {
    width: 100%;
    padding: 12px;
    border: none;
    border-radius: 8px;
    background: #5865F2;
    color: #fff;
    font-weight: bold;
    cursor: pointer;
    font-size: 14px;
}
.login-box button:hover { background: #4752c4; }
.error-msg { color: #ff5c5c; margin-top: 10px; font-size: 13px; min-height: 16px; }

/* التطبيق */
.app { display: flex; min-height: 100vh; }
.sidebar {
    width: 260px;
    background: #171a24;
    padding: 20px;
    display: flex;
    flex-direction: column;
    border-left: 1px solid #22273a;
}
.sidebar-header h2 { font-size: 18px; margin: 0 0 4px; }
.current-user { color: #8b8fa3; font-size: 12px; margin-bottom: 20px; }
.guild-picker { margin-bottom: 20px; }
.guild-picker label { font-size: 12px; color: #8b8fa3; display: block; margin-bottom: 6px; }
select, input[type=text], input[type=password], textarea {
    width: 100%;
    padding: 10px;
    border-radius: 8px;
    border: 1px solid #2a2e3d;
    background: #0f1117;
    color: #fff;
    font-size: 13px;
    margin-bottom: 10px;
    font-family: inherit;
}
.nav { display: flex; flex-direction: column; gap: 6px; flex: 1; }
.nav-btn {
    text-align: right;
    padding: 12px 14px;
    background: transparent;
    border: none;
    color: #c3c6d4;
    border-radius: 8px;
    cursor: pointer;
    font-size: 14px;
}
.nav-btn:hover { background: #20243350; }
.nav-btn.active { background: #5865F2; color: #fff; }
.logout-btn {
    margin-top: 20px;
    padding: 10px;
    border: 1px solid #2a2e3d;
    background: transparent;
    color: #ff8080;
    border-radius: 8px;
    cursor: pointer;
}
.logout-btn:hover { background: #2a1a1a; }

.content { flex: 1; padding: 30px 40px; overflow-y: auto; }
.page h2 { margin-top: 0; }
.hint { color: #8b8fa3; font-size: 13px; margin-bottom: 20px; }
.hint code { background: #20243a; padding: 2px 6px; border-radius: 4px; }

.card {
    background: #171a24;
    border: 1px solid #22273a;
    border-radius: 12px;
    padding: 24px;
    margin-bottom: 24px;
}
.card h3 { margin-top: 0; }
.card label { display: block; font-size: 13px; color: #b9bcc9; margin-bottom: 6px; margin-top: 12px; }

.placeholders { font-size: 12px; color: #8b8fa3; background: #0f1117; padding: 10px; border-radius: 8px; margin-bottom: 10px; line-height: 1.8; }
.placeholders code { background: #20243a; padding: 2px 6px; border-radius: 4px; color: #9fb3ff; }

.primary-btn {
    padding: 12px 24px;
    border: none;
    border-radius: 8px;
    background: #5865F2;
    color: #fff;
    font-weight: bold;
    cursor: pointer;
    font-size: 14px;
    margin-top: 10px;
}
.primary-btn:hover { background: #4752c4; }
.secondary-btn {
    padding: 8px 16px;
    border: 1px solid #2a2e3d;
    border-radius: 8px;
    background: transparent;
    color: #c3c6d4;
    cursor: pointer;
    font-size: 13px;
}
.secondary-btn:hover { background: #20243350; }

.status-msg { margin-top: 10px; font-size: 13px; min-height: 16px; }
.status-msg.ok { color: #4ade80; }
.status-msg.err { color: #ff5c5c; }

hr { border-color: #22273a; margin: 20px 0; }

.button-config { border: 1px dashed #2a2e3d; border-radius: 10px; padding: 16px; margin-bottom: 12px; }

.ticket-panel-item {
    border: 1px solid #22273a;
    border-radius: 10px;
    padding: 16px;
    margin-bottom: 12px;
}
.ticket-panel-item h4 { margin: 0 0 8px; }
.ticket-btn-chip {
    display: inline-block;
    background: #20243a;
    padding: 4px 10px;
    border-radius: 20px;
    font-size: 12px;
    margin: 3px;
}

.commands-category { margin-bottom: 20px; }
.commands-category h3 { border-bottom: 1px solid #22273a; padding-bottom: 8px; }
.command-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #1c1f2c; font-size: 13px; }
.command-row .cmd-name { color: #9fb3ff; font-family: monospace; }
.command-row .cmd-desc { color: #8b8fa3; }

.users-table { width: 100%; border-collapse: collapse; }
.users-table th, .users-table td { text-align: right; padding: 10px; border-bottom: 1px solid #22273a; font-size: 13px; }
.users-table button { background: transparent; border: 1px solid #2a2e3d; color: #ff8080; border-radius: 6px; padding: 4px 10px; cursor: pointer; }
