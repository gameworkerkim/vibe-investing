#!/usr/bin/env python3
"""
VibeQuant vendor/rename pipeline.
Transforms gs-quant source (gs_quant → vi_quant, Gs* → Vi*)
while preserving Apache-2.0 license headers.
"""

import os
import re
import sys
from pathlib import Path


def find_license_header_end(lines):
    """Find the end of the Apache-2.0 license docstring block.

    The gs-quant license header is a docstring:
        \"\"\"
        Copyright 20xx Goldman Sachs.
        Licensed under the Apache License, Version 2.0 ...
        ...
        under the License.
        \"\"\"

    Returns the index of the line AFTER the closing triple-quote (0-based),
    or 0 if no license header found.
    """
    if not lines:
        return 0

    seen_opening = False
    for i, line in enumerate(lines):
        stripped = line.strip()
        if not seen_opening:
            if stripped in ('"""', 'r"""', "'''", "r'''"):
                # Check if this is a one-line docstring
                if stripped.count('"""') >= 2 or stripped.count("'''") >= 2:
                    if 'Copyright' in stripped or 'Licensed' in stripped:
                        return 0
                    continue
                seen_opening = True
                continue
        else:
            if stripped in ('"""', "'''", '"""', "'''"):
                return i + 1
            if 'Copyright' in stripped or 'Licensed' in stripped:
                continue
    return 0


FILENAME_RENAMES = {
    'datetime/gscalendar.py': 'datetime/vicalendar.py',
}


def transform_content(content, rel_path):
    """Transform gs_quant content to vi_quant content."""

    # First run all namespace transformations on the raw content
    result = content

    result = result.replace('/api/gs/', '/api/vi/')
    result = result.replace('.api.gs.', '.api.vi.')
    result = result.replace('GSCALENDAR', 'VICALENDAR')
    result = result.replace('.gscalendar', '.vicalendar')
    result = result.replace('from gs_quant.', 'from vi_quant.')
    result = result.replace('import gs_quant.', 'import vi_quant.')
    result = re.sub(r'\bgs_quant\b', 'vi_quant', result)

    def replace_gs_class(m):
        full = m.group(0)
        prefix = m.string[:m.start()]
        if prefix.endswith('.'):
            return full
        return 'Vi' + m.group(1)

    result = re.sub(r'\bGs([A-Z]\w*)', replace_gs_class, result)

    # Then add the modification comment after the license header
    lines = result.split('\n')
    header_end = find_license_header_end(lines)

    if header_end > 0:
        preserved = lines[:header_end]
        rest = lines[header_end:]

        while rest and rest[0].strip() == '':
            rest = rest[1:]

        comment_line = '# Portions modified for vi_quant: namespace renaming (gs_quant→vi_quant, Gs→Vi).'
        lines = preserved + [comment_line, ''] + rest
        result = '\n'.join(lines)

    return result


def process_file(src_path, dst_path):
    """Process a single file from source to destination."""
    with open(src_path, 'r', encoding='utf-8') as f:
        content = f.read()

    rel_path = str(src_path)

    # Skip if file doesn't need transformation (empty or no content)
    if not content.strip():
        os.makedirs(os.path.dirname(dst_path), exist_ok=True)
        with open(dst_path, 'w', encoding='utf-8') as f:
            f.write(content)
        return True

    transformed = transform_content(content, rel_path)

    os.makedirs(os.path.dirname(dst_path), exist_ok=True)
    with open(dst_path, 'w', encoding='utf-8') as f:
        f.write(transformed)

    return True


def main():
    if len(sys.argv) < 3:
        print("Usage: vendor_rename.py <src_root> <dst_root> [file1.py file2.py ...]")
        print("Example: vendor_rename.py /path/to/gs-quant/gs_quant /path/to/vi_quant")
        sys.exit(1)

    src_root = sys.argv[1]
    dst_root = sys.argv[2]

    file_list = sys.argv[3:] if len(sys.argv) > 3 else None

    if file_list:
        rel_paths = file_list
    else:
        # Process all .py files
        src_path = Path(src_root)
        rel_paths = [
            str(p.relative_to(src_root))
            for p in sorted(src_path.rglob('*.py'))
        ]

    processed = 0
    skipped = 0

    for rel_path in rel_paths:
        src_file = os.path.join(src_root, rel_path)
        dst_rel = FILENAME_RENAMES.get(rel_path.replace(os.sep, '/'), rel_path)
        dst_file = os.path.join(dst_root, dst_rel)

        if not os.path.isfile(src_file):
            print(f"SKIP (missing source): {rel_path}")
            skipped += 1
            continue

        process_file(src_file, dst_file)
        processed += 1
        print(f"OK  {rel_path}")

    print(f"\nDone: {processed} files processed, {skipped} skipped")


if __name__ == '__main__':
    main()
