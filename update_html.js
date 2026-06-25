const fs = require('fs');
const path = require('path');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(function(file) {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            if (!file.includes('.git')) {
                results = results.concat(walk(file));
            }
        } else {
            if (file.endsWith('.html')) {
                results.push(file);
            }
        }
    });
    return results;
}

const htmlToAdd =     <div class="a11y-info-section">
      <h4><i class="fa-solid fa-keyboard"></i> Keyboard Navigation</h4>
      <div class="a11y-key-row">
        <span>Navigate elements</span>
        <span class="a11y-key">Tab</span>
      </div>
      <div class="a11y-key-row">
        <span>Activate buttons</span>
        <span class="a11y-key">Enter / Space</span>
      </div>
      <div class="a11y-key-row">
        <span>Toggle Henry AI</span>
        <span class="a11y-key">H</span>
      </div>
      <div class="a11y-key-row">
        <span>Close dialogs</span>
        <span class="a11y-key">Esc</span>
      </div>
      
      <div class="a11y-screen-reader-box">
        <strong>Screen Reader Support:</strong> This website uses semantic HTML, ARIA labels, and proper heading structure for optimal screen reader compatibility.
      </div>
    </div>;

const files = walk('c:/Users/raghu/Downloads/henrybplantmuseum_git_repo');
let count = 0;

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    
    // Check if it's already there
    if (content.includes('Keyboard Navigation') && content.includes('Screen Reader Support')) {
        return;
    }

    const regex = /(<input type="checkbox" id="toggle-links">\s*<span class="slider"><\/span>\s*<\/label>\s*<\/div>)/;
    if (regex.test(content)) {
        content = content.replace(regex, $1\n\n);
        fs.writeFileSync(file, content, 'utf8');
        count++;
    }
});

console.log('Modified files: ' + count);
