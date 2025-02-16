// Firebase SDK laden via CDN (geen npm nodig)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc, collection } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// 🔹 Jouw Firebase-configuratie
const firebaseConfig = {
    apiKey: "AIzaSyAgT_uX_5RrP7CKiI5-KpBSUXvvT928qik",
    authDomain: "wandeltracker-3692d.firebaseapp.com",
    projectId: "wandeltracker-3692d",
    storageBucket: "wandeltracker-3692d.firebasestorage.app",
    messagingSenderId: "131040578819",
    appId: "1:131040578819:web:1aabbd1272a76fdc232d36"
};

// 🔹 Firebase initialiseren
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// 🔹 Event listener voor registratieknop
document.getElementById("register-btn").addEventListener("click", async () => {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    try {
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Gebruiker opslaan in Firestore
        await setDoc(doc(db, "users", user.uid), {
            email: user.email,
            startLocation: null,
            history: {}
        });

        alert("Account aangemaakt voor: " + user.email);
    } catch (error) {
        alert("Fout bij registreren: " + error.message);
    }
});

// 🔹 Event listener voor login-knop
document.getElementById("login-btn").addEventListener("click", async () => {
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        alert("Welkom terug, " + userCredential.user.email);
    } catch (error) {
        alert("Fout bij inloggen: " + error.message);
    }
});

// 🔹 Functie om startlocatie op te slaan
async function saveStartLocation(userId, latitude, longitude) {
    try {
        await setDoc(doc(db, "users", userId), {
            startLocation: { latitude: Number(latitude), longitude: Number(longitude) }
        }, { merge: true });
        alert("Startlocatie opgeslagen!");
    } catch (error) {
        alert("Fout bij opslaan startlocatie: " + error.message);
    }
}

// 🔹 Functie om wandeldata per dag op te slaan
async function saveWalkData(userId, date, distance, direction) {
    try {
        await setDoc(doc(db, "users", userId, "history", date), {
            distance: Number(distance),
            direction: direction
        });
        alert("Wandeldata opgeslagen!");
    } catch (error) {
        alert("Fout bij opslaan wandeldata: " + error.message);
    }
}

// 🔹 Functie om wandeldata op te halen
async function getWalkData(userId, date) {
    try {
        const docRef = doc(db, "users", userId, "history", date);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            return docSnap.data();
        } else {
            return null;
        }
    } catch (error) {
        console.error("Fout bij ophalen wandeldata:", error);
    }
}

// 🔹 Event listener voor opslaan van startlocatie
document.getElementById("save-start-btn").addEventListener("click", () => {
    const lat = document.getElementById("latitude").value;
    const lon = document.getElementById("longitude").value;

    if (!auth.currentUser) {
        alert("Je moet ingelogd zijn om je startlocatie op te slaan!");
        return;
    }

    saveStartLocation(auth.currentUser.uid, lat, lon);
});

// 🔹 Event listener voor opslaan van wandeldata
document.getElementById("save-walk-btn").addEventListener("click", () => {
    const date = document.getElementById("date").value;
    const distance = document.getElementById("distance").value;
    const direction = document.getElementById("direction").value;

    if (!auth.currentUser) {
        alert("Je moet ingelogd zijn om je wandeling op te slaan!");
        return;
    }

    saveWalkData(auth.currentUser.uid, date, distance, direction);
});

// 🔹 Event listener voor ophalen van wandeldata
document.getElementById("fetch-walk-btn").addEventListener("click", async () => {
    const date = document.getElementById("fetch-date").value;

    if (!auth.currentUser) {
        alert("Je moet ingelogd zijn om wandeldata op te halen!");
        return;
    }

    const walkData = await getWalkData(auth.currentUser.uid, date);

    if (walkData) {
        document.getElementById("walk-data-output").innerText =
            `Op ${date} heb je ${walkData.distance} km gewandeld richting ${walkData.direction}.`;
    } else {
        document.getElementById("walk-data-output").innerText = "Geen data gevonden voor deze datum.";
    }
});
