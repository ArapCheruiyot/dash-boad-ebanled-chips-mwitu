document.addEventListener("DOMContentLoaded", function () {
  // Initialize Firebase (using the compat libraries)
  const firebaseConfig = {
    apiKey: "AIzaSyApCCYURyPlaHb_k_Z1EGdPifMFk7CBfg4",
    authDomain: "sapient-rune-446613-b3.firebaseapp.com",
    projectId: "sapient-rune-446613-b3",
    storageBucket: "sapient-rune-446613-b3.firebasestorage.app",
    messagingSenderId: "207818890436",
    appId: "1:207818890436:web:ea7b627f0191b8720fbd91",
    measurementId: "G-XX85S3LHNE"
  };

  firebase.initializeApp(firebaseConfig);
  const db = firebase.firestore();

  // Grab all necessary elements
  const pinLocationBtn = document.getElementById("pin-location-btn");
  const locationInfo = document.getElementById("location-info");
  const orderBtn = document.getElementById("order-btn");
  const orderForm = document.getElementById("order-form");
  const orderLocation = document.getElementById("order-location");
  const confirmOrderBtn = document.getElementById("confirm-order");
  const timelineList = document.getElementById("section-4-timeline");

  // Global variables to store location data
  let pinnedAddress = "";
  let pinnedCoordinates = null;

  // Function to reverse geocode, update UI, and save location data
  function reverseGeocode(latitude, longitude) {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`;
    fetch(url)
      .then(response => response.json())
      .then(data => {
        if (data.display_name) {
          pinnedAddress = data.display_name;
        } else {
          pinnedAddress = `Lat: ${latitude}, Lon: ${longitude}`;
        }
        // Save coordinates in a global variable
        pinnedCoordinates = {
          latitude: latitude,
          longitude: longitude
        };

        // Update the UI with the human-readable address
        locationInfo.innerText = `📍 ${pinnedAddress}`;
        orderLocation.innerText = pinnedAddress;

        // Enable the order button once location is pinned
        orderBtn.disabled = false;

        // Save the location data to Firestore in a collection called "locations"
        saveLocationData({
          address: pinnedAddress,
          coordinates: pinnedCoordinates,
          timestamp: new Date().toISOString()
        });
      })
      .catch(error => {
        console.error("Reverse geocoding failed:", error);
        locationInfo.innerText = "⚠️ Location not found.";
      });
  }

  // Function to save location data (even if no order is placed)
  async function saveLocationData(locationData) {
    try {
      const docRef = await db.collection("locations").add(locationData);
      console.log("Location data saved with ID:", docRef.id);
    } catch (error) {
      console.error("Error saving location data:", error);
    }
  }

  // Pin location when the "Pin My Location" button is clicked
  pinLocationBtn.addEventListener("click", function () {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        function (position) {
          const latitude = position.coords.latitude;
          const longitude = position.coords.longitude;
          reverseGeocode(latitude, longitude);
        },
        function () {
          locationInfo.innerText = "⚠️ Failed to get location. Try again.";
        }
      );
    } else {
      locationInfo.innerText = "⚠️ Geolocation is not supported by your browser.";
    }
  });

  // Show the order form when "Order via WhatsApp" is clicked
  orderBtn.addEventListener("click", function () {
    if (!pinnedAddress) {
      alert("Please pin your location first.");
      return;
    }
    orderForm.style.display = "block";
    orderForm.scrollIntoView({ behavior: "smooth" });
  });

  // Helper function to compute the next available delivery time
  function getNextDeliveryTime() {
    const currentTime = new Date();
    const totalMinutesNow = currentTime.getHours() * 60 + currentTime.getMinutes();
    const deliverySlots = [
      { time: "10:00 AM", minutes: 10 * 60 },
      { time: "10:45 AM", minutes: 10 * 60 + 45 },
      { time: "11:30 AM", minutes: 11 * 60 + 30 },
      { time: "12:15 PM", minutes: 12 * 60 + 15 },
      { time: "1:00 PM", minutes: 13 * 60 },
      { time: "1:45 PM", minutes: 13 * 60 + 45 },
      { time: "2:30 PM", minutes: 14 * 60 + 30 },
      { time: "3:15 PM", minutes: 15 * 60 + 15 },
      { time: "4:00 PM", minutes: 16 * 60 },
      { time: "4:45 PM", minutes: 16 * 60 + 45 },
      { time: "5:30 PM", minutes: 17 * 60 + 30 },
      { time: "6:15 PM", minutes: 18 * 60 + 15 },
      { time: "7:00 PM", minutes: 19 * 60 },
      { time: "7:45 PM", minutes: 19 * 60 + 45 },
      { time: "8:30 PM", minutes: 20 * 60 + 30 }
    ];
    for (const slot of deliverySlots) {
      if (slot.minutes > totalMinutesNow) {
        return slot.time;
      }
    }
    // If no future slot is found (e.g., after the last slot), return the first slot of the next day
    return deliverySlots[0].time;
  }

  // Function to save order data to Firestore
  async function saveOrder(orderData) {
    try {
      const docRef = await db.collection("orders").add(orderData);
      console.log("Order stored successfully with ID:", docRef.id);
    } catch (error) {
      console.error("Error adding order:", error);
    }
  }

  // When the "Confirm Order" button is clicked, capture and save order details
  confirmOrderBtn.addEventListener("click", async function () {
    const name = document.getElementById("customer-name").value.trim();
    const phone = document.getElementById("customer-phone").value.trim();
    const quantity = document.getElementById("order-quantity").value.trim();

    if (!name || !phone || !quantity) {
      alert("Please enter your name, phone number, and quantity.");
      return;
    }

    // Get the next delivery time from the timeline
    const nextDeliveryTime = getNextDeliveryTime();

    // Prepare the order data with all desired fields
    const orderData = {
      name: name,
      phone: phone,
      quantity: Number(quantity),
      pinnedAddress: pinnedAddress,
      coordinates: pinnedCoordinates,      // New: Location coordinates
      orderTime: new Date().toISOString(),
      status: "Pending",
      nextDeliveryTime: nextDeliveryTime     // New: Next available delivery time
    };

    // Save the order data to Firestore
    try {
      await saveOrder(orderData);
      console.log("Order saved successfully!");
    } catch (error) {
      console.error("Error saving order:", error);
    }

    // Prepare a WhatsApp message with the order details and redirect the customer
    const message = `Hello, I want to order Chips Mwitu.\n\nName: ${name}\nPhone: ${phone}\nQuantity: ${quantity}\nLocation: ${pinnedAddress}\nOrder: ${quantity} pack(s) @ KES 150 each.\nNext Delivery Time: ${nextDeliveryTime}`;
    const whatsappUrl = `https://wa.me/254712345678?text=${encodeURIComponent(message)}`;
    window.location.href = whatsappUrl;
  });

  // Update the delivery timeline (this part remains unchanged)
  function updateDeliveryTimeline() {
    if (!timelineList) {
      console.error("❌ Error: Element 'section-4-timeline' not found.");
      return;
    }
    timelineList.innerHTML = "";
    const currentTime = new Date();
    const totalMinutesNow = currentTime.getHours() * 60 + currentTime.getMinutes();
    const deliverySlots = [
      { time: "10:00 AM", minutes: 10 * 60 },
      { time: "10:45 AM", minutes: 10 * 60 + 45 },
      { time: "11:30 AM", minutes: 11 * 60 + 30 },
      { time: "12:15 PM", minutes: 12 * 60 + 15 },
      { time: "1:00 PM", minutes: 13 * 60 },
      { time: "1:45 PM", minutes: 13 * 60 + 45 },
      { time: "2:30 PM", minutes: 14 * 60 + 30 },
      { time: "3:15 PM", minutes: 15 * 60 + 15 },
      { time: "4:00 PM", minutes: 16 * 60 },
      { time: "4:45 PM", minutes: 16 * 60 + 45 },
      { time: "5:30 PM", minutes: 17 * 60 + 30 },
      { time: "6:15 PM", minutes: 18 * 60 + 15 },
      { time: "7:00 PM", minutes: 19 * 60 },
      { time: "7:45 PM", minutes: 19 * 60 + 45 },
      { time: "8:30 PM", minutes: 20 * 60 + 30 }
    ];
    deliverySlots.forEach(slot => {
      const slotItem = document.createElement("li");
      const timeBox = document.createElement("div");
      timeBox.classList.add("timeline-box");
      timeBox.textContent = slot.time;
      slotItem.appendChild(timeBox);
      if (totalMinutesNow >= slot.minutes) {
        slotItem.style.backgroundColor = "#ccc";
        slotItem.style.color = "#333";
      } else {
        slotItem.style.backgroundColor = "#dcedc8";
        slotItem.style.color = "#333";
        if (slot.minutes - totalMinutesNow <= 45) {
          slotItem.classList.add("blinking");
          timeBox.innerHTML += "<br><span style='font-size: 12px;'>Order Now!</span>";
          slotItem.style.backgroundColor = "#ff4500";
          slotItem.style.color = "#fff";
        }
      }
      timelineList.appendChild(slotItem);
    });
    console.log("✅ Delivery timeline updated.");
  }

  updateDeliveryTimeline();
  setInterval(updateDeliveryTimeline, 60000);
});
