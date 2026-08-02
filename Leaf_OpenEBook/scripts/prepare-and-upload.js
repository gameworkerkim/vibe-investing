#!/usr/bin/env node
// Leaf — 이미지 준비 + R2 업로드 스크립트 (보안 로드맵 2단계: 변형 배정)
//
// 원본을 리사이즈(≤max-width)한 뒤, 워터마크 격자 오프셋이 서로 다른
// N개(기본 16) 변형을 사전 생성해 R2에 업로드한다.
// - 원본(고해상도, 서빙 금지): origin/{album}/{page}.jpg
// - 웹뷰 변형(서빙용):        images/{album}/{page}/{variant}.jpg
// Worker가 세션 기준으로 변형을 결정적으로 선택 → 유출본에서 열람자 역추적.
//
// 사용법:
//   node prepare-and-upload.js --album 1 --source ./photobook --watermark "Leaf | 문구"
//   node prepare-and-upload.js --album 1 --samples 3 --variants 8
//
// 옵션:
//   --album <id>     R2 키의 앨범 id (기본 1)
//   --source <dir>   원본 이미지 폴더 (jpg/png/webp)
//   --samples <n>    원본 없을 때 샘플 n장 생성
//   --watermark <t>  워터마크 본문 텍스트
//   --variants <n>   페이지당 변형 수 (기본 16, 저장 N배)
//   --max-width <px> 서빙용 변형의 장변 한도 (기본 900)
//   --out <dir>      처리 결과 임시 폴더 (기본 ./photobook-out)
//   --no-upload      R2 업로드 생략

import sharp from 'sharp';
import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const BUCKET = 'leaf-images';
const DEFAULT_VARIANTS = 16;
const DEFAULT_MAX_WIDTH = 900;
const JPEG_QUALITY = 82;
const UPLOAD_CONCURRENCY = 3;
const UPLOAD_RETRIES = 3;
// npx 는 비대화형 스폰에서 실패하는 경우가 있어 로컬 설치 바이너리를 직접 사용
const WRANGLER = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  'node_modules',
  '.bin',
  'wrangler'
);

const uploadTasks = [];

function uploadToR2(key, file) {
  uploadTasks.push({ key, file });
}

async function runUploads() {
  console.log(`  … R2 업로드 ${uploadTasks.length}건 (동시 ${UPLOAD_CONCURRENCY})`);
  let done = 0;
  const put = (key, file) =>
    new Promise((resolve, reject) => {
      const args = ['r2', 'object', 'put', `${BUCKET}/${key}`, '--file', file, '--remote'];
      const p = spawn(WRANGLER, args, { stdio: 'ignore' });
      p.on('close', (code) => (code === 0 ? resolve() : reject(new Error(`put fail ${key} (${code})`))));
      p.on('error', reject);
    });

  const worker = async (task) => {
    for (let attempt = 1; attempt <= UPLOAD_RETRIES; attempt++) {
      try {
        await put(task.key, task.file);
        break;
      } catch (err) {
        if (attempt === UPLOAD_RETRIES) throw err;
        await new Promise((r) => setTimeout(r, 800 * attempt));
      }
    }
    done++;
    if (done % 25 === 0) console.log(`  … ${done}/${uploadTasks.length}`);
  };

  const queue = [...uploadTasks];
  const runners = Array.from({ length: Math.min(UPLOAD_CONCURRENCY, queue.length) }, async () => {
    while (queue.length) {
      const task = queue.shift();
      await worker(task);
    }
  });
  await Promise.all(runners);
  console.log(`  ↑ 업로드 완료 ${uploadTasks.length}건`);
}

function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--album') args.album = argv[++i];
    else if (a === '--source') args.source = argv[++i];
    else if (a === '--samples') args.samples = Number(argv[++i]) || 0;
    else if (a === '--watermark') args.watermark = argv[++i];
    else if (a === '--variants') args.variants = Number(argv[++i]) || 0;
    else if (a === '--max-width') args.maxWidth = Number(argv[++i]) || 0;
    else if (a === '--out') args.out = argv[++i];
    else if (a === '--no-upload') args.noUpload = true;
  }
  return args;
}

// 결정적 의사난수 (변형별·행별 오프셋 시프트용)
function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function readImages(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir)
    .filter((f) => /\.(jpe?g|png|webp)$/i.test(f))
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
}

// v: 변형 인덱스. 격자 오프셋이 v에 따라 달라짐 (결정적).
function svgWatermark(w, h, text, v) {
  const rng = mulberry32(v * 2654435761 + 0x9e3779b9);
  const fontSize = Math.max(14, Math.min(w, h) * 0.026);
  const stepX = fontSize * Math.max(13, text.length * 0.5);
  const stepY = fontSize * 5.2;
  const cols = Math.ceil(w / stepX) + 1;
  const rows = Math.ceil(h / stepY) + 1;

  let texts = '';
  for (let row = 0; row < rows; row++) {
    const shiftX = Math.floor(rng() * stepX * 0.85); // 행마다 시프트 → 세로 크롭 내성
    for (let col = 0; col < cols; col++) {
      const x = col * stepX + shiftX - stepX / 2;
      const y = row * stepY - stepY / 2;
      const opacity = 0.05 + rng() * 0.03;
      texts += `<text x="${x}" y="${y}" font-size="${fontSize}" fill="white" fill-opacity="${opacity}" font-family="Arial" font-weight="bold" transform="rotate(-25, ${x}, ${y})">${text}</text>`;
    }
  }
  // 우하단 변형 태그 (관리자 판별용)
  const tagSize = Math.max(10, Math.round(fontSize * 0.55));
  texts += `<text x="${w - 12}" y="${h - 16}" font-size="${tagSize}" fill="white" fill-opacity="0.35" text-anchor="end" font-family="monospace">v${v}</text>`;
  return `<svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">${texts}</svg>`;
}

async function loadResized(src, maxWidth) {
  const meta = await sharp(src).metadata();
  const w = meta.width, h = meta.height;
  if (!w || !h) throw new Error(`bad image metadata: ${src}`);
  const scale = Math.min(1, maxWidth / Math.max(w, h));
  return sharp(src)
    .rotate()
    .resize({ width: Math.round(w * scale), height: Math.round(h * scale), withoutEnlargement: true })
    .toBuffer();
}

async function buildVariant(resized, v, watermark, maxWidth) {
  const rMeta = await sharp(resized).metadata();
  const svg = svgWatermark(rMeta.width, rMeta.height, watermark, v);
  return sharp(resized)
    .composite([{ input: Buffer.from(svg) }])
    .jpeg({ quality: JPEG_QUALITY })
    .toBuffer();
}

async function writeBuffer(buf, file) {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, buf);
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const album = args.album || '1';
  const variants = args.variants > 0 ? args.variants : DEFAULT_VARIANTS;
  const maxWidth = args.maxWidth > 0 ? args.maxWidth : DEFAULT_MAX_WIDTH;
  const outDir = path.resolve(args.out || './photobook-out');
  const watermark = args.watermark || 'Leaf | 개인 열람용 | 무단전재 금지';
  const source = args.source ? path.resolve(args.source) : null;

  fs.mkdirSync(outDir, { recursive: true });
  const files = source ? readImages(source) : [];
  if (!files.length && !args.samples) {
    console.error('원본이 없습니다. --source <dir> 또는 --samples <n> 을 지정하세요.');
    process.exit(1);
  }

  console.log(`album=${album} · variants=${variants}/page · max-width=${maxWidth}px · sources=${files.length || args.samples}`);

  let page = 1;
  const processPage = async (src) => {
    const resized = await loadResized(src, maxWidth);
    const meta = await sharp(resized).metadata();
    // 1) 원본(서빙 금지, 고해상도) — R2 origin/
    const originBuf = await sharp(src).rotate().jpeg({ quality: 90 }).toBuffer();
    const originTmp = path.join(outDir, '_origin.jpg');
    await writeBuffer(originBuf, originTmp);
    if (!args.noUpload) uploadToR2(`origin/${album}/${page}.jpg`, originTmp);
    console.log(`  page ${page} → ${meta.width}x${meta.height}, variants ${variants}`);
    // 2) 웹뷰 변형 N개 — images/{album}/{page}/{v}.jpg
    for (let v = 0; v < variants; v++) {
      const buf = await buildVariant(resized, v, watermark, maxWidth);
      const tmp = path.join(outDir, `${page}-v${v}.jpg`);
      await writeBuffer(buf, tmp);
      if (!args.noUpload) uploadToR2(`images/${album}/${page}/${v}.jpg`, tmp);
    }
    page++;
  };

  for (const f of files) {
    console.log(`processing ${f}`);
    await processPage(path.join(source, f));
  }

  for (let n = 1; n <= (args.samples || 0); n++) {
    const bg = { r: 24 + n * 26, g: 48 + n * 14, b: 88 + n * 10 };
    const svg = `<svg width="1080" height="1440" xmlns="http://www.w3.org/2000/svg">
      <rect width="1080" height="1440" fill="rgb(${bg.r},${bg.g},${bg.b})"/>
      <text x="540" y="720" font-size="90" fill="#fff" text-anchor="middle" font-family="sans-serif" font-weight="bold" opacity="0.9">SAMPLE PAGE ${n}</text>
    </svg>`;
    const sample = await sharp({ create: { width: 1080, height: 1440, channels: 3, background: bg } })
      .composite([{ input: Buffer.from(svg) }])
      .jpeg({ quality: 90 })
      .toBuffer();
    console.log(`sample page ${page}`);
    await processPage(sample);
  }

  if (!args.noUpload) await runUploads();
  console.log(`완료: album=${album}, 총 ${page - 1}페이지 × ${variants}변형`);
}

main().catch((err) => { console.error(err); process.exit(1); });
