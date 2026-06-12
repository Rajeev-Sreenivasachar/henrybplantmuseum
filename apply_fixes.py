import os
import re

base_dir = r"c:\Users\raghu\Downloads\static-snapshot (3)\henrybplantmuseum"

def update_file(filename, callback):
    filepath = os.path.join(base_dir, filename)
    if not os.path.exists(filepath):
        return
    with open(filepath, 'r', encoding='utf8') as f:
        content = f.read()
    new_content = callback(content)
    if new_content != content:
        with open(filepath, 'w', encoding='utf8') as f:
            f.write(new_content)
        print(f"Updated {filename}")

# 1. Update style.css
def modify_css(content):
    # Remove text-transform: uppercase
    content = re.sub(r'text-transform:\s*uppercase;', '/* text-transform removed */', content)
    
    # Update card background to light gold
    content = re.sub(r'(\.card\s*\{[^}]*background:\s*)var\(--bg-surface\)', r'\1#fdf5d6', content)
    content = re.sub(r'(\.history \.card\s*\{[^}]*background:\s*)var\(--bg-surface\)', r'\1#fdf5d6', content)
    content = re.sub(r'(\.highlights \.card\s*\{[^}]*background:\s*)var\(--bg-main\)', r'\1#fdf5d6', content)
    
    # Update a11y toggle from red to dark brown
    content = re.sub(r'(\.switch input:checked \+ \.slider\s*\{\s*background-color:\s*)var\(--brand-primary\)', r'\1#4A3525', content)
    content = re.sub(r'(\.switch input:checked \+ \.slider\s*\{\s*background-color:\s*)#[0-9a-fA-F]+', r'\1#4A3525', content) # catch any color
    
    # Reduce top navigation space
    content = re.sub(r'(\.hero-common-content\s*\{[^\}]*padding:\s*)0 20px', r'\1 0 20px', content)
    content = re.sub(r'(\.hero-visitor\s*\{[^\}]*padding:\s*)12rem', r'\1 6rem', content)
    
    # Add .card-ribbon and back-button repositioning
    if '.card-ribbon' not in content:
        content += '''
/* Card Ribbon & Back Button Styles */
.card-ribbon {
    position: absolute;
    top: 15px;
    right: -10px;
    background: #4A3525;
    color: #fff;
    padding: 5px 15px;
    font-size: 0.8rem;
    font-weight: bold;
    box-shadow: 0 4px 6px rgba(0,0,0,0.2);
    border-radius: 4px 0 0 4px;
    z-index: 10;
}
.back-link, a:has(.fa-arrow-left) {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 20px;
    padding: 8px 16px;
    background: #fdf5d6;
    border: 1px solid #e0ce9a;
    color: #4A3525;
    text-decoration: none;
    font-weight: 600;
    border-radius: 6px;
    transition: all 0.2s;
}
.back-link:hover, a:has(.fa-arrow-left):hover {
    background: #4A3525;
    color: #fff;
}
'''
    return content

update_file("style.css", modify_css)

# 2. Update visitor.html
def modify_visitor(content):
    # Remove duplicate CTA
    content = re.sub(r'</div>\s*<a href="/visitor\.html" class="nav-cta active">Plan Your Visit</a>\s*</div>\s*</nav>', r'</div>\n    </div>\n  </nav>', content)
    content = re.sub(r'</div>\s*<a href="/visitor\.html" class="nav-cta">Plan Your Visit</a>\s*</div>\s*</nav>', r'</div>\n    </div>\n  </nav>', content)
    return content

update_file("visitor.html", modify_visitor)

# 3. Update profile.html
def modify_profile(content):
    # Change signout hover
    content = re.sub(r'\.new-signout-btn:hover \{ background: var\(--crimson\); color: #fff; border-color: var\(--crimson\); \}', r'.new-signout-btn:hover { background: #EAEAEA; color: var(--dark-text); border-color: #ccc; }', content)
    # Fix itinerary links
    content = re.sub(r'\.new-wishlist li a \{ text-decoration: none;', r'.new-wishlist li a { text-decoration: underline;', content)
    return content

update_file("profile.html", modify_profile)

# 4. Update script.js
def modify_script(content):
    if "sessionStorage.getItem(window.location.pathname + '_scroll')" not in content:
        content += '''
// State retention for Events/Exhibits scroll position
document.addEventListener('DOMContentLoaded', () => {
    if (window.location.pathname.includes('events.html') || window.location.pathname.includes('exhibits.html')) {
        const savedScroll = sessionStorage.getItem(window.location.pathname + '_scroll');
        if (savedScroll) {
            window.scrollTo(0, parseInt(savedScroll, 10));
        }
        
        document.querySelectorAll('.card, .card a').forEach(el => {
            el.addEventListener('click', () => {
                sessionStorage.setItem(window.location.pathname + '_scroll', window.scrollY);
            });
        });
    }
});
'''
    return content

update_file("script.js", modify_script)

# 5. Update artifacts.html
def modify_artifacts(content):
    if "close-curate-backdrop" not in content:
        # Inject script for closing the sidebar when clicking outside
        script = '''
<script>
document.addEventListener('DOMContentLoaded', () => {
    const sidebar = document.getElementById('favSidebar');
    const toggleBtn = document.getElementById('floatingFavBtn');
    
    // Create an overlay div
    const overlay = document.createElement('div');
    overlay.className = 'close-curate-backdrop';
    overlay.style.cssText = 'position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 99; display: none;';
    document.body.appendChild(overlay);

    toggleBtn.addEventListener('click', () => {
        // If sidebar becomes active, show overlay
        setTimeout(() => {
            if (sidebar.classList.contains('active')) {
                overlay.style.display = 'block';
            }
        }, 50);
    });

    overlay.addEventListener('click', () => {
        sidebar.classList.remove('active');
        overlay.style.display = 'none';
    });
    
    const closeBtn = document.getElementById('closeFavBtn');
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            overlay.style.display = 'none';
        });
    }
});
</script>
</body>'''
        content = content.replace('</body>', script)
    return content

update_file("artifacts.html", modify_artifacts)

# 6. Add Ribbons to all event and exhibit HTML pages
def add_ribbons():
    for folder in ['events', 'exhibits']:
        folder_path = os.path.join(base_dir, f"{folder}.html")
        if not os.path.exists(folder_path): continue
        with open(folder_path, 'r', encoding='utf8') as f:
            content = f.read()
        
        # We need to add `<div class="card-ribbon">Event</div>` inside `.card` elements
        label = "Event" if folder == "events" else "Exhibit"
        new_content = re.sub(r'(<div class="card">)', f'\\1\n            <div class="card-ribbon">{label}</div>', content)
        if new_content != content:
            with open(folder_path, 'w', encoding='utf8') as f:
                f.write(new_content)
            print(f"Added ribbons to {folder}.html")

add_ribbons()
print("All fixes applied successfully!")
