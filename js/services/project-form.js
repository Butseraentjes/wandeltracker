// js/components/project-form.js

import { geocodingService } from '../services/geocoding.js';
import { createProject } from '../services/projects.js';
import { validateAddress } from '../utils/validation.js';

export class ProjectForm {
    constructor(formId, modalId) {
        this.form = document.getElementById(formId);
        this.modal = document.getElementById(modalId);
        this.initializeForm();
    }

    initializeForm() {
        this.form.addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.handleSubmit(e);
        });

        // Input validatie tijdens typen
        const addressFields = ['street', 'house-number', 'postal-code', 'city'];
        addressFields.forEach(field => {
            const input = document.getElementById(field);
            input.addEventListener('input', () => {
                this.validateField(input);
            });
        });
    }

    async handleSubmit(event) {
        try {
            const formData = this.getFormData();
            
            // Valideer alle velden
            if (!this.validateAllFields(formData)) {
                throw new Error('Niet alle velden zijn correct ingevuld');
            }

            // Haal coördinaten op
            const coordinates = await geocodingService.getCoordinates(formData.address);

            // Maak project aan
            await createProject({
                name: formData.projectName,
                description: formData.description,
                startLocation: {
                    ...formData.address,
                    ...coordinates
                }
            });

            this.closeModal();
            this.showSuccess('Project succesvol aangemaakt!');

        } catch (error) {
            this.showError(error.message);
        }
    }

    getFormData() {
        return {
            projectName: document.getElementById('project-name').value,
            description: document.getElementById('project-description').value,
            address: {
                street: document.getElementById('street').value,
                houseNumber: document.getElementById('house-number').value,
                postalCode: document.getElementById('postal-code').value,
                city: document.getElementById('city').value,
                country: document.getElementById('country').value
            }
        };
    }

    validateField(input) {
        const value = input.value.trim();
        const isValid = validateAddress[input.id](value);
        
        input.classList.toggle('is-invalid', !isValid);
        input.classList.toggle('is-valid', isValid);
        
        return isValid;
    }

    validateAllFields(formData) {
        let isValid = true;
        
        // Valideer project naam
        if (!formData.projectName) {
            isValid = false;
            this.showFieldError('project-name', 'Projectnaam is verplicht');
        }

        // Valideer adresvelden
        Object.entries(formData.address).forEach(([field, value]) => {
            if (!validateAddress[field](value)) {
                isValid = false;
                this.showFieldError(field, `Ongeldig ${field}`);
            }
        });

        return isValid;
    }

    showFieldError(fieldId, message) {
        const field = document.getElementById(fieldId);
        field.classList.add('is-invalid');
        
        const errorDiv = document.createElement('div');
        errorDiv.className = 'invalid-feedback';
        errorDiv.textContent = message;
        
        field.parentNode.appendChild(errorDiv);
    }

    showError(message) {
        // Implementeer foutmelding UI
        alert(message); // Vervang dit later door een betere UI
    }

    showSuccess(message) {
        // Implementeer succes melding UI
        alert(message); // Vervang dit later door een betere UI
    }

    closeModal() {
        this.form.reset();
        this.modal.style.display = 'none';
    }
}
