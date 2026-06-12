import os

base_dir = r"c:\Users\raghu\Downloads\static-snapshot (3)\henrybplantmuseum"
style_path = os.path.join(base_dir, 'style.css')

with open(style_path, 'r', encoding='utf8') as f:
    style_content = f.read()

dark_nav_css = """
/* Dark Mode Navbar */
body.dark-mode .navbar {
    background: #1e1e1e !important;
    border-bottom: 1px solid #333 !important;
}
body.dark-mode .navbar a:not(.nav-cta),
body.dark-mode .navbar .logo,
body.dark-mode .navbar i.menu-toggle {
    color: #ffffff !important;
}
body.dark-mode .nav-links .nav-cta, 
body.dark-mode .nav-container > .nav-cta {
    background-color: var(--brand-primary) !important;
    color: #ffffff !important;
    border: none !important;
}
"""

if "body.dark-mode .navbar {" not in style_content:
    style_content += dark_nav_css
    with open(style_path, 'w', encoding='utf8') as f:
        f.write(style_content)
    print("Added dark mode navbar styles.")
else:
    print("Styles already exist.")
