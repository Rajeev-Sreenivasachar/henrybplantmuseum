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
    // (Runs on all detailed pages automatically)
    // ==========================================
    document.addEventListener('click', (e) => {
        const link = e.target.closest('a');
        
        // If they clicked a link that has "Back to" in the text...
        if (link && link.textContent.includes('Back to')) {
            const href = link.getAttribute('href') || '';
            
            // Drop the correct flag depending on where they are going back to
            if (href.includes('events.html')) {
                sessionStorage.setItem('triggerRestore_events', 'true');
            } else if (href.includes('exhibits.html')) {
                sessionStorage.setItem('triggerRestore_exhibits', 'true');
            }
        }
    });

    // ==========================================
    // 2. THE RADIO FILTER MEMORY & RESTORER
    // (Runs on Events or Exhibits main pages)
    // ==========================================
    const currentPath = window.location.pathname.toLowerCase();

    // Route the logic based on which main page the user is currently looking at
    if (currentPath.includes('events.html')) {
        setupRadioFilters('triggerRestore_events', 'savedRadio_events');
    } else if (currentPath.includes('exhibits.html') || currentPath.includes('exhibit.html')) {
        setupRadioFilters('triggerRestore_exhibits', 'savedRadio_exhibits');
    }

    function setupRadioFilters(triggerKey, savedFilterKey) {
        // Find all radio buttons that control the categories
        const radioButtons = document.querySelectorAll('input[type="radio"][name="category"]');
        if (radioButtons.length === 0) return; // Exit if no filters exist on this page

        const shouldRestore = sessionStorage.getItem(triggerKey) === 'true';
        const savedRadioId = sessionStorage.getItem(savedFilterKey);

        if (shouldRestore && savedRadioId) {
            // Find the saved radio button by its ID and check it
            const targetRadio = document.getElementById(savedRadioId);
            if (targetRadio) {
                targetRadio.checked = true;
            }
            // Wipe the flag so a normal page refresh doesn't trigger it again
            sessionStorage.removeItem(triggerKey);
        } else {
            // If they came from Home or About, clear the memory completely
            sessionStorage.removeItem(savedFilterKey);
            
            // Reset to the default "All" filter just in case
            const defaultRadio = document.getElementById('every');
            if (defaultRadio) {
                defaultRadio.checked = true;
            }
        }

        // Whenever the user clicks a new filter, memorize its ID
        radioButtons.forEach(radio => {
            radio.addEventListener('change', (e) => {
                if (e.target.checked) {
                    sessionStorage.setItem(savedFilterKey, e.target.id);
                }
            });
        });
    }
});
