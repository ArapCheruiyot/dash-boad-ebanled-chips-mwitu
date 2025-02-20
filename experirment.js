// Import required functions from Firebase SDK
import { initializeApp } from "firebase/app";
import { getFirestore, collection, addDoc } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyATOdbF-M6uWxwu4KjUXWJ9clomW-VPFMQ",
  authDomain: "nth-weft-446512-g5.firebaseapp.com",
  projectId: "nth-weft-446512-g5",
  storageBucket: "nth-weft-446512-g5.firebasestorage.app",
  messagingSenderId: "534160681000",
  appId: "1:534160681000:web:7b20e51d700df2fc90ad1d",
  measurementId: "G-NMBJ57GD08"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);

// Wait for the DOM to be fully loaded (module scripts are deferred by default)
document.addEventListener("DOMContentLoaded", () => {
  // Get the "Pin My Location" button element
  const pinLocationBtn = document.getElementById("pin-location-btn");

  // Listen for click events on the button
  pinLocationBtn.addEventListener("click", () => {
    // Check if the browser supports geolocation
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(async (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;

        // Use a reverse geocoding service (e.g., OpenStreetMap's Nominatim) to get a human-readable address
        const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`;
        try {
          const response = await fetch(url);
          const data = await response.json();
          const address = data.display_name || `Lat: ${lat}, Lon: ${lon}`;

          // Log the retrieved address to the console
          console.log("Pinned Address:", address);

          // Save the location data to Firestore in a collection called "pinnedLocations"
          const docRef = await addDoc(collection(db, "pinnedLocations"), {
            address: address,
            latitude: lat,
            longitude: lon,
            timestamp: new Date().toISOString()
          });

          console.log("Location saved with ID:", docRef.id);
        } catch (error) {
          console.error("Error fetching reverse geocode data or saving location:", error);
        }
      }, (error) => {
        console.error("Error obtaining geolocation:", error);
      });
    } else {
      console.error("Geolocation is not supported by this browser.");
    }
  });
});
