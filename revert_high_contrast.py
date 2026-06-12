import os
import re

base_dir = r"c:\Users\raghu\Downloads\static-snapshot (3)\henrybplantmuseum"
style_path = os.path.join(base_dir, 'style.css')

with open(style_path, 'r', encoding='utf8') as f:
    style_content = f.read()

# I added this block at the end:
# body.high-contrast { ... } down to body.high-contrast button:hover { ... }
# Let's replace the whole block starting from body.high-contrast {

# Remove everything from body.high-contrast { down to the end of the file since I appended it at the end
# Wait, let's use regex to remove my entire injected block.
injected_pattern = r'body\.high-contrast\s*\{.*?body\.high-contrast button:hover\s*\{.*?\}'
style_content = re.sub(injected_pattern, '', style_content, flags=re.DOTALL)

# Also remove any remaining body.high-contrast if I missed some parts
style_content = re.sub(r'body\.high-contrast\s*\{[^}]*\}', '', style_content)
style_content = re.sub(r'body\.high-contrast\s+\*[^{]*\{[^}]*\}', '', style_content)
style_content = re.sub(r'body\.high-contrast\s+\.[^{]*\{[^}]*\}', '', style_content)

# Add the original back
original_hc = """
body.high-contrast {
  --bg-main: #000; --bg-surface: #000; --bg-alt: #111;
  --text-main: #fff; --text-muted: #ddd;
  --brand-primary: #ffcc00; --brand-primary-hover: #e6b800;
  --brand-gold: #ffcc00; --border-color: #fff;
}
"""

style_content += original_hc

with open(style_path, 'w', encoding='utf8') as f:
    f.write(style_content)

print("Reverted high contrast mode.")
