"""
scripts/env_store.py — .env 읽기/쓰기 공통 로직

scripts/setup_credentials.py(터미널)와 dashboard/app.py(웹)가 동일한 필드 정의와
로드/저장 로직을 공유하기 위한 모듈. 여기 정의된 FIELDS 순서/키가 .env의
정본(source of truth)이다.
"""

from pathlib import Path
from typing import Dict, NamedTuple

PROJECT_ROOT = Path(__file__).resolve().parent.parent
ENV_PATH = PROJECT_ROOT / ".env"


class Field(NamedTuple):
    key: str
    label: str
    is_secret: bool
    default: str
    group: str


# (key, label, is_secret, default, group)
FIELDS = [
    Field("TOSS_CLIENT_ID", "TOSS 증권 Open API Client ID", False, "", "TOSS"),
    Field("TOSS_CLIENT_SECRET", "TOSS 증권 Open API Client Secret", True, "", "TOSS"),
    Field("TOSS_BASE_URL", "TOSS Open API Base URL", False, "https://openapi.tossinvest.com", "TOSS"),
    Field("DART_API_KEY", "DART Open API Key (opendart.fss.or.kr)", True, "", "DART"),
    Field("DEEPSEEK_API_KEY", "DeepSeek API Key (platform.deepseek.com)", True, "", "DeepSeek"),
    Field("DEEPSEEK_BASE_URL", "DeepSeek API Base URL", False, "https://api.deepseek.com", "DeepSeek"),
    Field("DEEPSEEK_MODEL", "DeepSeek 모델명", False, "deepseek-chat", "DeepSeek"),
    Field("NEWSAPI_KEY", "NewsAPI.org Key (선택, 없으면 RSS 폴백)", True, "", "News"),
    Field("MYSQL_HOST", "MySQL Host", False, "127.0.0.1", "MySQL"),
    Field("MYSQL_PORT", "MySQL Port", False, "3306", "MySQL"),
    Field("MYSQL_USER", "MySQL User", False, "root", "MySQL"),
    Field("MYSQL_PASSWORD", "MySQL Password", True, "", "MySQL"),
    Field("MYSQL_DATABASE", "MySQL Database", False, "ackman_quant", "MySQL"),
]

# 대시보드 접속 게이트 키. 대시보드 폼으로는 노출/변경하지 않는다 —
# .env를 직접 편집하거나 scripts/setup_credentials.py로만 설정.
ADMIN_KEY_FIELD = "ADMIN_SETUP_KEY"


def load_existing_env(path: Path = ENV_PATH) -> Dict[str, str]:
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


def write_env(values: Dict[str, str], path: Path = ENV_PATH) -> None:
    """FIELDS에 정의된 키 + ADMIN_SETUP_KEY(있으면)를 .env에 기록.
    FIELDS에 없는 기존 키(예: ADMIN_SETUP_KEY)는 보존한다."""
    existing = load_existing_env(path)
    merged = dict(existing)
    merged.update(values)

    lines = [
        "# 이 파일은 scripts/setup_credentials.py 또는 dashboard/app.py 로 생성/수정됩니다.",
        "# 절대 커밋하지 마세요 (.gitignore에 포함되어 있음).",
        "",
    ]
    known_keys = {f.key for f in FIELDS}
    for f in FIELDS:
        lines.append(f"{f.key}={merged.get(f.key, '')}")
    # FIELDS에 없는 값(ADMIN_SETUP_KEY 등)은 뒤에 보존
    for k, v in merged.items():
        if k not in known_keys:
            lines.append(f"{k}={v}")
    path.write_text("\n".join(lines) + "\n", encoding="utf-8")
