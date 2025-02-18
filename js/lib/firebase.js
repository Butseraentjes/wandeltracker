const firebase = window.firebase;
console.log('Loading Firebase configuration...');

// Firebase initialisatie
const app = firebase.initializeApp({
    apiKey: "AIzaSyAgT_uX_5RrP7CKiI5-KpBSUXvvT928qik",
    authDomain: "wandeltracker-3692d.firebaseapp.com",
    projectId: "wandeltracker-3692d",
    storageBucket: "wandeltracker-3692d.appspot.com",
    messagingSenderId: "131040578819",
    appId: "1:131040578819:web:1aabbd1272a76fdc232d36"
});

const auth = firebase.auth();
const db = firebase.firestore();
const provider = new firebase.auth.GoogleAuthProvider();

console.log('Firebase initialized successfully');

// UI Update Functions
function showDashboard(user) {
    const loginContainer = document.getElementById('login-container');
    const mainContent = document.getElementById('main-content');
    const mainNav = document.getElementById('main-nav');
    const logoutBtn = document.getElementById('logout-btn');
    const userInfo = document.getElementById('user-info');

    loginContainer?.classList.add('hidden');
    mainContent?.classList.remove('hidden');
    mainNav?.classList.remove('hidden');
    logoutBtn?.classList.remove('hidden');
    if (userInfo) userInfo.textContent = user.email;
}

function showLogin() {
    const loginContainer = document.getElementById('login-container');
    const mainContent = document.getElementById('main-content');
    const mainNav = document.getElementById('main-nav');
    const logoutBtn = document.getElementById('logout-btn');
    const userInfo = document.getElementById('user-info');

    loginContainer?.classList.remove('hidden');
    mainContent?.classList.add('hidden');
    mainNav?.classList.add('hidden');
    logoutBtn?.classList.add('hidden');
    if (userInfo) userInfo.textContent = '';
}

// Auth state observer
export function initializeAuth(onLogin, onLogout) {
    console.log('Setting up auth state observer...');
    auth.onAuthStateChanged(async (user) => {
        console.log('Auth state changed:', user ? 'logged in' : 'logged out');
        if (user) {
            showDashboard(user);

            try {
                await db.collection("users").doc(user.uid).set({
                    email: user.email,
                    lastLogin: firebase.firestore.FieldValue.serverTimestamp()
                }, { merge: true });
            } catch (error) {
                console.error("Error updating user data:", error);
            }

            if (onLogin) onLogin(user);
        } else {
            showLogin();
            if (onLogout) onLogout();
        }
    });
}

// Login functie
export async function loginWithGoogle() {
    try {
        const result = await auth.signInWithPopup(provider);
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
        await auth.signOut();
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

        const projectsRef = db.collection("projects");
        const newProjectRef = projectsRef.doc();

        await newProjectRef.set({
            ...projectData,
            userId: user.uid,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });

        return newProjectRef.id;
    } catch (error) {
        console.error("Error creating project:", error);
        throw error;
    }
}

// Nieuwe functie voor het instellen van een project doel
export async function setProjectDestination(projectId, destinationName) {
    try {
        const user = auth.currentUser;
        if (!user) throw new Error("Geen gebruiker ingelogd");

        // Geocoding van de destination met GraphHopper
        const destinationQuery = encodeURIComponent(destinationName);
        const response = await fetch(`https://graphhopper.com/api/1/geocode?q=${destinationQuery}&locale=nl&key=1fb0ae3f-1d34-4c16-896d-02ee3f40d4ec`);
        const data = await response.json();

        if (!data.hits || data.hits.length === 0) {
            throw new Error("Kon de opgegeven bestemming niet vinden");
        }

        const destinationLocation = data.hits[0];
        
        // Update het project met de nieuwe destination
        await db.collection("projects").doc(projectId).update({
            destination: {
                name: destinationName,
                coordinates: {
                    lat: destinationLocation.point.lat,
                    lng: destinationLocation.point.lng
                },
                completed: false,
                setAt: firebase.firestore.FieldValue.serverTimestamp()
            }
        });

        return destinationLocation;
    } catch (error) {
        console.error("Error setting project destination:", error);
        throw error;
    }
}

// Projecten ophalen
export function subscribeToProjects(callback) {
    console.log('Setting up projects subscription...');
    const user = auth.currentUser;
    if (!user) return null;

    return db.collection("projects")
        .where("userId", "==", user.uid)
        .onSnapshot(
            (snapshot) => {
                const projects = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
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

export function subscribeToProject(projectId, callback) {
    console.log('Setting up project subscription for:', projectId);
    const user = auth.currentUser;
    if (!user) {
        console.log('No user logged in');
        return null;
    }

    return db.collection("projects").doc(projectId)
        .onSnapshot((doc) => {
            if (doc.exists && doc.data().userId === user.uid) {
                const projectData = {
                    id: doc.id,
                    ...doc.data()
                };
                console.log('Project data received:', projectData);
                callback(projectData);
            } else {
                console.log('Project not found or unauthorized');
                callback(null);
            }
        }, (error) => {
            console.error('Error fetching project:', error);
            callback(null);
        });
}

export function subscribeToWalks(projectId, callback) {
    console.log('Setting up walks subscription for project:', projectId);
    const user = auth.currentUser;
    if (!user) return null;

    return db.collection("projects").doc(projectId).collection("walks")
        .onSnapshot((snapshot) => {
            const walks = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            console.log('Walks data received:', walks);
            callback(walks);
        }, (error) => {
            console.error('Error fetching walks:', error);
            callback([]);
        });
}

export async function saveWalk(projectId, walkData) {
    try {
        const user = auth.currentUser;
        if (!user) throw new Error("Geen gebruiker ingelogd");

        const walkRef = db.collection("projects").doc(projectId)
            .collection("walks").doc(walkData.date);
        
        await walkRef.set({
            ...walkData,
            userId: user.uid,
            createdAt: firebase.firestore.FieldValue.serverTimestamp()
        });

        return walkRef.id;
    } catch (error) {
        console.error("Error saving walk:", error);
        throw error;
    }
}

// Helper functions
export async function getCurrentUser() {
    return new Promise((resolve, reject) => {
        const unsubscribe = auth.onAuthStateChanged(
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

export { db, auth };
