import os
import re

base_dir = r"c:\Users\raghu\Downloads\static-snapshot (3)\henrybplantmuseum"

# 1. Remove Ribbons from events and exhibits
for folder in ['events', 'exhibits']:
    path = os.path.join(base_dir, f"{folder}.html")
    if os.path.exists(path):
        with open(path, 'r', encoding='utf8') as f:
            content = f.read()
        
        # Remove <div class="card-ribbon">...</div>
        new_content = re.sub(r'\s*<div class="card-ribbon">.*?</div>', '', content)
        
        if new_content != content:
            with open(path, 'w', encoding='utf8') as f:
                f.write(new_content)
            print(f"Removed ribbons from {folder}.html")

# 2. Remove .card-ribbon CSS
style_path = os.path.join(base_dir, 'style.css')
with open(style_path, 'r', encoding='utf8') as f:
    style_content = f.read()

# Remove the block:
# .card-ribbon {
#     position: absolute; ... }
style_content = re.sub(r'/\* Card Ribbon & Back Button Styles \*/\s*\.card-ribbon\s*\{[^}]*\}', '/* Back Button Styles */', style_content)

with open(style_path, 'w', encoding='utf8') as f:
    f.write(style_content)
print("Removed .card-ribbon from style.css")
