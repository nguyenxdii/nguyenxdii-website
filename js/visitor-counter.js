import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
  getDatabase,
  ref,
  onValue,
  set,
  onDisconnect,
  increment,
  push,
  serverTimestamp,
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

const firebaseConfig = {
  apiKey: "AIzaSyB2dz-jHuCBbgPspUnd3M2rMWQpYjk_iAo",
  authDomain: "my-web-c93a1.firebaseapp.com",
  databaseURL:
    "https://my-web-c93a1-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "my-web-c93a1",
  storageBucket: "my-web-c93a1.firebasestorage.app",
  messagingSenderId: "471469563187",
  appId: "1:471469563187:web:8ba2a6998404c832f63246",
  measurementId: "G-T1VFLWC57D",
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

const onlineRef = ref(db, "status/online");
const visitsRef = ref(db, "status/visits");
const myConnectionRef = push(onlineRef);

// Online counter
set(myConnectionRef, {
  timestamp: serverTimestamp(),
  userAgent: navigator.userAgent,
}).then(() => {
  onDisconnect(myConnectionRef).remove();
});

onValue(onlineRef, (snapshot) => {
  const count = snapshot.size;
  updateUI("online-count", count);
});

// Visit counter
const SESSION_KEY = "has_visited_session_" + new Date().toDateString();

if (!sessionStorage.getItem(SESSION_KEY)) {
  set(visitsRef, increment(1));
  sessionStorage.setItem(SESSION_KEY, "true");
}

onValue(visitsRef, (snapshot) => {
  const visits = snapshot.val() || 0;
  updateUI("visit-count", visits);
});

function updateUI(elementId, value) {
  const element = document.getElementById(elementId);
  if (element) {
    animateValue(
      element,
      parseInt(element.innerText.replace(/[^0-9]/g, "") || "0"),
      value,
      500,
    );
  }
}

function animateValue(obj, start, end, duration) {
  if (start === end) return;
  let startTimestamp = null;
  const step = (timestamp) => {
    if (!startTimestamp) startTimestamp = timestamp;
    const progress = Math.min((timestamp - startTimestamp) / duration, 1);
    obj.innerHTML = Math.floor(
      progress * (end - start) + start,
    ).toLocaleString();
    if (progress < 1) {
      window.requestAnimationFrame(step);
    } else {
      obj.innerHTML = end.toLocaleString();
    }
  };
  window.requestAnimationFrame(step);
}
