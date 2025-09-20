import React, { useState, useEffect } from 'react';
import firebase from 'firebase/app';
import 'firebase/firestore';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faCalendar, faTimes } from '@fortawesome/free-solid-svg-icons';

function UserProfile({ userId, onClose }) {
    const firestore = firebase.firestore();
    const [profile, setProfile] = useState({
        displayName: '',
        photoURL: '',
        bio: '',
        dateOfBirth: '',
        email: ''
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!userId) return;

        const fetchUserProfile = async () => {
            setLoading(true);
            setError('');
            
            try {
                const userDoc = await firestore.collection('users').doc(userId).get();
                
                if (userDoc.exists) {
                    const userData = userDoc.data();
                    setProfile({
                        displayName: userData.displayName || 'Unknown User',
                        photoURL: userData.photoURL || '',
                        bio: userData.bio || '',
                        dateOfBirth: userData.dateOfBirth || '',
                        email: userData.email || ''
                    });
                } else {
                    setError('User profile not found');
                }
            } catch (error) {
                console.error('Error fetching user profile:', error);
                setError('Failed to load user profile');
            } finally {
                setLoading(false);
            }
        };

        fetchUserProfile();
    }, [userId, firestore]);

    if (!userId) return null;

    return (
        <div className="user-profile-modal">
            <div className="user-profile-overlay" onClick={onClose}></div>
            <div className="user-profile-content">
                <div className="user-profile-header">
                    <h2><FontAwesomeIcon icon={faUser} /> User Profile</h2>
                    <button className="close-btn" onClick={onClose}>
                        <FontAwesomeIcon icon={faTimes} />
                    </button>
                </div>

                {loading ? (
                    <div className="user-profile-loading">
                        <div className="loading-spinner"></div>
                        <p>Loading profile...</p>
                    </div>
                ) : error ? (
                    <div className="user-profile-error">
                        <p>{error}</p>
                    </div>
                ) : (
                    <div className="user-profile-body">
                        {/* Hero Section with Avatar and Name */}
                        <div className="user-profile-hero">
                                                            <div className="user-profile-picture-container">
                                <img 
                                    src={profile.photoURL || '/default-avatar.png'} 
                                    alt="Profile"
                                    className="user-profile-picture"
                                    onError={(e) => {
                                        e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.displayName || 'User')}&size=200&background=667eea&color=fff`;
                                    }}
                                />
                            </div>
                            <div className="user-profile-hero-info">
                                <h3 className="user-profile-name">{profile.displayName || 'Unknown User'}</h3>
                                <div className="user-profile-email-badge">{profile.email || 'Private'}</div>
                            </div>
                        </div>

                        {/* Profile Details Cards */}
                        <div className="user-profile-details">
                            {profile.bio && (
                                <div className="user-profile-card">
                                    <div className="user-profile-card-header">
                                        <span className="user-profile-card-icon">💬</span>
                                        <span className="user-profile-card-title">About</span>
                                    </div>
                                    <div className="user-profile-card-content">
                                        {profile.bio}
                                    </div>
                                </div>
                            )}

                            {profile.dateOfBirth && (
                                <div className="user-profile-card">
                                    <div className="user-profile-card-header">
                                        <span className="user-profile-card-icon">🎂</span>
                                        <span className="user-profile-card-title">Birthday</span>
                                    </div>
                                    <div className="user-profile-card-content">
                                        {new Date(profile.dateOfBirth).toLocaleDateString('en-US', { 
                                            year: 'numeric', 
                                            month: 'long', 
                                            day: 'numeric' 
                                        })}
                                    </div>
                                </div>
                            )}

                                
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default UserProfile; 