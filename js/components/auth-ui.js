// js/components/auth-ui.js

import { authService } from "../services/auth.js";

export class AuthUI {
    constructor() {
        this.loginContainer = document.getElementById("login-container");
        this.mainContent = document.getElementById("main-content");
        this.userInfo = document.getElementById("user-info");
        this.loginButton = document.getElementById("google-login-btn");
        this.logoutButton = document.getElementById("logout-btn");

        this.initializeListeners();
        this.initializeAuthStateObserver();
    }

    initializeListeners() {
        if (this.loginButton) {
            this.loginButton.addEventListener("click", async () => {
                try {
                    await authService.loginWithGoogle();
                } catch (error) {
                    this.showError(error.message);
                }
            });
        }

        if (this.logoutButton) {
            this.logoutButton.addEventListener("click", async () => {
                try {
                    await authService.logout();
                } catch (error) {
                    this.showError(error.message);
                }
            });
        }
    }

    initializeAuthStateObserver() {
        authService.onAuthStateChanged((user) => {
            if (user) {
                this.updateUIForLoggedInUser(user);
            } else {
                this.updateUIForLoggedOutUser();
            }
        });
    }

    updateUIForLoggedInUser(user) {
        if (this.loginContainer && this.mainContent && this.userInfo) {
            this.loginContainer.style.display = "none";
            this.mainContent.style.display = "block";
            this.userInfo.innerText = "Ingelogd als: " + user.displayName;
        }
    }

    updateUIForLoggedOutUser() {
        if (this.loginContainer && this.mainContent) {
            this.loginContainer.style.display = "block";
            this.mainContent.style.display = "none";
            if (this.userInfo) {
                this.userInfo.innerText = "";
            }
        }
    }

    showError(message) {
        // Implementeer een betere foutmelding UI
        alert(message);
    }
}
