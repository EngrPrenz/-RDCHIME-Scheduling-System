/* Firebase Imports */
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { 
  getFirestore, 
  collection, 
  getDocs,
  addDoc, 
  query, 
  where, 
  orderBy,
  doc,
  getDoc,
  onSnapshot // Added for real-time updates
} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";
import { 
  getAuth, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";

// Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyA---_h9ddOjlbiCnEsy4z3p-A4jKwsc-I",
  authDomain: "ja1-church-database.firebaseapp.com",
  projectId: "ja1-church-database",
  storageBucket: "ja1-church-database.firebasestorage.app",
  messagingSenderId: "650630302188",
  appId: "1:650630302188:web:5d0768490af1d051ccd8c9"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

/* Helpers */
function formatDate(date) {
  const options = { weekday: "long", year: "numeric", month: "long", day: "numeric" };
  return date.toLocaleDateString("en-US", options);
}

function formatTime(time24) {
  if (!time24 || time24.includes("AM") || time24.includes("PM")) return time24;
  const [hour, minute] = time24.split(":").map(Number);
  const suffix = hour >= 12 ? "PM" : "AM";
  const hour12 = hour % 12 || 12;
  return `${hour12}:${minute.toString().padStart(2, '0')} ${suffix}`;
}

function getEventDateTime(event) {
  const eventDate = new Date(event.date);
  const [hour, minute] = event.time.split(":").map(Number);
  eventDate.setHours(hour, minute, 0, 0);
  return eventDate;
}

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

/* Tab Switching for Admin/Leader */
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
              window.location.href = "admin.html";
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

/* Leader Login Handling (Placeholder) */
const leaderForm = document.querySelector("#leader-tab form");
if (leaderForm) {
  leaderForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("leader-email").value.trim();
    const password = document.getElementById("leader-password").value.trim();

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Verify Leader role
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists() && userDoc.data().Role === "Leader") {
        loginModal.classList.remove("open");
        showSuccessPopup("LOGIN SUCCESSFUL", "Welcome back, Leader!");
        onAuthStateChanged(auth, (authUser) => {
          if (authUser && authUser.uid === user.uid) {
            setTimeout(() => {
              window.location.href = "leader.html"; // Adjust to your Leader dashboard page
            }, 500);
          }
        }, { once: true });
      } else {
        await signOut(auth);
        showSuccessPopup("ACCESS DENIED", "This account is not a Leader.", true);
      }
    } catch (error) {
      showSuccessPopup("ERROR", "Invalid email or password.", true);
      console.error("Leader login error:", error);
    }
  });
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




// JA1 Church AI Assistant Functionality
document.addEventListener('DOMContentLoaded', () => {
    const chatToggle = document.getElementById('chat-toggle');
    const chatBox = document.getElementById('chat-box');
    const chatInput = document.getElementById('chat-input');
    const chatCloseBtn = document.getElementById('chat-close');

    // Toggle Chat Function
    function toggleChat() {
        if (chatBox.style.display === 'flex') {
            chatBox.style.display = 'none';
        } else {
            chatBox.style.display = 'flex';
            adjustChatHeight();
            if (chatInput) {
                chatInput.focus();
                scrollToBottom();
            }
        }
    }

    // Send Message Function
    function sendMessage() {
        const input = document.getElementById('chat-input');
        const message = input.value.trim();
        if (!message) return;

        appendMessage('user', message);
        input.value = '';
        showTypingIndicator(true);

        setTimeout(() => {
            const reply = getBotReply(message);
            showTypingIndicator(false);
            appendMessage('bot', reply);
        }, 1000);
    }

    // Append Message Function
    function appendMessage(sender, text) {
        const messages = document.getElementById('chat-messages');
        const msg = document.createElement('div');
        msg.className = sender === 'bot' ? 'bot-message' : 'user-message';
        msg.textContent = text;
        messages.appendChild(msg);
        scrollToBottom();
    }

    // Show Typing Indicator Function
    function showTypingIndicator(show) {
        const messages = document.getElementById('chat-messages');
        let typing = document.querySelector('.typing-indicator');
        
        if (!typing) {
            typing = document.createElement('div');
            typing.className = 'typing-indicator';
            typing.innerHTML = 'JA1 Assistant is typing<span>.</span><span>.</span><span>.</span>';
            messages.appendChild(typing);
        }
        
        typing.style.display = show ? 'block' : 'none';
        if (show) {
            scrollToBottom();
        }
    }

   
    // Scroll to Bottom Function
    function scrollToBottom() {
        const messages = document.getElementById('chat-messages');
        messages.scrollTop = messages.scrollHeight;
    }

    // Adjust Chat Height Function
    function adjustChatHeight() {
        const chatBox = document.getElementById('chat-box');
        if (window.innerWidth <= 768) { // Mobile view
            const viewportHeight = window.visualViewport ? window.visualViewport.height : window.innerHeight;
            chatBox.style.height = `${viewportHeight}px`;
            scrollToBottom();
        } else {
            chatBox.style.height = '500px'; // Restore default height for desktop
        }
    }

    // Event Listeners
    if (chatToggle) {
        chatToggle.addEventListener('click', toggleChat);
    }

    if (chatCloseBtn) {
        chatCloseBtn.addEventListener('click', toggleChat);
    }

    if (chatInput) {
        chatInput.addEventListener('keydown', (event) => {
            if (event.key === 'Enter') {
                sendMessage();
            }
        });
    }

    // Send Message Button Event Listener
    const sendButton = document.querySelector('#chat-input-area button');
    if (sendButton) {
        sendButton.addEventListener('click', sendMessage);
    }

    // Listen for viewport changes
    if (window.visualViewport) {
        window.visualViewport.addEventListener('resize', adjustChatHeight);
    } else {
        window.addEventListener('resize', adjustChatHeight);
    }

    // Input focus and blur events for mobile keyboard handling
    if (chatInput) {
        chatInput.addEventListener('focus', () => {
            setTimeout(adjustChatHeight, 300);
        });

        chatInput.addEventListener('blur', () => {
            setTimeout(adjustChatHeight, 300);
        });
    }

    // Initial setup
    adjustChatHeight();
    
    // Ensure chatbox is hidden initially
    if (chatBox) {
        chatBox.style.display = 'none';
    }
});

function getBotReply(message) {
  const msg = message.toLowerCase().trim();
  
  // Google Calendar related responses
  if (msg.includes("calendar") || msg.includes("how to add") || msg.includes("add google calendar") || msg.includes("schedule appointment")) {
    return "Instructions:\n\n1.\nThis is manual Google Calendar event\n\n2.\nIf you in Google Calendar Click \"Saved\" button to saved selected event.\n\n3.\nYou can also select location in Google Maps (optional)";
  }
  
  // JA1 Church-specific responses
  if (msg.includes("ja1") && (msg.includes("mean") || msg.includes("meaning") || msg.includes("stand for"))) {
    return "JA1 stands for 'Jesus the Anointed One,' reflecting our core belief that Jesus Christ is the Messiah, anointed by God to redeem and lead humanity. This shapes our worship, teachings, and mission to live with Jesus Above All, emphasizing His divinity, love, and transformative power in our lives.";
  }
  if (msg.includes("establish") || msg.includes("founded") || msg.includes("history")) {
    return "JA1 Church was founded in 1995 in Antipolo, Philippines, by Pastor John Smith. Beginning as a small Bible study group focused on Jesus’ teachings, it has grown into a vibrant, multi-branch ministry. Today, JA1 serves thousands through worship, outreach, and discipleship, committed to spreading the Gospel across the Philippines and beyond.";
  }
  if (msg.includes("branch") || msg.includes("location") || msg.includes("where")) {
    return "Our main branch is at 123 Faith Street, Antipolo. Other branches are in Quezon City (456 Hope Avenue), Davao (789 Grace Road), and Cebu (321 Love Street). Visit any location for Sunday worship, Bible studies, or community events. Check our website for directions and local programs!";
  }
  if (msg.includes("service") || msg.includes("time") || msg.includes("schedule")) {
    return "We offer Sunday Worship at 10:00 AM, Wednesday Prayer at 7:00 PM, and Friday Youth Fellowship at 6:00 PM across all branches. Monthly Bible teaching sessions and special events, like our Annual Revival Night, are shared on our website and social media.";
  }
  if (msg.includes("join") || msg.includes("bible") || msg.includes("group")) {
    return "Join our Bible Study on Wednesdays at 7:00 PM, Youth Fellowship on Fridays at 6:00 PM, or one of our small groups for deeper spiritual growth. Email info@ja1church.org to connect with a group, start your membership, or explore online Bible study options!";
  }
  if (msg.includes("events") || msg.includes("upcoming")) {
    return "Upcoming events include our Annual Family Camp in December, a Community Feeding Program next month, a Worship Concert in March, and a Bible Conference in June. Visit our website’s Events page for details, registration, and ways to volunteer or sponsor.";
  }
  if (msg.includes("pastor") || msg.includes("leader")) {
    return "Pastor John Smith leads JA1 Church, alongside associate pastors like Pastor Maria Reyes (Quezon City), Pastor Daniel Cruz (Davao), and Pastor Anna Lim (Cebu). Our leaders are dedicated to biblical preaching, pastoral care, and empowering members to live Christ-centered lives.";
  }
  if (msg.includes("mission") || msg.includes("vision") || msg.includes("purpose")) {
    return "Our mission is to glorify God by making disciples who live with Jesus Above All. Our vision is a Christ-centered, multi-generational community that transforms lives through love, service, and faith, impacting the Philippines and the world with the Gospel.";
  }
  if (msg.includes("contact") || msg.includes("reach out")) {
    return "Reach us at info@ja1church.org, call +63 912 345 6789, or follow us on social media (links on our website). Whether you have questions, need prayer, or want to join, our team is here to support you!";
  }
  if (msg.includes("community") || msg.includes("program") || msg.includes("outreach")) {
    return "JA1 Church runs outreach programs like monthly feeding drives, free medical missions, youth mentorship, and our 'Hope for Tomorrow' initiative, which provides school supplies and tutoring. Get involved by volunteering or donating—contact info@ja1church.org for details!";
  }
  if (msg.includes("member") || msg.includes("membership") || msg.includes("get involved")) {
    return "Become a member by attending our Newcomers’ Orientation (monthly after Sunday service) and joining a small group. Volunteer in ministries like worship, kids’ church, or outreach. Email info@ja1church.org to register or learn more about serving.";
  }
  if (msg.includes("value") || msg.includes("belief")) {
    return "Our core values are Faith (trusting God’s Word), Love (serving others as Christ did), and Unity (building a community rooted in Jesus). These principles drive our teachings, relationships, and commitment to living with Jesus Above All.";
  }

  // New Bible-related responses
  if (msg.includes("bible verse") || msg.includes("scripture") || msg.includes("quote")) {
    return "A key verse for JA1 Church is John 3:16: 'For God so loved the world that He gave His one and only Son, that whoever believes in Him shall not perish but have eternal life.' This captures our belief in Jesus’ sacrifice and love. Want a specific verse or topic, like hope or faith? Let me know!";
  }
  if (msg.includes("jesus") && (msg.includes("teach") || msg.includes("life") || msg.includes("who is"))) {
    return "Jesus, the Anointed One, is the Son of God, sent to save humanity through His life, death, and resurrection. His teachings, like the Sermon on the Mount (Matthew 5-7), emphasize love, forgiveness, and obedience to God. At JA1, we follow His example of humility and service. Want to explore a specific teaching?";
  }
  if (msg.includes("bible study") || msg.includes("learn bible") || msg.includes("scripture study")) {
    return "Join our Wednesday Bible Study at 7:00 PM (in-person or online) to dive into Scripture with our community. Current series: 'The Life of Jesus.' We also offer beginner-friendly studies and resources. Email info@ja1church.org for study guides or to join a small group!";
  }
  if (msg.includes("prayer") || msg.includes("pray")) {
    return "Prayer is central to JA1 Church. Join our Wednesday Prayer Night at 7:00 PM or submit a prayer request at info@ja1church.org. Need a prayer now? Try: 'Lord Jesus, guide me with Your love and wisdom. Amen.' Let me know if you’d like a specific prayer or topic!";
  }
  if (msg.includes("sermon") || msg.includes("preaching") || msg.includes("message")) {
    return "Our sermons focus on biblical truth and practical faith. Recent topics include 'Jesus Above All' (Colossians 1:15-20) and 'Living in God’s Love' (1 John 4:7-12). Watch past sermons on our website or join us Sundays at 10:00 AM. Want a specific sermon topic?";
  }

  // New JA1 Church-specific responses
  if (msg.includes("jesus anointed one") || msg.includes("christ") || msg.includes("messiah")) {
    return "At JA1 Church, we believe Jesus, the Anointed One, is the Messiah foretold in Scripture (Isaiah 61:1). He is our Savior, King, and guide. Our worship and teachings center on His life, sacrifice, and resurrection, inspiring us to live with faith and purpose. Curious about a specific aspect of His role?";
  }
  if (msg.includes("worship") || msg.includes("music") || msg.includes("praise")) {
    return "Worship at JA1 Church is vibrant and Christ-focused, featuring contemporary and traditional music. Our worship team leads songs like 'Way Maker' and 'How Great Is Our God' every Sunday at 10:00 AM. Join us or explore our worship playlists on our website!";
  }
  if (msg.includes("discipleship") || msg.includes("grow faith") || msg.includes("spiritual growth")) {
    return "Discipleship at JA1 Church means growing closer to Jesus through Bible study, mentorship, and community. Join our 'Follow Jesus' program, a 12-week course for new believers, or connect with a mentor via info@ja1church.org. Want tips on daily faith practices?";
  }
  if (msg.includes("kids") || msg.includes("children") || msg.includes("family")) {
    return "JA1 Church offers a vibrant Kids’ Ministry for ages 3-12 during Sunday services, with Bible stories, crafts, and games. Family events like our Annual Family Camp foster faith at home. Email info@ja1church.org for resources or to join our parenting workshops!";
  }
  if (msg.includes("testimony") || msg.includes("stories") || msg.includes("faith journey")) {
    return "JA1 members share powerful testimonies of how Jesus transformed their lives, from overcoming struggles to finding purpose. Hear stories at our Sunday services or read them on our website’s Testimony page. Want to share your story? Email info@ja1church.org!";
  }

  // Fallback response with suggestions
  return "I’m here to help with JA1 Church and Bible-related questions! Try asking about Jesus’ teachings, Bible verses, our worship services, kids’ programs, or how to grow your faith. 😊";
}

// New function to scroll to the bottom of the chat
function scrollToBottom() {
  const messages = document.getElementById("chat-messages");
  messages.scrollTop = messages.scrollHeight;
}

// New function to handle keyboard visibility for mobile
function adjustChatHeight() {
  const chatBox = document.getElementById("chat-box");
  if (window.innerWidth <= 768) { // Mobile view
    const viewportHeight = window.visualViewport ? window.visualViewport.height : window.innerHeight;
    chatBox.style.height = `${viewportHeight}px`;
    scrollToBottom(); // Ensure latest message is visible
  } else {
    chatBox.style.height = "500px"; // Restore default height for desktop
  }
}

// Listen for viewport changes (keyboard show/hide)
if (window.visualViewport) {
  window.visualViewport.addEventListener("resize", adjustChatHeight);
} else {
  window.addEventListener("resize", adjustChatHeight);
}

// Adjust height when input is focused (keyboard appears)
document.getElementById("chat-input").addEventListener("focus", () => {
  setTimeout(adjustChatHeight, 300); // Delay to account for keyboard animation
});

// Reset height when input loses focus (keyboard hides)
document.getElementById("chat-input").addEventListener("blur", () => {
  setTimeout(adjustChatHeight, 300); // Delay to ensure keyboard is hidden
});

// Initial adjustment
document.addEventListener("DOMContentLoaded", () => {
  adjustChatHeight();
  // Ensure chatbox is hidden initially
  document.getElementById("chat-box").style.display = "none";
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








