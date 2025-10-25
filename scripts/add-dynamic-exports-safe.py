#!/usr/bin/env python3
"""
Safely add 'export const dynamic = "force-dynamic"' to API route files.
This version properly handles multi-line imports and function definitions.
"""

import os
import re
from pathlib import Path

def find_insertion_point(lines):
    """
    Find the correct insertion point after imports and before any code.
    Returns the line number where the export should be inserted.
    """
    last_import_line = -1
    in_multiline_import = False

    for i, line in enumerate(lines):
        stripped = line.strip()

        # Skip empty lines and comments
        if not stripped or stripped.startswith('//') or stripped.startswith('/*') or stripped.startswith('*'):
            continue

        # Detect import statement start
        if stripped.startswith('import '):
            in_multiline_import = True
            last_import_line = i

            # Check if it's a single-line import
            if ';' in stripped or (stripped.endswith(("'", '"')) and 'from' in stripped):
                in_multiline_import = False

        # Detect end of multi-line import
        elif in_multiline_import:
            last_import_line = i
            if ('from' in stripped and (stripped.endswith(("'", '"')) or stripped.endswith("';") or stripped.endswith('"'))):
                in_multiline_import = False

        # If we're not in an import and found actual code, stop
        elif last_import_line >= 0 and not in_multiline_import:
            if (stripped.startswith('export ') or
                stripped.startswith('const ') or
                stripped.startswith('function ') or
                stripped.startswith('async ') or
                stripped.startswith('interface ') or
                stripped.startswith('type ') or
                stripped.startswith('class ')):
                # Found the first code after imports
                break

    # Insert after last import line
    return last_import_line + 1 if last_import_line >= 0 else 0

def has_dynamic_export(content):
    """Check if file already has dynamic export."""
    return "export const dynamic = 'force-dynamic'" in content or \
           'export const dynamic = "force-dynamic"' in content

def process_file(file_path):
    """Add dynamic export to a single file."""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()

        # Skip if already has dynamic export
        if has_dynamic_export(content):
            return 'skipped', 'already has export'

        lines = content.split('\n')

        # Find where to insert
        insert_line = find_insertion_point(lines)

        if insert_line == 0:
            return 'skipped', 'no imports found'

        # Insert the export with proper spacing
        export_statement = "\nexport const dynamic = 'force-dynamic'\n"
        lines.insert(insert_line, export_statement)

        # Write back
        new_content = '\n'.join(lines)
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(new_content)

        return 'updated', f'inserted at line {insert_line + 1}'

    except Exception as e:
        return 'error', str(e)

def main():
    """Main function to process all API route files."""
    api_dir = Path('src/app/api')

    if not api_dir.exists():
        print(f"API directory not found: {api_dir}")
        return

    # Find all route.ts files
    route_files = list(api_dir.rglob('route.ts'))

    print(f"Found {len(route_files)} API route files\n")

    stats = {'updated': 0, 'skipped': 0, 'error': 0}

    for file_path in sorted(route_files):
        rel_path = file_path.relative_to(api_dir.parent.parent)
        status, message = process_file(file_path)

        stats[status] += 1

        prefix = {'updated': '[OK]', 'skipped': '[SKIP]', 'error': '[ERR]'}[status]
        print(f"{prefix} {rel_path}: {message}")

    print(f"\nSummary:")
    print(f"  Updated: {stats['updated']}")
    print(f"  Skipped: {stats['skipped']}")
    print(f"  Errors: {stats['error']}")

if __name__ == '__main__':
    main()