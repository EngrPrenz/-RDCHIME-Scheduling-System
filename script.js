


import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { updateProfile, GoogleAuthProvider, signInWithPopup } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import { 
    getFirestore, 
    collection, 
    addDoc, 
    getDocs, 
    updateDoc, 
    doc, 
    query, 
    where, 
    orderBy, 
    serverTimestamp 
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

// Add these lines right after your existing imports
import { 
    getAuth, 
    signInWithEmailAndPassword, 
    signOut, 
    onAuthStateChanged 
} from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';

// Also add getDoc if not already imported (your code uses it but it's missing in the provided snippet)
import { getDoc } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

// Firebase configuration - REPLACE WITH YOUR OWN
const firebaseConfig = {
    apiKey: "AIzaSyBiQCMXldHH1ff5Yn7lMP0PUIk3LRkFHcg",
    authDomain: "rdchime-scheduling-system.firebaseapp.com",
    projectId: "rdchime-scheduling-system",
    storageBucket: "rdchime-scheduling-system.firebasestorage.app",
    messagingSenderId: "692945279316",
    appId: "1:692945279316:web:2dd298e7030c0b038b10c1",
    measurementId: "G-LP39RX0R47"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Add this line right after const db = getFirestore(app);
const auth = getAuth(app);

// Track if we're in the middle of a login attempt
let isLoggingIn = false;

// onAuthStateChanged(auth, async (user) => {
//     // Skip if we're in the middle of a login attempt - let the login handler deal with it
//     if (isLoggingIn) {
//         console.log("⏭️ Skipping onAuthStateChanged - login in progress");
//         return;
//     }

//     // Only run this on the login/home page (index.html or root)
//     if (window.location.pathname.includes("index.html") || window.location.pathname === "/" || window.location.pathname.endsWith("/")) {
//         if (user) {
//             console.log("🔍 User detected on login page:", user.email);
            
//             try {
//                 const userDoc = await getDoc(doc(db, 'users', user.uid));
                
//                 if (!userDoc.exists()) {
//                     console.log("❌ No user document found, signing out...");
//                     await signOut(auth);
//                     return;
//                 }

//                 const userData = userDoc.data();
//                 console.log("📄 User data:", userData);
                
//                 // Only redirect if username is set (don't show modal here)
//                 if (userData.usernameSet && userData.displayName && userData.displayName !== "New User") {
//                     console.log(`✅ Username set, redirecting to dashboard...`);
//                     const redirectUrl = userData.Role === "Admin" ? "admin.html" : "user.html";
//                     window.location.href = redirectUrl;
//                 }
                
//             } catch (error) {
//                 console.error("❌ Error checking user status:", error);
//             }
//         } else {
//             console.log("👤 No user signed in");
//         }
//     }
// });


/* Video Background Handler */
document.addEventListener("DOMContentLoaded", () => {
  const video = document.getElementById("church-video");
  if (video) {
    video.playbackRate = 0.75;
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) {
        video.pause();
      } else {
        video.play();
      }
    });
  }
});

/* Navigation */
const menuToggle = document.getElementById("menu-toggle");
const menuClose = document.getElementById("menu-close");
const mobileMenu = document.getElementById("mobile-menu");
const mobileNavLinks = document.querySelectorAll(".mobile-nav-link");
const body = document.body;

if (menuToggle && menuClose && mobileMenu) {
  menuToggle.addEventListener("click", () => {
    mobileMenu.classList.add("open");
    body.style.overflow = "hidden";
    body.classList.add("menu-active");
  });

  menuClose.addEventListener("click", () => {
    mobileMenu.classList.remove("open");
    body.style.overflow = "";
    body.classList.remove("menu-active");
  });

  mobileNavLinks.forEach((link) => {
    link.addEventListener("click", () => {
      mobileMenu.classList.remove("open");
      body.style.overflow = "";
      body.classList.remove("menu-active");
    });
  });
}

/* Login Modal Toggle */
const loginBtn = document.getElementById("login-btn");
const mobileLoginBtn = document.getElementById("mobile-login-btn");
const loginModal = document.getElementById("login-modal");
const closeModal = loginModal ? loginModal.querySelector(".close-modal") : null;

if (loginBtn && loginModal) {
  loginBtn.addEventListener("click", () => {
    loginModal.classList.add("open");
  });
}

if (mobileLoginBtn && loginModal) {
  mobileLoginBtn.addEventListener("click", () => {
    loginModal.classList.add("open");
  });
}

if (closeModal && loginModal) {
  closeModal.addEventListener("click", () => {
    loginModal.classList.remove("open");
  });
}

/* Tab Switching for Admin/User */
const tabButtons = document.querySelectorAll(".tab-btn");
const tabContents = document.querySelectorAll(".tab-content");

if (tabButtons.length && tabContents.length) {
  tabButtons.forEach((button) => {
    button.addEventListener("click", () => {
      tabButtons.forEach((btn) => btn.classList.remove("active"));
      tabContents.forEach((content) => content.classList.remove("active"));
      button.classList.add("active");
      document.getElementById(`${button.dataset.tab}-tab`).classList.add("active");
    });
  });
}

/* Admin Login Handling */
const adminForm = document.getElementById("admin-login-form");
const adminError = document.getElementById("admin-error");

if (adminForm && adminError) {
  adminForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("admin-email").value.trim();
    const password = document.getElementById("admin-password").value.trim();

    try {
      // Sign in with Firebase Authentication
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Verify Admin role
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists() && userDoc.data().Role === "Admin") {
        loginModal.classList.remove("open");
        showSuccessPopup("LOGIN SUCCESSFULLY", "Welcome back, Administrator!");
        // Wait for auth state to propagate
        onAuthStateChanged(auth, (authUser) => {
          if (authUser && authUser.uid === user.uid) {
            setTimeout(() => {
              window.location.href = "new.html";
            }, 500);
          }
        }, { once: true });
      } else {
        await signOut(auth);
        adminError.textContent = "This account is not an Admin.";
        adminError.style.display = "block";
      }
    } catch (error) {
      adminError.textContent = "Invalid email or password. Please try again.";
      adminError.style.display = "block";
      console.error("Admin login error:", error);
    }
  });
}

/* User Login Handling (Placeholder) */
/* User Login Handling with Username Setup */
const userForm = document.querySelector("#user-tab form");
console.log("User form found:", userForm);

if (userForm) {
  userForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    console.log("🔵 User login form submitted!");
    
    // Set flag to prevent onAuthStateChanged from interfering
    isLoggingIn = true;
    
    const email = document.getElementById("user-email").value.trim();
    const password = document.getElementById("user-password").value.trim();
    
    console.log("📧 Email:", email);

    try {
      console.log("⏳ Attempting to sign in...");
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      console.log("✅ User logged in:", user.email);
      console.log("📨 Email verified (before reload):", user.emailVerified);

      // Reload to get latest verification status
      await user.reload();
      console.log("📨 Email verified (after reload):", user.emailVerified);

      // Check if email is verified
      if (!user.emailVerified) {
        console.log("❌ Email not verified, signing out");
        isLoggingIn = false;
        await signOut(auth);
        showSuccessPopup("EMAIL NOT VERIFIED", "Please verify your email before logging in. Check your inbox for the verification link.", true);
        return;
      }

      console.log("⏳ Fetching user document from Firestore...");
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      
      if (!userDoc.exists()) {
        console.log("❌ User document not found in Firestore");
        isLoggingIn = false;
        await signOut(auth);
        showSuccessPopup("ERROR", "User profile not found. Please contact support.", true);
        return;
      }

      const userData = userDoc.data();
      console.log("📄 User data from Firestore:", userData);
      console.log("👤 displayName:", userData.displayName);
      console.log("✔️ usernameSet:", userData.usernameSet);
      console.log("👥 Role:", userData.Role);

      // Check if user has set username
      console.log("\n=== 🔍 USERNAME CHECK START ===");
      console.log("Condition 1 - !userData.usernameSet:", !userData.usernameSet);
      console.log("Condition 2 - !userData.displayName:", !userData.displayName);
      console.log("Condition 3 - displayName === 'New User':", userData.displayName === "New User");
      
      const shouldShowUsernameModal = !userData.usernameSet || !userData.displayName || userData.displayName === "New User";
      console.log("🎯 Should show username modal?", shouldShowUsernameModal);
      
      if (shouldShowUsernameModal) {
        console.log("\n=== 🎯 SHOWING USERNAME MODAL ===");
        
        // Check if loginModal exists
        console.log("🔍 Checking loginModal variable:", typeof loginModal);
        const loginModalElement = document.getElementById('login-modal');
        console.log("🔍 Login modal element from DOM:", loginModalElement);
        
        if (loginModalElement) {
          console.log("📊 Login Modal Current State:");
          console.log("   - display:", window.getComputedStyle(loginModalElement).display);
          console.log("   - classList:", Array.from(loginModalElement.classList));
        }
        
        // Close login modal
        console.log("🚪 Closing login modal...");
        if (loginModal) {
          loginModal.classList.remove("open");
          loginModalElement.style.display = "none";
          loginModalElement.style.display = "none";
          loginModalElement.style.opacity = "0";
          loginModalElement.style.visibility = "hidden";
          console.log("✅ Removed 'open' class from login modal");
        } else {
          console.warn("⚠️ loginModal variable is undefined");
        }
        
        document.body.style.overflow = "";
        console.log("✅ Body overflow reset");
        
        isLoggingIn = false;
        console.log("✅ isLoggingIn flag reset to false");
        
        // Check for username modal BEFORE timeout
        console.log("\n🔍 PRE-TIMEOUT CHECK:");
        const preModal = document.getElementById('username-setup-modal');
        console.log("   - Modal exists in DOM:", preModal ? "YES" : "NO");
        
        if (preModal) {
          console.log("   - Modal tag name:", preModal.tagName);
          console.log("   - Modal parent:", preModal.parentElement);
          console.log("   - Modal display (before):", window.getComputedStyle(preModal).display);
          console.log("   - Modal visibility (before):", window.getComputedStyle(preModal).visibility);
          console.log("   - Modal opacity (before):", window.getComputedStyle(preModal).opacity);
          console.log("   - Modal classList (before):", Array.from(preModal.classList));
        } else {
          console.error("❌ CRITICAL: Username modal NOT FOUND in DOM!");
          console.log("📋 All elements with 'modal' in ID:");
          const allModals = document.querySelectorAll('[id*="modal"]');
          allModals.forEach(el => console.log("   -", el.id));
        }
        
        console.log("⏰ Setting timeout for 100ms...");
        
        setTimeout(() => {
          console.log("\n=== ⏰ TIMEOUT EXECUTED (100ms passed) ===");
          console.log("🕐 Current timestamp:", new Date().toISOString());
          
          const modal = document.getElementById('username-setup-modal');
          console.log("🔍 Modal element lookup result:", modal ? "FOUND" : "NOT FOUND");
          
          if (modal) {
            console.log("✅ Modal found! Proceeding with display...");
            
            // FIX: Force ALL parent elements to be visible
            console.log("\n🔧 FIXING PARENT VISIBILITY:");
            let parent = modal.parentElement;
            let level = 1;
            while (parent && level <= 10) {
              const parentStyle = window.getComputedStyle(parent);
              console.log(`   Level ${level} (${parent.tagName}#${parent.id || 'no-id'}.${Array.from(parent.classList).join('.')}):`);
              console.log("      - display BEFORE:", parentStyle.display);
              console.log("      - visibility BEFORE:", parentStyle.visibility);
              
              if (parentStyle.display === 'none') {
                console.log("      ❌ FOUND HIDDEN PARENT (display:none) - FIXING IT!");
                parent.style.display = 'block';
                console.log("      ✅ Set parent display to 'block'");
              }
              
              if (parentStyle.visibility === 'hidden') {
                console.log("      ❌ FOUND HIDDEN PARENT (visibility:hidden) - FIXING IT!");
                parent.style.visibility = 'visible';
                console.log("      ✅ Set parent visibility to 'visible'");
              }
              
              const afterStyle = window.getComputedStyle(parent);
              console.log("      - display AFTER:", afterStyle.display);
              console.log("      - visibility AFTER:", afterStyle.visibility);
              
              parent = parent.parentElement;
              level++;
            }
            console.log("✅ All parent elements checked and fixed\n");
            
            console.log("🔧 Applying visibility changes to modal...");
            
            // Body overflow
            document.body.style.overflow = "hidden";
            console.log("   ✅ Body overflow set to hidden");
            
            // Force modal visibility with comprehensive inline styles
            modal.style.display = 'flex';
            modal.style.visibility = 'visible';
            modal.style.opacity = '1';
            modal.style.position = 'fixed';
            modal.style.top = '0';
            modal.style.left = '0';
            modal.style.width = '100%';
            modal.style.height = '100%';
            modal.style.zIndex = '9999';
            modal.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
            modal.style.alignItems = 'center';
            modal.style.justifyContent = 'center';
            modal.classList.add('open');
            console.log("   ✅ Modal inline styles applied");
            
            // Verify modal styles
            const modalStyle = window.getComputedStyle(modal);
            console.log("\n📊 Modal Final Computed Styles:");
            console.log("   - display:", modalStyle.display);
            console.log("   - visibility:", modalStyle.visibility);
            console.log("   - opacity:", modalStyle.opacity);
            console.log("   - position:", modalStyle.position);
            console.log("   - z-index:", modalStyle.zIndex);
            console.log("   - width:", modalStyle.width);
            console.log("   - height:", modalStyle.height);
            
            // Force modal content visibility
            const modalContent = modal.querySelector('.modal-content');
           
            
            if (modalContent) {
              console.log("   - Setting content styles...");
              modalContent.style.display = 'block';
              modalContent.style.visibility = 'visible';
              modalContent.style.opacity = '1';
              modalContent.style.backgroundColor = 'white';
              modalContent.style.padding = '2rem';
              modalContent.style.borderRadius = '8px';
              modalContent.style.maxWidth = '500px';
              modalContent.style.width = '90%';
              modalContent.style.position = 'relative';
              modalContent.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
            
            } else {
              console.error("   ❌ Modal content (.modal-content) not found!");
            }
            
            // Verify final visibility
            const rect = modal.getBoundingClientRect();
           
            
            if (rect.width > 0 && rect.height > 0) {
              console.log("   ✅ Modal has dimensions and should be visible!");
            } else {
              console.error("   ❌ Modal has zero dimensions!");
            }
            
            console.log("\n🔧 Calling setupUsernameModal function...");
            setupUsernameModal(user);
            console.log("✅ setupUsernameModal called");
            
            console.log("\n🎉 Modal should NOW be visible on screen!");
            console.log("=== ✅ USERNAME MODAL DISPLAY COMPLETE ===\n");
            
          } else {
            console.error("\n❌ CRITICAL ERROR: Username modal not found in DOM!");
            console.log("🔍 Debugging DOM structure:");
            console.log("   - document.body exists:", !!document.body);
            console.log("   - document.body.children count:", document.body.children.length);
            
            console.log("\n📋 All elements with 'username' in ID:");
            const usernameElements = document.querySelectorAll('[id*="username"]');
            console.log("   - Found", usernameElements.length, "elements");
            usernameElements.forEach(el => {
              console.log("      -", el.id, "(" + el.tagName + ")");
            });
            
            console.log("\n📋 All modal elements:");
            const allModals = document.querySelectorAll('.modal, [class*="modal"]');
            console.log("   - Found", allModals.length, "modal elements");
            allModals.forEach(el => {
              console.log("      - ID:", el.id || "no-id", "Classes:", Array.from(el.classList));
            });
            
            alert("Username setup modal not found. Please contact support.");
          }
        }, 100);
        
        return;
      }

      console.log("\n✅ Username already set, checking role...");
      
      // Verify User role
      if (userData.Role === "User") {
        console.log("✅ Role is User, redirecting...");
        isLoggingIn = false;
        loginModal.classList.remove("open");
        showSuccessPopup("LOGIN SUCCESSFUL", `Welcome back, ${userData.displayName}!`);
        setTimeout(() => {
          window.location.href = "index.html"; 
        }, 1500);
      } else {
        console.log("❌ Role is not User:", userData.Role);
        isLoggingIn = false;
        await signOut(auth);
        showSuccessPopup("ACCESS DENIED", "This account is not a User.", true);
      }
    } catch (error) {
      console.error("❌ Login error:", error);
      console.error("Error code:", error.code);
      console.error("Error message:", error.message);
      console.error("Full error:", error);
      isLoggingIn = false;
      showSuccessPopup("ERROR", "Invalid email or password.", true);
    }
  });
}
/* Setup Username Modal */
function setupUsernameModal(user) {
  console.log("🔧 Setting up username modal for user:", user.email);
  
  const usernameInput = document.getElementById('username-setup-input');
  const submitBtn = document.getElementById('username-setup-submit');
  const errorDiv = document.getElementById('username-setup-error');

  if (!usernameInput || !submitBtn || !errorDiv) {
    console.error("❌ Modal elements not found!");
    return;
  }

  // Clear previous values
  usernameInput.value = '';
  errorDiv.style.display = 'none';
  errorDiv.textContent = '';

  // Focus on input
  setTimeout(() => usernameInput.focus(), 200);

  // Remove old event listeners by cloning
  const newSubmitBtn = submitBtn.cloneNode(true);
  submitBtn.parentNode.replaceChild(newSubmitBtn, submitBtn);

  const newUsernameInput = usernameInput.cloneNode(true);
  usernameInput.parentNode.replaceChild(newUsernameInput, usernameInput);

  // Get fresh references
  const freshInput = document.getElementById('username-setup-input');
  const freshSubmitBtn = document.getElementById('username-setup-submit');
  const freshErrorDiv = document.getElementById('username-setup-error');

  // Handle Enter key
  freshInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      freshSubmitBtn.click();
    }
  });

  // Handle submission
  freshSubmitBtn.addEventListener('click', async () => {
    console.log("🔵 Submit button clicked");
    const username = freshInput.value.trim();
    console.log("👤 Username entered:", username);
    
    if (!username) {
      freshErrorDiv.textContent = "Username cannot be empty.";
      freshErrorDiv.style.display = 'block';
      return;
    }

    if (username.length < 3) {
      freshErrorDiv.textContent = "Username must be at least 3 characters.";
      freshErrorDiv.style.display = 'block';
      return;
    }

    if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
      freshErrorDiv.textContent = "Username can only contain letters, numbers, underscores, and hyphens.";
      freshErrorDiv.style.display = 'block';
      return;
    }

    freshSubmitBtn.disabled = true;
    freshSubmitBtn.textContent = "Saving...";
    freshErrorDiv.style.display = 'none';

    try {
      console.log("📝 Updating Firestore...");
      await updateDoc(doc(db, 'users', user.uid), {
        displayName: username,
        usernameSet: true,
        emailVerified: true
      });
      
      console.log("📝 Updating Auth profile...");
      await updateProfile(user, {
        displayName: username
      });
      
      console.log("✅ Username saved successfully!");
      
      const modal = document.getElementById('username-setup-modal');
      modal.classList.remove('open');
      modal.style.display = 'none';
      
      
      // Sign out and redirect to login
      await signOut(auth);
      
      setTimeout(() => {
        console.log("Redirecting to Scheduling System homepage...");
        window.location.href = 'new.html';
      }, 1000);
    } catch (error) {
      console.error("Error setting username:", error);
      freshErrorDiv.textContent = "Error setting username. Please try again.";
      freshErrorDiv.style.display = 'block';
      freshSubmitBtn.disabled = false;
      freshSubmitBtn.textContent = "Set Username";
    }
  });
}

/* User Google Login Handling */
// Handle Admin Google Login
const adminGoogleLoginBtn = document.getElementById('admin-google-login-btn');
if (adminGoogleLoginBtn) {
  adminGoogleLoginBtn.addEventListener('click', async () => {
    console.log("🔵 Admin Google login button clicked");
    await handleGoogleLogin('Admin');
  });
}

// Handle User Google Login
const userGoogleLoginBtn = document.getElementById('user-google-login-btn');
if (userGoogleLoginBtn) {
  userGoogleLoginBtn.addEventListener('click', async () => {
    console.log("🔵 User Google login button clicked");
    await handleGoogleLogin('User');
  });
}

// Shared Google Login Handler
async function handleGoogleLogin(expectedRole) {
  const provider = new GoogleAuthProvider();

  try {
    console.log("⏳ Opening Google sign-in popup...");
    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    console.log("✅ Google sign-in successful:", user.email);

    // Get user document from Firestore
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    
    if (!userDoc.exists()) {
      console.log("❌ User account not found. Please sign up first.");
      await signOut(auth);
      showSuccessPopup("ACCOUNT NOT FOUND", "Please sign up first before logging in with Google.", true);
      return;
    }

    const userData = userDoc.data();
    console.log("📄 User data:", userData);

    // Verify User role matches expected
    if (userData.Role === expectedRole) {
      console.log(`✅ Role is ${expectedRole}, redirecting...`);
      loginModal.classList.remove("open");
      showSuccessPopup("LOGIN SUCCESSFUL", `Welcome back, ${userData.displayName}!`);
      
      const redirectUrl = expectedRole === "Admin" ? "admin.html" : "user.html";
      setTimeout(() => {
        window.location.href = redirectUrl; 
      }, 1500);
    } else {
      console.log(`❌ Role mismatch. Expected: ${expectedRole}, Got: ${userData.Role}`);
      await signOut(auth);
      showSuccessPopup("ACCESS DENIED", `This account is not registered as ${expectedRole}.`, true);
    }
  } catch (error) {
    console.error("❌ Google login error:", error);
    if (error.code === 'auth/popup-closed-by-user') {
      showSuccessPopup("CANCELLED", "Google sign-in was cancelled.", true);
    } else if (error.code === 'auth/popup-blocked') {
      showSuccessPopup("POPUP BLOCKED", "Please allow pop-ups for this site.", true);
    } else {
      showSuccessPopup("ERROR", "Failed to sign in with Google.", true);
    }
  }
}


/* Logout Handling */
const logoutLinks = document.querySelectorAll('.logout-link');
logoutLinks.forEach(link => {
  link.addEventListener('click', async (e) => {
    e.preventDefault();
    await signOut(auth);
    showSuccessPopup("LOGGED OUT SUCCESSFULLY", "You have been logged out. Redirecting to home page...");
    setTimeout(() => {
      window.location.href = "index.html";
    }, 2000);
  });
});

/* Custom Success Popup Function */
function showSuccessPopup(title, message, isError = false) {
  const popup = document.createElement("div");
  popup.style.position = 'fixed';
  popup.style.top = '20px';
  popup.style.right = '20px';
  popup.style.padding = '1rem 2rem';
  popup.style.background = isError ? '#dc2626' : '#10b981';
  popup.style.color = '#ffffff';
  popup.style.borderRadius = '0.5rem';
  popup.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
  popup.style.zIndex = '10000';
  popup.style.maxWidth = '300px';
  popup.innerHTML = `
      <h4 style="font-size: 0.875rem; font-weight: 600; margin-bottom: 0.25rem;">${title}</h4>
      <p style="font-size: 0.75rem;">${message}</p>
  `;
  document.body.appendChild(popup);
  setTimeout(() => {
    popup.style.transition = 'opacity 0.5s ease';
    popup.style.opacity = '0';
    setTimeout(() => popup.remove(), 500);
  }, 3000);
}




/* Smooth Scrolling */
document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
  anchor.addEventListener("click", function (e) {
    const targetId = this.getAttribute("href");
    if (targetId === "#") return;
    e.preventDefault();
    const targetElement = document.querySelector(targetId);
    if (targetElement) {
      const navbarHeight = document.querySelector(".navbar").offsetHeight;
      const targetPosition = targetElement.getBoundingClientRect().top + window.scrollY - navbarHeight;
      window.scrollTo({
        top: targetPosition,
        behavior: "smooth",
      });
    }
  });
});

/* Modal Functionality */
function setupModal(triggerSelector, modalId, closeSelector = ".close-modal, .close-btn") {
  const triggers = document.querySelectorAll(triggerSelector);
  const modal = document.getElementById(modalId);
  if (!modal) return;

  triggers.forEach((trigger) => {
    trigger.addEventListener("click", () => {
      modal.classList.add("open");
      document.body.style.overflow = "hidden";
      const closeBtns = modal.querySelectorAll(closeSelector);
      closeBtns.forEach((btn) => {
        const newBtn = btn.cloneNode(true);
        btn.parentNode.replaceChild(newBtn, btn);
        newBtn.addEventListener("click", () => {
          modal.classList.remove("open");
          document.body.style.overflow = "";
        });
      });
      const closeOnOutsideClick = (e) => {
        if (e.target === modal) {
          modal.classList.remove("open");
          document.body.style.overflow = "";
          modal.removeEventListener("click", closeOnOutsideClick);
        }
      };
      modal.addEventListener("click", closeOnOutsideClick);
    });
  });
}

setupModal("#login-btn, #mobile-login-btn", "login-modal");
setupModal("#register-btn", "register-modal");
setupModal("[data-event-id]", "event-modal");

/* Calendar Functionality */
function generateCalendar(date = new Date(), events = []) {
  const calendarContainer = document.getElementById("events-calendar");
  if (!calendarContainer) return;

  const year = date.getFullYear();
  const month = date.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startingDayOfWeek = firstDay.getDay();
  const daysInMonth = lastDay.getDate();

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  let calendarHTML = `
    <div class="calendar-month">
      <h4>${monthNames[month]} ${year}</h4>
    </div>
    <table>
      <thead>
        <tr>
          <th>Sun</th><th>Mon</th><th>Tue</th><th>Wed</th><th>Thu</th><th>Fri</th><th>Sat</th>
        </tr>
      </thead>
      <tbody>
  `;

  let dayCount = 1;
  const today = new Date();

  for (let i = 0; i < 6; i++) {
    calendarHTML += "<tr>";
    for (let j = 0; j < 7; j++) {
      if (i === 0 && j < startingDayOfWeek) {
        calendarHTML += '<td class="empty"></td>';
      } else if (dayCount > daysInMonth) {
        calendarHTML += '<td class="empty"></td>';
      } else {
        const currentDate = new Date(year, month, dayCount);
        const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(dayCount).padStart(2, "0")}`;
        const hasEvent = events.some(event => event.date === dateStr);
        const isPastEventDate = hasEvent && events.every(event => {
          if (event.date !== dateStr) return true;
          return getEventDateTime(event) < today;
        });
        const isToday =
          today.getDate() === currentDate.getDate() &&
          today.getMonth() === currentDate.getMonth() &&
          today.getFullYear() === currentDate.getFullYear();
        const classes = [
          hasEvent ? "has-event" : "",
          isPastEventDate ? "past-event" : "",
          isToday ? "today" : ""
        ].filter(Boolean).join(" ");
        calendarHTML += `<td class="${classes}" data-date="${dateStr}">${dayCount}</td>`;
        dayCount++;
      }
    }
    calendarHTML += "</tr>";
    if (dayCount > daysInMonth) break;
  }

  calendarHTML += `
      </tbody>
    </table>
    <div class="calendar-legend">
      <div class="calendar-legend-item">
        <div class="calendar-legend-dot"></div>
        <span>Dates with events</span>
      </div>
      <div class="calendar-legend-item">
        <div class="calendar-legend-dot past-dot"></div>
        <span>Past events</span>
      </div>
    </div>
  `;

  calendarContainer.innerHTML = calendarHTML;

  // Add click listeners to calendar days
  document.querySelectorAll("#events-calendar td:not(.empty)").forEach((td) => {
    td.addEventListener("click", function () {
      document.querySelectorAll("#events-calendar td").forEach((cell) => {
        cell.classList.remove("selected");
      });
      this.classList.add("selected");
      const dateString = this.dataset.date;
      const [selectedYear, selectedMonth, selectedDay] = dateString.split("-").map(Number);
      const selectedDate = new Date(selectedYear, selectedMonth - 1, selectedDay);
      updateEventsList(selectedDate, dateString, events);
    });
  });

  // Auto-select today or the first event date
  const todayCell = document.querySelector("#events-calendar td.today");
  if (todayCell) {
    todayCell.classList.add("selected");
    const dateString = todayCell.dataset.date;
    const [selectedYear, selectedMonth, selectedDay] = dateString.split("-").map(Number);
    updateEventsList(new Date(selectedYear, selectedMonth - 1, selectedDay), dateString, events);
  } else {
    const firstEventCell = document.querySelector("#events-calendar td.has-event");
    if (firstEventCell) {
      firstEventCell.classList.add("selected");
      const dateString = firstEventCell.dataset.date;
      const [selectedYear, selectedMonth, selectedDay] = dateString.split("-").map(Number);
      updateEventsList(new Date(selectedYear, selectedMonth - 1, selectedDay), dateString, events);
    } else {
      const firstDayCell = document.querySelector("#events-calendar td:not(.empty)");
      if (firstDayCell) {
        firstDayCell.classList.add("selected");
        const dateString = firstDayCell.dataset.date;
        const [selectedYear, selectedMonth, selectedDay] = dateString.split("-").map(Number);
        updateEventsList(new Date(selectedYear, selectedMonth - 1, selectedDay), dateString, events);
      }
    }
  }
}

function updateEventsList(selectedDate, dateString, events) {
  const eventsContainer = document.getElementById("events-for-date");
  const dateHeading = document.getElementById("selected-date");
  const today = new Date();
  const eventsForDate = events.filter(event => event.date === dateString);

  dateHeading.textContent = `Events for ${formatDate(selectedDate)}`;

  if (eventsForDate.length === 0) {
    eventsContainer.innerHTML = '<div class="no-events">No events scheduled for this date.</div>';
  } else {
    let eventsHTML = "";
    eventsForDate.forEach((event) => {
      const isPastEvent = getEventDateTime(event) < today;
      eventsHTML += `
        <div class="event-item ${isPastEvent ? "past-event" : ""}" data-event-id="${event.id}">
          <div class="event-item-details">
            <h4>${event.title}</h4>
            <p>${formatTime(event.time)} • ${event.location}</p>
            ${isPastEvent ? '<span class="event-past-badge">Past</span>' : ""}
          </div>
          <button class="btn btn-outline">Details</button>
        </div>
      `;
    });

    eventsContainer.innerHTML = eventsHTML;

    document.querySelectorAll(".event-item").forEach((item) => {
      item.addEventListener("click", function () {
        const eventId = this.dataset.eventId;
        const event = events.find(e => e.id === eventId);
        if (event) {
          showEventDetails(event);
        }
      });
    });
  }
}

/* Real-Time Event Listener */
function setupRealtimeEventsListener() {
  const currentDate = new Date();
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const startDate = `${year}-${String(month + 1).padStart(2, "0")}-01`;
  const endDate = `${year}-${String(month + 1).padStart(2, "0")}-${new Date(year, month + 1, 0).getDate()}`;

  const eventsRef = collection(db, "events");
  const q = query(
    eventsRef,
    where("date", ">=", startDate),
    where("date", "<=", endDate),
    orderBy("date", "asc")
  );

  // Listen for real-time updates
  onSnapshot(q, (snapshot) => {
    const events = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    generateCalendar(new Date(), events);
  }, (error) => {
    console.error("Error listening to events: ", error);
    const calendarContainer = document.getElementById("events-calendar");
    if (calendarContainer) {
      calendarContainer.innerHTML += `<p>Error loading events: ${error.message}</p>`;
    }
  });
}

function showEventDetails(event) {
  const modal = document.getElementById("event-modal");
  const title = document.getElementById("event-title");
  const dateTime = document.getElementById("event-date-time");
  const location = document.getElementById("event-location");
  const description = document.getElementById("event-description");
  const modalContent = modal.querySelector(".modal-content");

  const today = new Date();
  const eventDateTime = getEventDateTime(event);
  const isPastEvent = eventDateTime < today;

  modalContent.classList.remove("past-event");
  if (isPastEvent) modalContent.classList.add("past-event");

  title.textContent = event.title;
  dateTime.textContent = `${formatDate(new Date(event.date))} • ${formatTime(event.time)}`;
  location.textContent = event.location;
  description.textContent = event.description;

  const modalFooter = document.querySelector(".modal-footer");

  if (isPastEvent) {
    modalFooter.innerHTML = `
      <div class="event-status">This event has already taken place</div>
      <button class="btn btn-outline close-btn">Close</button>
    `;
  } else {
    modalFooter.innerHTML = `
      <button class="btn btn-primary" id="add-to-calendar-btn">Add to Google Calendar</button>
      <button class="btn btn-outline" id="download-ics-btn">Download .ics</button>
      <button class="btn btn-outline close-btn">Close</button>
    `;

    const start = new Date(event.date);
    const [rawHour, rawMinute] = event.time.split(":");
    let hour = parseInt(rawHour);
    const isPM = event.time.toUpperCase().includes("PM");
    if (isPM && hour < 12) hour += 12;
    if (!isPM && hour === 12) hour = 0;
    start.setHours(hour, parseInt(rawMinute), 0);
    const end = new Date(start);
    end.setHours(start.getHours() + 1);

    const formatForCalendar = (date) =>
      date.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";

    document.getElementById("add-to-calendar-btn").addEventListener("click", () => {
      const calendarUrl = `https://www.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.title)}&dates=${formatForCalendar(start)}/${formatForCalendar(end)}&details=${encodeURIComponent(event.description)}&location=${encodeURIComponent(event.location)}&sf=true&output=xml`;
      window.open(calendarUrl, "_blank");
      showSuccessPopup("ADDED TO CALENDAR", `${event.title} was opened in Google Calendar.`);
    });

    document.getElementById("download-ics-btn").addEventListener("click", () => {
      const icsContent = `
BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//JA1 Church//EN
BEGIN:VEVENT
UID:${Date.now()}@ja1church.org
DTSTAMP:${formatForCalendar(new Date())}
DTSTART:${formatForCalendar(start)}
DTEND:${formatForCalendar(end)}
SUMMARY:${event.title}
DESCRIPTION:${event.description}
LOCATION:${event.location}
END:VEVENT
END:VCALENDAR
`.trim();

      const blob = new Blob([icsContent], { type: 'text/calendar' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${event.title.replace(/\s+/g, '_')}.ics`;
      a.click();
      URL.revokeObjectURL(url);
      showSuccessPopup("ICS FILE DOWNLOADED", "You can now import the event into your calendar.");
    });
  }

  modal.classList.add("open");
  document.body.style.overflow = "hidden";

  modal.querySelectorAll(".close-btn, .close-modal").forEach((btn) => {
    btn.addEventListener("click", () => {
      modal.classList.remove("open");
      document.body.style.overflow = "";
    });
  });

  modal.addEventListener("click", (e) => {
    if (e.target === modal) {
      modal.classList.remove("open");
      document.body.style.overflow = "";
    }
  });
}

/* Form Submission Handling */
document.querySelectorAll("form").forEach((form) => {
  form.addEventListener("submit", function (e) {
    // Only handle forms not already handled by specific listeners
    if (form.id !== "admin-login-form" && form.id !== "leader-tab" && !form.classList.contains("register-form")) {
      e.preventDefault();
      const formData = new FormData(this);
      const formEntries = {};
      for (const entry of formData.entries()) {
        formEntries[entry[0]] = entry[1];
      }
      console.log("Form submitted:", formEntries);
      const modal = this.closest(".modal");
      if (modal) {
        modal.classList.remove("open");
        document.body.style.overflow = "";
        showSuccessPopup("FORM SUBMITTED", "Your form has been submitted successfully!");
        this.reset();
      }
    }
  });
});

/* Initialize Calendar and Leader Dashboard */
document.addEventListener("DOMContentLoaded", () => {
  setupRealtimeEventsListener();
  setupEventSuggestionForm();
  onAuthStateChanged(auth, async (user) => {
    if (window.location.pathname.includes("leader.html")) {
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists() && userDoc.data().Role === "Leader") {
            loadMembers(user.uid);
            loadPendingEvents(user.uid);
          } else {
            showPopup("ACCESS DENIED", "This page is for Leaders only.", true);
            setTimeout(() => {
              window.location.href = "index.html";
            }, 2000);
          }
        } catch (error) {
          console.error("Error checking user role:", error);
          showPopup("ERROR", "Failed to verify user role.", true);
          setTimeout(() => {
            window.location.href = "index.html";
          }, 2000);
        }
      } else {
        showPopup("NOT LOGGED IN", "Please log in as a Leader to access this page.", true);
        setTimeout(() => {
          window.location.href = "index.html";
        }, 2000);
      }
    }
  });
});

/* Parallax Effect */
window.addEventListener("scroll", () => {
  const scrollPosition = window.scrollY;
  const heroSection = document.querySelector(".hero");
  if (heroSection) {
    const video = document.getElementById("church-video");
    if (video && scrollPosition < window.innerHeight) {
      video.style.transform = `translateX(-50%) translateY(calc(-50% + ${scrollPosition * 0.15}px))`;
    }
  }
});

/* Header Transparency */
window.addEventListener("scroll", () => {
  const scrollPosition = window.scrollY;
  const navbar = document.querySelector(".navbar");
  if (scrollPosition > 50) {
    navbar.classList.add("scrolled");
  } else {
    navbar.classList.remove("scrolled");
  }
});

/* Verse of the Day */
async function fetchVerseOfDay() {
  const verseElement = document.getElementById("verse-text");
  const referenceElement = document.getElementById("verse-reference");
  const verseSection = document.querySelector(".verse-of-day");
  if (!verseElement || !referenceElement || !verseSection) return;

  verseElement.innerHTML = `
    <div class="loading-spinner">
      <div class="spinner"></div>
      <p>Loading today's verse...</p>
    </div>
  `;

  try {
    const verseApiUrl = "https://labs.bible.org/api/?passage=votd&type=json";
    const verseResponse = await fetch(verseApiUrl);
    if (!verseResponse.ok) throw new Error(`Bible API responded with status: ${verseResponse.status}`);
    const verseData = await verseResponse.json();
    if (!verseData || verseData.length === 0) throw new Error("No verse data received from API");

    const verse = verseData[0];
    const verseText = verse.text;
    const reference = `${verse.bookname} ${verse.chapter}:${verse.verse}`;
    const today = new Date().toISOString().split("T")[0];
    const dateSum = today.split("-").reduce((sum, part) => sum + Number.parseInt(part), 0);
    const imageId = (dateSum % 1000) + 1;
    const backgroundImageUrl = `https://picsum.photos/id/${imageId}/1920/1080`;

    verseElement.innerHTML = verseText;
    referenceElement.textContent = reference;
    verseSection.style.backgroundImage = `linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url(${backgroundImageUrl})`;

    const shareButton = document.getElementById("share-verse");
    if (shareButton) {
      shareButton.addEventListener("click", () => {
        shareVerse(verseText, reference);
      });
    }
  } catch (error) {
    console.error("Error fetching verse of the day:", error);
    try {
      const fallbackApiUrl = "https://beta.ourmanna.com/api/v1/get?format=json";
      const fallbackResponse = await fetch(fallbackApiUrl);
      if (!fallbackResponse.ok) throw new Error(`Fallback API responded with status: ${fallbackResponse.status}`);
      const fallbackData = await fallbackResponse.json();
      const verseText = fallbackData?.verse?.details?.text;
      const reference = fallbackData?.verse?.details?.reference;
      if (verseText && reference) {
        verseElement.innerHTML = verseText;
        referenceElement.textContent = reference;
        const today = new Date().toISOString().split("T")[0];
        const dateSum = today.split("-").reduce((sum, part) => sum + Number.parseInt(part), 0);
        const imageId = (dateSum % 1000) + 1;
        const backgroundImageUrl = `https://picsum.photos/id/${imageId}/1920/1080`;
        verseSection.style.backgroundImage = `linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url(${backgroundImageUrl})`;
        return;
      }
      throw new Error("Invalid data from fallback API");
    } catch (fallbackError) {
      console.error("Fallback API also failed:", fallbackError);
      verseElement.innerHTML = "Could not load today's verse. Please try again later.";
      referenceElement.textContent = "";
      verseSection.style.backgroundImage = "linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url(assets/img/hero-bg.jpg)";
    }
  }
}

function shareVerse(verseText, reference) {
  if (navigator.share) {
    navigator.share({
      title: "JA1 Church - Verse of the Day",
      text: `"${verseText}" - ${reference}`,
      url: window.location.href,
    }).catch((error) => {
      console.log("Error sharing:", error);
    });
  } else {
    const textArea = document.createElement("textarea");
    textArea.value = `"${verseText}" - ${reference}`;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand("copy");
    document.body.removeChild(textArea);
    alert("Verse copied to clipboard!");
  }
}

document.addEventListener("DOMContentLoaded", () => {
  fetchVerseOfDay();
});

/* Intersection Observer for Animations */
document.addEventListener("DOMContentLoaded", () => {
  const sections = document.querySelectorAll("section");
  const observerOptions = {
    root: null,
    rootMargin: "0px",
    threshold: 0.2,
  };

  const sectionObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const section = entry.target;
        const sectionId = section.id;
        section.classList.add("visible");
        switch (sectionId) {
          case "home":
            animateHeroElements(section);
            break;
          case "verse-of-day":
            animateVerseOfDay(section);
            break;
          case "ministries":
            animateMinistryCards(section);
            break;
          case "events":
            animateEventsSection(section);
            break;
          case "about":
            animateAboutSection(section);
            break;
          case "gallery":
            animateGallerySection(section);
            break;
        }
        observer.unobserve(section);
      }
    });
  }, observerOptions);

  sections.forEach((section) => {
    sectionObserver.observe(section);
  });

  function animateHeroElements(section) {
    const title = section.querySelector(".hero-title");
    const subtitle = section.querySelector(".hero-subtitle");
    const button = section.querySelector(".btn-primary");
    const highlights = section.querySelector(".service-highlights");
    if (title) title.classList.add("animate-title");
    if (subtitle) subtitle.classList.add("animate-subtitle");
    if (button) button.classList.add("animate-button");
    if (highlights) highlights.classList.add("animate-highlights");
  }

  function animateVerseOfDay(section) {
    const verseContainer = section.querySelector(".verse-container");
    if (verseContainer) verseContainer.classList.add("animate-verse");
  }

  function animateMinistryCards(section) {
    const cards = section.querySelectorAll(".ministry-card");
    cards.forEach((card, index) => {
      setTimeout(() => {
        card.classList.add("animate-card");
        const shimmerEffect = () => {
          card.classList.add("shimmer");
          setTimeout(() => {
            card.classList.remove("shimmer");
          }, 1000);
        };
        setTimeout(shimmerEffect, 500 + index * 200);
      }, 150 * index);
    });
  }

  function animateEventsSection(section) {
    const calendar = section.querySelector(".calendar-container");
    const eventsList = section.querySelector(".events-list");
    if (calendar) calendar.classList.add("animate-calendar");
    if (eventsList) {
      setTimeout(() => {
        eventsList.classList.add("animate-events-list");
      }, 300);
    }
  }

  function animateAboutSection(section) {
    const cards = section.querySelectorAll(".about-card");
    const infoCards = section.querySelectorAll(".info-card");
    cards.forEach((card, index) => {
      setTimeout(() => {
        card.classList.add("animate-about-card");
      }, 200 * index);
    });
    infoCards.forEach((card, index) => {
      setTimeout(() => {
        card.classList.add("animate-info-card");
      }, 150 * index + 400);
    });
  }

  function animateGallerySection(section) {
    const cards = document.querySelectorAll(".gallery-card");
    cards.forEach((card, index) => {
      setTimeout(() => {
        card.classList.add("animate-card");
      }, 150 * index);
    });
  }
});

/* Gallery Slider */
document.addEventListener("DOMContentLoaded", () => {
  const cards = document.querySelectorAll(".gallery-card");
  cards.forEach((card, cardIndex) => {
    setTimeout(() => card.classList.add("animate-card"), cardIndex * 200);
    const slider = card.querySelector(".image-slider");
    let images = [];
    try {
      images = JSON.parse(card.getAttribute("data-images"));
    } catch (e) {
      console.error(`Failed to parse data-images for card ${cardIndex + 1}`, e);
      return;
    }
    if (!slider || images.length < 2) return;
    let currentImageIndex = 0;
    const changeImage = () => {
      const nextIndex = (currentImageIndex + 1) % images.length;
      const nextSrc = images[nextIndex];
      const newImg = document.createElement("img");
      newImg.src = nextSrc;
      newImg.alt = `Image ${nextIndex + 1}`;
      newImg.classList.add("next");
      slider.appendChild(newImg);
      newImg.onload = () => {
        const currentImg = slider.querySelector("img.active");
        requestAnimationFrame(() => {
          newImg.classList.remove("next");
          newImg.classList.add("active");
          if (currentImg) {
            currentImg.classList.remove("active");
            currentImg.classList.add("exiting");
          }
          setTimeout(() => {
            if (currentImg && currentImg.parentElement === slider) {
              slider.removeChild(currentImg);
            }
          }, 500);
        });
        currentImageIndex = nextIndex;
      };
      newImg.onerror = () => {
        slider.removeChild(newImg);
        currentImageIndex = nextIndex;
        setTimeout(changeImage, 100);
      };
    };
    setInterval(changeImage, 4000 + cardIndex * 500);
  });
});

/* Ministry Card Hover Effects */
document.addEventListener("DOMContentLoaded", () => {
  const ministryCards = document.querySelectorAll(".ministry-card");
  ministryCards.forEach((card, index) => {
    const colors = [
      ["#f43f5e", "#fb7185"],
      ["#8b5cf6", "#a78bfa"],
      ["#10b981", "#34d399"],
      ["#f59e0b", "#fbbf24"],
    ];
    card.addEventListener("mouseenter", () => {
      const [color1, color2] = colors[index % colors.length];
      card.style.boxShadow = `0 15px 35px rgba(0, 0, 0, 0.1), 0 0 0 1px ${color1}10`;
    });
    card.addEventListener("mouseleave", () => {
      card.style.boxShadow = "";
    });
  });
});

/* Enhanced About Section Animations */
document.addEventListener("DOMContentLoaded", () => {
  const aboutSection = document.getElementById("about");
  if (!aboutSection) return;
  const observerOptions = {
    root: null,
    rootMargin: "0px",
    threshold: 0.2,
  };
  const sectionObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        aboutSection.classList.add("visible");
        const aboutCards = aboutSection.querySelectorAll(".about-card");
        aboutCards.forEach((card, index) => {
          card.style.animationDelay = `${index * 0.2}s`;
        });
        const infoCards = aboutSection.querySelectorAll(".info-card");
        infoCards.forEach((card, index) => {
          card.style.animationDelay = `${index * 0.2 + 0.4}s`;
        });
        const valueItems = aboutSection.querySelectorAll(".values-list li");
        valueItems.forEach((item, index) => {
          item.style.animationDelay = `${index * 0.15 + 0.3}s`;
          item.style.animation = `fadeInUp 0.8s ease-out forwards`;
        });
        sectionObserver.unobserve(aboutSection);
      }
    });
  }, observerOptions);
  sectionObserver.observe(aboutSection);
  const valueItems = document.querySelectorAll(".values-list li");
  valueItems.forEach((item) => {
    item.addEventListener("mouseenter", function () {
      const hoverSound = new Audio();
      hoverSound.volume = 0.05;
      hoverSound.src = "data:audio/mpeg;base64,SUQzBAAAAAAAI1RTU0UAAAAPAAADTGF2ZjU4Ljc2LjEwMAAAAAAAAAAAAAAA//tQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAASW5mbwAAAA8AAAASAAAeMwAUFBQUFCgUFBQUFDMzMzMzMzNGRkZGRkZGWlpaWlpaWm1tbW1tbW2AgICAgICAlJSUlJSUlKenpycnJye7u7u7u7u7z8/Pz8/Pz+Li4uLi4uL19fX19fX1//////////8AAAAATGF2YzU4LjEzAAAAAAAAAAAAAAAAJAX/LAAAAAAAAAAA";
      hoverSound.play().catch((e) => {
        console.log("Audio autoplay blocked");
      });
    });
  });
  const infoCards = document.querySelectorAll(".info-card");
  infoCards.forEach((card) => {
    card.addEventListener("mousemove", function (e) {
      const rect = this.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      this.style.background = `radial-gradient(circle at ${x}px ${y}px, rgba(255,255,255,0.8) 0%, rgba(245,245,245,1) 50%)`;
    });
    card.addEventListener("mouseleave", function () {
      this.style.background = "linear-gradient(145deg, #ffffff, #f5f5f5)";
    });
  });
});

/* 3D Tilt Effect for About Cards */
document.addEventListener("DOMContentLoaded", function () {
  const aboutCards = document.querySelectorAll(".about-card");
  aboutCards.forEach((card) => {
    card.addEventListener("mousemove", function (e) {
      const rect = this.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const angleX = (y - centerY) / 20;
      const angleY = (centerX - x) / 20;
      this.style.transform = `perspective(1000px) rotateX(${angleX}deg) rotateY(${angleY}deg) translateY(-8px)`;
    });
    card.addEventListener("mouseleave", function () {
      this.style.transform = "perspective(1000px) rotateX(0) rotateY(0) translateY(0)";
    });
  });
});

/* Load Events for Admin Dashboard */
async function loadEvents() {
  const eventsList = document.getElementById('events-list');
  if (!eventsList) return;

  eventsList.innerHTML = '';
  let events = [];

  try {
    const eventsRef = collection(db, "events");
    const q = query(eventsRef, orderBy("date", "asc"));
    const querySnapshot = await getDocs(q);
    events = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error fetching events: ", error);
    eventsList.innerHTML = `<p>Error loading events: ${error.message}</p>`;
    return;
  }

  if (events.length === 0) {
    eventsList.innerHTML = '<div class="no-events">No upcoming events.</div>';
    return;
  }

  events.forEach((event, index) => {
    const eventDateTime = getEventDateTime(event);
    const isPast = eventDateTime < new Date();
    const eventItem = `
      <div class="event-item ${isPast ? 'past-event' : ''}" style="animation-delay: ${index * 0.1}s;">
        <div class="event-item-details">
          <h4>${event.title}</h4>
          <p>${event.date} at ${event.time}</p>
          <p>Location: ${event.location}</p>
          <p>${event.description}</p>
          ${isPast ? '<span class="event-past-badge">Past Event</span>' : ''}
        </div>
      </div>
    `;
    eventsList.innerHTML += eventItem;
  });

  document.querySelectorAll('.event-item').forEach(item => {
    item.classList.add('animate-events-list');
  });
}

/* Load Leaders for Admin Dashboard */
async function loadLeaders() {
  const leadersList = document.getElementById('leaders-list');
  if (!leadersList) return;

  leadersList.innerHTML = '';
  let leaders = [];

  try {
    const usersRef = collection(db, "users");
    const q = query(usersRef, where("Role", "==", "Leader"));
    const querySnapshot = await getDocs(q);
    leaders = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error fetching leaders: ", error);
    leadersList.innerHTML = `<p>Error loading leaders: ${error.message}</p>`;
    return;
  }

  if (leaders.length === 0) {
    leadersList.innerHTML = '<div class="no-leaders">No leaders found.</div>';
    return;
  }

  leaders.forEach((leader, index) => {
    const leaderItem = `
      <div class="leader-item" style="animation-delay: ${index * 0.1}s;">
        <div class="leader-item-details">
          <h4>${leader.firstName} ${leader.lastName}</h4>
          <p>Email: ${leader.email}</p>
          <p>Phone: ${leader.phoneNumber || 'N/A'}</p>
          <p>Status: ${leader.Status || 'Active'}</p>
        </div>
      </div>
    `;
    leadersList.innerHTML += leaderItem;
  });

  document.querySelectorAll('.leader-item').forEach(item => {
    item.classList.add('animate-leaders-list');
  });
}

/* Load Dashboard Stats for Admin Dashboard */
async function loadDashboardStats() {
  const statsContainer = document.getElementById('dashboard-stats');
  if (!statsContainer) return;

  statsContainer.innerHTML = '';
  let stats = [];

  try {
    const statsRef = collection(db, "stats");
    const querySnapshot = await getDocs(q);
    stats = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error fetching dashboard stats: ", error);
    statsContainer.innerHTML = `<p>Error loading dashboard stats: ${error.message}</p>`;
    return;
  }

  if (stats.length === 0) {
    statsContainer.innerHTML = '<div class="no-stats">No stats available.</div>';
    return;
  }

  stats.forEach((stat, index) => {
    const statItem = `
      <div class="stat-item" style="animation-delay: ${index * 0.1}s;">
        <h4>${stat.title || stat.id}</h4>
        <p>Value: ${stat.value || 'N/A'}</p>
        <p>Description: ${stat.description || 'No description'}</p>
      </div>
    `;
    statsContainer.innerHTML += statItem;
  });

  document.querySelectorAll('.stat-item').forEach(item => {
    item.classList.add('animate-stats-list');
  });
}

/* Admin Dashboard Initialization */
document.addEventListener("DOMContentLoaded", () => {
  onAuthStateChanged(auth, async (user) => {
    // Only enforce Admin checks on admin.html
    if (window.location.pathname.includes("admin.html")) {
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (userDoc.exists() && userDoc.data().Role === "Admin") {
            loadEvents();
            loadLeaders();
            loadDashboardStats();
          } else {
            showSuccessPopup("ACCESS DENIED", "This page is for Admins only.", true);
            setTimeout(() => {
              window.location.href = "index.html";
            }, 2000);
          }
        } catch (error) {
          console.error("Error checking user role:", error);
          showSuccessPopup("ERROR", "Failed to verify user role.", true);
          setTimeout(() => {
            window.location.href = "index.html";
          }, 2000);
        }
      } else {
        showSuccessPopup("NOT LOGGED IN", "Please log in as an Admin to access this page.", true);
        setTimeout(() => {
          window.location.href = "index.html";
        }, 2000);
      }
    }
  });
});





/* Registration Form Handling */
document.querySelector('.register-form')?.addEventListener('submit', function (e) {
  e.preventDefault();
  const firstName = document.getElementById('firstName').value.trim();
  const lastName = document.getElementById('lastName').value.trim();
  const email = document.getElementById('email').value.trim();
  const phone = document.getElementById('phone').value.trim();
  const address = document.getElementById('address').value.trim();
  const specialRequests = document.getElementById('specialRequests').value.trim();

  if (!firstName || !lastName || !email || !phone) {
    showSuccessPopup("MISSING FIELDS", "Please fill in all required fields (First Name, Last Name, Email, Phone).", true);
    return;
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    showSuccessPopup("INVALID EMAIL", "Please enter a valid email address.", true);
    return;
  }

  let pendingUsers = JSON.parse(localStorage.getItem('pendingUsers') || '[]');
  const isDuplicate = pendingUsers.some(user => user.email.toLowerCase() === email.toLowerCase());
  if (isDuplicate) {
    showSuccessPopup("DUPLICATE EMAIL", "This email is already pending approval.", true);
    return;
  }

  const newPendingUser = {
    id: Date.now().toString(),
    name: `${firstName} ${lastName}`,
    email,
    phone,
    address,
    specialRequests,
    suynlTopicsCompleted: [],
    id101Status: false,
    role: 'Member',
    status: 'Active',
    anointedGroupLeader: ''
  };

  pendingUsers.push(newPendingUser);
  localStorage.setItem('pendingUsers', JSON.stringify(pendingUsers));
  showSuccessPopup("REGISTRATION SUBMITTED", "Your registration is pending admin approval. You will be notified once approved!");
  document.querySelector('.register-form').reset();
  document.getElementById('register-modal').style.display = 'none';
});








