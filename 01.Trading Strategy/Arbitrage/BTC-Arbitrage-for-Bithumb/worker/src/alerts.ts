import { CoinPrice, MaybeNumber, SignalDecision } from "./types";

const nf0 = new Intl.NumberFormat("ko-KR", { maximumFractionDigits: 0 });
const nf2 = new Intl.NumberFormat("ko-KR", {
  maximumFractionDigits: 2,
  minimumFractionDigits: 2,
});

const ACTION_LABEL: Record<SignalDecision["action"], string> = {
  BITHUMB_SELL: "빗썸에서 매도 · 바이낸스에서 매수",
  BITHUMB_BUY: "빗썸에서 매수 · 바이낸스에서 매도",
  NEUTRAL: "대기",
};

const ACTION_EMOJI: Record<SignalDecision["action"], string> = {
  BITHUMB_SELL: "🔴",
  BITHUMB_BUY: "🟢",
  NEUTRAL: "⚪",
};

/** 값이 없거나 비정상이면 계산 결과 대신 "—" 를 보여준다 (NaN·null 노출 방지) */
function isNum(value: MaybeNumber): value is number {
  return value !== null && Number.isFinite(value);
}

export function formatKrw(value: MaybeNumber): string {
  return isNum(value) ? `${nf0.format(value)} KRW` : "—";
}

export function formatUsdt(value: MaybeNumber): string {
  return isNum(value) ? `${nf2.format(value)} USDT` : "—";
}

export function formatPremium(pct: MaybeNumber): string {
  if (!isNum(pct)) return "—";
  // 반올림하면 0 이 되는 값에 "-" 가 붙지 않도록 (−0.00% 방지)
  const rounded = Math.abs(pct) < 0.005 ? 0 : pct;
  const sign = rounded > 0 ? "+" : "";
  return `${sign}${nf2.format(rounded)}%`;
}

/** 텔레그램 HTML 메시지 생성 (parse_mode=HTML) */
export function formatSignalMessage(decision: SignalDecision, price: CoinPrice): string {
  const dir = decision.action === "BITHUMB_BUY" ? "매수" : "매도";
  const rows = [
    `${ACTION_EMOJI[decision.action]} <b>[차익거래 시그널] ${decision.coin}</b>`,
    ``,
    `📌 방향: <b>${dir}</b>`,
    `   ${ACTION_LABEL[decision.action]}`,
    ``,
    `🏪 빗썸     : ${formatKrw(price.bithumbKrw)}`,
    `🌐 바이낸스 : ${formatUsdt(price.binanceUsdt)} → ${formatKrw(price.binanceKrw)}`,
    `📈 김치 프리미엄 : <b>${formatPremium(decision.premiumPct)}</b>`,
    `🧮 추정 순이익(수수료·출금비 차감): ${formatPremium(decision.netPct)}`,
  ];
  return rows.join("\n");
}

export function formatTestMessage(): string {
  return `✅ 텔레그램 알림 연결 정상입니다.\nBTC 차익거래 시그널 봇 (bithumb-arbitrage-signals)`;
}

/**
 * 텔레그램 Bot API 로 메시지 발송.
 * https://core.telegram.org/bots/api#sendmessage
 */
export async function sendTelegramMessage(
  botToken: string,
  chatId: string,
  text: string
): Promise<boolean> {
  const url = `https://api.telegram.org/bot${botToken}/sendMessage`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text,
      parse_mode: "HTML",
      disable_web_page_preview: true,
    }),
  });
  if (!res.ok) {
    const body = await res.text();
    console.error("[telegram] send failed", res.status, body.slice(0, 500));
    return false;
  }
  return true;
}
