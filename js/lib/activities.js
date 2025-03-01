// activities.js - Beheer activiteiten voor de tijdlijn
import { db, auth } from './firebase.js';

// Activiteit aanmaken
export async function createActivity(activityData) {
    try {
        const user = auth.currentUser;
        if (!user) throw new Error("Gebruiker niet ingelogd");

        // Haal gebruikersgegevens op
        const userDoc = await db.collection("users").doc(user.uid).get();
        const userData = userDoc.data() || {};
        
        const activitiesRef = db.collection("activities");
        const newActivityRef = activitiesRef.doc();

        // Standaardwaarden voor de activiteit
        const defaultActivity = {
            userId: user.uid,
            userName: userData.displayName || userData.firstName || user.email.split('@')[0],
            userPhotoUrl: userData.profileImageBase64 || null,
            type: 'post',
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            likes: 0,
            comments: []
        };

        await newActivityRef.set({
            ...defaultActivity,
            ...activityData
        });

        return newActivityRef.id;
    } catch (error) {
        console.error("Error creating activity:", error);
        throw error;
    }
}

// Abonneren op activiteiten
export function subscribeToActivities(callback, limit = 20) {
    console.log('Setting up activities subscription...');
    const user = auth.currentUser;
    if (!user) return null;

    // Eerst alleen eigen activiteiten weergeven
    // Later aanpassen voor vrienden
    return db.collection("activities")
        .where("userId", "==", user.uid)
        .orderBy("createdAt", "desc")
        .limit(limit)
        .onSnapshot(
            (snapshot) => {
                const activities = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                callback(activities);
            },
            (error) => {
                console.error('Error in subscribeToActivities:', error);
                callback([]);
            }
        );
}

// Activiteit leuk vinden
export async function likeActivity(activityId) {
    try {
        const user = auth.currentUser;
        if (!user) throw new Error("Gebruiker niet ingelogd");

        const activityRef = db.collection("activities").doc(activityId);
        const likesRef = activityRef.collection("likes").doc(user.uid);
        
        const likeDoc = await likesRef.get();
        
        if (likeDoc.exists) {
            // Ongedaan maken indien al leuk gevonden
            await likesRef.delete();
            await activityRef.update({
                likes: firebase.firestore.FieldValue.increment(-1)
            });
            return false; // Niet meer leuk
        } else {
            // Markeer als leuk
            await likesRef.set({
                userId: user.uid,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            await activityRef.update({
                likes: firebase.firestore.FieldValue.increment(1)
            });
            return true; // Nu leuk
        }
    } catch (error) {
        console.error("Error liking activity:", error);
        throw error;
    }
}

// Automatisch activiteiten genereren voor wandelingen
export async function createWalkActivity(walkData, projectData) {
    try {
        const user = auth.currentUser;
        if (!user) return;
        
        // Genereer een bericht op basis van de wandelgegevens
        const distance = parseFloat(walkData.distance).toFixed(1);
        const content = `Ik heb vandaag ${distance} km gewandeld voor mijn project "${projectData.name}"!`;
        
        await createActivity({
            content,
            type: 'walk',
            walkId: walkData.id,
            walkDistance: walkData.distance,
            projectId: projectData.id,
            projectName: projectData.name
        });
        
        console.log("Walk activity created successfully");
    } catch (error) {
        console.error("Error creating walk activity:", error);
    }
}

// Automatisch activiteiten genereren voor nieuwe projecten
export async function createProjectActivity(projectData) {
    try {
        const user = auth.currentUser;
        if (!user) return;
        
        const content = `Ik ben een nieuw wandelproject gestart: "${projectData.name}"!`;
        
        await createActivity({
            content,
            type: 'project',
            projectId: projectData.id,
            projectName: projectData.name
        });
        
        console.log("Project activity created successfully");
    } catch (error) {
        console.error("Error creating project activity:", error);
    }
}
