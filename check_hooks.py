import os
import re

hooks = ['useState', 'useEffect', 'useCallback', 'useMemo', 'useRef', 'useContext', 'useReducer', 'useLayoutEffect']
issues = []

for root, dirs, files in os.walk('src'):
    for file in files:
        if file.endswith(('.tsx', '.ts')):
            filepath = os.path.join(root, file)
            try:
                with open(filepath, 'r', encoding='utf-8') as f:
                    content = f.read()

                    if 'react' not in content.lower():
                        continue

                    import_pattern = r'import.*from ["\']react["\']'
                    import_match = re.search(import_pattern, content, re.IGNORECASE)
                    if not import_match:
                        continue

                    import_line = import_match.group(0)

                    for hook in hooks:
                        hook_pattern = r'\b' + hook + r'\s*\('
                        if re.search(hook_pattern, content):
                            if hook not in import_line:
                                issues.append(f'{filepath}: uses {hook} but not imported')
            except Exception as e:
                pass

if issues:
    print('MISSING IMPORTS FOUND:')
    for issue in issues:
        print(issue)
else:
    print('No missing hook imports found')
