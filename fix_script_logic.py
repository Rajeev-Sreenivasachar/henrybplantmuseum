import os
import re

base_dir = r"c:\Users\raghu\Downloads\static-snapshot (3)\henrybplantmuseum"

# 1. Fix script.js
script_path = os.path.join(base_dir, 'script.js')
with open(script_path, 'r', encoding='utf8') as f:
    script_content = f.read()

old_a11y = """  Object.entries(a11ySettings).forEach(([id, cls]) => {
    const toggle = document.getElementById(id);
    if (!toggle) return;
    const saved = localStorage.getItem(cls) === 'true';
    toggle.checked = saved;
    document.body.classList.toggle(cls, saved);
    toggle.addEventListener('change', e => {
      document.body.classList.toggle(cls, e.target.checked);
      localStorage.setItem(cls, e.target.checked);
    });
  });"""

new_a11y = """  Object.entries(a11ySettings).forEach(([id, cls]) => {
    const toggle = document.getElementById(id);
    if (!toggle) return;
    const saved = localStorage.getItem(cls) === 'true';
    toggle.checked = saved;
    document.body.classList.toggle(cls, saved);
    toggle.addEventListener('change', e => {
      document.body.classList.toggle(cls, e.target.checked);
      localStorage.setItem(cls, e.target.checked);
      
      // Mutual Exclusivity
      if (id === 'toggle-contrast' && e.target.checked) {
          const darkToggle = document.getElementById('toggle-dark');
          if (darkToggle && darkToggle.checked) {
              darkToggle.checked = false;
              document.body.classList.remove('dark-mode');
              localStorage.setItem('dark-mode', 'disabled');
          }
      }
    });
  });"""

script_content = script_content.replace(old_a11y, new_a11y)

# Also ensure dark mode mutually excludes contrast correctly on load
old_load = """  if (savedTheme === 'enabled' || (!savedTheme && prefersDark)) {
    document.body.classList.add('dark-mode');
    if (darkToggle) darkToggle.checked = true;
  }"""
new_load = """  if (savedTheme === 'enabled' || (!savedTheme && prefersDark)) {
    const contrastToggle = document.getElementById('toggle-contrast');
    if (!contrastToggle || !contrastToggle.checked) {
        document.body.classList.add('dark-mode');
        if (darkToggle) darkToggle.checked = true;
    }
  }"""
script_content = script_content.replace(old_load, new_load)

with open(script_path, 'w', encoding='utf8') as f:
    f.write(script_content)

# 2. Fix style.css for dark mode typography in #drawerA11y
style_path = os.path.join(base_dir, 'style.css')
with open(style_path, 'r', encoding='utf8') as f:
    style_content = f.read()

# I previously forced #drawerA11y label and .a11y-desc to be #000.
# I need to add dark mode overrides.
dark_override = """
body.dark-mode #drawerA11y .panel-header h3,
body.dark-mode #drawerA11y label,
body.dark-mode #drawerA11y .a11y-desc {
    color: var(--brand-primary) !important;
}
"""

if "body.dark-mode #drawerA11y" not in style_content:
    style_content += dark_override
    
with open(style_path, 'w', encoding='utf8') as f:
    f.write(style_content)

print("Fixed mutual exclusivity and dark mode colors.")
