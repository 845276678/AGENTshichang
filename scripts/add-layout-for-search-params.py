#!/usr/bin/env python3
"""
为所有使用 useSearchParams() 的页面创建 layout.tsx 文件
"""

import os
from pathlib import Path

# 所有使用 useSearchParams 的页面路径
pages_with_search_params = [
    "src/app/workshops/idea-refinement",
    "src/app/workshops/mvp-visualization",
    "src/app/workshops/[workshopId]",
    "src/app/workshop/[id]",
    "src/app/marketplace/bidding",
    "src/app/business-plan",
    "src/app/business-plan/workspace",
    "src/app/business-plan/generating",
    "src/app/business-plan/intelligent",
    "src/app/auth/login",
    "src/app/auth/register",
    "src/app/agents/search",
    "src/app/collaboration/result",
]

layout_template = """export const dynamic = 'force-dynamic'

export default function Layout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
"""

def create_layout_file(page_dir: str):
    """为指定目录创建 layout.tsx 文件"""
    layout_path = Path(page_dir) / "layout.tsx"

    # 如果已存在，检查是否已有 dynamic 配置
    if layout_path.exists():
        content = layout_path.read_text(encoding='utf-8')
        if 'dynamic' in content:
            return 'skipped', 'already has dynamic config'

    # 创建目录（如果不存在）
    layout_path.parent.mkdir(parents=True, exist_ok=True)

    # 写入 layout 文件
    layout_path.write_text(layout_template.strip() + '\n', encoding='utf-8')

    return 'created', f'created at {layout_path}'

def main():
    print("Creating layout.tsx files for pages using useSearchParams...\n")

    stats = {'created': 0, 'skipped': 0, 'error': 0}

    for page_dir in pages_with_search_params:
        page_path = Path(page_dir)

        if not page_path.exists():
            print(f"[SKIP] {page_dir}: directory not found")
            stats['skipped'] += 1
            continue

        try:
            status, message = create_layout_file(page_dir)
            stats[status] += 1

            prefix = {'created': '[OK]', 'skipped': '[SKIP]'}[status]
            print(f"{prefix} {page_dir}: {message}")

        except Exception as e:
            stats['error'] += 1
            print(f"[ERR] {page_dir}: {str(e)}")

    print(f"\nSummary:")
    print(f"  Created: {stats['created']}")
    print(f"  Skipped: {stats['skipped']}")
    print(f"  Errors: {stats['error']}")

if __name__ == '__main__':
    main()
