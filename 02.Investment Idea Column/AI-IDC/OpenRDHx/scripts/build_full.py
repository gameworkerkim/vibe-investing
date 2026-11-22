#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""OpenRDHx_Full.md 를 하위 문서에서 생성한다.

사용: python3 -I scripts/build_full.py
합본을 손으로 고치지 않는다. 하위 문서를 고치고 이 스크립트를 다시 돌린다.
"""
import io, os, sys, datetime

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

ORDER = [
    "README.md",
    "00_오픈아키텍처/오픈아키텍처.md",
    "01_제품기획/제품기획.md",
    "02_컨셉/컨셉.md",
    "03_설계도/도면목록.md",
    "04_기술명세서/기술명세서.md",
    "04_기술명세서/열정산_및_보호로직.md",
    "05_경쟁제품비교/경쟁제품_비교.md",
    "05_경쟁제품비교/중국_프로토타입_후보.md",
    "06_원가구조/원가구조.md",
    "07_생산계획/생산계획.md",
    "08_예산/예산.md",
    "09_시장/시장_국내외.md",
    "10_사업계획서/사업계획서.md",
    "11_자체IDC_5MW/자체IDC_5MW.md",
    "12_국산화_로드맵/국산화_로드맵.md",
]

def main():
    missing = [p for p in ORDER if not os.path.exists(os.path.join(ROOT, p))]
    if missing:
        sys.stderr.write("없는 문서: %s\n" % ", ".join(missing))
        return 1

    today = datetime.date.today().isoformat()
    out = [
        "# OpenRDHx 전체본",
        "",
        "**생성**: `scripts/build_full.py` 가 만든 파일이다. **직접 고치지 않는다.**",
        "**생성일**: %s" % today,
        "**원본**: 아래 목차의 각 문서. 내용을 바꾸려면 원본을 고치고 스크립트를 다시 돌린다.",
        "",
        "```",
        "python3 -I scripts/build_full.py",
        "```",
        "",
        "## 합본 순서",
        "",
    ]
    for p in ORDER:
        out.append("1. `%s`" % p)
    out.append("")

    for p in ORDER:
        with io.open(os.path.join(ROOT, p), encoding="utf-8") as f:
            body = f.read().rstrip("\n")
        out.append("")
        out.append("---")
        out.append("")
        out.append("<!-- 원본: %s -->" % p)
        out.append("")
        out.append(body)
        out.append("")

    text = "\n".join(out) + "\n"
    with io.open(os.path.join(ROOT, "OpenRDHx_Full.md"), "w", encoding="utf-8") as f:
        f.write(text)
    print("OpenRDHx_Full.md 생성: %d 문서, %d 바이트" % (len(ORDER), len(text.encode("utf-8"))))
    return 0

if __name__ == "__main__":
    sys.exit(main())
