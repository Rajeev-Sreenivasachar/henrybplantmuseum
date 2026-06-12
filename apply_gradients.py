import os
import re

base_dir = r"c:\Users\raghu\Downloads\static-snapshot (3)\henrybplantmuseum"

# Gradient CSS rule
gradient = "linear-gradient(135deg, #fffcf2 0%, #fdf5d6 100%)"

# 1. Update style.css
style_path = os.path.join(base_dir, 'style.css')
with open(style_path, 'r', encoding='utf8') as f:
    style_content = f.read()

# .card
style_content = re.sub(r'(\.card\s*\{[^}]*background:\s*)#fdf5d6', r'\1' + gradient, style_content)
style_content = re.sub(r'(\.card\s*\{[^}]*background:\s*)var\(--bg-surface\)', r'\1' + gradient, style_content)

# .card-exhibits
style_content = re.sub(r'(\.card-exhibits\s*\{[^}]*background:\s*)#fdf5d6', r'\1' + gradient, style_content)

# .card-artifacts
if '.card-artifacts { background: ' in style_content:
    style_content = re.sub(r'(\.card-artifacts\s*\{[^}]*background:\s*)[^;}]+', r'\1' + gradient, style_content)
else:
    # Look for .card-artifacts { and add background
    style_content = re.sub(r'(\.card-artifacts\s*\{)', r'\1 background: ' + gradient + ';', style_content)
    
with open(style_path, 'w', encoding='utf8') as f:
    f.write(style_content)
print("Updated style.css with gradients")

# 2. Update profile.html
profile_path = os.path.join(base_dir, 'profile.html')
with open(profile_path, 'r', encoding='utf8') as f:
    profile_content = f.read()

# .new-card
profile_content = re.sub(r'(\.new-card\s*\{[^}]*background:\s*)var\(--card-bg\)', r'\1' + gradient, profile_content)

with open(profile_path, 'w', encoding='utf8') as f:
    f.write(profile_content)
print("Updated profile.html with gradients")
