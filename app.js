document.addEventListener("DOMContentLoaded", function () {
  // Initialize Firebase (using the compat libraries for easier integration)
  const firebaseConfig = {
    apiKey: "AIzaSyApCCYURyPlaHb_k_Z1EGdPifMFk7CBfg4",
    authDomain: "sapient-rune-446613-b3.firebaseapp.com",
    projectId: "sapient-rune-446613-b3",
    storageBucket: "sapient-rune-446613-b3.firebasestorage.app",
    messagingSenderId: "207818890436",
    appId: "1:207818890436:web:ea7b627f0191b8720fbd91",
    measurementId: "G-XX85S3LHNE"
  };

  // Initialize Firebase App
  firebase.initializeApp(firebaseConfig);
  // Initialize Firestore
  const db = firebase.firestore();

  // Grab all necessary elements
  const pinLocationBtn = document.getElementById("pin-location-btn");
  const locationInfo = document.getElementById("location-info");
  const orderBtn = document.getElementById("order-btn");
  const orderForm = document.getElementById("order-form");
  const orderLocation = document.getElementById("order-location");
  const confirmOrderBtn = document.getElementById("confirm-order");
  const timelineList = document.getElementById("section-4-timeline");

  let pinnedAddress = "";

  // Function to reverse geocode and update location info
  function reverseGeocode(latitude, longitude) {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`;
    fetch(url)
      .then(response => response.json())
      .then(data => {
        if (data.display_name) {
          pinnedAddress = data.display_name;
          locationInfo.innerText = `📍 ${pinnedAddress}`;
          orderLocation.innerText = pinnedAddress;
        } else {
          pinnedAddress = `Lat: ${latitude}, Lon: ${longitude}`;
          locationInfo.innerText = `📍 ${pinnedAddress}`;
          orderLocation.innerText = pinnedAddress;
        }
        // Enable the order button once a location is pinned
        orderBtn.disabled = false;
      })
      .catch(error => {
        console.error("Reverse geocoding failed:", error);
        locationInfo.innerText = "⚠️ Location not found.";
      });
  }

  // Pin location when button is clicked
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

  // When "Order via WhatsApp" is clicked, show the order form (if location is pinned)
  orderBtn.addEventListener("click", function () {
    if (!pinnedAddress) {
      alert("Please pin your location first.");
      return;
    }
    orderForm.style.display = "block";
    orderForm.scrollIntoView({ behavior: "smooth" });
  });

  // Function to save order data to Firestore
  async function saveOrder(orderData) {
    try {
      const docRef = await db.collection("orders").add(orderData);
      console.log("Order stored successfully with ID:", docRef.id);
    } catch (error) {
      console.error("Error adding order:", error);
    }
  }

 confirmOrderBtn.addEventListener("click", async function () {
  const name = document.getElementById("customer-name").value.trim();
  const phone = document.getElementById("customer-phone").value.trim();
  const quantity = document.getElementById("order-quantity").value.trim();
  
  if (!name || !phone || !quantity) {
    alert("Please enter your name, phone number, and quantity.");
    return;
  }
  
  // Prepare order data
  const orderData = {
    name: name,
    phone: phone,
    quantity: Number(quantity),
    pinnedAddress: pinnedAddress,
    orderTime: new Date().toISOString(),
    status: "Pending"
  };

  // Save order data to Firestore and wait for it to complete
  try {
    await saveOrder(orderData);
    console.log("Order saved successfully!");
  } catch (error) {
    console.error("Error saving order:", error);
  }
  
  // Prepare WhatsApp message and redirect after saving
  const message = `Hello, I want to order Chips Mwitu.\n\nName: ${name}\nPhone: ${phone}\nQuantity: ${quantity}\nLocation: ${pinnedAddress}\nOrder: ${quantity} pack(s) @ KES 150 each.`;
  const whatsappUrl = `https://wa.me/254712345678?text=${encodeURIComponent(message)}`;
  window.location.href = whatsappUrl;
});

  // Update the delivery timeline (unchanged)
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
