import os
import re

base_dir = r"c:\Users\raghu\Downloads\static-snapshot (3)\henrybplantmuseum"

# 1. Add Ribbons to events and exhibits
for folder in ['events', 'exhibits']:
    path = os.path.join(base_dir, f"{folder}.html")
    if os.path.exists(path):
        with open(path, 'r', encoding='utf8') as f:
            content = f.read()
        
        label = "Event" if folder == "events" else "Exhibit"
        # Find <a href="..." class="...card-exhibits...">
        # and inject <div class="card-ribbon">Event</div> inside
        new_content = re.sub(r'(class="[^"]*card-exhibits[^"]*"\s*(?:target="_blank")?>)', f'\\1\n          <div class="card-ribbon">{label}</div>', content)
        
        if new_content != content:
            with open(path, 'w', encoding='utf8') as f:
                f.write(new_content)
            print(f"Added ribbons to {folder}.html")

# 2. Update style.css for .card-exhibits background
style_path = os.path.join(base_dir, 'style.css')
with open(style_path, 'r', encoding='utf8') as f:
    style_content = f.read()

# Update .card-exhibits background if it exists
style_content = re.sub(r'(\.card-exhibits\s*\{[^}]*background:\s*)var\(--bg-surface\)', r'\1#fdf5d6', style_content)
style_content = re.sub(r'(\.card-exhibits\s*\{[^}]*background:\s*)#fff(fff)?', r'\1#fdf5d6', style_content)

# Just to be safe, explicitly add rule if needed
if '.card-exhibits { background: #fdf5d6;' not in style_content:
    style_content += '\n.card-exhibits { background: #fdf5d6 !important; position: relative; }\n'

with open(style_path, 'w', encoding='utf8') as f:
    f.write(style_content)
print("Updated style.css for .card-exhibits")
