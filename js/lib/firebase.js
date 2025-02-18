// Verwijder de imports en gebruik de compat versie
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
    auth.onAuthStateChanged(async (user) => {
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

// Projecten ophalen
export function subscribeToProjects(callback) {
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
    const user = auth.currentUser;
    if (!user) return null;

    return db.collection("projects").doc(projectId)
        .onSnapshot((doc) => {
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

export function subscribeToWalks(projectId, callback) {
    const user = auth.currentUser;
    if (!user) return null;

    return db.collection("projects").doc(projectId).collection("walks")
        .onSnapshot((snapshot) => {
            const walks = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
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

export { db, auth };
