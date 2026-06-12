import os
import re

base_dir = r"c:\Users\raghu\Downloads\static-snapshot (3)\henrybplantmuseum"
style_path = os.path.join(base_dir, 'style.css')
profile_path = os.path.join(base_dir, 'profile.html')

# 1. Update style.css
with open(style_path, 'r', encoding='utf8') as f:
    style_content = f.read()

# Make card text black
card_text_css = """
.card h3, .card p, .card h4, .card span,
.card-exhibits h3, .card-exhibits p, .card-exhibits h4, .card-exhibits span,
.card-artifacts h3, .card-artifacts p, .card-artifacts h4, .card-artifacts span {
    color: #000000 !important;
}
"""
if "color: #000000 !important;" not in style_content.split('/* Nav CTA Overrides */')[0]: # Just preventing duplicates roughly
    style_content += "\n/* Force Card Text Black */\n" + card_text_css

# Update nav-cta button
nav_cta_css = """
/* Nav CTA Overrides */
.nav-cta {
    background-color: #ffffff !important;
    color: #000000 !important;
    border: 1px solid #ddd;
}
.nav-cta:hover {
    background-color: var(--brand-primary) !important;
    color: #000000 !important;
    border-color: var(--brand-primary) !important;
}
"""
# Remove existing .nav-cta overrides if I injected them before
style_content = re.sub(r'/\* Nav CTA Overrides \*/.*?(?=\Z|\n\n)', '', style_content, flags=re.DOTALL)
style_content += nav_cta_css

with open(style_path, 'w', encoding='utf8') as f:
    f.write(style_content)

# 2. Update profile.html for .new-card
with open(profile_path, 'r', encoding='utf8') as f:
    profile_content = f.read()

profile_content = re.sub(r'(\.new-card h4\s*\{[^}]*color:\s*)var\(--dark-text\)', r'\1#000000', profile_content)
profile_content = re.sub(r'(\.new-card p\s*\{[^}]*color:\s*)#777', r'\1#000000', profile_content)

with open(profile_path, 'w', encoding='utf8') as f:
    f.write(profile_content)

print("Updated text colors for cards and nav-cta.")
