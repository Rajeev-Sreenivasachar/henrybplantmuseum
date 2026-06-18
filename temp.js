
    import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-app.js";
    import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, onAuthStateChanged, signOut, updatePassword, EmailAuthProvider, reauthenticateWithCredential } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-auth.js";
    import { getFirestore, doc, setDoc, getDoc, updateDoc, arrayUnion, arrayRemove } from "https://www.gstatic.com/firebasejs/10.8.1/firebase-firestore.js";

    const firebaseConfig = {
      apiKey: "AIzaSyA-ltDU9XbrsCIDWAnjze85Q2duWpLje5s",
      authDomain: "plant-museum-fbla.firebaseapp.com",
      projectId: "plant-museum-fbla",
      storageBucket: "plant-museum-fbla.firebasestorage.app",
      messagingSenderId: "132636635847",
      appId: "1:132636635847:web:6c306c59b00f4e290944e2"
    };

    const app = initializeApp(firebaseConfig);
    const auth = getAuth(app);
    const db = getFirestore(app);

    // Password View/Hide Toggle Utility Function Logic
    window.togglePasswordVisibility = (inputId, iconEl) => {
      const input = document.getElementById(inputId);
      if(input.type === "password") {
        input.type = "text";
        iconEl.classList.replace("fa-eye", "fa-eye-slash");
      } else {
        input.type = "password";
        iconEl.classList.replace("fa-eye-slash", "fa-eye");
      }
    };

    // Sub-pane Switching Control logic loop for management panel
    window.switchSettingsPane = (paneKey) => {
      document.querySelectorAll('.settings-pane').forEach(p => p.classList.add('fbla-hidden'));
      document.querySelectorAll('.nested-tab-btn').forEach(b => b.classList.remove('active'));
      
      document.getElementById(`pane-${paneKey}`).classList.remove('fbla-hidden');
      document.getElementById(`subtab-${paneKey}`).classList.add('active');
    };

    window.switchTab = (tab) => {
      document.getElementById('form-login').classList.toggle('fbla-hidden', tab !== 'login');
      document.getElementById('form-signup').classList.toggle('fbla-hidden', tab !== 'signup');
      document.getElementById('tab-login').classList.toggle('active', tab === 'login');
      document.getElementById('tab-signup').classList.toggle('active', tab === 'signup');
      document.getElementById('log-err').innerText = "";
      document.getElementById('reg-err').innerText = "";
    };

    function drawWishlist(arr) {
      const box = document.getElementById('fbla-wishlist-box');
      box.innerHTML = "";

      document.querySelectorAll('.fbla-add-btn').forEach(btn => {
        btn.innerHTML = 'Add <i class="fa-solid fa-plus"></i>';
        btn.disabled = false;
      });

      if (!arr || arr.length === 0) {
        box.innerHTML = "<li style='color:#888; font-size:14px; border:none; background:none; padding-left:0; pointer-events:none;'>Your Gilded Experience is currently empty.</li>";
        return;
      }

      arr.forEach(item => {
        const escapedName = item.name.replace(/'/g, "\\'");
        const btn = document.querySelector(`.fbla-add-btn[data-name="${item.name}"]`);

        if (btn) {
          btn.innerHTML = 'Added <i class="fa-solid fa-check"></i>';
          btn.disabled = true;
        }

        box.innerHTML += `
          <li>
            <a href="${item.url}" target="_blank">${item.name}</a>
            <button onclick="window.removeWish('${escapedName}', '${item.url}')" title="Remove Entry">
              <i class="fa-solid fa-xmark"></i>
            </button>
          </li>`;
      });
    }

    window.signUp = async () => {
      const n = document.getElementById('reg-name').value;
      const u = document.getElementById('reg-user').value;
      const p = document.getElementById('reg-pass').value;
      try {
        const cred = await createUserWithEmailAndPassword(auth, `${u.toLowerCase()}@museum.local`, p);
        const initialWishlist = [
          { name: "Upstairs / Downstairs", url: "events/upstairs-downstairs.html" },
          { name: "Free Movie Series", url: "events/free-movie-series.html" },
          { name: "Celebrate Sunset", url: "events/celebrate-sunset.html" },
          { name: "Tampa at War", url: "exhibits/tampa-at-war.html" },
          { name: "Grand Hotel", url: "exhibits/grand-hotel.html" },
          { name: "Gaspar's Gold", url: "exhibits/gaspar_gold.html" },
          { name: "Plants Southern Empire", url: "exhibits/plants-southern-empire.html" }
        ];
        await setDoc(doc(db, "users", cred.user.uid), { realName: n, username: u, wishlist: initialWishlist });
        localStorage.setItem('museumUserLogged', 'true');
        switchTab('login');
      } catch (e) { document.getElementById('reg-err').innerText = e.message; }
    };

    window.signIn = async () => {
      const u = document.getElementById('log-user').value;
      const p = document.getElementById('log-pass').value;
      try { 
        await signInWithEmailAndPassword(auth, `${u.toLowerCase()}@museum.local`, p); 
        localStorage.setItem('museumUserLogged', 'true');
      } 
      catch (e) { document.getElementById('log-err').innerText = e.message; }
    };

    window.logout = () => {
        localStorage.removeItem('museumUserLogged');
        signOut(auth);
    };

    /* --- TABBED CONFIGURATION CREDENTIAL CONTROLLER PROCESSING LOGIC --- */
    window.updateCredentials = async (e) => {
      e.preventDefault();
      if(!auth.currentUser) return;

      const activeTabId = document.querySelector('.nested-tab-btn.active').id;
      
      try {
        const ref = doc(db, "users", auth.currentUser.uid);
        const snap = await getDoc(ref);
        if (!snap.exists()) return;
        const userData = snap.data();

        if (activeTabId === 'subtab-name') {
          const currPass = document.getElementById('settings-name-curr-pass').value;
          const currName = document.getElementById('settings-name-curr-name').value.trim();
          const newName = document.getElementById('settings-new-name').value.trim();
          
          if(!currPass || !currName || !newName) return alert("Please fill out all fields.");
          
          if(currName.toLowerCase() !== userData.realName.toLowerCase()) {
            return alert("Validation error: Current display name is incorrect.");
          }
          
          const credential = EmailAuthProvider.credential(auth.currentUser.email, currPass);
          await reauthenticateWithCredential(auth.currentUser, credential);
          
          await updateDoc(ref, { realName: newName });
          document.getElementById('ui-name').innerText = newName;
          alert("Display name updated successfully.");
          
        } else if (activeTabId === 'subtab-user') {
          const currPass = document.getElementById('settings-user-curr-pass').value;
          const currUser = document.getElementById('settings-user-curr-user').value.trim();
          const newUsername = document.getElementById('settings-new-user').value.trim();
          
          if(!currPass || !currUser || !newUsername) return alert("Please fill out all fields.");
          
          if(currUser.toLowerCase() !== userData.username.toLowerCase()) {
            return alert("Validation error: Current username is incorrect.");
          }
          
          const credential = EmailAuthProvider.credential(auth.currentUser.email, currPass);
          await reauthenticateWithCredential(auth.currentUser, credential);
          
          await updateDoc(ref, { username: newUsername });
          document.getElementById('ui-user').innerText = newUsername;
          alert("Username updated successfully.");
          
        } else if (activeTabId === 'subtab-pass') {
          const currPass = document.getElementById('settings-pass-curr-pass').value;
          const newPass = document.getElementById('settings-new-pass').value;
          const confirmPass = document.getElementById('settings-confirm-pass').value;
          
          if(!currPass || !newPass || !confirmPass) return alert("Please fill out all fields.");
          
          if(newPass !== confirmPass) {
            return alert("Validation error: New passwords do not match.");
          }
          if(newPass.length < 6) {
            return alert("Security exception: Password requires 6+ characters minimum.");
          }
          
          const credential = EmailAuthProvider.credential(auth.currentUser.email, currPass);
          await reauthenticateWithCredential(auth.currentUser, credential);
          
          await updatePassword(auth.currentUser, newPass);
          alert("Password updated successfully.");
        }

        e.target.reset();

      } catch(err) {
        alert("Verification failed or update error: " + err.message);
      }
    };

    window.addWish = async (name, url) => {
      if(!auth.currentUser) return;
      const ref = doc(db, "users", auth.currentUser.uid);
      await updateDoc(ref, { wishlist: arrayUnion({ name, url }) });
      const snap = await getDoc(ref);
      drawWishlist(snap.data().wishlist);
    };

    window.removeWish = async (name, url) => {
      if(!auth.currentUser) return;
      const ref = doc(db, "users", auth.currentUser.uid);
      await updateDoc(ref, { wishlist: arrayRemove({ name, url }) });
      const snap = await getDoc(ref);
      drawWishlist(snap.data().wishlist);
    };

    window.clearGilded Experience = async () => {
      if(!auth.currentUser) return;
      if(confirm("Are you sure you want to clear your entire Gilded Experience?")) {
        const ref = doc(db, "users", auth.currentUser.uid);
        await updateDoc(ref, { wishlist: [] });
        drawWishlist([]);
      }
    };

    window.copyGilded Experience = async () => {
      if(!auth.currentUser) return;
      const ref = doc(db, "users", auth.currentUser.uid);
      const snap = await getDoc(ref);
      if (!snap.exists()) return;
      const arr = snap.data().wishlist || [];
      if(arr.length === 0) {
          alert("Your Gilded Experience is empty!");
          return;
      }
      let text = "My Henry B. Plant Museum Gilded Experience:\n";
      arr.forEach(item => { text += "- " + item.name + "\n"; });
      navigator.clipboard.writeText(text).then(() => {
          alert("Gilded Experience copied to clipboard!");
      }).catch(err => {
          console.error("Could not copy text: ", err);
      });
    };

    onAuthStateChanged(auth, async (user) => {
      const authView = document.getElementById('fbla-auth-view');
      const dashView = document.getElementById('fbla-dash-view');
      if(user) {
        const snap = await getDoc(doc(db, "users", user.uid));
        if(snap.exists()) {
          const data = snap.data();
          document.getElementById('ui-name').innerText = data.realName;
          document.getElementById('ui-user').innerText = data.username;
          drawWishlist(data.wishlist);
        }
        authView.classList.add('fbla-hidden');
        dashView.classList.remove('fbla-hidden');
      } else {
        authView.classList.remove('fbla-hidden');
        dashView.classList.add('fbla-hidden');
      }
    });
  
