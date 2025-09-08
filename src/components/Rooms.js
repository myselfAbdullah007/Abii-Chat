import React, { useEffect, useMemo, useState } from 'react';
import firebase from 'firebase/app';
import 'firebase/firestore';
import 'firebase/auth';

function Rooms({ activeRoomId, onSelectRoom }) {
    const firestore = firebase.firestore();
    const auth = firebase.auth();

    const [rooms, setRooms] = useState([]);
    const [newRoomName, setNewRoomName] = useState('');
    const [inviteEmail, setInviteEmail] = useState('');
    const [creating, setCreating] = useState(false);
    const [inviting, setInviting] = useState(false);

    const user = auth.currentUser;

    useEffect(() => {
        if (!user) return;
        const unsub = firestore
            .collection('rooms')
            .where('memberUids', 'array-contains', user.uid)
            .orderBy('createdAt', 'desc')
            .onSnapshot((snap) => {
                const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
                setRooms(list);
            });
        return () => unsub && unsub();
    }, [firestore, user]);

    const handleCreateRoom = async (e) => {
        e.preventDefault();
        if (!user || !newRoomName.trim()) return;
        setCreating(true);
        try {
            const roomRef = await firestore.collection('rooms').add({
                name: newRoomName.trim(),
                ownerUid: user.uid,
                memberUids: [user.uid],
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            });
            setNewRoomName('');
            onSelectRoom && onSelectRoom(roomRef.id);
        } finally {
            setCreating(false);
        }
    };

    const handleInvite = async (e, roomId) => {
        e.preventDefault();
        if (!inviteEmail.trim()) return;
        setInviting(true);
        try {
            const usersSnap = await firestore
                .collection('users')
                .where('email', '==', inviteEmail.trim())
                .limit(1)
                .get();
            if (usersSnap.empty) {
                alert('No user found with that email.');
                return;
            }
            const invitee = usersSnap.docs[0].data();
            const roomRef = firestore.collection('rooms').doc(roomId);
            await roomRef.update({
                memberUids: firebase.firestore.FieldValue.arrayUnion(invitee.uid),
            });
            setInviteEmail('');
        } finally {
            setInviting(false);
        }
    };

    return (
        <aside className="rooms">
            <form onSubmit={handleCreateRoom} className="room-create-form">
                <input
                    value={newRoomName}
                    onChange={(e) => setNewRoomName(e.target.value)}
                    placeholder="New room name"
                />
                <button type="submit" disabled={!newRoomName.trim() || creating}>
                    {creating ? 'Creating…' : 'Create'}
                </button>
            </form>

            <ul className="room-list">
                {rooms.map((room) => (
                    <li key={room.id} className={room.id === activeRoomId ? 'active' : ''}>
                        <button onClick={() => onSelectRoom && onSelectRoom(room.id)}>
                            {room.name || 'Untitled room'}
                        </button>
                        <form onSubmit={(e) => handleInvite(e, room.id)} className="invite-form">
                            <input
                                value={inviteEmail}
                                onChange={(e) => setInviteEmail(e.target.value)}
                                placeholder="Invite by email"
                            />
                            <button type="submit" disabled={!inviteEmail.trim() || inviting}>Invite</button>
                        </form>
                    </li>
                ))}
            </ul>
        </aside>
    );
}

export default Rooms; 