import os
import re

base_dir = r"c:\Users\raghu\Downloads\static-snapshot (3)\henrybplantmuseum"
style_path = os.path.join(base_dir, 'style.css')

with open(style_path, 'r', encoding='utf8') as f:
    style_content = f.read()

# Remove the old appended overrides to prevent clutter
style_content = re.sub(r'/\* Nav CTA Overrides \*/.*?(?=\Z|\n\n)', '', style_content, flags=re.DOTALL)

# Let's target the exact selectors so we win the specificity war
nav_cta_css = """
/* Nav CTA Overrides - Fixed Specificity */
.nav-links .nav-cta, .nav-container > .nav-cta, .nav-links a.nav-cta.active {
    background-color: #ffffff !important;
    color: #000000 !important;
    border: 1px solid #ddd;
}
.nav-links .nav-cta:hover, .nav-container > .nav-cta:hover, .nav-links a.nav-cta.active:hover {
    background-color: var(--brand-primary) !important;
    color: #000000 !important;
    border-color: var(--brand-primary) !important;
}
"""
style_content += nav_cta_css

with open(style_path, 'w', encoding='utf8') as f:
    f.write(style_content)

print("Updated nav-cta overrides with correct specificity")
