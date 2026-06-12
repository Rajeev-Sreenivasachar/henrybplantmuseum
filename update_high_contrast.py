import os
import re

base_dir = r"c:\Users\raghu\Downloads\static-snapshot (3)\henrybplantmuseum"
style_path = os.path.join(base_dir, 'style.css')

with open(style_path, 'r', encoding='utf8') as f:
    style_content = f.read()

# 1. Update accessibility settings text in High Contrast Mode to yellow
a11y_hc = """
body.high-contrast #drawerA11y .panel-header h3,
body.high-contrast #drawerA11y label,
body.high-contrast #drawerA11y .a11y-desc {
    color: #ffcc00 !important;
}
"""

# Remove old if it exists
style_content = re.sub(r'body\.high-contrast #drawerA11y[^{]*\{[^}]*\}', '', style_content)
style_content += a11y_hc

# 2. Update navbar in high contrast to have yellow background and black text
navbar_hc = """
body.high-contrast .navbar { 
    background: #ffcc00 !important; 
    border-bottom: 2px solid #000 !important; 
}
body.high-contrast .navbar a, 
body.high-contrast .navbar .logo, 
body.high-contrast .navbar i {
    color: #000 !important;
}
"""
style_content = re.sub(r'body\.high-contrast \.navbar\s*\{[^}]*\}', '', style_content)
style_content += navbar_hc

# Ensure body.high-contrast has the black background and white text
# (This should already be there from the revert, but we can make sure)
# The user said "white text should be black, black text should be white". 
# The revert already restored --bg-main: #000 and --text-main: #fff.

with open(style_path, 'w', encoding='utf8') as f:
    f.write(style_content)

print("Updated high contrast mode styles.")
