import os
import re

base_dir = r"c:\Users\raghu\Downloads\static-snapshot (3)\henrybplantmuseum"
visitor_path = os.path.join(base_dir, 'visitor.html')
style_path = os.path.join(base_dir, 'style.css')

# 1. Fix visitor.html
with open(visitor_path, 'r', encoding='utf8') as f:
    visitor_content = f.read()

# I removed the desktop CTA button earlier. Let's add it back right before </div> </nav>
# Let's search for the end of the .nav-links block
target = r'(<a href="/visitor\.html" class="nav-cta active">Plan Your Visit</a>\s*</div>\s*)(</div>\s*</nav>)'
replacement = r'\1  <a href="/visitor.html" class="nav-cta active">Plan Your Visit</a>\n    \2'

visitor_content = re.sub(target, replacement, visitor_content)

with open(visitor_path, 'w', encoding='utf8') as f:
    f.write(visitor_content)


# 2. Fix style.css for reduced padding
with open(style_path, 'r', encoding='utf8') as f:
    style_content = f.read()

spacing_fix = """
/* Reduced padding between hero and filters */
.exhibitions-wrapper, .artifacts-wrapper {
    padding-top: 1.5rem !important;
}
.exhibitions-filters, .artifact-filters {
    margin-top: 0 !important;
}
"""

if ".exhibitions-wrapper, .artifacts-wrapper {" not in style_content:
    style_content += spacing_fix

with open(style_path, 'w', encoding='utf8') as f:
    f.write(style_content)

print("Fixed visitor desktop CTA and reduced hero padding.")
