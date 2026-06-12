import os
import re

base_dir = r"c:\Users\raghu\Downloads\static-snapshot (3)\henrybplantmuseum"

# 1. Update style.css
style_path = os.path.join(base_dir, 'style.css')
with open(style_path, 'r', encoding='utf8') as f:
    style_content = f.read()

# Make Accessibility Settings heading black
style_content = re.sub(r'(#drawerA11y \.panel-header h3\s*\{[^}]*color:\s*)var\(--brand-primary\)(\s*!important)?;?', r'\1#000\2;', style_content)

# Update High Contrast theme to yellow background, black text
high_contrast_css = """
body.high-contrast {
  --bg-main: #FFFF00 !important;
  --bg-surface: #FFFF00 !important;
  --bg-alt: #FFFF00 !important;
  --text-main: #000000 !important;
  --text-muted: #000000 !important;
  --brand-primary: #000000 !important;
  --brand-gold: #000000 !important;
  --border-color: #000000 !important;
  background-color: #FFFF00 !important;
  color: #000000 !important;
}
body.high-contrast * {
  color: #000000 !important;
  border-color: #000000 !important;
}
body.high-contrast .card, body.high-contrast .card-exhibits, body.high-contrast .card-artifacts, body.high-contrast .new-card, body.high-contrast .sleek-panel, body.high-contrast .new-auth-box, body.high-contrast .new-dash-header {
  background: #FFFF00 !important;
}
body.high-contrast .btn, body.high-contrast .nav-cta, body.high-contrast .back-link, body.high-contrast .new-auth-btn, body.high-contrast button {
  background-color: #000000 !important;
  color: #FFFF00 !important;
}
body.high-contrast .btn:hover, body.high-contrast .nav-cta:hover, body.high-contrast .back-link:hover, body.high-contrast button:hover {
  background-color: #FFFF00 !important;
  color: #000000 !important;
  border: 2px solid #000000 !important;
}
"""

# Remove old high contrast block
style_content = re.sub(r'body\.high-contrast\s*\{[^}]*\}', '', style_content)

# Append new high contrast
style_content += "\n" + high_contrast_css

with open(style_path, 'w', encoding='utf8') as f:
    f.write(style_content)
print("Updated style.css")


# 2. Update script.js for mutual exclusivity
script_path = os.path.join(base_dir, 'script.js')
with open(script_path, 'r', encoding='utf8') as f:
    script_content = f.read()

# Replace the a11y toggle logic
old_a11y_logic = """
  Object.entries(a11ySettings).forEach(([id, cls]) => {
    const toggle = document.getElementById(id);
    if (!toggle) return;
    const saved = localStorage.getItem(cls) === 'true';
    if(saved) document.body.classList.add(cls);
    toggle.checked = saved;
    toggle.addEventListener('change', () => {
      document.body.classList.toggle(cls, toggle.checked);
      localStorage.setItem(cls, toggle.checked);
    });
  });"""

new_a11y_logic = """
  Object.entries(a11ySettings).forEach(([id, cls]) => {
    const toggle = document.getElementById(id);
    if (!toggle) return;
    const saved = localStorage.getItem(cls) === 'true';
    if(saved) document.body.classList.add(cls);
    toggle.checked = saved;
    toggle.addEventListener('change', () => {
      document.body.classList.toggle(cls, toggle.checked);
      localStorage.setItem(cls, toggle.checked);
      
      // Mutual Exclusivity: High Contrast vs Dark Mode
      if (id === 'toggle-contrast' && toggle.checked) {
          const darkToggle = document.getElementById('toggle-dark');
          if (darkToggle && darkToggle.checked) {
              darkToggle.checked = false;
              document.body.classList.remove('dark-mode');
              localStorage.setItem('dark-mode', 'disabled');
          }
      }
    });
  });"""

script_content = script_content.replace(old_a11y_logic, new_a11y_logic)

# Replace the dark mode toggle logic
old_dark_logic = """
  if (darkToggle) {
    darkToggle.addEventListener('change', () => {
      if (darkToggle.checked) {
        document.body.classList.add('dark-mode');
        localStorage.setItem('dark-mode', 'enabled');
      } else {
        document.body.classList.remove('dark-mode');
        localStorage.setItem('dark-mode', 'disabled');
      }
    });
  }"""

new_dark_logic = """
  if (darkToggle) {
    darkToggle.addEventListener('change', () => {
      if (darkToggle.checked) {
        document.body.classList.add('dark-mode');
        localStorage.setItem('dark-mode', 'enabled');
        
        // Mutual Exclusivity: High Contrast vs Dark Mode
        const contrastToggle = document.getElementById('toggle-contrast');
        if (contrastToggle && contrastToggle.checked) {
            contrastToggle.checked = false;
            document.body.classList.remove('high-contrast');
            localStorage.setItem('high-contrast', 'false');
        }
      } else {
        document.body.classList.remove('dark-mode');
        localStorage.setItem('dark-mode', 'disabled');
      }
    });
  }"""

script_content = script_content.replace(old_dark_logic, new_dark_logic)

with open(script_path, 'w', encoding='utf8') as f:
    f.write(script_content)
print("Updated script.js")
