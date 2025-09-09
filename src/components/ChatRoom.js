import React, { useEffect, useRef, useState } from 'react';

//Import Firbase component
import firebase from 'firebase/app';

//Import FirebaseAuth component
import { useCollectionData } from 'react-firebase-hooks/firestore';

// Import FontAwesomeIcon component
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPaperPlane } from '@fortawesome/free-solid-svg-icons';

// Importing Component
import ChatMessage from './ChatMessage';

function ChatRoom({ roomId }) {
    const auth = firebase.auth();
    const firestore = firebase.firestore();

    const dummy = useRef();
    const roomRef = firestore.collection('rooms').doc(roomId);
    const messagesRef = roomRef.collection('messages');
    const query = messagesRef.orderBy('createdAt');
    const [messages] = useCollectionData(query, { idField: 'id' });
    const [formValue, setFormValue] = useState('');

    const scrollToBottom = () => {
        dummy.current?.scrollIntoView({ behavior: "smooth" });
    };

    const inputRef = useRef();

    useEffect(() => {
        inputRef.current.focus();
    }, []);

    useEffect(() => {
        scrollToBottom();
    });

    const sendMessage = async (e) => {
        e.preventDefault();
        if (!formValue.trim()) return;

        const { uid, photoURL, displayName } = auth.currentUser;

        await messagesRef.add({
            text: formValue.trim(),
            createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            uid,
            photoURL,
            displayName
        });

        setFormValue('');
        scrollToBottom();
    };

    return (
        <div className="chat-container-clean">
            <main className="chat-messages-full">
                {messages && messages.map((msg, index, pool) => {
                    const prev = pool[index - 1];
                    const next = pool[index + 1];
                    return <ChatMessage key={msg.id} message={msg} neighbour={{ prev, next }} />;
                })}
                <span ref={dummy}></span>
            </main>

            <form onSubmit={sendMessage} className="message-form">
                <input 
                    ref={inputRef}
                    autoFocus
                    value={formValue} 
                    onChange={(e) => setFormValue(e.target.value)} 
                    placeholder="Type a message in this room..." 
                />
                <button className="chat-message-button" type="submit" disabled={!formValue.trim()}>
                    <FontAwesomeIcon icon={faPaperPlane} />
                </button>
            </form>
        </div>
    );
}

export default ChatRoom;
