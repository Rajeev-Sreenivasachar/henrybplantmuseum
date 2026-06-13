import os

base_dir = r"c:\Users\raghu\Downloads\static-snapshot (3)\henrybplantmuseum"
profile_path = os.path.join(base_dir, 'profile.html')

with open(profile_path, 'r', encoding='utf8') as f:
    profile_content = f.read()

# Replace the new-wishlist CSS to add max-height
old_css = """    .new-wishlist { 
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

new_css = """    .new-wishlist { 
      list-style: none; padding: 0; margin: 0; 
      border: 1px solid var(--border-color); 
      border-radius: 6px; 
      overflow-y: auto;
      max-height: 220px;
      display: flex !important;
      flex-direction: column !important;
      gap: 0 !important;
    }
    /* Scrollbar styling for wishlist */
    .new-wishlist::-webkit-scrollbar { width: 6px; }
    .new-wishlist::-webkit-scrollbar-track { background: transparent; }
    .new-wishlist::-webkit-scrollbar-thumb { background: #ddd; border-radius: 4px; }
    .new-wishlist::-webkit-scrollbar-thumb:hover { background: #bbb; }

    .new-wishlist li {
      display: flex; justify-content: space-between; align-items: center;
      padding: 0.5rem 0.8rem; border-bottom: 1px solid var(--border-color); 
      margin: 0 !important; background: var(--app-bg); transition: all 0.25s ease;
      min-height: 40px;
    }"""

if old_css in profile_content:
    profile_content = profile_content.replace(old_css, new_css)

with open(profile_path, 'w', encoding='utf8') as f:
    f.write(profile_content)

print("Updated profile.html wishlist to be scrollable and compact")
