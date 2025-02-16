// 🔹 Firebase SDK laden via CDN (geen npm nodig)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, GoogleAuthProvider, signInWithPopup, signInWithRedirect, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// 🔹 Firebase configuratie (gecorrigeerd)
const firebaseConfig = {
    apiKey: "AIzaSyAgT_uX_5RrP7CKiI5-KpBSUXvvT928qik",
    authDomain: "wandeltracker-3692d.firebaseapp.com",
    projectId: "wandeltracker-3692d",
    storageBucket: "wandeltracker-3692d.appspot.com",
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
            startLocation: null,
            history: {}
        }, { merge: true });
        
        alert("Succesvol ingelogd als: " + user.displayName);
    } catch (error) {
        console.error("Fout bij Google login:", error.message);
        alert("Fout bij Google login: " + error.message);
        
        // 🔹 Alternatieve login methode als popup geblokkeerd is
        if (error.code === "auth/popup-blocked" || error.code === "auth/unauthorized-domain") {
            try {
                await signInWithRedirect(auth, provider);
            } catch (redirectError) {
                console.error("Fout bij redirect login:", redirectError.message);
                alert("Fout bij redirect login: " + redirectError.message);
            }
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
        // Gebruiker is ingelogd
        document.getElementById("login-container").style.display = "none";
        document.getElementById("main-content").style.display = "block";
        document.getElementById("user-info").innerText = "Ingelogd als: " + user.displayName;
        
        // 🔹 Controleer of gebruiker al een profiel heeft
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);
        
        if (!docSnap.exists()) {
            // Maak nieuw gebruikersprofiel aan
            await setDoc(docRef, {
                email: user.email,
                displayName: user.displayName,
                startLocation: null,
                history: {}
            });
        }
    } else {
        // Gebruiker is niet ingelogd
        document.getElementById("login-container").style.display = "block";
        document.getElementById("main-content").style.display = "none";
    }
});
