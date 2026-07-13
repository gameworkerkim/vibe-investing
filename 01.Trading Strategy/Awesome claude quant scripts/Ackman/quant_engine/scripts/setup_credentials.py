"""
scripts/setup_credentials.py — 터미널 대화형 자격증명 입력 스크립트

TOSS / DART / DeepSeek API 키와 MySQL 접속 정보를 터미널에서 입력받아
프로젝트 루트의 .env 파일로 저장한다. .env는 .gitignore에 포함되어
커밋되지 않는다.

실행:
    python scripts/setup_credentials.py

기존 .env가 있으면 각 항목의 현재 설정 여부를 보여주고, 엔터만 누르면
기존 값을 유지한다. 비밀 값(API 키, 비밀번호)은 입력 시 화면에 표시되지 않는다.

웹 대시보드(dashboard/app.py)로도 동일한 항목을 입력할 수 있다. 다만 대시보드
접속 게이트 키(ADMIN_SETUP_KEY)는 여기서만 설정할 수 있다.
"""

import getpass
import secrets

from env_store import ADMIN_KEY_FIELD, ENV_PATH, FIELDS, load_existing_env, mask, write_env


def prompt_field(key: str, label: str, is_secret: bool, default: str, existing: dict) -> str:
    current = existing.get(key, "")
    shown_current = mask(current) if is_secret else (current or "(미설정)")
    hint = f" [현재: {shown_current}, 엔터=유지]" if current else (f" [기본값: {default}, 엔터=기본값]" if default else " [엔터=비움]")

    prompt_text = f"{label}{hint}: "
    if is_secret:
        value = getpass.getpass(prompt_text)
    else:
        value = input(prompt_text)

    value = value.strip()
    if not value:
        return current if current else default
    return value


def prompt_admin_key(existing: dict) -> str:
    current = existing.get(ADMIN_KEY_FIELD, "")
    print("\n--- 웹 대시보드 접속 키 ---")
    print("dashboard/app.py 실행 시 http://127.0.0.1:8765/admin/setup/<이 키> 로만 접속 가능합니다.")
    hint = f" [현재: {mask(current)}, 엔터=유지]" if current else " [엔터=랜덤 생성]"
    value = getpass.getpass(f"대시보드 접속 키{hint}: ").strip()
    if value:
        return value
    if current:
        return current
    generated = secrets.token_urlsafe(24)
    print("랜덤 키를 생성했습니다 (저장 후 화면에 접속 URL로 표시됩니다).")
    return generated


def main() -> None:
    print("=" * 60)
    print("Ackman Quant Engine — 자격증명 설정")
    print("=" * 60)
    print("각 항목을 입력하세요. 비워두고 엔터를 누르면 해당 기능은")
    print("MOCK/제한 모드로 동작하거나 건너뜁니다.\n")

    existing = load_existing_env(ENV_PATH)
    values = {}
    for f in FIELDS:
        values[f.key] = prompt_field(f.key, f.label, f.is_secret, f.default, existing)

    values[ADMIN_KEY_FIELD] = prompt_admin_key(existing)

    write_env(values, ENV_PATH)
    print(f"\n저장 완료: {ENV_PATH}")

    missing_optional = []
    if not values["TOSS_CLIENT_ID"] or not values["TOSS_CLIENT_SECRET"]:
        missing_optional.append("TOSS (가격 데이터 MOCK 모드로 동작)")
    if not values["DART_API_KEY"]:
        missing_optional.append("DART (국내 종목 재무데이터 조회 불가, 미국 종목은 Yahoo Finance로 대체)")
    if not values["DEEPSEEK_API_KEY"]:
        missing_optional.append("DeepSeek (정성 코멘트 생성 건너뛰고 정량 점수만 출력)")

    if missing_optional:
        print("\n다음 항목은 비어 있어 제한 모드로 동작합니다:")
        for m in missing_optional:
            print(f"  - {m}")

    print("\n다음 단계:")
    print("  1) db/schema.sql 을 MySQL에 적용")
    print("  2) python main.py 로 CLI 실행, 또는 python dashboard/app.py 로 웹 대시보드 실행")


if __name__ == "__main__":
    main()
