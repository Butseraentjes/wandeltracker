// 🔹 Firebase SDK laden via CDN (geen npm nodig)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, GoogleAuthProvider, signInWithPopup, signInWithRedirect, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// 🔹 Firebase configuratie (Check of authDomain correct is!)
const firebaseConfig = {
    apiKey: "AIzaSyAgT_uX_5RrP7CKiI5-KpBSUXvvT928qik",
    authDomain: "wandelttracker.onrender.com", // 🔹 Dit moet correct zijn!
    projectId: "wandeltracker-3692d",
    storageBucket: "wandeltracker-3692d.appspot.com", // 🔹 Correctie hier!
    messagingSenderId: "131040578819",
    appId: "1:131040578819:web:1aabbd1272a76fdc232d36"
};

// 🔹 Firebase initialiseren
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const provider = new GoogleAuthProvider();

// 🔹 Google Login functie
document.getElementById("google-login-btn").addEventListener("click", async () => {
    try {
        const result = await signInWithPopup(auth, provider);
        const user = result.user;
        console.log("Ingelogd als:", user.displayName);

        // 🔹 Sla gebruiker op in Firestore (als nog niet bestaat)
        await setDoc(doc(db, "users", user.uid), {
            email: user.email,
            displayName: user.displayName,
            startLocation: null, // Nog geen startlocatie ingevuld
            history: {} // Leeg wandelgeschiedenis object
        }, { merge: true });

        alert("Succesvol ingelogd als: " + user.displayName);
    } catch (error) {
        console.error("Fout bij Google login:", error.message);
        alert("Fout bij Google login: " + error.message);

        // 🔹 Alternatieve login methode als unauthorized-domain fout optreedt
        if (error.code === "auth/unauthorized-domain") {
            signInWithRedirect(auth, provider);
        }
    }
});

// 🔹 Uitloggen functie
document.getElementById("logout-btn").addEventListener("click", async () => {
    try {
        await signOut(auth);
        alert("Succesvol uitgelogd!");
        window.location.reload();
    } catch (error) {
        console.error("Fout bij uitloggen:", error.message);
        alert("Fout bij uitloggen: " + error.message);
    }
});

// 🔹 Controleer of gebruiker ingelogd is
onAuthStateChanged(auth, async (user) => {
    if (user) {
        document.getElementById("login-container").style.display = "none";
        document.getElementById("main-content").style.display = "block";
        document.getElementById("user-info").innerText = "Ingelogd als: " + user.displayName;

        // 🔹 Controleer of gebruiker al een startlocatie heeft
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
            await setDoc(doc(db, "users", user.uid), {
                email: user.email,
                displayName: user.displayName,
                startLocation: null,
                history: {}
            });
        }
    } else {
        document.getElementById("login-container").style.display = "block";
        document.getElementById("main-content").style.display = "none";
    }
});
