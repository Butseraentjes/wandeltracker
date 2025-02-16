// 🔹 Firebase SDK laden via CDN (geen npm nodig)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, GoogleAuthProvider, signInWithPopup, signInWithRedirect, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc, collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// 🔹 Firebase configuratie
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
        // Eerst proberen met popup
        const result = await signInWithPopup(auth, provider);
        const user = result.user;
        console.log("Ingelogd als:", user.displayName);
        
        // Gebruiker opslaan in Firestore
        await setDoc(doc(db, "users", user.uid), {
            email: user.email,
            displayName: user.displayName,
            startLocation: null,
            history: {}
        }, { merge: true });
        
        alert("Succesvol ingelogd als: " + user.displayName);
    } catch (error) {
        console.error("Fout bij Google login:", error.message);
        
        // Als popup mislukt, probeer redirect
        if (error.code === "auth/popup-blocked" || error.code === "auth/unauthorized-domain") {
            try {
                await signInWithRedirect(auth, provider);
            } catch (redirectError) {
                console.error("Fout bij redirect login:", redirectError.message);
                alert("Fout bij inloggen. Probeer het opnieuw of controleer of je het juiste domein gebruikt.");
            }
        } else {
            alert("Fout bij inloggen: " + error.message);
        }
    }
});

// 🔹 Uitloggen functie
document.getElementById("logout-btn").addEventListener("click", async () => {
    try {
        await signOut(auth);
        console.log("Succesvol uitgelogd");
        window.location.reload();
    } catch (error) {
        console.error("Fout bij uitloggen:", error.message);
        alert("Fout bij uitloggen: " + error.message);
    }
});

// 🔹 Controleer login status
onAuthStateChanged(auth, async (user) => {
    if (user) {
        // Gebruiker is ingelogd
        document.getElementById("login-container").style.display = "none";
        document.getElementById("main-content").style.display = "block";
        document.getElementById("user-info").innerText = "Ingelogd als: " + user.displayName;
        
        // Controleer/maak gebruikersprofiel
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);
        
        if (!docSnap.exists()) {
            // Nieuw gebruikersprofiel aanmaken
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

// 🔹 Modal elementen
const modal = document.getElementById("new-project-modal");
const newProjectBtn = document.getElementById("new-project-btn");
const closeBtn = document.querySelector(".close");
const cancelBtn = document.getElementById("cancel-project");
const projectForm = document.getElementById("new-project-form");
const getLocationBtn = document.getElementById("get-location");

// 🔹 Modal openen
newProjectBtn.addEventListener("click", () => {
    modal.style.display = "block";
});

// 🔹 Modal sluiten (via X of Annuleren)
const closeModal = () => {
    modal.style.display = "none";
    projectForm.reset();
};

closeBtn.addEventListener("click", closeModal);
cancelBtn.addEventListener("click", closeModal);
window.addEventListener("click", (e) => {
    if (e.target === modal) closeModal();
});

// 🔹 Huidige locatie ophalen
getLocationBtn.addEventListener("click", () => {
    if (navigator.geolocation) {
        getLocationBtn.textContent = "Locatie ophalen...";
        navigator.geolocation.getCurrentPosition(
            (position) => {
                document.getElementById("latitude").value = position.coords.latitude;
                document.getElementById("longitude").value = position.coords.longitude;
                getLocationBtn.textContent = "Gebruik huidige locatie";
            },
            (error) => {
                console.error("Fout bij ophalen locatie:", error);
                alert("Kon de locatie niet ophalen. Controleer of je locatietoegang hebt gegeven.");
                getLocationBtn.textContent = "Gebruik huidige locatie";
            }
        );
    } else {
        alert("Geolocatie wordt niet ondersteund door je browser.");
    }
});

// 🔹 Project aanmaken
projectForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const projectName = document.getElementById("project-name").value;
    const latitude = parseFloat(document.getElementById("latitude").value);
    const longitude = parseFloat(document.getElementById("longitude").value);
    const description = document.getElementById("project-description").value;

    try {
        const user = auth.currentUser;
        if (!user) throw new Error("Niet ingelogd");

        // Nieuw project toevoegen aan Firestore
        const projectRef = await addDoc(collection(db, "projects"), {
            userId: user.uid,
            name: projectName,
            startLocation: { latitude, longitude },
            description: description,
            createdAt: serverTimestamp(),
            totalDistance: 0,
            history: {}
        });

        alert("Project succesvol aangemaakt!");
        closeModal();
        
        // TODO: Project toevoegen aan de UI
        // Hier kunnen we later code toevoegen om het project direct in de UI te tonen

    } catch (error) {
        console.error("Fout bij aanmaken project:", error);
        alert("Er ging iets mis bij het aanmaken van het project. Probeer het opnieuw.");
    }
});
