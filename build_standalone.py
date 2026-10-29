#!/usr/bin/env python3
"""Собрать автономный HTML из файлов архива без подпапок."""
from pathlib import Path
import base64
import mimetypes

root = Path(__file__).resolve().parent
page = (root / 'index.html').read_text(encoding='utf-8')
css = (root / 'style.css').read_text(encoding='utf-8')
data = (root / 'catalog-data.js').read_text(encoding='utf-8')
app = (root / 'app.js').read_text(encoding='utf-8')
replacements = {
    '<link rel="stylesheet" href="style.css">': '<style>\n' + css + '\n</style>',
    '<script src="catalog-data.js" defer></script>': '<script>\n' + data + '\n</script>',
    '<script src="app.js" defer></script>': '<script>\n' + app + '\n</script>',
}
for old, new in replacements.items():
    if old not in page:
        raise RuntimeError('Не найден блок для сборки: ' + old)
    page = page.replace(old, new)
resources = ['cocktail-table.jpg', 'deep-plate.jpg', 'flute.jpg', 'font-inter-cyrillic.woff2', 'font-inter-latin-ext.woff2', 'font-inter-latin.woff2', 'forks.jpg', 'green-glass.jpg', 'hero-desktop.jpg', 'hero-mobile.jpg', 'knives.jpg', 'plate-set.jpg', 'product-11763848.jpg', 'product-11763873.jpg', 'product-11768457.jpg', 'product-11768650.jpg', 'product-11768693.jpg', 'product-11770582.jpg', 'product-11770596.jpg', 'product-11770601.jpg', 'product-11770610.jpg', 'product-11770634.jpg', 'product-11770645.jpg', 'product-11770665.jpg', 'product-11770676.jpg', 'product-11770700.jpg', 'product-11770784.jpg', 'product-11770787.jpg', 'product-11770895.jpg', 'product-11771001.jpg', 'product-11771211.jpg', 'product-11776006.jpg', 'product-11841580.jpg', 'product-11841874.jpg', 'product-11841903.jpg', 'product-11842001.jpg', 'product-11842014.jpg', 'product-11842222.jpg', 'product-11842324.jpg', 'vk-icon.png', 'vk-logo.jpg', 'vk-original-11759208.jpg', 'vk-original-11763848.jpg', 'vk-original-11763873.jpg', 'vk-original-11768457.jpg', 'vk-original-11768650.jpg', 'vk-original-11768693.jpg', 'vk-original-11770582.jpg', 'vk-original-11770596.jpg', 'vk-original-11770601.jpg', 'vk-original-11770610.jpg', 'vk-original-11770634.jpg', 'vk-original-11770645.jpg', 'vk-original-11770665.jpg', 'vk-original-11770676.jpg', 'vk-original-11770700.jpg', 'vk-original-11770784.jpg', 'vk-original-11770787.jpg', 'vk-original-11770895.jpg', 'vk-original-11771001.jpg', 'vk-original-11771211.jpg', 'vk-original-11771568.jpg', 'vk-original-11771578.jpg', 'vk-original-11771587.jpg', 'vk-original-11776006.jpg', 'vk-original-11841580.jpg', 'vk-original-11841874.jpg', 'vk-original-11841883.jpg', 'vk-original-11841914.jpg', 'vk-original-11842001.jpg', 'vk-original-11842014.jpg', 'vk-original-11842222.jpg', 'vk-original-11842228.jpg', 'vk-original-11842234.jpg', 'vk-original-11842324.jpg', 'wine-glass.jpg']
embedded = 0
for name in sorted(resources, key=len, reverse=True):
    if name not in page:
        continue
    file = root / name
    if not file.is_file():
        raise FileNotFoundError(name)
    mime = mimetypes.guess_type(name)[0] or 'application/octet-stream'
    encoded = base64.b64encode(file.read_bytes()).decode('ascii')
    page = page.replace(name, 'data:' + mime + ';base64,' + encoded)
    embedded += 1
target = root / 'Event-Table-standalone.html'
target.write_text(page, encoding='utf-8')
print(f'Готово: {target} ({embedded} встроенных ресурсов)')
