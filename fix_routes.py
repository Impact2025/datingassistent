import pathlib
import re

def should_add_csrf(content):
    """Determine if route needs CSRF protection"""
    # Check if it has POST/PUT/DELETE/PATCH
    has_mutation = bool(re.search(r'export\s+async\s+function\s+(POST|PUT|DELETE|PATCH)', content))
    # Check if it already has CSRF
    has_csrf = 'verifyCSRF' in content or 'csrf.verify' in content
    return has_mutation and not has_csrf

def should_add_auth(content, route_path):
    """Determine if route needs auth"""
    # Admin routes should have auth
    is_admin_route = '/admin/' in route_path
    # Check if already has auth
    has_auth = 'getToken' in content or 'getServerSession' in content
    return is_admin_route and not has_auth

def needs_edge_runtime(content):
    """Check if route needs Edge runtime"""
    return 'export const runtime' not in content

def generate_imports(content, needs_csrf, needs_auth):
    """Generate necessary imports"""
    imports = []

    # Check existing imports
    has_nextauth_import = "from 'next-auth/jwt'" in content
    has_csrf_import = "from '@/lib/csrf-edge'" in content

    if needs_csrf and not has_csrf_import:
        imports.append("import { verifyCSRF } from '@/lib/csrf-edge';")

    if needs_auth and not has_nextauth_import:
        imports.append("import { getToken } from 'next-auth/jwt';")

    return imports

def add_edge_runtime(content):
    """Add Edge runtime export"""
    if 'export const runtime' in content:
        return content

    # Find where to insert (after imports)
    lines = content.split('\n')
    insert_index = 0

    for i, line in enumerate(lines):
        if line.strip().startswith('import '):
            insert_index = i + 1
        elif line.strip() and not line.strip().startswith('import') and insert_index > 0:
            break

    # Insert after last import
    lines.insert(insert_index, '')
    lines.insert(insert_index + 1, 'export const runtime = \'edge\';')

    return '\n'.join(lines)

def add_csrf_check(content, function_name='POST'):
    """Add CSRF verification to function"""
    pattern = f'export async function {function_name}\\s*\\(([^)]+)\\)\\s*{{([^}}]*?)(?=\\n\\s*(?:const|let|var|try|return|if)))'

    def replacement(match):
        params = match.group(1)
        # Extract request param name
        req_match = re.search(r'(\w+)\s*:\s*(?:NextRequest|Request)', params)
        req_name = req_match.group(1) if req_match else 'request'

        csrf_check = f'''export async function {function_name}({params}) {{
  // CSRF Protection
  const csrfValid = await verifyCSRF({req_name});
  if (!csrfValid) {{
    return NextResponse.json({{ error: 'Invalid CSRF token' }}, {{ status: 403 }});
  }}
'''
        return csrf_check

    return re.sub(pattern, replacement, content, flags=re.MULTILINE | re.DOTALL)

def add_auth_check(content, function_name='POST', is_admin=False):
    """Add auth verification to function"""
    pattern = f'(export async function {function_name}\\s*\\([^)]+\\)\\s*{{\\s*(?://[^\\n]*\\n\\s*)*(?:const csrfValid[^}}]+}}\\s*)?)'

    def replacement(match):
        existing = match.group(1)

        auth_check = f'''{existing}
  // Authentication Check
  const token = await getToken({{ req: request, secret: process.env.NEXTAUTH_SECRET }});
  if (!token) {{
    return NextResponse.json({{ error: 'Unauthorized' }}, {{ status: 401 }});
  }}
'''
        if is_admin:
            auth_check += '''
  // Admin Check
  if (token.role !== 'admin') {
    return NextResponse.json({ error: 'Forbidden - Admin access required' }, { status: 403 });
  }
'''

        return auth_check

    return re.sub(pattern, replacement, content, count=1)

# Generate report
api_dir = pathlib.Path('src/app/api')
report = []

for route_file in api_dir.rglob('route.ts'):
    try:
        content = route_file.read_text(encoding='utf-8')
        route_path = str(route_file).replace('src\\app\\api\\', '/api/')

        needs_csrf = should_add_csrf(content)
        needs_auth = should_add_auth(content, route_path)
        needs_edge = needs_edge_runtime(content)

        if needs_csrf or needs_auth or needs_edge:
            report.append({
                'path': route_path,
                'needs_csrf': needs_csrf,
                'needs_auth': needs_auth,
                'needs_edge': needs_edge
            })
    except:
        pass

# Print summary
print(f"\n=== FIX SUMMARY ===")
print(f"Routes needing fixes: {len(report)}")
print(f"Need CSRF: {sum(1 for r in report if r['needs_csrf'])}")
print(f"Need Auth: {sum(1 for r in report if r['needs_auth'])}")
print(f"Need Edge: {sum(1 for r in report if r['needs_edge'])}")

print(f"\n=== TOP 20 PRIORITY FIXES ===")
for i, r in enumerate(report[:20]):
    fixes = []
    if r['needs_csrf']:
        fixes.append('CSRF')
    if r['needs_auth']:
        fixes.append('AUTH')
    if r['needs_edge']:
        fixes.append('EDGE')
    print(f"{i+1}. {r['path']}")
    print(f"   Needs: {', '.join(fixes)}")
