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

// 🔹 Helper functies voor UI updates
function updateUIForLoggedInUser(user) {
    console.log("Updating UI for logged in user:", user.displayName);
    
    const loginContainer = document.getElementById("login-container");
    const mainContent = document.getElementById("main-content");
    const userInfo = document.getElementById("user-info");

    if (loginContainer && mainContent && userInfo) {
        loginContainer.classList.add("hidden");
        loginContainer.classList.remove("visible");
        
        mainContent.classList.add("visible");
        mainContent.classList.remove("hidden");
        
        userInfo.innerText = "Ingelogd als: " + user.displayName;
        console.log("UI updated for logged in user");
    } else {
        console.error("Some elements not found:", {
            loginContainer: !!loginContainer,
            mainContent: !!mainContent,
            userInfo: !!userInfo
        });
    }
}

function updateUIForLoggedOutUser() {
    console.log("Updating UI for logged out user");
    
    const loginContainer = document.getElementById("login-container");
    const mainContent = document.getElementById("main-content");
    
    if (loginContainer && mainContent) {
        loginContainer.classList.add("visible");
        loginContainer.classList.remove("hidden");
        
        mainContent.classList.add("hidden");
        mainContent.classList.remove("visible");
        console.log("UI updated for logged out user");
    } else {
        console.error("Some elements not found:", {
            loginContainer: !!loginContainer,
            mainContent: !!mainContent
        });
    }
}

// 🔹 Google Login functie
document.getElementById("google-login-btn")?.addEventListener("click", async () => {
    try {
        console.log("Starting Google login process");
        const result = await signInWithPopup(auth, provider);
        const user = result.user;
        console.log("Successfully logged in as:", user.displayName);
        
        // Gebruiker opslaan in Firestore
        await setDoc(doc(db, "users", user.uid), {
            email: user.email,
            displayName: user.displayName,
            history: {},
            createdAt: serverTimestamp()
        }, { merge: true });
        
        console.log("User saved to database");
        updateUIForLoggedInUser(user);
    } catch (error) {
        console.error("Error during Google login:", error);
        
        if (error.code === "auth/popup-blocked" || error.code === "auth/unauthorized-domain") {
            try {
                await signInWithRedirect(auth, provider);
            } catch (redirectError) {
                console.error("Error during redirect login:", redirectError);
                alert("Fout bij inloggen. Probeer het opnieuw.");
            }
        } else {
            alert("Fout bij inloggen: " + error.message);
        }
    }
});

// 🔹 Uitloggen functie
document.getElementById("logout-btn")?.addEventListener("click", async () => {
    try {
        console.log("Starting logout process");
        await signOut(auth);
        console.log("Successfully logged out");
        updateUIForLoggedOutUser();
    } catch (error) {
        console.error("Error during logout:", error);
        alert("Fout bij uitloggen: " + error.message);
    }
});

// 🔹 Auth state observer
onAuthStateChanged(auth, async (user) => {
    console.log("Auth state changed:", user ? "logged in" : "logged out");
    
    if (user) {
        // Gebruiker is ingelogd
        console.log("User is logged in:", user.displayName);
        updateUIForLoggedInUser(user);
        
        // Controleer/maak gebruikersprofiel
        try {
            const docRef = doc(db, "users", user.uid);
            const docSnap = await getDoc(docRef);
            
            if (!docSnap.exists()) {
                console.log("Creating new user profile");
                await setDoc(docRef, {
                    email: user.email,
                    displayName: user.displayName,
                    history: {},
                    createdAt: serverTimestamp()
                });
                console.log("User profile created");
            }
        } catch (error) {
            console.error("Error checking/creating user profile:", error);
        }
    } else {
        // Gebruiker is niet ingelogd
        console.log("No user logged in");
        updateUIForLoggedOutUser();
    }
});

// 🔹 Modal elementen
const modal = document.getElementById("new-project-modal");
const newProjectBtn = document.getElementById("new-project-btn");
const closeBtn = document.querySelector(".close");
const cancelBtn = document.getElementById("cancel-project");
const projectForm = document.getElementById("new-project-form");

// 🔹 Modal functies
newProjectBtn?.addEventListener("click", () => {
    console.log("Opening new project modal");
    modal.style.display = "block";
});

const closeModal = () => {
    console.log("Closing modal");
    modal.style.display = "none";
    projectForm.reset();
};

closeBtn?.addEventListener("click", closeModal);
cancelBtn?.addEventListener("click", closeModal);
window.addEventListener("click", (e) => {
    if (e.target === modal) closeModal();
});

// 🔹 Project aanmaken
projectForm?.addEventListener("submit", async (e) => {
    e.preventDefault();
    console.log("Starting new project creation");

    const projectName = document.getElementById("project-name").value;
    const address = document.getElementById("address").value;
    const description = document.getElementById("project-description").value;

    try {
        const user = auth.currentUser;
        if (!user) throw new Error("Niet ingelogd");

        console.log("Converting address to coordinates");
        const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`);
        const data = await response.json();

        if (data.length === 0) {
            throw new Error("Kon het adres niet vinden. Controleer of het correct is ingevoerd.");
        }

        const latitude = parseFloat(data[0].lat);
        const longitude = parseFloat(data[0].lon);
        console.log("Coordinates found:", { latitude, longitude });

        // Project toevoegen aan Firestore
        const projectRef = await addDoc(collection(db, "projects"), {
            name: projectName,
            userId: user.uid,
            description: description,
            createdAt: serverTimestamp(),
            startLocation: {
                address: address,
                latitude: latitude,
                longitude: longitude
            },
            totalDistance: 0
        });

        console.log("Project created successfully:", projectRef.id);
        alert("Project succesvol aangemaakt!");
        closeModal();

    } catch (error) {
        console.error("Error creating project:", error);
        alert(error.message);
    }
