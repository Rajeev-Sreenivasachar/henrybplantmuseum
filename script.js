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
    });
  });

});

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.x.x/firebase-app.js";
import { 
  getAuth, 
  reauthenticateWithCredential, 
  EmailAuthProvider, 
  updateProfile, 
  updateEmail, 
  updatePassword,
  signOut
} from "https://www.gstatic.com/firebasejs/10.x.x/firebase-auth.js";

// replace with your project's specific configurations
const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// identity verification validation handler
async function reauthenticateUser(identifier, passwordValue) {
  const user = auth.currentUser;
  if (!user) throw new Error("No active authorization context found.");
  
  // validation check if plain username or email layout signature is passed
  const emailTarget = identifier.includes('@') ? identifier : user.email;
  const credential = EmailAuthProvider.credential(emailTarget, passwordValue);
  return await reauthenticateWithCredential(user, credential);
}

// FLOW 1: Current Password + New Display Name
const formDisplayName = document.getElementById('form-display-name');
if (formDisplayName) {
  formDisplayName.addEventListener('submit', async (e) => {
    e.preventDefault();
    const currentPassword = document.getElementById('dn-current-password').value;
    const newDisplayName = document.getElementById('new-display-name').value;
    const user = auth.currentUser;

    try {
      await reauthenticateUser(user.email, currentPassword);
      await updateProfile(user, { displayName: newDisplayName });
      document.getElementById('user-greeting-name').textContent = newDisplayName;
      alert("Display name processed and modified successfully!");
      formDisplayName.reset();
    } catch (err) {
      console.error("Profile name configuration error:", err);
      alert("Verification failed: " + err.message);
    }
  });
}

// FLOW 2: Current Password + New Username (Email ID)
const formUsername = document.getElementById('form-username');
if (formUsername) {
  formUsername.addEventListener('submit', async (e) => {
    e.preventDefault();
    const currentPassword = document.getElementById('un-current-password').value;
    const newUsername = document.getElementById('new-username').value;
    const user = auth.currentUser;

    try {
      await reauthenticateUser(user.email, currentPassword);
      await updateEmail(user, newUsername);
      alert("Username identifier updated successfully!");
      formUsername.reset();
    } catch (err) {
      console.error("Username string update error:", err);
      alert("Verification failed: " + err.message);
    }
  });
}

// FLOW 3: Current Username (Email) + New Password
const formPassword = document.getElementById('form-password');
if (formPassword) {
  formPassword.addEventListener('submit', async (e) => {
    e.preventDefault();
    const currentUsername = document.getElementById('pw-current-username').value;
    const newPassword = document.getElementById('new-password').value;
    const user = auth.currentUser;

    try {
      // uses the current password on file to match against the username argument
      await reauthenticateUser(currentUsername, user.password || prompt("Confirm verification password key:"));
      await updatePassword(user, newPassword);
      alert("Security credentials modified successfully!");
      formPassword.reset();
    } catch (err) {
      console.error("Credential assignment error:", err);
      alert("Verification failed: " + err.message);
    }
  });
}

// Global Log Out Action
const signOutBtn = document.getElementById('sign-out-btn');
if (signOutBtn) {
  signOutBtn.addEventListener('click', () => {
    signOut(auth).then(() => {
      window.location.href = "/index.html";
    }).catch((err) => console.error("Signout error loop:", err));
  });
}