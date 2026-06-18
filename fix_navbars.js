const fs = require('fs');
const glob = require('glob');
const path = require('path');

const files = glob.sync('c:/Users/raghu/Downloads/static-snapshot (3)/henrybplantmuseum/*.html');

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    
    // Identify which page this is to set the active class
    const filename = path.basename(file);
    let navContent = `  <nav class="navbar" id="navbar">
    <div class="nav-container">
      <a href="/index.html" class="logo">Henry B. Plant Museum</a>
      <i class="fa-solid fa-bars menu-toggle" id="menuToggle"></i>
      <div class="nav-links" id="navLinks">
        <a href="/index.html"^^INDEX_ACTIVE^^>Home</a>
        <a href="/about.html"^^ABOUT_ACTIVE^^>About</a>
        <a href="/events.html"^^EVENTS_ACTIVE^^>Events</a>
        <a href="/exhibits.html"^^EXHIBITS_ACTIVE^^>Exhibits</a>
        <a href="/artifacts.html"^^ARTIFACTS_ACTIVE^^>Artifacts</a>
        <a href="/get_involved.html"^^GET_INVOLVED_ACTIVE^^>Get Involved</a>
        <a href="/visitor.html"^^VISITOR_ACTIVE^^>Plan Your Visit</a>
        <a href="/profile.html" class="nav-cta^^PROFILE_ACTIVE^^">Sign In</a>
      </div>
      <a href="/profile.html" class="nav-cta^^PROFILE_ACTIVE^^">Sign In</a>
    </div>
  </nav>`;

    navContent = navContent.replace('^^INDEX_ACTIVE^^', filename === 'index.html' ? ' class="active"' : '');
    navContent = navContent.replace('^^ABOUT_ACTIVE^^', filename === 'about.html' ? ' class="active"' : '');
    navContent = navContent.replace('^^EVENTS_ACTIVE^^', filename === 'events.html' ? ' class="active"' : '');
    navContent = navContent.replace('^^EXHIBITS_ACTIVE^^', filename === 'exhibits.html' ? ' class="active"' : '');
    navContent = navContent.replace('^^ARTIFACTS_ACTIVE^^', filename === 'artifacts.html' ? ' class="active"' : '');
    navContent = navContent.replace('^^GET_INVOLVED_ACTIVE^^', filename === 'get_involved.html' ? ' class="active"' : '');
    navContent = navContent.replace('^^VISITOR_ACTIVE^^', filename === 'visitor.html' ? ' class="active"' : '');
    navContent = navContent.replace(/\^\^PROFILE_ACTIVE\^\^/g, filename === 'profile.html' ? ' active' : '');

    // Replace the existing nav with the normalized one.
    // Use regex to find <nav class="navbar" id="navbar"> ... </nav>
    const navRegex = /<nav class="navbar" id="navbar">[\s\S]*?<\/nav>/;
    if (navRegex.test(content)) {
        content = content.replace(navRegex, navContent);
        fs.writeFileSync(file, content, 'utf8');
        console.log(`Updated navbar in ${filename}`);
    } else {
        console.log(`No navbar found in ${filename}`);
    }
});
