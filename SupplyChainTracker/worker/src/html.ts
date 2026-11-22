import type { AuthUser } from "./middleware";

function esc(value: unknown): string {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function base(title: string, body: string): string {
  return `<!doctype html>
<html lang="ko">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)} — SupplyChainTracker</title>
<style>
  :root { color-scheme: light; }
  * { box-sizing: border-box; }
  body { margin: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; background: #f5f6f8; color: #1c2430; }
  .wrap { max-width: 640px; margin: 0 auto; padding: 32px 20px 64px; }
  .card { background: #fff; border: 1px solid #e3e7ee; border-radius: 10px; padding: 24px; margin-bottom: 16px; }
  h1 { font-size: 22px; margin: 0 0 8px; }
  h2 { font-size: 16px; margin: 0 0 12px; }
  .muted { color: #6b7684; font-size: 13px; }
  label { display: block; font-size: 13px; margin: 12px 0 4px; color: #3a4553; }
  input { width: 100%; padding: 10px 12px; border: 1px solid #cdd5e0; border-radius: 8px; font-size: 15px; }
  button { margin-top: 16px; padding: 10px 18px; border: 0; border-radius: 8px; background: #2563eb; color: #fff; font-size: 15px; cursor: pointer; }
  button.secondary { background: #6b7684; }
  button.danger { background: #dc2626; }
  button.small { margin: 0 4px 0 0; padding: 6px 10px; font-size: 13px; }
  a { color: #2563eb; }
  .row { display: flex; justify-content: space-between; align-items: center; gap: 8px; }
  .badge { font-size: 12px; padding: 3px 8px; border-radius: 999px; background: #eef2f7; color: #4a5568; }
  .badge.admin { background: #dcfce7; color: #166534; }
  .badge.pending { background: #fef9c3; color: #854d0e; }
  .badge.member { background: #dbeafe; color: #1e40af; }
  .badge.rejected { background: #fee2e2; color: #991b1b; }
  table { width: 100%; border-collapse: collapse; font-size: 14px; }
  th, td { text-align: left; padding: 8px 6px; border-bottom: 1px solid #edf0f5; }
  .msg { margin-top: 12px; font-size: 14px; white-space: pre-wrap; }
  .msg.error { color: #dc2626; }
  .msg.ok { color: #16a34a; }
</style>
</head>
<body>
<div class="wrap">
${body}
</div>
</body>
</html>`;
}

export function indexPage(): string {
  return base("홈", `
<div class="card">
  <h1>SupplyChainTracker</h1>
  <p class="muted">미국 공공 정부 공급망 추적기 — 한국 공급망 기반 미국 연방정부 조달 플랫폼</p>
  <div class="row" style="justify-content:flex-start">
    <a href="/login"><button>로그인</button></a>
    <a href="/signup"><button class="secondary">회원 가입</button></a>
  </div>
  <p class="muted" style="margin-top:16px">가입 신청 후 관리자 승인을 받아야 로그인할 수 있습니다.</p>
</div>`);
}

export function loginPage(): string {
  return base("로그인", `
<div class="card">
  <h1>로그인</h1>
  <form id="form">
    <label for="email">이메일</label>
    <input id="email" type="email" autocomplete="username" required>
    <label for="password">비밀번호</label>
    <input id="password" type="password" autocomplete="current-password" required>
    <button type="submit">로그인</button>
  </form>
  <div class="msg" id="msg"></div>
  <p class="muted" style="margin-top:16px">계정이 없으면 <a href="/signup">회원 가입</a></p>
</div>
<script>
document.getElementById('form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const msg = document.getElementById('msg');
  msg.className = 'msg';
  msg.textContent = '';
  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: document.getElementById('email').value,
      password: document.getElementById('password').value
    })
  });
  const data = await res.json();
  if (!res.ok) {
    msg.className = 'msg error';
    msg.textContent = data.error || '로그인에 실패했습니다.';
    return;
  }
  location.href = '/dashboard';
});
</script>`);
}

export function signupPage(): string {
  return base("회원 가입", `
<div class="card">
  <h1>회원 가입 신청</h1>
  <form id="form">
    <label for="email">이메일</label>
    <input id="email" type="email" autocomplete="username" required>
    <label for="password">비밀번호 (8자 이상)</label>
    <input id="password" type="password" autocomplete="new-password" minlength="8" required>
    <button type="submit">가입 신청</button>
  </form>
  <div class="msg" id="msg"></div>
  <p class="muted" style="margin-top:16px">이미 계정이 있으면 <a href="/login">로그인</a></p>
</div>
<script>
document.getElementById('form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const msg = document.getElementById('msg');
  msg.className = 'msg';
  msg.textContent = '';
  const res = await fetch('/api/auth/signup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: document.getElementById('email').value,
      password: document.getElementById('password').value
    })
  });
  const data = await res.json();
  msg.className = res.ok ? 'msg ok' : 'msg error';
  msg.textContent = data.message || data.error || '처리되었습니다.';
});
</script>`);
}

export function dashboardPage(user: AuthUser): string {
  const changePassword = user.mustChangePassword
    ? `
<div class="card">
  <h2>비밀번호 변경 필수</h2>
  <p class="muted">최초 로그인입니다. 계속하려면 비밀번호를 변경하세요.</p>
  <form id="pwform">
    <label for="current">현재 비밀번호</label>
    <input id="current" type="password" autocomplete="current-password" required>
    <label for="next">새 비밀번호 (8자 이상)</label>
    <input id="next" type="password" autocomplete="new-password" minlength="8" required>
    <button type="submit">비밀번호 변경</button>
  </form>
  <div class="msg" id="pwmsg"></div>
</div>
<script>
document.getElementById('pwform').addEventListener('submit', async (e) => {
  e.preventDefault();
  const msg = document.getElementById('pwmsg');
  msg.className = 'msg';
  msg.textContent = '';
  const res = await fetch('/api/auth/change-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      currentPassword: document.getElementById('current').value,
      newPassword: document.getElementById('next').value
    })
  });
  const data = await res.json();
  if (!res.ok) { msg.className = 'msg error'; msg.textContent = data.error || '변경 실패'; return; }
  msg.className = 'msg ok';
  msg.textContent = data.message;
  setTimeout(() => location.reload(), 1000);
});
</script>`
    : "";

  const adminPanel = user.role === "admin"
    ? `
<div class="card">
  <h2>가입 승인 대기</h2>
  <table id="users"><tbody><tr><td colspan="3">불러오는 중…</td></tr></tbody></table>
  <div class="msg" id="umsg"></div>
</div>
<script>
async function loadUsers() {
  const res = await fetch('/api/admin/users');
  const data = await res.json();
  const tbody = document.querySelector('#users tbody');
  const pending = (data.users || []).filter((u) => u.role === 'pending');
  if (pending.length === 0) {
    tbody.innerHTML = '<tr><td colspan="3">승인 대기 중인 가입 신청이 없습니다.</td></tr>';
    return;
  }
  tbody.innerHTML = pending.map((u) =>
    '<tr><td>' + esc2(u.email) + '</td><td><span class="badge pending">' + esc2(u.role) + '</span></td>' +
    '<td style="text-align:right">' +
    '<button class="small" onclick="act(' + u.id + ', \'approve\')">승인</button>' +
    '<button class="small danger" onclick="act(' + u.id + ', \'reject\')">거부</button>' +
    '</td></tr>'
  ).join('');
}
function esc2(v) { return String(v ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
async function act(id, action) {
  const res = await fetch('/api/admin/users/' + id + '/' + action, { method: 'POST' });
  const msg = document.getElementById('umsg');
  msg.className = res.ok ? 'msg ok' : 'msg error';
  msg.textContent = res.ok ? '처리되었습니다.' : '처리에 실패했습니다.';
  loadUsers();
}
loadUsers();
</script>`
    : "";

  return base("대시보드", `
<div class="card">
  <div class="row">
    <div>
      <h1>대시보드</h1>
      <p class="muted">${esc(user.email)}</p>
    </div>
    <div>
      <span class="badge ${esc(user.role)}">${esc(user.role)}</span>
      <form id="logout" style="display:inline" method="post" action="/api/auth/logout"></form>
      <button class="small secondary" onclick="fetch('/api/auth/logout',{method:'POST'}).then(()=>location.href='/login')">로그아웃</button>
    </div>
  </div>
</div>
${changePassword}
${adminPanel}
<div class="card">
  <h2>기능 준비 중</h2>
  <p class="muted">공고 수집·분석·매칭 기능은 개발 로드맵(M2~M6)에 따라 추가됩니다.</p>
</div>`);
}
