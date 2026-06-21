document.addEventListener('DOMContentLoaded', () => {

  // 1. Mobile Menu
  const menuToggle = document.getElementById('menuToggle');
  const navLinks = document.getElementById('navLinks');
  if (menuToggle && navLinks) {
    menuToggle.addEventListener('click', (e) => {
      navLinks.classList.toggle('mobile-open');
      e.stopPropagation();
    });
    document.addEventListener('click', (e) => {
      if (!navLinks.contains(e.target) && !menuToggle.contains(e.target)) {
        navLinks.classList.remove('mobile-open');
      }
    });
  }

  // 2. Scroll Progress & Navbar
  const progressBar = document.getElementById('progressBar');
  const navbar = document.getElementById('navbar');
  window.addEventListener('scroll', () => {
    if (progressBar) {
      const winScroll = document.body.scrollTop || document.documentElement.scrollTop;
      const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
      progressBar.style.width = (winScroll / height) * 100 + '%';
    }
    if (navbar) {
      navbar.classList.toggle('scrolled', window.scrollY > 20);
    }
  });

  // 3. Drawers
  const overlay = document.getElementById('panelOverlay');
  const closeBtns = document.querySelectorAll('.close-btn');

  function closeDrawers() {
    document.querySelectorAll('.panel-drawer').forEach(d => d.classList.remove('open'));
    if (overlay) overlay.classList.remove('open');
  }

  function openDrawer(drawer) {
    closeDrawers();
    if (drawer) drawer.classList.add('open');
    if (overlay) overlay.classList.add('open');
  }

  const btnRes = document.getElementById('btnResources');
  const btnA11y = document.getElementById('btnA11y');
  const drawRes = document.getElementById('drawerResources');
  const drawA11y = document.getElementById('drawerA11y');

  if (btnRes) btnRes.addEventListener('click', () => openDrawer(drawRes));
  if (btnA11y) btnA11y.addEventListener('click', () => openDrawer(drawA11y));
  if (overlay) overlay.addEventListener('click', closeDrawers);
  closeBtns.forEach(btn => btn.addEventListener('click', closeDrawers));

  // 4. Slider
  const slides = document.querySelectorAll('.slide');
  const indicator = document.getElementById('slideNum');
  let currentSlide = 0;

  function updateSlider(direction) {
    if (slides.length > 0) {
      slides[currentSlide].classList.remove('active');
      currentSlide = (currentSlide + direction + slides.length) % slides.length;
      slides[currentSlide].classList.add('active');
      if (indicator) indicator.textContent = `0${currentSlide + 1} / 0${slides.length}`;
    }
  }

  const prevSlideBtn = document.getElementById('prevSlide');
  const nextSlideBtn = document.getElementById('nextSlide');
  if (prevSlideBtn) prevSlideBtn.addEventListener('click', () => updateSlider(-1));
  if (nextSlideBtn) nextSlideBtn.addEventListener('click', () => updateSlider(1));

  // 5. Reveal Animations
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) entry.target.classList.add('active');
    });
  }, { threshold: 0.1 });
  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));

  // 6. Accessibility Toggles (persisted with localStorage)
  const a11ySettings = {
    'toggle-contrast': 'high-contrast',
    'toggle-text': 'large-text',
    'toggle-dyslexia': 'dyslexia-mode',
    'toggle-links': 'highlight-links',
    'toggle-motion': 'reduced-motion',
  };

  Object.entries(a11ySettings).forEach(([id, cls]) => {
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
  });

  const darkToggle = document.getElementById('toggle-dark');

  // 1. Check local storage or system preference on load
  const savedTheme = localStorage.getItem('dark-mode');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

  if (savedTheme === 'enabled' || (!savedTheme && prefersDark)) {
    const contrastToggle = document.getElementById('toggle-contrast');
    if (!contrastToggle || !contrastToggle.checked) {
        document.body.classList.add('dark-mode');
        if (darkToggle) darkToggle.checked = true;
    }
  }

  // 2. Listen for switch toggles
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
  }

  // Dynamic addition of Reset to Default button
  if (drawA11y) {
    const panelBody = drawA11y.querySelector('.panel-body');
    if (panelBody && !document.getElementById('reset-a11y-btn')) {
      const resetBtn = document.createElement('button');
      resetBtn.id = 'reset-a11y-btn';
      resetBtn.innerText = 'Reset to Default';
      resetBtn.className = 'reset-a11y-btn';
      
      resetBtn.addEventListener('click', () => {
        const toggles = ['toggle-contrast', 'toggle-text', 'toggle-dyslexia', 'toggle-links', 'toggle-motion', 'toggle-dark'];
        toggles.forEach(id => {
          const toggle = document.getElementById(id);
          if (toggle) {
            toggle.checked = false;
            toggle.dispatchEvent(new Event('change'));
          }
        });
        
        // Final sanity check to clean all local states and body classes
        document.body.classList.remove('high-contrast', 'large-text', 'dyslexia-mode', 'highlight-links', 'reduced-motion', 'dark-mode');
        localStorage.setItem('high-contrast', 'false');
        localStorage.setItem('large-text', 'false');
        localStorage.setItem('dyslexia-mode', 'false');
        localStorage.setItem('highlight-links', 'false');
        localStorage.setItem('reduced-motion', 'false');
        localStorage.setItem('dark-mode', 'disabled');
      });

      panelBody.appendChild(resetBtn);
    }
  }
});

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

    // Smart Back Buttons on Detailed Pages
    const backBtn = document.querySelector('.sticky-ticket-btn');
    if (backBtn && backBtn.textContent.includes('Back to')) {
        const ref = document.referrer.toLowerCase();
        if (!ref.includes('events.html') && !ref.includes('exhibits.html') && !ref.includes('get_involved.html') && !ref.includes('artifacts.html')) {
            backBtn.style.display = 'none';
        }
    }
});

window.clearItinerary = function() {
    if(confirm("Are you sure you want to clear your entire itinerary?")) {
        localStorage.removeItem('fbla_wishlist');
        if(typeof renderWishlist === 'function') renderWishlist();
    }
};

window.copyItinerary = function() {
    let wishlist = JSON.parse(localStorage.getItem('fbla_wishlist')) || [];
    if(wishlist.length === 0) {
        alert("Your itinerary is empty!");
        return;
    }
    let text = "My Henry B. Plant Museum Itinerary:\n";
    wishlist.forEach(item => { text += "- " + item.name + "\n"; });
    navigator.clipboard.writeText(text).then(() => {
        alert("Itinerary copied to clipboard!");
    }).catch(err => {
        console.error("Could not copy text: ", err);
    });
};

window.printItinerary = function() {
    window.print();
};

// ==========================================
// UNIFIED NAVBAR & AUTHENTICATION MANAGER
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
    // Target all profile links on the entire page, excluding the footer
    const allProfileLinks = document.querySelectorAll('a[href*="profile.html"]');
    const profileLinks = Array.from(allProfileLinks).filter(link => !link.closest('footer'));

    // Helper function to update the navbar text instantly
    function updateNavbarText(username) {
        if (username) {
            // FIX: Truncate usernames longer than 7 characters
            const displayUsername = username.length > 7 ? username.substring(0, 4) + "..." : username;
            
            profileLinks.forEach(link => {
                link.innerHTML = `<i class="fa-solid fa-user"></i> ${displayUsername}`;
            });
        } else {
            profileLinks.forEach(link => {
                link.innerHTML = `<i class="fa-solid fa-user"></i> Sign In`; 
            });
        }
    }

    // 1. Initial State Sync on Page Load
    const isLoggedInitially = localStorage.getItem("museumUserLogged") === "true";
    const storedUsername = localStorage.getItem("currentUsername");

    if (isLoggedInitially && storedUsername) {
        updateNavbarText(storedUsername);
    } else {
        updateNavbarText(null);
    }

    // 2. Real-Time Input Tracker
    let lastTypedUsername = "";
    document.addEventListener('input', (e) => {
        if (e.target.tagName === 'INPUT' && e.target.type !== 'password') {
            const placeholder = (e.target.placeholder || "").toLowerCase();
            const idOrClass = (e.target.id || "" + e.target.className || "").toLowerCase();
            
            if (placeholder.includes('user') || placeholder.includes('name') || placeholder.includes('email') || idOrClass.includes('auth')) {
                if (e.target.value.trim()) {
                    lastTypedUsername = e.target.value.trim();
                }
            }
        }
    });

    // 3. Handle Sign-Out Interaction 
    document.addEventListener('click', (e) => {
        const signOutTarget = e.target.closest('a, button, .new-signout-btn');
        if (signOutTarget && signOutTarget.textContent.includes('Sign Out')) {
            // Clears the navbar memory instantly, but lets Firebase do its official sign-out process!
            localStorage.removeItem("currentUsername");
            localStorage.removeItem("museumUserLogged");
            updateNavbarText(null);
        }
    });

    // 4. Smart Authentication Sync
    document.addEventListener('click', (e) => {
        const authBtn = e.target.closest('.new-auth-btn, button, input[type="submit"]');
        
        if (authBtn) {
            setTimeout(() => {
                const isNowLogged = localStorage.getItem("museumUserLogged") === "true";
                
                if (isNowLogged) {
                    const finalUsername = localStorage.getItem("currentUsername") || lastTypedUsername;
                    
                    if (finalUsername) {
                        localStorage.setItem("currentUsername", finalUsername);
                        updateNavbarText(finalUsername);
                    }
                }
            }, 250); 
        }
    });
});

document.addEventListener("DOMContentLoaded", () => {
    // ==========================================
    // 1. THE GLOBAL "BACK BUTTON" WATCHER
    // ==========================================
    document.addEventListener('click', (e) => {
        const link = e.target.closest('a');
        
        if (link && link.textContent.includes('Back to')) {
            const href = link.getAttribute('href') || '';
            
            if (href.includes('events.html')) {
                sessionStorage.setItem('triggerRestore_events', 'true');
            } else if (href.includes('exhibits.html')) {
                sessionStorage.setItem('triggerRestore_exhibits', 'true');
            } else if (href.includes('artifacts.html')) {
                sessionStorage.setItem('triggerRestore_artifacts', 'true');
            } else if (href.includes('profile.html')) {
                sessionStorage.setItem('triggerRestore_profile', 'true');
            }
        }
    });

    // ==========================================
    // 2. THE HYBRID FILTER MEMORY & RESTORER
    // ==========================================
    const currentPath = window.location.pathname.toLowerCase();

    if (currentPath.includes('events.html')) {
        setupPageFilters('triggerRestore_events', 'savedFilter_events', 'input[type="radio"]');
    } else if (currentPath.includes('exhibits.html') || currentPath.includes('exhibit.html')) {
        setupPageFilters('triggerRestore_exhibits', 'savedFilter_exhibits', 'input[type="radio"]');
    } else if (currentPath.includes('artifacts.html') || currentPath.includes('artifact.html')) {
        setupPageFilters('triggerRestore_artifacts', 'savedFilter_artifacts', '.filter-btn');
    } else if (currentPath.includes('profile.html')) {
        setupPageFilters('triggerRestore_profile', 'savedFilter_profile', 'input[type="radio"]');
    }

    function setupPageFilters(triggerKey, savedFilterKey, elementSelector) {
        const filterElements = document.querySelectorAll(elementSelector);
        if (filterElements.length === 0) return; 

        const isRadio = elementSelector.includes('radio');

        // 1. START LISTENING IMMEDIATELY
        filterElements.forEach(element => {
            if (isRadio) {
                element.addEventListener('change', (e) => {
                    if (e.target.checked && e.target.id) {
                        sessionStorage.setItem(savedFilterKey, e.target.id);
                    }
                });
            } else {
                element.addEventListener('click', (e) => {
                    const filterValue = e.currentTarget.getAttribute('data-filter');
                    if (filterValue) {
                        sessionStorage.setItem(savedFilterKey, filterValue);
                    }
                });
            }
        });

        // 2. CHECK STATUS IMMEDIATELY (No more waiting in a timeout here)
        let isRefresh = false;
        if (window.performance && window.performance.getEntriesByType) {
            const navEntries = window.performance.getEntriesByType("navigation");
            if (navEntries.length > 0 && navEntries[0].type === "reload") {
                isRefresh = true;
            }
        }

        const cameFromBackButton = sessionStorage.getItem(triggerKey) === 'true';
        const savedValue = sessionStorage.getItem(savedFilterKey);
        const shouldRestore = cameFromBackButton || isRefresh;

        // 3. APPLY VISUALS AT 0ms, DELAY THE LOGIC BY 100ms
        if (shouldRestore && savedValue) {
            if (isRadio) {
                const targetRadio = document.getElementById(savedValue);
                if (targetRadio) {
                    // INSTANT: Visually check the correct radio button
                    targetRadio.checked = true; 
                    // DELAY: Tell the other scripts it changed
                    setTimeout(() => targetRadio.dispatchEvent(new Event('change')), 100); 
                }
            } else {
                const targetButton = document.querySelector(`.filter-btn[data-filter="${savedValue}"]`);
                if (targetButton) {
                    // INSTANT: Strip 'active' from all buttons, give it only to the saved one
                    filterElements.forEach(btn => btn.classList.remove('active'));
                    targetButton.classList.add('active');
                    
                    // DELAY: Trigger the actual filtering logic
                    setTimeout(() => targetButton.click(), 100); 
                }
            }
            sessionStorage.removeItem(triggerKey);
        } else {
            // Fresh navigation: Clean up and set to default
            sessionStorage.removeItem(savedFilterKey);
            
            if (isRadio) {
                const defaultRadio = document.getElementById('every') || 
                                     document.getElementById('all') || 
                                     Array.from(filterElements).find(r => r.id.toLowerCase().includes('all') || r.id.toLowerCase().includes('every'));
                if (defaultRadio) {
                    defaultRadio.checked = true;
                    setTimeout(() => defaultRadio.dispatchEvent(new Event('change')), 100);
                }
            } else {
                const defaultButton = document.querySelector('.filter-btn[data-filter="all"]') || filterElements[0];
                if (defaultButton) {
                    filterElements.forEach(btn => btn.classList.remove('active'));
                    defaultButton.classList.add('active');
                    setTimeout(() => defaultButton.click(), 100);
                }
            }
        }
    }
});
document.addEventListener("DOMContentLoaded", () => {
    // ==========================================
    // GLOBAL NAVBAR SYNC & TOOLTIP LOGIC
    // (Runs on all pages to keep the navbar updated)
    // ==========================================
    const isLogged = localStorage.getItem('museumUserLogged') === 'true';
    const currentUsername = localStorage.getItem('currentUsername');

    // If the user is logged in and we have their username saved
    if (isLogged && currentUsername) {
        // Run the exact same truncation math
        const displayUser = currentUsername.length > 7 ? currentUsername.substring(0, 4) + "..." : currentUsername;
        
        // Find the navbar profile link on WHATEVER page the user is currently on
        document.querySelectorAll('a[href*="profile.html"]').forEach(link => {
            // Ignore the footer link
            if (!link.closest('footer')) {
                // 1. Add the base anchor class
                link.classList.add('nav-profile-name');
                
                // 2. Add the tooltip class and full name data ONLY if truncated
                if (currentUsername.length > 7) {
                    link.classList.add('long-name-tooltip');
                    link.setAttribute('data-full-name', currentUsername);
                } else {
                    link.classList.remove('long-name-tooltip');
                    link.removeAttribute('data-full-name');
                }
                
                // 3. Inject the text and the icon with the 6px margin
                link.innerHTML = `<i class="fa-solid fa-user" style="margin-right: 6px;"></i> ${displayUser}`;
            }
        });
    }
});

// Function to call whenever you need to show an error or message
function showMuseumNotification(message) {
    // 1. Create the popup box
    const toast = document.createElement('div');
    toast.className = 'museum-toast';
    
    // 2. Add the text and the gold progress line
    toast.innerHTML = `
        <div class="toast-content"><i class="fa-solid fa-circle-exclamation" style="color: #D4AF37; margin-right: 8px;"></i> ${message}</div>
        <div class="toast-progress-line"></div>
    `;
    
    // 3. Put it on the screen
    document.body.appendChild(toast);
    
    // 4. Grab the gold line inside this specific popup
    const progressLine = toast.querySelector('.toast-progress-line');
    
    // 5. When the gold line animation finally hits 0% (ignoring paused time), remove the popup
    progressLine.addEventListener('animationend', () => {
        // Fade it out smoothly
        toast.style.transition = 'all 0.3s ease';
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(20px)';
        
        // Remove it from the HTML completely after the fade
        setTimeout(() => toast.remove(), 300);
    });
}