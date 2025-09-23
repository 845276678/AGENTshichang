#!/usr/bin/env python3
"""
TypeScript Error Fixer - Automatically fix common TypeScript strict mode errors
"""

import os
import re
import subprocess
import sys
from typing import List, Dict, Tuple
import tempfile

class TypeScriptErrorFixer:
    def __init__(self, project_root: str):
        self.project_root = project_root
        self.error_patterns = {
            'TS6133': self.fix_unused_variable,
            'TS2532': self.fix_potentially_undefined,
            'TS2345': self.fix_argument_type_mismatch,
            'TS2322': self.fix_type_assignment,
        }

    def run_tsc_check(self) -> List[str]:
        """Run TypeScript compiler and get error output"""
        try:
            result = subprocess.run(
                ['npx', 'tsc', '--noEmit'],
                capture_output=True,
                text=True,
                cwd=self.project_root
            )
            return result.stderr.split('\n') if result.stderr else []
        except Exception as e:
            print(f"Error running tsc: {e}")
            return []

    def parse_error(self, error_line: str) -> Dict[str, str]:
        """Parse TypeScript error line"""
        # Pattern: file.ts(line,col): error TSxxxx: message
        pattern = r'^(.+?)\((\d+),(\d+)\): error (TS\d+): (.+)$'
        match = re.match(pattern, error_line)

        if match:
            return {
                'file': match.group(1),
                'line': int(match.group(2)),
                'col': int(match.group(3)),
                'code': match.group(4),
                'message': match.group(5)
            }
        return {}

    def read_file_lines(self, filepath: str) -> List[str]:
        """Read file and return lines"""
        try:
            with open(filepath, 'r', encoding='utf-8') as f:
                return f.readlines()
        except Exception as e:
            print(f"Error reading {filepath}: {e}")
            return []

    def write_file_lines(self, filepath: str, lines: List[str]) -> bool:
        """Write lines to file"""
        try:
            with open(filepath, 'w', encoding='utf-8') as f:
                f.writelines(lines)
            return True
        except Exception as e:
            print(f"Error writing {filepath}: {e}")
            return False

    def fix_unused_variable(self, error: Dict[str, str], lines: List[str]) -> List[str]:
        """Fix TS6133 unused variable/import errors"""
        line_idx = error['line'] - 1
        line = lines[line_idx]

        # Extract the unused identifier from the error message
        match = re.search(r"'([^']+)' is declared but its value is never read", error['message'])
        if not match:
            return lines

        unused_name = match.group(1)

        # Handle import statements
        if 'import' in line:
            # Remove from import statement
            line = self.remove_from_import(line, unused_name)
            lines[line_idx] = line

            # If import line becomes empty, remove it
            if re.match(r'^\s*import\s*{\s*}\s*from', line):
                lines[line_idx] = ''

        # Handle variable declarations
        elif unused_name.startswith('set') and 'useState' in line:
            # For useState destructuring, keep only the getter
            pattern = r'const\s*\[\s*(\w+)\s*,\s*' + re.escape(unused_name) + r'\s*\]'
            match = re.search(pattern, line)
            if match:
                getter = match.group(1)
                lines[line_idx] = re.sub(pattern, f'const [{getter}]', line)

        elif 'const' in line or 'let' in line or 'var' in line:
            # For regular variables, comment out or remove the line
            if unused_name in ['previousValue', 'request', 'body', 'id']:
                # Comment out instead of removing
                lines[line_idx] = '  // ' + line.lstrip()
            else:
                # Remove the variable declaration line
                lines[line_idx] = ''

        return lines

    def remove_from_import(self, import_line: str, unused_name: str) -> str:
        """Remove unused import from import statement"""
        # Handle different import patterns
        patterns = [
            # Named import: import { a, b, c } from 'module'
            (r'import\s*{\s*([^}]+)\s*}\s*from', self.remove_from_named_imports),
            # Default import with named: import Default, { a, b } from 'module'
            (r'import\s+\w+\s*,\s*{\s*([^}]+)\s*}\s*from', self.remove_from_named_imports),
        ]

        for pattern, handler in patterns:
            match = re.search(pattern, import_line)
            if match:
                return handler(import_line, unused_name, match)

        return import_line

    def remove_from_named_imports(self, import_line: str, unused_name: str, match: re.Match) -> str:
        """Remove from named imports"""
        imports_part = match.group(1)
        imports = [imp.strip() for imp in imports_part.split(',')]
        imports = [imp for imp in imports if imp and imp != unused_name]

        if not imports:
            return ''  # Empty import

        new_imports = ', '.join(imports)
        return import_line.replace(match.group(1), new_imports)

    def fix_potentially_undefined(self, error: Dict[str, str], lines: List[str]) -> List[str]:
        """Fix TS2532 potentially undefined errors"""
        line_idx = error['line'] - 1
        line = lines[line_idx]

        # Add optional chaining or null checks
        if '.possibly undefined' in error['message'] or 'Object is possibly' in error['message']:
            # Simple fixes for common patterns
            if '?.(' in line or '?.' in line:
                return lines  # Already has optional chaining

            # Add non-null assertion for now (can be refined later)
            if '.' in line and not '?.' in line:
                # Find the object access and add optional chaining
                line = re.sub(r'(\w+)\.(\w+)', r'\1?.\2', line)
                lines[line_idx] = line

        return lines

    def fix_argument_type_mismatch(self, error: Dict[str, str], lines: List[str]) -> List[str]:
        """Fix TS2345 argument type mismatch errors"""
        line_idx = error['line'] - 1
        line = lines[line_idx]

        # Handle string | undefined -> string conversions
        if 'string | undefined' in error['message'] and 'string' in error['message']:
            # Add null coalescing operator
            if 'setFirstName(' in line or 'setLastName(' in line:
                line = re.sub(r'(\w+)\)', r'\1 || "")', line)
                lines[line_idx] = line

        return lines

    def fix_type_assignment(self, error: Dict[str, str], lines: List[str]) -> List[str]:
        """Fix TS2322 type assignment errors"""
        line_idx = error['line'] - 1
        line = lines[line_idx]

        # Handle common type assignment issues
        if 'string' in error['message'] and 'MessageType' in error['message']:
            # Fix enum assignments
            if 'type:' in line:
                line = re.sub(r"type:\s*'(\w+)'", r"type: '\1' as MessageType", line)
                lines[line_idx] = line

        return lines

    def fix_errors_in_file(self, filepath: str, errors: List[Dict[str, str]]) -> bool:
        """Fix all errors in a single file"""
        lines = self.read_file_lines(filepath)
        if not lines:
            return False

        # Sort errors by line number in reverse order to avoid line number shifts
        errors.sort(key=lambda x: x['line'], reverse=True)

        for error in errors:
            if error['code'] in self.error_patterns:
                lines = self.error_patterns[error['code']](error, lines)

        return self.write_file_lines(filepath, lines)

    def run_fixes(self) -> None:
        """Run all fixes"""
        print("Getting TypeScript errors...")
        error_lines = self.run_tsc_check()

        # Group errors by file
        files_errors = {}
        total_errors = 0

        for error_line in error_lines:
            if 'error TS' in error_line:
                error = self.parse_error(error_line)
                if error:
                    filepath = os.path.join(self.project_root, error['file'])
                    if filepath not in files_errors:
                        files_errors[filepath] = []
                    files_errors[filepath].append(error)
                    total_errors += 1

        print(f"Found {total_errors} errors in {len(files_errors)} files")

        # Fix errors file by file
        for filepath, errors in files_errors.items():
            error_codes = set(error['code'] for error in errors)
            fixable_codes = set(self.error_patterns.keys())
            fixable_errors = [e for e in errors if e['code'] in fixable_codes]

            if fixable_errors:
                print(f"Fixing {len(fixable_errors)} errors in {os.path.relpath(filepath, self.project_root)}")
                self.fix_errors_in_file(filepath, fixable_errors)

        print("Fixes complete! Running TypeScript check again...")
        remaining_errors = len([line for line in self.run_tsc_check() if 'error TS' in line])
        print(f"Remaining errors: {remaining_errors}")

if __name__ == '__main__':
    project_root = sys.argv[1] if len(sys.argv) > 1 else '.'
    fixer = TypeScriptErrorFixer(project_root)
    fixer.run_fixes()