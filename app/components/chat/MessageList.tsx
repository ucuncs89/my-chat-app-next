import { RefObject, useEffect, useState } from "react";
import { Message } from "@/app/types";
import { registerServiceWorker, subscribeToPushNotifications } from "@/lib/pushNotification";

interface MessageListProps {
    messages: Message[];
    currentUser: string;
    messagesEndRef: RefObject<HTMLDivElement | null>;
}

export default function MessageList({ messages, currentUser, messagesEndRef }: MessageListProps) {
    const [subscription, setSubscription] = useState<PushSubscription | null>(null);
    const [notificationPermission, setNotificationPermission] = useState<string>('default');
    const [swRegistration, setSwRegistration] = useState<ServiceWorkerRegistration | null>(null);

    const requestNotificationPermission = async () => {
        if (!('Notification' in window)) {
            alert('Browser ini tidak mendukung notifikasi');
            return;
        }

        try {
            const permission = await Notification.requestPermission();
            setNotificationPermission(permission);
            
            if (permission === 'granted') {
                const registration = await registerServiceWorker();
                if (registration) {
                    setSwRegistration(registration);
                    const pushSubscription = await subscribeToPushNotifications(registration, currentUser);
                    setSubscription(pushSubscription);
                }
            }
        } catch (error) {
            console.error('Error requesting notification permission:', error);
        }
    };

    useEffect(() => {
        // Check initial permission status and set up service worker
        if ('Notification' in window) {
            setNotificationPermission(Notification.permission);
            if (Notification.permission === 'granted') {
                registerServiceWorker().then(registration => {
                    if (registration) {
                        setSwRegistration(registration);
                        subscribeToPushNotifications(registration, currentUser)
                            .then(setSubscription);
                    }
                });
            }
        }
    }, [currentUser]);

    useEffect(() => {
        // Listen for new messages and show notification if window is not focused
        const lastMessage = messages[messages.length - 1];
        if (lastMessage && lastMessage.from !== currentUser && document.visibilityState === 'hidden') {
            if (swRegistration && Notification.permission === 'granted') {
                swRegistration.showNotification('New Message', {
                    body: `${lastMessage.from}: ${lastMessage.message}`,
                    icon: '/vercel.svg',
                    badge: '/vercel.svg',
                    tag: 'chat-message', // Group notifications
                    data: {
                        url: '/chat',
                        messageId: lastMessage.id
                    }
                });
            }
        }
    }, [messages, currentUser, swRegistration]);

    return (
        <div className="flex-1 p-4 overflow-y-auto relative">
            <div className="space-y-4">
                {messages.map((msg, index) => (
                    <div key={msg.id ?? index} className={`mb-4 flex ${msg.from === currentUser ? "justify-end" : "justify-start"}`}>
                        <div className={`p-3 rounded-lg max-w-[80%] sm:max-w-[70%] ${msg.from === currentUser ? "bg-indigo-600 text-white" : "bg-gray-200"}`}>
                            <div className="font-semibold">{msg.from}</div>
                            <div className="break-words">{msg.message}</div>
                            {msg.created_at && <div className="text-xs opacity-75 mt-1">{new Date(msg.created_at).toLocaleTimeString()}</div>}
                        </div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>
            
            {notificationPermission === 'default' && (
                <div className="fixed bottom-20 left-0 right-0 flex justify-center z-50">
                    <button
                        onClick={requestNotificationPermission}
                        className="bg-indigo-600 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-indigo-700 transition-colors"
                    >
                        Aktifkan Notifikasi Chat
                    </button>
                </div>
            )}
        </div>
    );
}
