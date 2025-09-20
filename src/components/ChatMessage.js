import React from 'react';

//Import Firbase component
import firebase from 'firebase/app';

function ChatMessage(props) {
    const auth = firebase.auth();
    const { text, uid, photoURL, displayName } = props.message;
    const { next, prev } = props.neighbour;
    const { onAvatarClick } = props;
    
    // Show name if it's a new sender or first message
    const showName = !prev || prev.uid !== uid;
    // Omit profile picture if the previously sent message was sent by the same user
    const withAvatar = !prev ? `` : prev.uid === uid ? `hidden` : ``;
    const addDistance = !next ? `` : next.uid !== uid ? `next` : ``;
    const messageClass = uid === auth.currentUser.uid ? 'sent' : 'received';

    const handleAvatarClick = () => {
        if (uid !== auth.currentUser.uid && onAvatarClick) {
            onAvatarClick(uid);
        }
    };

    return (
        <>
            {showName && messageClass === 'received' && (
                <div className="sender-name">
                    {displayName || 'Unknown User'}
                </div>
            )}
            <div className={`message ${messageClass} ${addDistance}`}>
                <img 
                    src={photoURL || '/default-avatar.png'} 
                    className={`${withAvatar} ${uid !== auth.currentUser.uid ? 'clickable-avatar' : ''}`}
                    alt="Profile Pic" 
                    onClick={handleAvatarClick}
                    style={{ cursor: uid !== auth.currentUser.uid ? 'pointer' : 'default' }}
                />
                <p>{text}</p>
            </div>
        </>
    );
}

export default ChatMessage;
