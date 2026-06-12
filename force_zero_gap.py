import os

base_dir = r"c:\Users\raghu\Downloads\static-snapshot (3)\henrybplantmuseum"
profile_path = os.path.join(base_dir, 'profile.html')

with open(profile_path, 'r', encoding='utf8') as f:
    profile_content = f.read()

# Make it completely bulletproof
old_css = """    .new-wishlist { 
      list-style: none; padding: 0; margin: 0; 
      border: 1px solid var(--border-color); 
      border-radius: 6px; 
      overflow: hidden;
    }
    .new-wishlist li {
      display: flex; justify-content: space-between; align-items: center;
      padding: 0.9rem 1.2rem; border-bottom: 1px solid var(--border-color); 
      margin-bottom: 0; background: var(--app-bg); transition: all 0.25s ease;
    }"""

new_css = """    .new-wishlist { 
      list-style: none; padding: 0; margin: 0; 
      border: 1px solid var(--border-color); 
      border-radius: 6px; 
      overflow: hidden;
      display: flex !important;
      flex-direction: column !important;
      gap: 0 !important;
    }
    .new-wishlist li {
      display: flex; justify-content: space-between; align-items: center;
      padding: 0.6rem 1rem; border-bottom: 1px solid var(--border-color); 
      margin: 0 !important; background: var(--app-bg); transition: all 0.25s ease;
    }"""

profile_content = profile_content.replace(old_css, new_css)

with open(profile_path, 'w', encoding='utf8') as f:
    f.write(profile_content)

print("Updated profile.html to enforce zero gap.")
