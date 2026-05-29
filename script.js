/* =============================================
   PageTurn — script.js
   Online Bookstore | Web Programming Project
   ============================================= */

"use strict";

/* ===== 1. DYNAMIC FOOTER — Date & Time ===== */
function updateFooterTime() {
  const el = document.getElementById("footer-time");
  if (!el) return;
  const now = new Date();
  const options = {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
    hour: "2-digit", minute: "2-digit", second: "2-digit"
  };
  el.textContent = now.toLocaleDateString("en-US", options);
}
updateFooterTime();
setInterval(updateFooterTime, 1000);


/* ===== 2. DARK / LIGHT MODE TOGGLE ===== */
const themeToggle = document.getElementById("theme-toggle");
const themeIcon   = document.getElementById("theme-icon");
const body        = document.body;

if (localStorage.getItem("theme") === "dark") {
  body.classList.add("dark");
  themeIcon.textContent = "☀";
}

themeToggle.addEventListener("click", () => {
  const isDark = body.classList.toggle("dark");
  themeIcon.textContent = isDark ? "☀" : "☽";
  localStorage.setItem("theme", isDark ? "dark" : "light");
});


/* ===== 3. HAMBURGER MENU ===== */
const hamburger = document.getElementById("hamburger");
const mainNav   = document.getElementById("main-nav");

hamburger.addEventListener("click", () => {
  mainNav.classList.toggle("open");
  hamburger.setAttribute("aria-expanded", mainNav.classList.contains("open"));
});

mainNav.querySelectorAll("a").forEach(link => {
  link.addEventListener("click", () => mainNav.classList.remove("open"));
});


/* ===== 4. CAROUSEL ===== */
const track   = document.getElementById("carousel-track");
const prevBtn = document.getElementById("carousel-prev");
const nextBtn = document.getElementById("carousel-next");
const dotsEl  = document.getElementById("carousel-dots");
const cards   = Array.from(track.querySelectorAll(".book-card"));
const total   = cards.length;
let current   = 0;

// ---- Build dot indicators ----
cards.forEach((_, i) => {
  const dot = document.createElement("button");
  dot.className = "carousel-dot";
  dot.setAttribute("aria-label", `Go to book ${i + 1}`);
  dot.addEventListener("click", () => goTo(i));
  dotsEl.appendChild(dot);
});

const dots = Array.from(dotsEl.querySelectorAll(".carousel-dot"));

// ---- Core: move to a given index ----
function goTo(index) {
  current = index;

  const cardWidth    = cards[0].offsetWidth;
  const gap          = 24; // 1.5rem
  const wrapperWidth = track.parentElement.offsetWidth;
  const offset       = (wrapperWidth / 2) - (cardWidth / 2) - (current * (cardWidth + gap));

  track.style.transform = `translateX(${offset}px)`;

  // Update card states
  cards.forEach((card, i) => {
    card.classList.toggle("is-active", i === current);
    // Reset description when navigating away
    if (i !== current) {
      card.classList.remove("desc-open");
      const desc = card.querySelector(".book-desc");
      if (desc) desc.hidden = true;
      const btn = card.querySelector(".btn-desc");
      if (btn) { btn.textContent = "Read More"; btn.setAttribute("aria-expanded", "false"); }
    }
  });
  dots.forEach((dot, i)   => dot.classList.toggle("active", i === current));

  prevBtn.disabled = current === 0;
  nextBtn.disabled = current === total - 1;
}

// ---- Arrow buttons ----
prevBtn.addEventListener("click", () => { if (current > 0)         goTo(current - 1); });
nextBtn.addEventListener("click", () => { if (current < total - 1) goTo(current + 1); });

// ---- Keyboard navigation ----
document.addEventListener("keydown", (e) => {
  if (e.key === "ArrowLeft"  && current > 0)         goTo(current - 1);
  if (e.key === "ArrowRight" && current < total - 1) goTo(current + 1);
});

// ---- Touch / swipe support ----
let touchStartX = 0;
track.addEventListener("touchstart", (e) => { touchStartX = e.touches[0].clientX; }, { passive: true });
track.addEventListener("touchend",   (e) => {
  const delta = touchStartX - e.changedTouches[0].clientX;
  if (Math.abs(delta) > 50) {
    if (delta > 0 && current < total - 1) goTo(current + 1);
    if (delta < 0 && current > 0)         goTo(current - 1);
  }
});

// ---- Recalculate on window resize ----
window.addEventListener("resize", () => goTo(current));

// ---- Init ----
goTo(0);


/* ===== 5. SHOW / HIDE BOOK DESCRIPTION ===== */
track.addEventListener("click", (e) => {
  const btn = e.target.closest(".btn-desc");
  if (!btn) return;
  const card = btn.closest(".book-card");
  if (!card.classList.contains("is-active")) return;

  const desc   = card.querySelector(".book-desc");
  const isOpen = !desc.hidden;
  desc.hidden  = isOpen;
  btn.textContent = isOpen ? "Read More" : "Read Less";
  btn.setAttribute("aria-expanded", String(!isOpen));
});


/* ===== 6. FORM VALIDATION ===== */
const contactForm  = document.getElementById("contact-form");
const nameInput    = document.getElementById("name");
const emailInput   = document.getElementById("email");
const messageInput = document.getElementById("message");
const nameError    = document.getElementById("name-error");
const emailError   = document.getElementById("email-error");
const messageError = document.getElementById("message-error");
const formSuccess  = document.getElementById("form-success");

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

nameInput.addEventListener("blur",    () => validateField(nameInput,    nameError,    "Please enter your name."));
emailInput.addEventListener("blur",   () => validateEmail());
messageInput.addEventListener("blur", () => validateField(messageInput, messageError, "Please enter a message."));

nameInput.addEventListener("input",    () => validateField(nameInput,    nameError,    "Please enter your name."));
emailInput.addEventListener("input",   () => validateEmail());
messageInput.addEventListener("input", () => validateField(messageInput, messageError, "Please enter a message."));

function validateField(input, errorEl, errorMsg) {
  const val = input.value.trim();
  if (!val) { showError(input, errorEl, errorMsg); return false; }
  clearError(input, errorEl);
  return true;
}

function validateEmail() {
  const val = emailInput.value.trim();
  if (!val) {
    showError(emailInput, emailError, "Please enter your email address.");
    return false;
  }
  if (!emailRegex.test(val)) {
    showError(emailInput, emailError, "Please enter a valid email address (e.g. you@example.com).");
    return false;
  }
  clearError(emailInput, emailError);
  return true;
}

function showError(input, errorEl, msg) {
  input.classList.add("error");
  input.classList.remove("valid");
  errorEl.textContent = msg;
}

function clearError(input, errorEl) {
  input.classList.remove("error");
  input.classList.add("valid");
  errorEl.textContent = "";
}

contactForm.addEventListener("submit", (e) => {
  e.preventDefault();
  formSuccess.hidden = true;

  const n  = validateField(nameInput,    nameError,    "Please enter your name.");
  const em = validateEmail();
  const m  = validateField(messageInput, messageError, "Please enter a message.");

  if (n && em && m) {
    formSuccess.hidden = false;
    contactForm.reset();
    [nameInput, emailInput, messageInput].forEach(el => el.classList.remove("valid"));
  }
});