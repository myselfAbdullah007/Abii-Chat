import React, { useEffect, useRef, useState } from 'react';
import firebase from 'firebase/app';
import { useCollectionData } from 'react-firebase-hooks/firestore';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPaperPlane } from '@fortawesome/free-solid-svg-icons';
import ChatMessage from './ChatMessage';

function GeneralChat({ onAvatarClick }) {
    const auth = firebase.auth();
    const firestore = firebase.firestore();

    const dummy = useRef();
    const messagesRef = firestore.collection('general-messages');
    const query = messagesRef.orderBy('createdAt');
    const [messages] = useCollectionData(query, { idField: 'id' });
    const [formValue, setFormValue] = useState('');

    const scrollToBottom = () => {
        dummy.current?.scrollIntoView({ behavior: "smooth" });
    };

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
                    return <ChatMessage key={msg.id} message={msg} neighbour={{ prev, next }} onAvatarClick={onAvatarClick} />;
                })}
                <span ref={dummy}></span>
            </main>

            <form onSubmit={sendMessage} className="message-form">
                <input 
                    value={formValue} 
                    onChange={(e) => setFormValue(e.target.value)} 
                    placeholder="Type a message in general chat..." 
                />
                <button className="chat-message-button" type="submit" disabled={!formValue.trim()}>
                    <FontAwesomeIcon icon={faPaperPlane} />
                </button>
            </form>
        </div>
    );
}

export default GeneralChat; 