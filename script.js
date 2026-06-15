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

    // State retention for Radio Filters
    const filterKey = window.location.pathname + '_filter';
    const savedFilterId = sessionStorage.getItem(filterKey);
    if (savedFilterId) {
        const radio = document.getElementById(savedFilterId);
        if (radio) radio.checked = true;
    }

    document.querySelectorAll('input[type="radio"][name="category"]').forEach(radio => {
        radio.addEventListener('change', (e) => {
            if (e.target.checked) {
                sessionStorage.setItem(filterKey, e.target.id);
            }
        });
    });
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
