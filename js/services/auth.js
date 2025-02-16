// js/services/auth.js

import { 
    GoogleAuthProvider, 
    signInWithPopup, 
    signInWithRedirect, 
    signOut 
} from "firebase/auth";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../config/firebase-config.js";

class AuthService {
    constructor() {
        this.provider = new GoogleAuthProvider();
    }

    async loginWithGoogle() {
        try {
            const result = await signInWithPopup(auth, this.provider);
            await this._createOrUpdateUserProfile(result.user);
            return result.user;
        } catch (error) {
            if (error.code === "auth/popup-blocked" || 
                error.code === "auth/unauthorized-domain") {
                try {
                    return await signInWithRedirect(auth, this.provider);
                } catch (redirectError) {
                    throw new Error("Fout bij redirect login: " + redirectError.message);
                }
            }
            throw new Error("Fout bij inloggen: " + error.message);
        }
    }

    async logout() {
        try {
            await signOut(auth);
        } catch (error) {
            throw new Error("Fout bij uitloggen: " + error.message);
        }
    }

    async _createOrUpdateUserProfile(user) {
        const userRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userRef);

        if (!userDoc.exists()) {
            await setDoc(userRef, {
                email: user.email,
                displayName: user.displayName,
                history: {},
                createdAt: serverTimestamp()
            });
        } else {
            await setDoc(userRef, {
                lastLogin: serverTimestamp()
            }, { merge: true });
        }
    }

    onAuthStateChanged(callback) {
        return auth.onAuthStateChanged(callback);
    }

    getCurrentUser() {
        return auth.currentUser;
    }
}

export const authService = new AuthService();
