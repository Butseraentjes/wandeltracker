import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { 
    getAuth, 
    GoogleAuthProvider, 
    signInWithPopup,
    signOut,
    onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { 
    getFirestore,
    collection,
    doc, 
    setDoc,
    serverTimestamp,
    query,
    where,
    onSnapshot
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// Firebase configuratie
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

// UI Update Functions
function showDashboard(user) {
    const loginContainer = document.getElementById('login-container');
    const mainContent = document.getElementById('main-content');
    const mainNav = document.getElementById('main-nav');
    const logoutBtn = document.getElementById('logout-btn');
    const userInfo = document.getElementById('user-info');

    loginContainer.classList.add('hidden');
    mainContent.classList.remove('hidden');
    mainNav.classList.remove('hidden');
    logoutBtn.classList.remove('hidden');
    userInfo.textContent = user.email;
}

function showLogin() {
    const loginContainer = document.getElementById('login-container');
    const mainContent = document.getElementById('main-content');
    const mainNav = document.getElementById('main-nav');
    const logoutBtn = document.getElementById('logout-btn');
    const userInfo = document.getElementById('user-info');

    loginContainer.classList.remove('hidden');
    mainContent.classList.add('hidden');
    mainNav.classList.add('hidden');
    logoutBtn.classList.add('hidden');
    userInfo.textContent = '';
}

// Auth state observer
export function initializeAuth(onLogin, onLogout) {
    onAuthStateChanged(auth, async (user) => {
        if (user) {
            // User is ingelogd
            showDashboard(user);

            // Update user data in Firestore
            try {
                await setDoc(doc(db, "users", user.uid), {
                    email: user.email,
                    lastLogin: serverTimestamp()
                }, { merge: true });
            } catch (error) {
                console.error("Error updating user data:", error);
            }

            if (onLogin) onLogin(user);
        } else {
            // User is uitgelogd
            showLogin();
            if (onLogout) onLogout();
        }
    });
}

// Login functie
export async function loginWithGoogle() {
    try {
        const result = await signInWithPopup(auth, provider);
        showDashboard(result.user);
        return result.user;
    } catch (error) {
        console.error("Login error:", error);
        throw error;
    }
}

// Logout functie
export async function logout() {
    try {
        await signOut(auth);
        showLogin();
    } catch (error) {
        console.error("Logout error:", error);
        throw error;
    }
}

// Project functies
export async function createProject(projectData) {
    try {
        const user = auth.currentUser;
        if (!user) throw new Error("Geen gebruiker ingelogd");

        const projectsRef = collection(db, "projects");
        const newProjectRef = doc(projectsRef);

        await setDoc(newProjectRef, {
            ...projectData,
            userId: user.uid,
            createdAt: serverTimestamp()
        });

        return newProjectRef.id;
    } catch (error) {
        console.error("Error creating project:", error);
        throw error;
    }
}

// Projecten ophalen
export function subscribeToProjects(callback) {
    const user = auth.currentUser;
    if (!user) return null;

    // Vereenvoudigde query zonder orderBy
    const projectsQuery = query(
        collection(db, "projects"),
        where("userId", "==", user.uid)
    );

    return onSnapshot(projectsQuery, 
        (snapshot) => {
            const projects = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            // Client-side sortering
            projects.sort((a, b) => {
                const dateA = a.createdAt?.toDate?.() || new Date(0);
                const dateB = b.createdAt?.toDate?.() || new Date(0);
                return dateB - dateA;
            });
            callback(projects);
        },
        (error) => {
            console.error('Error in subscribeToProjects:', error);
            callback([]);
        }
    );
}

// Helper functies
export async function getCurrentUser() {
    return new Promise((resolve, reject) => {
        const unsubscribe = onAuthStateChanged(auth,
            user => {
                unsubscribe();
                resolve(user);
            },
            error => {
                unsubscribe();
                reject(error);
            }
        );
    });
}

// Exporteer Firebase instances voor gebruik in andere modules
export { db, auth };

// In firebase.js, voeg deze functie toe:

export function subscribeToProject(projectId, callback) {
    const user = auth.currentUser;
    if (!user) return null;

    const projectRef = doc(db, "projects", projectId);
    
    return onSnapshot(projectRef, (doc) => {
        if (doc.exists() && doc.data().userId === user.uid) {
            callback({
                id: doc.id,
                ...doc.data()
            });
        } else {
            callback(null);
        }
    }, (error) => {
        console.error('Error fetching project:', error);
        callback(null);
    });
}


// Voeg toe aan firebase.js

export async function saveWalk(projectId, walkData) {
    try {
        const user = auth.currentUser;
        if (!user) throw new Error("Geen gebruiker ingelogd");

        const walkRef = doc(collection(db, "projects", projectId, "walks"), walkData.date);
        
        await setDoc(walkRef, {
            ...walkData,
            userId: user.uid,
            createdAt: serverTimestamp()
        });

        return walkRef.id;
    } catch (error) {
        console.error("Error saving walk:", error);
        throw error;
    }
}
