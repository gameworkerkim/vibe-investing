#!/usr/bin/env node
// Leaf — 이미지 준비 + R2 업로드 스크립트
//
// 용도:
//   실제 화보집 이미지를 "리사이즈(≤1600px) + 워터마크 사전 합성" 후 R2에 업로드.
//   (Workers 무료 티어 CPU 10ms 제한 때문에 요청 시 합성이 아닌 업로드 시 합성)
//
// 사용법:
//   node prepare-and-upload.js --album 1 --source ./photobook --watermark "Leaf | user@leaf.com"
//   node prepare-and-upload.js --album 1 --samples 3              # 샘플 생성 (데모)
//
// 옵션:
//   --album <id>     R2 키 images/{albumId}/{page}.jpg (기본 1)
//   --source <dir>   원본 이미지 폴더 (jpg/png/webp). 지정 시 그 폴더 사용
//   --samples <n>    원본 없을 때 샘플 n장 생성
//   --watermark <t>  워터마크 텍스트 (기본 'Leaf | 개인 열람용 | 무단전재 금지')
//   --out <dir>      처리 결과 임시 폴더 (기본 ./photobook-out)
//   --no-upload      R2 업로드 생략 (로컬 확인용)

import sharp from 'sharp';
import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

const BUCKET = 'leaf-images';
const MAX_WIDTH = 1600;
const JPEG_QUALITY = 85;

function parseArgs(argv) {
  const args = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === '--album') args.album = argv[++i];
    else if (a === '--source') args.source = argv[++i];
    else if (a === '--samples') args.samples = Number(argv[++i]) || 0;
    else if (a === '--watermark') args.watermark = argv[++i];
    else if (a === '--out') args.out = argv[++i];
    else if (a === '--no-upload') args.noUpload = true;
  }
  return args;
}

function readImages(dir) {
  if (!fs.existsSync(dir)) return [];
  return fs.readdirSync(dir)
    .filter((f) => /\.(jpe?g|png|webp)$/i.test(f))
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
}

function svgWatermark(w, h, text) {
  const fontSize = Math.max(18, Math.min(w, h) * 0.028);
  const stepX = fontSize * 10;
  const stepY = fontSize * 5;
  const cols = Math.ceil(w / stepX) + 1;
  const rows = Math.ceil(h / stepY) + 1;
  let texts = '';
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const x = col * stepX - stepX / 2;
      const y = row * stepY - stepY / 2;
      const opacity = 0.05 + Math.random() * 0.03;
      texts += `<text x="${x}" y="${y}" font-size="${fontSize}" fill="white" fill-opacity="${opacity}" font-family="Arial" font-weight="bold" transform="rotate(-25, ${x}, ${y})">${text}</text>`;
    }
  }
  return `<svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">${texts}</svg>`;
}

async function processFile(src, outPath, watermark) {
  const image = sharp(src);
  const meta = await image.metadata();
  const { width: w, height: h } = meta;
  if (!w || !h) throw new Error(`bad image metadata: ${src}`);

  // 리사이즈 (원본 해상도 초과 노출 방지)
  const resized = await sharp(src)
    .rotate()
    .resize({ width: Math.min(MAX_WIDTH, w), height: Math.min(MAX_WIDTH * 1.6, h), fit: 'inside', withoutEnlargement: true })
    .toBuffer();

  const rMeta = await sharp(resized).metadata();
  const svg = svgWatermark(rMeta.width, rMeta.height, watermark);

  await sharp(resized)
    .composite([{ input: Buffer.from(svg) }])
    .jpeg({ quality: JPEG_QUALITY })
    .toFile(outPath);
}

async function makeSample(outPath, n, watermark) {
  const { width, height } = { width: 1600, height: 1067 };
  const bg = { r: 24 + n * 26, g: 48 + n * 14, b: 88 + n * 10 };
  const svg = `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
    <rect width="${width}" height="${height}" fill="rgb(${bg.r},${bg.g},${bg.b})"/>
    <text x="800" y="540" font-size="110" fill="#ffffff" text-anchor="middle" font-family="sans-serif" font-weight="bold" opacity="0.9">SAMPLE PAGE ${n}</text>
  </svg>`;
  const raw = await sharp({ create: { width, height, channels: 3, background: bg } })
    .composite([{ input: Buffer.from(svg) }])
    .jpeg({ quality: 90 })
    .toBuffer();
  await processFile(raw, outPath, watermark);
}

async function uploadToR2(key, file) {
  execSync(
    `npx wrangler r2 object put "${BUCKET}/${key}" --file "${file}" --remote`,
    { stdio: 'inherit' }
  );
  console.log(`  ↑ uploaded ${key}`);
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const album = args.album || '1';
  const outDir = args.out || './photobook-out';
  const watermark = args.watermark || 'Leaf | 개인 열람용 | 무단전재 금지';
  const source = args.source ? path.resolve(args.source) : null;

  fs.mkdirSync(outDir, { recursive: true });
  const files = source ? readImages(source) : [];
  if (!files.length && !args.samples) {
    console.error('원본 이미지가 없습니다. --source <dir> 또는 --samples <n> 을 지정하세요.');
    process.exit(1);
  }

  let page = 1;
  for (const f of files) {
    const out = path.join(outDir, `${page}.jpg`);
    console.log(`processing ${f} → page ${page}`);
    await processFile(path.join(source, f), out, watermark);
    if (!args.noUpload) await uploadToR2(`images/${album}/${page}.jpg`, out);
    page++;
  }

  for (let n = 1; n <= (args.samples || 0); n++) {
    const out = path.join(outDir, `${page}.jpg`);
    console.log(`sample page ${page}`);
    await makeSample(out, n, watermark);
    if (!args.noUpload) await uploadToR2(`images/${album}/${page}.jpg`, out);
    page++;
  }

  console.log(`완료: album=${album}, 총 ${page - 1}장`);
}

main().catch((err) => { console.error(err); process.exit(1); });
