import os
import re

base_dir = r"c:\Users\raghu\Downloads\static-snapshot (3)\henrybplantmuseum"
profile_path = os.path.join(base_dir, 'profile.html')

with open(profile_path, 'r', encoding='utf8') as f:
    profile_content = f.read()

# Replace the new-wishlist CSS block
old_css = """    .new-wishlist { list-style: none; padding: 0; margin: 0; }
    .new-wishlist li {
      display: flex; justify-content: space-between; align-items: center;
      padding: 0.9rem 1.2rem; border: 1px solid var(--border-color); border-radius: 6px;
      margin-bottom: 0; background: var(--app-bg); transition: all 0.25s ease;
    }"""

new_css = """    .new-wishlist { 
      list-style: none; padding: 0; margin: 0; 
      border: 1px solid var(--border-color); 
      border-radius: 6px; 
      overflow: hidden;
    }
    .new-wishlist li {
      display: flex; justify-content: space-between; align-items: center;
      padding: 0.9rem 1.2rem; border-bottom: 1px solid var(--border-color); 
      margin-bottom: 0; background: var(--app-bg); transition: all 0.25s ease;
    }
    .new-wishlist li:last-child {
      border-bottom: none;
    }"""

if old_css in profile_content:
    profile_content = profile_content.replace(old_css, new_css)
else:
    # Use regex if exact match fails
    profile_content = re.sub(r'\.new-wishlist\s*\{[^}]*\}\s*\.new-wishlist li\s*\{[^}]*\}', new_css, profile_content)

# Make sure :hover doesn't override border awkwardly
hover_old = """    .new-wishlist li:hover { background: #fff; border-color: var(--burgundy); box-shadow: 0 4px 12px rgba(114, 47, 55, 0.04); }"""
hover_new = """    .new-wishlist li:hover { background: #fff; box-shadow: inset 2px 0 0 var(--burgundy); }"""
if hover_old in profile_content:
    profile_content = profile_content.replace(hover_old, hover_new)

with open(profile_path, 'w', encoding='utf8') as f:
    f.write(profile_content)

print("Updated profile.html wishlist list-group style")
