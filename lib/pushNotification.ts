export async function registerServiceWorker() {
  if ("serviceWorker" in navigator) {
    try {
      const registration = await navigator.serviceWorker.register("/sw.js");
      return registration;
    } catch (error) {
      console.error("Service worker registration failed:", error);
      return null;
    }
  }
  return null;
}

export async function subscribeToPushNotifications(
  registration: ServiceWorkerRegistration,
  username: string
) {
  try {
    // Get the VAPID public key
    const response = await fetch("/api/push/subscribe", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username }), // Send username to get public key
    });

    if (!response.ok) {
      throw new Error("Failed to get public key");
    }

    const data = await response.json();
    const publicKey = data.publicKey;

    // Subscribe to push notifications
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: publicKey,
    });

    console.log("Push subscription:", subscription);

    // Save the subscription to the backend with username
    const saveResponse = await fetch("/api/push/subscribe", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        subscription,
        username,
      }),
    });

    if (!saveResponse.ok) {
      const error = await saveResponse.json();
      throw new Error(error.message || "Failed to save subscription");
    }

    return subscription;
  } catch (error) {
    console.error("Error subscribing to push notifications:", error);
    return null;
  }
}

export async function sendPushNotification(
  recipientUsername: string,
  message: string,
  senderUsername: string
) {
  try {
    await fetch("/api/push/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        recipientUsername,
        message,
        senderUsername,
      }),
    });
    return true;
  } catch (error) {
    console.error("Error sending push notification:", error);
    return false;
  }
}
