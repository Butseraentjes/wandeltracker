// 🔹 Firebase SDK laden via CDN
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, GoogleAuthProvider, signInWithPopup, signInWithRedirect, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc, collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

console.log("Firebase.js is loading..."); // Debug log

// 🔹 Firebase SDK laden via CDN
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAuth, GoogleAuthProvider, signInWithPopup, signInWithRedirect, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc, collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

console.log("Firebase.js is loading..."); // Debug log

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

console.log("Firebase initialized"); // Debug log

// 🔹 Login button event listener
const loginButton = document.getElementById("google-login-btn");
console.log("Login button found:", !!loginButton); // Debug log

if (loginButton) {
    loginButton.addEventListener("click", async () => {
        console.log("Login button clicked"); // Debug log
        try {
            console.log("Starting login process");
            const result = await signInWithPopup(auth, provider);
            const user = result.user;
            console.log("Login successful:", user.displayName);

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
            console.error("Login error:", error);
            if (error.code === "auth/popup-blocked" || error.code === "auth/unauthorized-domain") {
                try {
                    await signInWithRedirect(auth, provider);
                } catch (redirectError) {
                    console.error("Redirect error:", redirectError);
                    alert("Fout bij inloggen. Probeer het opnieuw.");
                }
            } else {
                alert("Fout bij inloggen: " + error.message);
            }
        }
    });
}

// 🔹 UI Update functies
function updateUIForLoggedInUser(user) {
    console.log("Updating UI for logged in user");
    const loginContainer = document.getElementById("login-container");
    const mainContent = document.getElementById("main-content");
    const userInfo = document.getElementById("user-info");

    if (loginContainer && mainContent && userInfo) {
        loginContainer.style.display = "none";
        mainContent.style.display = "block";
        userInfo.innerText = "Ingelogd als: " + user.displayName;
        console.log("UI updated successfully");
    } else {
        console.error("UI elements not found");
    }
}

function updateUIForLoggedOutUser() {
    console.log("Updating UI for logged out user");
    const loginContainer = document.getElementById("login-container");
    const mainContent = document.getElementById("main-content");

    if (loginContainer && mainContent) {
        loginContainer.style.display = "block";
        mainContent.style.display = "none";
        console.log("UI updated successfully");
    } else {
        console.error("UI elements not found");
    }
}

// 🔹 Logout functie
const logoutButton = document.getElementById("logout-btn");
console.log("Logout button found:", !!logoutButton);

if (logoutButton) {
    logoutButton.addEventListener("click", async () => {
        console.log("Logout clicked");
        try {
            await signOut(auth);
            console.log("Logout successful");
            updateUIForLoggedOutUser();
        } catch (error) {
            console.error("Logout error:", error);
            alert("Fout bij uitloggen: " + error.message);
        }
    });
}

// 🔹 Auth state observer
onAuthStateChanged(auth, async (user) => {
    console.log("Auth state changed:", user ? "logged in" : "logged out");
    
    if (user) {
        console.log("User is logged in:", user.displayName);
        updateUIForLoggedInUser(user);
        
        // Check/create user profile
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
            console.error("Error with user profile:", error);
        }
    } else {
        console.log("No user logged in");
        updateUIForLoggedOutUser();
    }
});

// 🔹 Modal elementen en functies
const modal = document.getElementById("new-project-modal");
const newProjectBtn = document.getElementById("new-project-btn");
const closeBtn = document.querySelector(".close");
const cancelBtn = document.getElementById("cancel-project");
const projectForm = document.getElementById("new-project-form");

if (newProjectBtn) {
    newProjectBtn.addEventListener("click", () => {
        console.log("Opening project modal");
        modal.style.display = "block";
    });
}

const closeModal = () => {
    console.log("Closing modal");
    modal.style.display = "none";
    if (projectForm) projectForm.reset();
};

if (closeBtn) closeBtn.addEventListener("click", closeModal);
if (cancelBtn) cancelBtn.addEventListener("click", closeModal);

window.addEventListener("click", (e) => {
    if (e.target === modal) closeModal();
});

// 🔹 Project aanmaken
if (projectForm) {
    projectForm.addEventListener("submit", async (e) => {
        e.preventDefault();
        console.log("Project form submitted");

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

            console.log("Project created:", projectRef.id);
            alert("Project succesvol aangemaakt!");
            closeModal();

        } catch (error) {
            console.error("Error creating project:", error);
            alert(error.message);
        }
    });
}

console.log("Firebase.js loaded completely"); // Final debug log

