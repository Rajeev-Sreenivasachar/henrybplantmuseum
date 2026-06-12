import os
import re

base_dir = r"c:\Users\raghu\Downloads\static-snapshot (3)\henrybplantmuseum"
style_path = os.path.join(base_dir, 'style.css')

with open(style_path, 'r', encoding='utf8') as f:
    style_content = f.read()

# Replace color in #drawerA11y label
style_content = re.sub(r'(#drawerA11y label\s*\{[^}]*color:\s*)var\(--brand-primary\)(\s*!important)?;?', r'\1#000\2;', style_content)

# Replace color in #drawerA11y .a11y-desc
style_content = re.sub(r'(#drawerA11y \.a11y-desc\s*\{[^}]*color:\s*)var\(--brand-primary\)(\s*!important)?;?', r'\1#000\2;', style_content)

with open(style_path, 'w', encoding='utf8') as f:
    f.write(style_content)

print("Updated accessibility text colors to black")
