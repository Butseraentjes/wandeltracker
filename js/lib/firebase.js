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
    doc, 
    setDoc,
    getDoc,
    getDocs,
    addDoc,
    deleteDoc,
    collection,
    query,
    where,
    orderBy,
    serverTimestamp,
    updateDoc 
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

// Auth state observer
export function initializeAuth(onLogin, onLogout) {
    return onAuthStateChanged(auth, async (user) => {
        const mainNav = document.getElementById('main-nav');
        const loginContainer = document.getElementById('login-container');
        const mainContent = document.getElementById('main-content');
        const logoutBtn = document.getElementById('logout-btn');
        const userInfo = document.getElementById('user-info');

        if (user) {
            // User is ingelogd
            loginContainer.classList.add('hidden');
            mainContent.classList.remove('hidden');
            mainNav.classList.remove('hidden');
            logoutBtn.classList.remove('hidden');
            userInfo.textContent = `${user.email}`;

            // Update user data in Firestore
            try {
                await setDoc(doc(db, "users", user.uid), {
                    email: user.email,
                    displayName: user.displayName,
                    lastLogin: serverTimestamp()
                }, { merge: true });
            } catch (error) {
                console.error("Error updating user data:", error);
            }

            if (onLogin) onLogin(user);
        } else {
            // User is uitgelogd
            loginContainer.classList.remove('hidden');
            mainContent.classList.add('hidden');
            mainNav.classList.add('hidden');
            logoutBtn.classList.add('hidden');
            userInfo.textContent = '';

            if (onLogout) onLogout();
        }
    });
}

// Login functie
export async function loginWithGoogle() {
    try {
        const result = await signInWithPopup(auth, provider);
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

        const projectRef = await addDoc(collection(db, "projects"), {
            ...projectData,
            userId: user.uid,
            createdAt: serverTimestamp(),
            totalDistance: 0
        });

        return projectRef.id;
    } catch (error) {
        console.error("Error creating project:", error);
        throw error;
    }
}

export async function updateProject(projectId, projectData) {
    try {
        const user = auth.currentUser;
        if (!user) throw new Error("Geen gebruiker ingelogd");

        const projectRef = doc(db, "projects", projectId);
        const projectDoc = await getDoc(projectRef);

        if (!projectDoc.exists()) {
            throw new Error("Project niet gevonden");
        }

        if (projectDoc.data().userId !== user.uid) {
            throw new Error("Geen toegang tot dit project");
        }

        await updateDoc(projectRef, {
            ...projectData,
            updatedAt: serverTimestamp()
        });

        return projectId;
    } catch (error) {
        console.error("Error updating project:", error);
        throw error;
    }
}

export async function deleteProject(projectId) {
    try {
        const user = auth.currentUser;
        if (!user) throw new Error("Geen gebruiker ingelogd");

        const projectRef = doc(db, "projects", projectId);
        const projectDoc = await getDoc(projectRef);

        if (!projectDoc.exists()) {
            throw new Error("Project niet gevonden");
        }

        if (projectDoc.data().userId !== user.uid) {
            throw new Error("Geen toegang tot dit project");
        }

        await deleteDoc(projectRef);

        // Verwijder ook alle activiteiten van dit project
        const activitiesQuery = query(
            collection(db, "activities"),
            where("projectId", "==", projectId)
        );
        const activities = await getDocs(activitiesQuery);
        
        const deletePromises = activities.docs.map(doc => deleteDoc(doc.ref));
        await Promise.all(deletePromises);

    } catch (error) {
        console.error("Error deleting project:", error);
        throw error;
    }
}

export async function getProjects() {
    try {
        const user = auth.currentUser;
        if (!user) throw new Error("Geen gebruiker ingelogd");

        const projectsQuery = query(
            collection(db, "projects"),
            where("userId", "==", user.uid),
            orderBy("createdAt", "desc")
        );

        const querySnapshot = await getDocs(projectsQuery);
        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    } catch (error) {
        console.error("Error getting projects:", error);
        throw error;
    }
}

export async function getProject(projectId) {
    try {
        const user = auth.currentUser;
        if (!user) throw new Error("Geen gebruiker ingelogd");

        const projectRef = doc(db, "projects", projectId);
        const projectDoc = await getDoc(projectRef);

        if (!projectDoc.exists()) {
            throw new Error("Project niet gevonden");
        }

        const projectData = projectDoc.data();
        if (projectData.userId !== user.uid) {
            throw new Error("Geen toegang tot dit project");
        }

        return {
            id: projectDoc.id,
            ...projectData
        };
    } catch (error) {
        console.error("Error getting project:", error);
        throw error;
    }
}

// Activiteiten functies
export async function addActivity(projectId, activityData) {
    try {
        const user = auth.currentUser;
        if (!user) throw new Error("Geen gebruiker ingelogd");

        // Controleer of project bestaat en van gebruiker is
        const projectRef = doc(db, "projects", projectId);
        const projectDoc = await getDoc(projectRef);

        if (!projectDoc.exists()) {
            throw new Error("Project niet gevonden");
        }

        if (projectDoc.data().userId !== user.uid) {
            throw new Error("Geen toegang tot dit project");
        }

        // Voeg activiteit toe
        const activityRef = await addDoc(collection(db, "activities"), {
            ...activityData,
            projectId,
            userId: user.uid,
            createdAt: serverTimestamp()
        });

        // Update totale afstand van project
        const currentTotal = projectDoc.data().totalDistance || 0;
        await updateDoc(projectRef, {
            totalDistance: currentTotal + (activityData.distance || 0),
            updatedAt: serverTimestamp()
        });

        return activityRef.id;
    } catch (error) {
        console.error("Error adding activity:", error);
        throw error;
    }
}

export async function getActivities(projectId) {
    try {
        const user = auth.currentUser;
        if (!user) throw new Error("Geen gebruiker ingelogd");

        const activitiesQuery = query(
            collection(db, "activities"),
            where("projectId", "==", projectId),
            where("userId", "==", user.uid),
            orderBy("date", "desc")
        );

        const querySnapshot = await getDocs(activitiesQuery);
        return querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
    } catch (error) {
        console.error("Error getting activities:", error);
        throw error;
    }
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
