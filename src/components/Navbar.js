import React, { useState, useEffect } from 'react';
import firebase from 'firebase/app';
import 'firebase/firestore';
import 'firebase/auth';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faTimes, faUsers, faGlobe, faSignInAlt, faPlusCircle, faUser } from '@fortawesome/free-solid-svg-icons';

function Navbar({ activeSection, onSectionChange, activeRoomId, onSelectRoom, isMobileMenuOpen, isCollapsed }) {
    const firestore = firebase.firestore();
    const auth = firebase.auth();
    const user = auth.currentUser;



    const [rooms, setRooms] = useState([]);
    const [showJoinModal, setShowJoinModal] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [joinCode, setJoinCode] = useState('');
    const [newRoomName, setNewRoomName] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!user) return;
        
        console.log('Setting up rooms listener for user:', user.uid);
        
        const unsub = firestore
            .collection('rooms')
            .where('memberUids', 'array-contains', user.uid)
            .onSnapshot((snap) => {
                console.log('Rooms snapshot received, docs:', snap.docs.length);
                const list = snap.docs.map((d) => {
                    const data = d.data();
                    console.log('Room data:', data);
                    return { id: d.id, ...data };
                });
                // Sort on client side instead of server
                list.sort((a, b) => {
                    if (a.createdAt && b.createdAt) {
                        return b.createdAt.toDate() - a.createdAt.toDate();
                    }
                    return 0;
                });
                console.log('Final rooms list:', list);
                setRooms(list);
            }, (error) => {
                console.error('Error fetching rooms:', error);
            });
        return () => unsub && unsub();
    }, [firestore, user]);

    const generateRoomCode = () => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let result = '';
        for (let i = 0; i < 5; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    };

    const handleJoinRoom = async (e) => {
        e.preventDefault();
        if (!joinCode.trim() || loading) return;
        setLoading(true);
        try {
            const roomSnap = await firestore
                .collection('rooms')
                .where('code', '==', joinCode.trim().toUpperCase())
                .limit(1)
                .get();
            
            if (roomSnap.empty) {
                alert('Room not found. Please check the code.');
                return;
            }
            
            const roomData = roomSnap.docs[0].data();
            const roomRef = firestore.collection('rooms').doc(roomSnap.docs[0].id);
            
            if (!roomData.memberUids.includes(user.uid)) {
                await roomRef.update({
                    memberUids: firebase.firestore.FieldValue.arrayUnion(user.uid),
                });
            }
            
            onSelectRoom && onSelectRoom(roomSnap.docs[0].id);
            onSectionChange && onSectionChange('rooms');
            setJoinCode('');
            setShowJoinModal(false);
        } catch (error) {
            console.error('Error joining room:', error);
            alert('Error joining room. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateRoom = async (e) => {
        e.preventDefault();
        if (!newRoomName.trim() || loading) return;
        setLoading(true);
        try {
            let code;
            let codeExists = true;
            
            // Generate unique code
            while (codeExists) {
                code = generateRoomCode();
                const existingRoom = await firestore
                    .collection('rooms')
                    .where('code', '==', code)
                    .limit(1)
                    .get();
                codeExists = !existingRoom.empty;
            }

            const roomRef = await firestore.collection('rooms').add({
                name: newRoomName.trim(),
                code: code,
                ownerUid: user.uid,
                memberUids: [user.uid],
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
            });
            
            setNewRoomName('');
            setShowCreateModal(false);
            onSelectRoom && onSelectRoom(roomRef.id);
            onSectionChange && onSectionChange('rooms');
        } catch (error) {
            console.error('Error creating room:', error);
            alert('Error creating room. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <nav className={`navbar ${isMobileMenuOpen ? 'mobile-open' : ''} ${isCollapsed ? 'collapsed' : ''}`}>
            <div className="nav-section">
                <button 
                    className={`nav-item ${activeSection === 'general' ? 'active' : ''}`}
                    onClick={() => {
                        onSectionChange && onSectionChange('general');
                        onSelectRoom && onSelectRoom(null);
                    }}
                >
                    <FontAwesomeIcon icon={faGlobe} />
                    General Chat
                </button>

                <button 
                    className={`nav-item ${activeSection === 'profile' ? 'active' : ''}`}
                    onClick={() => {
                        onSectionChange && onSectionChange('profile');
                        onSelectRoom && onSelectRoom(null);
                    }}
                >
                    <FontAwesomeIcon icon={faUser} />
                    My Profile
                </button>
            </div>

            <div className="nav-section">
                <div className="nav-header">
                    <FontAwesomeIcon icon={faUsers} />
                    <span>Chat Rooms</span>
                    <div className="nav-actions">
                        <button 
                            className="icon-btn" 
                            onClick={() => setShowJoinModal(true)}
                            title="Join Room"
                        >
                            <FontAwesomeIcon icon={faSignInAlt} />
                        </button>
                        <button 
                            className="icon-btn create-btn" 
                            onClick={() => setShowCreateModal(true)}
                            title="Create Room"
                        >
                            <FontAwesomeIcon icon={faPlusCircle} />
                        </button>
                    </div>
                </div>

                <div className="room-list">
                    {rooms.length === 0 ? (
                        <div className="no-rooms">
                            <p>No rooms yet. Create or join a room to get started!</p>
                        </div>
                    ) : (
                        rooms.map((room) => {
                            const isOwner = room.ownerUid === user?.uid;
                            return (
                                <button
                                    key={room.id}
                                    className={`nav-item room-item ${room.id === activeRoomId ? 'active' : ''}`}
                                    onClick={() => {
                                        onSelectRoom && onSelectRoom(room.id);
                                        onSectionChange && onSectionChange('rooms');
                                    }}
                                >
                                    <div className="room-info">
                                        <span className="room-name">{room.name}</span>
                                        <div className="room-details">
                                            <span className="room-code">{room.code}</span>
                                            <span className={`room-status ${isOwner ? 'owner' : 'member'}`}>
                                                {isOwner ? 'Owner' : 'Member'}
                                            </span>
                                        </div>
                                    </div>
                                </button>
                            );
                        })
                    )}
                </div>
            </div>

            {/* Join Room Modal */}
            {showJoinModal && (
                <div className="modal-overlay">
                    <div className="modal">
                        <div className="modal-header">
                            <h3>Join Room</h3>
                            <button onClick={() => setShowJoinModal(false)}>
                                <FontAwesomeIcon icon={faTimes} />
                            </button>
                        </div>
                        <form onSubmit={handleJoinRoom}>
                            <input
                                type="text"
                                value={joinCode}
                                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                                placeholder="Enter 5-digit room code"
                                maxLength="5"
                                required
                            />
                            <button type="submit" disabled={loading || joinCode.length !== 5}>
                                {loading ? 'Joining...' : 'Join Room'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Create Room Modal */}
            {showCreateModal && (
                <div className="modal-overlay">
                    <div className="modal">
                        <div className="modal-header">
                            <h3>Create Room</h3>
                            <button onClick={() => setShowCreateModal(false)}>
                                <FontAwesomeIcon icon={faTimes} />
                            </button>
                        </div>
                        <form onSubmit={handleCreateRoom}>
                            <input
                                type="text"
                                value={newRoomName}
                                onChange={(e) => setNewRoomName(e.target.value)}
                                placeholder="Room name"
                                required
                            />
                            <button type="submit" disabled={loading || !newRoomName.trim()}>
                                {loading ? 'Creating...' : 'Create Room'}
                            </button>
                        </form>
                    </div>
                </div>
            )}
        </nav>
    );
}

export default Navbar; 