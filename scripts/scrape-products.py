import json, re, ssl, urllib.request
from html import unescape
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / 'src' / 'catalog.js'
IMG = ROOT / 'public' / 'products'
IMG.mkdir(parents=True, exist_ok=True)
SSL = ssl._create_unverified_context()
UA = {'User-Agent': 'Mozilla/5.0'}

def get(url):
    req = urllib.request.Request(url, headers=UA)
    with urllib.request.urlopen(req, context=SSL, timeout=30) as r:
        return r.read()

def text(html):
    s = re.sub(r'<script[\s\S]*?</script>|<style[\s\S]*?</style>', ' ', html, flags=re.I)
    s = re.sub(r'<[^>]+>', ' ', s)
    return re.sub(r'\s+', ' ', unescape(s)).strip()

def attr_records(html):
    pattern = r'<a href="(/china/[^"]+)">\s*<img[^>]+src="([^"]+)"[^>]+alt="([^"]+)"'
    return re.findall(pattern, html, flags=re.I)

records = []
for page in ('p1', 'p2', 'p3'):
    html = get(f'https://www.so-fine.com.cn/supplies/{page}').decode('utf-8', 'ignore')
    records.extend(attr_records(html))

seen = set(); products = []
for path, image, alt in records:
    if path in seen: continue
    seen.add(path)
    detail = get('https://www.so-fine.com.cn' + path).decode('utf-8', 'ignore')
    body = text(detail)
    title_match = re.search(r'<h1>(.*?)</h1>', detail, flags=re.I|re.S)
    title = text(title_match.group(1)) if title_match else alt
    model = re.search(r'\((SF[^)]+)\)', title)
    model = model.group(1) if model else re.search(r'(SF\d+)', alt).group(1) if re.search(r'(SF\d+)', alt) else title
    images = re.findall(r'data-large-src="([^"]+)"', detail, flags=re.I)
    if not images: images = [image]
    local_images=[]
    for i, remote in enumerate(dict.fromkeys(images)):
        suffix = '.jpg' if remote.lower().split('?')[0].endswith(('.jpg','.jpeg')) else '.png'
        filename = f'{model.lower()}-{i+1}{suffix}'
        target = IMG / filename
        try: target.write_bytes(get(remote))
        except Exception: pass
        if target.exists(): local_images.append('/products/' + filename)
    fields = {}
    for label in ('Brand','Product origin','Delivery time','Supply capacity','Thickness','Adhesive','Liner','Backing Paper','Width','Length','Size','weight','Features'):
        match = re.search(label + r'\s*[:：]\s*([^<]{2,160})', detail, flags=re.I)
        if match: fields[label.lower().replace(' ','_')] = re.sub(r'\s+', ' ', unescape(match.group(1))).strip(' ;')
    family = title.split('(')[0].strip()
    slug = model.lower().replace(' ','-') if re.match(r'^SF\d+$', model, re.I) else re.sub(r'[^a-z0-9]+','-',title.lower()).strip('-')
    products.append({'family':family.upper(),'model':model,'title':family+'.','image':local_images[0] if local_images else image,'gallery':local_images,'description':body[:220],'specs':[[k.replace('_',' ').title(),v] for k,v in fields.items() if k not in ('brand','features')],'slug':slug,'source':'https://www.so-fine.com.cn'+path})

OUT.write_text('export const catalogProducts = ' + json.dumps(products, ensure_ascii=False, indent=2) + ';\n', encoding='utf-8')
print(f'captured {len(products)} products')
