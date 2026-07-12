"""
scripts/setup_credentials.py — 터미널 대화형 자격증명 입력 스크립트

TOSS / DART / DeepSeek API 키와 MySQL 접속 정보를 터미널에서 입력받아
프로젝트 루트의 .env 파일로 저장한다. .env는 .gitignore에 포함되어
커밋되지 않는다.

실행:
    python scripts/setup_credentials.py

기존 .env가 있으면 각 항목의 현재 설정 여부를 보여주고, 엔터만 누르면
기존 값을 유지한다. 비밀 값(API 키, 비밀번호)은 입력 시 화면에 표시되지 않는다.
"""

import getpass
from pathlib import Path

PROJECT_ROOT = Path(__file__).resolve().parent.parent
ENV_PATH = PROJECT_ROOT / ".env"

# (key, label, is_secret, default)
FIELDS = [
    ("TOSS_CLIENT_ID", "TOSS 증권 Open API Client ID", False, ""),
    ("TOSS_CLIENT_SECRET", "TOSS 증권 Open API Client Secret", True, ""),
    ("TOSS_BASE_URL", "TOSS Open API Base URL", False, "https://openapi.tossinvest.com"),
    ("DART_API_KEY", "DART Open API Key (opendart.fss.or.kr)", True, ""),
    ("DEEPSEEK_API_KEY", "DeepSeek API Key (platform.deepseek.com)", True, ""),
    ("DEEPSEEK_BASE_URL", "DeepSeek API Base URL", False, "https://api.deepseek.com"),
    ("DEEPSEEK_MODEL", "DeepSeek 모델명", False, "deepseek-chat"),
    ("NEWSAPI_KEY", "NewsAPI.org Key (선택, 없으면 RSS 폴백)", True, ""),
    ("MYSQL_HOST", "MySQL Host", False, "127.0.0.1"),
    ("MYSQL_PORT", "MySQL Port", False, "3306"),
    ("MYSQL_USER", "MySQL User", False, "root"),
    ("MYSQL_PASSWORD", "MySQL Password", True, ""),
    ("MYSQL_DATABASE", "MySQL Database", False, "ackman_quant"),
]


def load_existing_env(path: Path) -> dict:
    values = {}
    if not path.exists():
        return values
    for line in path.read_text(encoding="utf-8").splitlines():
        line = line.strip()
        if not line or line.startswith("#") or "=" not in line:
            continue
        k, v = line.split("=", 1)
        values[k.strip()] = v.strip()
    return values


def mask(value: str) -> str:
    if not value:
        return "(미설정)"
    if len(value) <= 4:
        return "*" * len(value)
    return value[:2] + "*" * (len(value) - 4) + value[-2:]


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


def write_env(path: Path, values: dict) -> None:
    lines = [
        "# 이 파일은 scripts/setup_credentials.py 로 생성되었습니다. 커밋하지 마세요.",
        "",
    ]
    for key, _, _, _ in FIELDS:
        lines.append(f"{key}={values.get(key, '')}")
    path.write_text("\n".join(lines) + "\n", encoding="utf-8")


def main() -> None:
    print("=" * 60)
    print("Ackman Quant Engine — 자격증명 설정")
    print("=" * 60)
    print("각 항목을 입력하세요. 비워두고 엔터를 누르면 해당 기능은")
    print("MOCK/제한 모드로 동작하거나 건너뜁니다.\n")

    existing = load_existing_env(ENV_PATH)
    values = {}
    for key, label, is_secret, default in FIELDS:
        values[key] = prompt_field(key, label, is_secret, default, existing)

    write_env(ENV_PATH, values)
    print(f"\n저장 완료: {ENV_PATH}")

    missing_optional = []
    if not values["TOSS_CLIENT_ID"] or not values["TOSS_CLIENT_SECRET"]:
        missing_optional.append("TOSS (가격 데이터 MOCK 모드로 동작)")
    if not values["DART_API_KEY"]:
        missing_optional.append("DART (국내 종목 재무데이터 조회 불가, 미국 종목은 Yahoo Finance로 대체)")
    if not values["DEEPSEEK_API_KEY"]:
        missing_optional.append("DeepSeek (정성 코멘트 생성 건너뛰고 정량 점수만 출력)")
    if not values["MYSQL_PASSWORD"] and not values["MYSQL_USER"] == "root":
        pass

    if missing_optional:
        print("\n다음 항목은 비어 있어 제한 모드로 동작합니다:")
        for m in missing_optional:
            print(f"  - {m}")

    print("\n다음 단계: db/schema.sql 을 MySQL에 적용한 뒤 main.py 를 실행하세요.")


if __name__ == "__main__":
    main()
