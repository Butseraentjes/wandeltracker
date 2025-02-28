// imageLoader.js - Voeg dit toe aan je project

/**
 * Helper functie om afbeeldingen te laden en fallbacks te gebruiken indien nodig
 */
export function initializeImageLoader() {
    // Zoek alle afbeeldingen met data-src attribuut
    const lazyImages = document.querySelectorAll('img[data-src]');
    
    lazyImages.forEach(img => {
        const src = img.getAttribute('data-src');
        
        // Maak een nieuw Image object om te testen of de afbeelding geladen kan worden
        const testImage = new Image();
        
        // Wanneer de afbeelding succesvol laadt
        testImage.onload = function() {
            img.src = src;
            img.style.display = 'block';
            
            // Verberg de fallback placeholder
            const placeholder = img.parentElement.querySelector('.fallback-placeholder');
            if (placeholder) {
                placeholder.style.display = 'none';
            }
        };
        
        // Wanneer de afbeelding niet kan laden
        testImage.onerror = function() {
            console.warn(`Kon afbeelding niet laden: ${src}`);
            // De fallback placeholder blijft zichtbaar
            img.style.display = 'none';
        };
        
        // Start het laden van de afbeelding
        testImage.src = src;
    });
}

/**
 * Deze functie kan worden gebruikt om achtergrondafbeeldingen te laden
 */
export function loadBackgroundImage(element, imagePath, fallbackColor = '#1a365d') {
    const testImage = new Image();
    
    testImage.onload = function() {
        element.style.backgroundImage = `url(${imagePath})`;
    };
    
    testImage.onerror = function() {
        console.warn(`Kon achtergrondafbeelding niet laden: ${imagePath}`);
        element.style.backgroundColor = fallbackColor;
    };
    
    testImage.src = imagePath;
}
