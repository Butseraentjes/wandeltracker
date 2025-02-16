// js/services/auth.js

import { 
    GoogleAuthProvider, 
    signInWithPopup, 
    signInWithRedirect, 
    signOut, 
    onAuthStateChanged 
} from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
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
            console.error("Login error:", error);
            if (error.code === "auth/popup-blocked") {
                try {
                    return await signInWithRedirect(auth, this.provider);
                } catch (redirectError) {
                    console.error("Redirect error:", redirectError);
                    throw new Error("Fout bij inloggen via redirect");
                }
            }
            throw error;
        }
    }

    async logout() {
        try {
            await signOut(auth);
        } catch (error) {
            console.error("Logout error:", error);
            throw new Error("Fout bij uitloggen");
        }
    }

    async _createOrUpdateUserProfile(user) {
        const userRef = doc(db, "users", user.uid);
        try {
            await setDoc(userRef, {
                email: user.email,
                displayName: user.displayName,
                lastLogin: serverTimestamp()
            }, { merge: true });
        } catch (error) {
            console.error("Error updating user profile:", error);
        }
    }

    onAuthStateChanged(callback) {
        return onAuthStateChanged(auth, callback);
    }
}

export const authService = new AuthService();
