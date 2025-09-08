import React, { useEffect, useState, useRef } from 'react';
import firebase from 'firebase/app';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faBell } from '@fortawesome/free-solid-svg-icons';

function NotificationSystem({ user, activeRoomId, activeSection }) {
    const firestore = firebase.firestore();
    const [notifications, setNotifications] = useState([]);
    const [hasPermission, setHasPermission] = useState(false);
    const lastMessageIds = useRef(new Set());

    useEffect(() => {
        // Request notification permission
        if ('Notification' in window) {
            if (Notification.permission === 'granted') {
                setHasPermission(true);
            } else if (Notification.permission !== 'denied') {
                Notification.requestPermission().then(permission => {
                    setHasPermission(permission === 'granted');
                });
            }
        }
    }, []);

    useEffect(() => {
        if (!user) return;

        const unsubscribes = [];

        // Listen to general chat messages
        const generalUnsub = firestore
            .collection('general-messages')
            .orderBy('createdAt', 'desc')
            .limit(1)
            .onSnapshot((snap) => {
                snap.docChanges().forEach((change) => {
                    if (change.type === 'added') {
                        const message = { id: change.doc.id, ...change.doc.data() };
                        if (message.uid !== user.uid && 
                            !lastMessageIds.current.has(message.id) &&
                            activeSection !== 'general') {
                            showNotification(message, 'General Chat');
                            lastMessageIds.current.add(message.id);
                        }
                    }
                });
            });
        unsubscribes.push(generalUnsub);

        // Listen to room messages
        const roomsUnsub = firestore
            .collection('rooms')
            .where('memberUids', 'array-contains', user.uid)
            .onSnapshot((roomsSnap) => {
                roomsSnap.docs.forEach((roomDoc) => {
                    const roomData = roomDoc.data();
                    const messagesUnsub = firestore
                        .collection('rooms')
                        .doc(roomDoc.id)
                        .collection('messages')
                        .orderBy('createdAt', 'desc')
                        .limit(1)
                        .onSnapshot((msgSnap) => {
                            msgSnap.docChanges().forEach((change) => {
                                if (change.type === 'added') {
                                    const message = { id: change.doc.id, ...change.doc.data() };
                                    if (message.uid !== user.uid && 
                                        !lastMessageIds.current.has(message.id) &&
                                        (activeSection !== 'rooms' || activeRoomId !== roomDoc.id)) {
                                        showNotification(message, roomData.name || 'Room');
                                        lastMessageIds.current.add(message.id);
                                    }
                                }
                            });
                        });
                    unsubscribes.push(messagesUnsub);
                });
            });
        unsubscribes.push(roomsUnsub);

        return () => {
            unsubscribes.forEach(unsub => unsub && unsub());
        };
    }, [user, firestore, activeRoomId, activeSection]);

    const showNotification = (message, roomName) => {
        const notification = {
            id: Date.now(),
            message,
            roomName,
            timestamp: new Date()
        };

        // Add to toast notifications
        setNotifications(prev => [...prev, notification]);

        // Show browser notification if permitted and window not focused
        if (hasPermission && document.hidden) {
            const browserNotification = new Notification(`New message in ${roomName}`, {
                body: `${message.displayName || 'Someone'}: ${message.text}`,
                icon: message.photoURL || '/favicon.ico',
                tag: `message-${message.id}`
            });

            browserNotification.onclick = () => {
                window.focus();
                browserNotification.close();
            };

            setTimeout(() => browserNotification.close(), 5000);
        }

        // Auto-remove toast after 5 seconds
        setTimeout(() => {
            setNotifications(prev => prev.filter(n => n.id !== notification.id));
        }, 5000);
    };

    const removeNotification = (id) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    };

    const requestPermission = async () => {
        if ('Notification' in window && Notification.permission !== 'granted') {
            const permission = await Notification.requestPermission();
            setHasPermission(permission === 'granted');
        }
    };

    return (
        <>
            {/* Notification Permission Button */}
            {!hasPermission && 'Notification' in window && (
                <button className="notification-permission-btn" onClick={requestPermission}>
                    <FontAwesomeIcon icon={faBell} />
                    Enable Notifications
                </button>
            )}

            {/* Toast Notifications */}
            <div className="notification-container">
                {notifications.map((notification) => (
                    <div key={notification.id} className="toast-notification">
                        <div className="notification-header">
                            <strong>{notification.roomName}</strong>
                            <button onClick={() => removeNotification(notification.id)}>
                                <FontAwesomeIcon icon={faTimes} />
                            </button>
                        </div>
                        <div className="notification-body">
                            <img 
                                src={notification.message.photoURL || '/default-avatar.png'} 
                                alt="Avatar" 
                                className="notification-avatar"
                            />
                            <div>
                                <div className="notification-sender">
                                    {notification.message.displayName || 'Someone'}
                                </div>
                                <div className="notification-text">
                                    {notification.message.text}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </>
    );
}

export default NotificationSystem; 