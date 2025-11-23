import pathlib
import re
from collections import defaultdict

api_dir = pathlib.Path('src/app/api')
routes = []

for route_file in api_dir.rglob('route.ts'):
    try:
        content = route_file.read_text(encoding='utf-8')

        # Detect HTTP methods
        methods = []
        if re.search(r'export\s+async\s+function\s+GET', content):
            methods.append('GET')
        if re.search(r'export\s+async\s+function\s+POST', content):
            methods.append('POST')
        if re.search(r'export\s+async\s+function\s+PUT', content):
            methods.append('PUT')
        if re.search(r'export\s+async\s+function\s+DELETE', content):
            methods.append('DELETE')
        if re.search(r'export\s+async\s+function\s+PATCH', content):
            methods.append('PATCH')

        # Security checks
        has_edge = 'export const runtime' in content
        has_csrf = 'csrf.verify' in content or 'verifyCSRF' in content
        has_auth = 'getToken' in content or 'getServerSession' in content
        has_admin = 'isAdmin' in content or 'role === "admin"' in content

        # Risk assessment
        risk = 'LOW'
        if any(m in ['POST', 'PUT', 'DELETE', 'PATCH'] for m in methods):
            if not has_csrf:
                risk = 'CRITICAL'
            elif not has_auth:
                risk = 'HIGH'
            else:
                risk = 'MEDIUM'

        route_info = {
            'path': str(route_file).replace('src\\app\\api\\', '/api/').replace('\\route.ts', ''),
            'methods': methods or ['UNKNOWN'],
            'has_edge': has_edge,
            'has_csrf': has_csrf,
            'has_auth': has_auth,
            'has_admin': has_admin,
            'risk': risk
        }
        routes.append(route_info)
    except Exception as e:
        pass

# Sort by risk
risk_order = {'CRITICAL': 0, 'HIGH': 1, 'MEDIUM': 2, 'LOW': 3}
routes.sort(key=lambda x: (risk_order.get(x['risk'], 99), x['path']))

# Print summary
print("\n=== SECURITY AUDIT SUMMARY ===\n")
print(f"Total routes: {len(routes)}")
print(f"With Edge runtime: {sum(1 for r in routes if r['has_edge'])}")
print(f"With CSRF protection: {sum(1 for r in routes if r['has_csrf'])}")
print(f"With Auth: {sum(1 for r in routes if r['has_auth'])}")

risk_counts = defaultdict(int)
for r in routes:
    risk_counts[r['risk']] += 1

print(f"\n=== RISK LEVELS ===")
for risk in ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW']:
    print(f"{risk}: {risk_counts[risk]}")

print(f"\n=== TOP 30 CRITICAL/HIGH RISK ROUTES ===\n")
count = 0
for route in routes:
    if route['risk'] in ['CRITICAL', 'HIGH'] and count < 30:
        methods_str = ','.join(route['methods'])
        flags = []
        if not route['has_edge']:
            flags.append('NO_EDGE')
        if not route['has_csrf']:
            flags.append('NO_CSRF')
        if not route['has_auth']:
            flags.append('NO_AUTH')

        print(f"{route['risk']:8} [{methods_str:20}] {route['path']}")
        print(f"         Issues: {', '.join(flags)}")
        count += 1

print(f"\n=== ROUTES BY HTTP METHOD ===")
method_counts = defaultdict(int)
for route in routes:
    for method in route['methods']:
        method_counts[method] += 1

for method, count in sorted(method_counts.items()):
    print(f"{method}: {count}")
