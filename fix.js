const fs = require('fs');
const path = require('path');

const dir = 'c:/Users/raghu/Downloads/static-snapshot (3)/henrybplantmuseum';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.html'));

files.forEach(file => {
    const filePath = path.join(dir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    
    // The string currently in the file contains literal "`n"
    const target = '</div>`n      <a href="/profile.html" class="nav-cta">Sign In</a>';
    const replacement = `  <a href="/profile.html" class="nav-cta">Sign In</a>\n      </div>\n      <a href="/profile.html" class="nav-cta">Sign In</a>`;
    
    if (content.includes(target)) {
        content = content.replace(target, replacement);
        fs.writeFileSync(filePath, content, 'utf8');
        console.log('Fixed', file);
    }
});
