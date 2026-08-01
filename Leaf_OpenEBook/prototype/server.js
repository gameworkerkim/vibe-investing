// 적정 기술 서버 — 캡처 알림 + 서버 워터마크
// npm install express sharp

const express = require('express');
const path = require('path');
const fs = require('fs');
const sharp = require('sharp');

const app = express();

app.disable('x-powered-by');
app.use(express.json());

// ── 사진 디렉토리 ──
const PHOTOS_DIR = path.join(__dirname, 'photos');

// ══════════════════════════════════════════════
// 0. 보안 헤더 — 모든 응답에 적용 (express.static 보다 먼저)
//    ※ 순서 중요: 아래 static 보다 앞에 있어야 정적 파일에도 적용됨
// ══════════════════════════════════════════════
app.use((req, res, next) => {
  res.set('X-Frame-Options', 'DENY');
  res.set('X-Content-Type-Options', 'nosniff');
  res.set('Referrer-Policy', 'no-referrer');
  res.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  next();
});

// ══════════════════════════════════════════════
// 0-1. 정적 파일 — photos/ 는 절대 서빙하지 않음 (원본 노출 방지)
//      index.html, favicon 등 프론트 리소스만 허용
//      ※ express.static 보다 먼저 평가해야 파일 서빙 이전에 차단됨
// ══════════════════════════════════════════════
app.use((req, res, next) => {
  if (req.path.startsWith('/photos/')) return res.status(404).end();
  next();
});
app.use(express.static(path.join(__dirname), {
  index: 'index.html',
  dotfiles: 'deny',
}));

// ══════════════════════════════════════════════
// 1. 서버 사이드 워터마크 — 브라우저에서 절대 제거 불가
// ══════════════════════════════════════════════
app.get('/api/watermarked-image', async (req, res) => {
  try {
    const id = parseInt(req.query.id, 10) || 0;
    const uid = req.query.uid || 'unknown';

    // photos 디렉토리에서 이미지 찾기
    const files = fs.readdirSync(PHOTOS_DIR)
      .filter(f => /\.(jpg|jpeg|png|webp|avif)$/i.test(f))
      .sort();

    if (!files[id]) return res.status(404).end();

    const filePath = path.join(PHOTOS_DIR, files[id]);

    // 로그: 누가 몇 번 이미지를 봤는지
    console.log(`[VIEW] uid=${uid} image=${files[id]} ip=${req.ip} time=${new Date().toISOString()}`);

    // 비공개: 접근 횟수 과다 감지 (캡처봇 등)
    // → Redis / DB로 Rate limit 권장

    // Sharp로 워터마크 합성
    const metadata = await sharp(filePath).metadata();
    const w = metadata.width;
    const h = metadata.height;

    // SVG 워터마크 생성 (반복 패턴)
    const fontSize = Math.max(18, Math.min(w, h) * 0.03);
    const stepX = fontSize * 10;
    const stepY = fontSize * 5;
    const cols = Math.ceil(w / stepX) + 1;
    const rows = Math.ceil(h / stepY) + 1;

    let svgTexts = '';
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const x = col * stepX - stepX / 2;
        const y = row * stepY - stepY / 2;
        const opacity = 0.04 + (Math.random() * 0.02);
        svgTexts += `<text x="${x}" y="${y}" font-size="${fontSize}" fill="white" fill-opacity="${opacity}" font-family="Arial" font-weight="bold" transform="rotate(-25, ${x}, ${y})">${uid} | 유출금지</text>`;
      }
    }

    const svgWatermark = `<svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">${svgTexts}</svg>`;

    const watermarked = await sharp(filePath)
      .composite([{ input: Buffer.from(svgWatermark), top: 0, left: 0 }])
      .jpeg({ quality: 85 })
      .toBuffer();

    res.set('Content-Type', 'image/jpeg');
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate');
    res.send(watermarked);

  } catch (err) {
    console.error(err);
    res.status(500).end();
  }
});

// ══════════════════════════════════════════════
// 2. 캡처 시도 알림 수신
// ══════════════════════════════════════════════
const captureLog = [];

app.post('/api/capture-alert', (req, res) => {
  const { page, image, timestamp, userAgent, detail } = req.body;

  const entry = {
    page, image, timestamp, detail,
    ip: req.ip,
    userAgent: (userAgent || '').substring(0, 200),
  };

  captureLog.push(entry);
  console.log(`[CAPTURE ALERT] ${JSON.stringify(entry)}`);

  // 실서비스: Slack/Discord 웹훅, 이메일 알림 등 연동
  // sendAlertToAdmin(entry);

  res.json({ ok: true });
});

// ── 로그 조회 (관리자용) ──
app.get('/api/capture-log', (req, res) => {
  res.json(captureLog.slice(-100));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`화보집 서버: http://localhost:${PORT}`);
});
