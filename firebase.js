// Firebase configuratie en initialisatie
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { 
    getAuth, 
    GoogleAuthProvider, 
    signInWithPopup, 
    onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { 
    getFirestore,
    doc, 
    setDoc, 
    getDoc, 
    collection, 
    addDoc, 
    serverTimestamp 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyAgT_uX_5RrP7CKiI5-KpBSUXvvT928qik",
    authDomain: "wandeltracker-3692d.firebaseapp.com",
    projectId: "wandeltracker-3692d",
    storageBucket: "wandeltracker-3692d.appspot.com",
    messagingSenderId: "131040578819",
    appId: "1:131040578819:web:1aabbd1272a76fdc232d36"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const provider = new GoogleAuthProvider();

// DOM Elements
const loginButton = document.getElementById("google-login-btn");
const logoutButton = document.getElementById("logout-btn");
const loginContainer = document.getElementById("login-container");
const mainContent = document.getElementById("main-content");
const userInfo = document.getElementById("user-info");

// Login handler
async function handleLogin() {
    try {
        const result = await signInWithPopup(auth, provider);
        const user = result.user;
        console.log("Successfully logged in:", user.email);
        
        // Store user data in Firestore
        await setDoc(doc(db, "users", user.uid), {
            email: user.email,
            lastLogin: serverTimestamp()
        }, { merge: true });
        
    } catch (error) {
        console.error("Login error:", error);
        alert("Er is een fout opgetreden bij het inloggen. Probeer het opnieuw.");
    }
}

// Logout handler
async function handleLogout() {
    try {
        await auth.signOut();
        console.log("Successfully logged out");
    } catch (error) {
        console.error("Logout error:", error);
        alert("Er is een fout opgetreden bij het uitloggen. Probeer het opnieuw.");
    }
}

// Auth state observer
onAuthStateChanged(auth, (user) => {
    if (user) {
        // User is signed in
        loginContainer.classList.add("hidden");
        mainContent.classList.remove("hidden");
        userInfo.textContent = `Ingelogd als: ${user.email}`;
    } else {
        // User is signed out
        loginContainer.classList.remove("hidden");
        mainContent.classList.add("hidden");
        userInfo.textContent = "";
    }
});

// Event listeners
loginButton?.addEventListener("click", handleLogin);
logoutButton?.addEventListener("click", handleLogout);

// Initialize new project modal functionality
const newProjectBtn = document.getElementById("new-project-btn");
const newProjectModal = document.getElementById("new-project-modal");
const closeModalBtn = document.querySelector(".close");
const cancelProjectBtn = document.getElementById("cancel-project");
const newProjectForm = document.getElementById("new-project-form");

function openModal() {
    newProjectModal.style.display = "block";
}

function closeModal() {
    newProjectModal.style.display = "none";
}

newProjectBtn?.addEventListener("click", openModal);
closeModalBtn?.addEventListener("click", closeModal);
cancelProjectBtn?.addEventListener("click", closeModal);

// Handle new project form submission
newProjectForm?.addEventListener("submit", async (e) => {
    e.preventDefault();
    
    const projectName = document.getElementById("project-name").value;
    const address = document.getElementById("address").value;
    const description = document.getElementById("project-description").value;
    
    try {
        const user = auth.currentUser;
        if (!user) throw new Error("Geen gebruiker ingelogd");
        
        await addDoc(collection(db, "projects"), {
            userId: user.uid,
            name: projectName,
            startLocation: address,
            description: description,
            createdAt: serverTimestamp(),
            totalDistance: 0
        });
        
        closeModal();
        newProjectForm.reset();
        
    } catch (error) {
        console.error("Error creating project:", error);
        alert("Er is een fout opgetreden bij het aanmaken van het project. Probeer het opnieuw.");
    }
});
