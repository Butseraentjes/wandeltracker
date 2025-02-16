// js/app.js

import { AuthUI } from './components/auth-ui.js';
import { ProjectForm } from './components/project-form.js';

// Initialize components
document.addEventListener('DOMContentLoaded', () => {
    // Initialize authentication UI
    const authUI = new AuthUI();
    
    // Initialize project form
    const projectForm = new ProjectForm('new-project-form', 'new-project-modal');
});
