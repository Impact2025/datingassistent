import pathlib

api_dir = pathlib.Path('src/app/api')
for route_file in api_dir.rglob('route.ts'):
    try:
        content = route_file.read_text(encoding='utf-8')
        if 'export const runtime' not in content:
            print(route_file)
    except Exception as e:
        pass
