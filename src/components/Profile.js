import React, { useState, useEffect } from 'react';
import firebase from 'firebase/app';
import 'firebase/firestore';
import 'firebase/storage';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faUser, faCamera, faCalendar, faEdit, faSave, faTimes } from '@fortawesome/free-solid-svg-icons';

function Profile() {
    const auth = firebase.auth();
    const firestore = firebase.firestore();
    const storage = firebase.storage();
    const user = auth.currentUser;

    const [profile, setProfile] = useState({
        displayName: '',
        photoURL: '',
        bio: '',
        dateOfBirth: '',
        email: ''
    });
    const [editing, setEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);

    useEffect(() => {
        if (user) {
            // Load existing profile data
            setProfile({
                displayName: user.displayName || '',
                photoURL: user.photoURL || '',
                bio: '',
                dateOfBirth: '',
                email: user.email || ''
            });

            // Fetch additional profile data from Firestore
            firestore.collection('users').doc(user.uid).get()
                .then(doc => {
                    if (doc.exists) {
                        const data = doc.data();
                        setProfile(prev => ({
                            ...prev,
                            bio: data.bio || '',
                            dateOfBirth: data.dateOfBirth || '',
                            displayName: data.displayName || prev.displayName
                        }));
                    }
                })
                .catch(error => {
                    console.error('Error fetching profile:', error);
                });
        }
    }, [user, firestore]);

    const handleInputChange = (field, value) => {
        setProfile(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleImageUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            alert('Please select an image file');
            return;
        }

        // Validate file size (5MB max)
        if (file.size > 5 * 1024 * 1024) {
            alert('Image size should be less than 5MB');
            return;
        }

        setUploading(true);
        try {
            const storageRef = storage.ref(`profile-pictures/${user.uid}`);
            const uploadTask = storageRef.put(file);
            
            const snapshot = await uploadTask;
            const downloadURL = await snapshot.ref.getDownloadURL();
            
            setProfile(prev => ({
                ...prev,
                photoURL: downloadURL
            }));
        } catch (error) {
            console.error('Error uploading image:', error);
            alert('Failed to upload image. Please try again.');
        } finally {
            setUploading(false);
        }
    };

    const handleSave = async () => {
        if (!profile.displayName.trim()) {
            alert('Display name is required');
            return;
        }

        setLoading(true);
        try {
            // Update Firebase Auth profile
            await user.updateProfile({
                displayName: profile.displayName,
                photoURL: profile.photoURL
            });

            // Update Firestore document
            await firestore.collection('users').doc(user.uid).set({
                uid: user.uid,
                displayName: profile.displayName,
                email: profile.email,
                photoURL: profile.photoURL,
                bio: profile.bio,
                dateOfBirth: profile.dateOfBirth,
                lastUpdated: firebase.firestore.FieldValue.serverTimestamp()
            }, { merge: true });

            setEditing(false);
            alert('Profile updated successfully!');
        } catch (error) {
            console.error('Error updating profile:', error);
            alert('Failed to update profile. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        // Reset to original values
        setProfile({
            displayName: user.displayName || '',
            photoURL: user.photoURL || '',
            bio: '',
            dateOfBirth: '',
            email: user.email || ''
        });
        
        // Refetch from Firestore
        firestore.collection('users').doc(user.uid).get()
            .then(doc => {
                if (doc.exists) {
                    const data = doc.data();
                    setProfile(prev => ({
                        ...prev,
                        bio: data.bio || '',
                        dateOfBirth: data.dateOfBirth || ''
                    }));
                }
            });
        
        setEditing(false);
    };

    if (!user) {
        return (
            <div className="profile-container">
                <div className="profile-signin-message">
                    <FontAwesomeIcon icon={faUser} size="3x" />
                    <h2>Profile Not Available</h2>
                    <p>Please sign in to view and edit your profile.</p>
                </div>
            </div>
        );
    }

    return (
        <div className={`profile-container ${editing ? 'editing' : ''}`}>
            <div className="profile-header">
                <div className="profile-title">
                    <FontAwesomeIcon icon={faUser} />
                    <h2>My Profile</h2>
                </div>
                {!editing && (
                    <button className="edit-profile-btn" onClick={() => setEditing(true)}>
                        <FontAwesomeIcon icon={faEdit} /> Edit Profile
                    </button>
                )}
            </div>

            <div className="profile-content">
                {/* Profile Picture Section */}
                <div className="profile-picture-section">
                    <div className="profile-picture-container">
                        <img 
                            src={profile.photoURL || '/default-avatar.png'} 
                            alt="Profile"
                            className="profile-picture"
                            onError={(e) => {
                                e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.displayName || 'User')}&size=200&background=667eea&color=fff`;
                            }}
                        />
                        {editing && (
                            <div className="profile-picture-overlay">
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                    className="file-input"
                                    id="profile-picture-input"
                                    disabled={uploading}
                                />
                                <label htmlFor="profile-picture-input" className="upload-btn">
                                    <FontAwesomeIcon icon={faCamera} />
                                    {uploading ? 'Uploading...' : 'Change Photo'}
                                </label>
                            </div>
                        )}
                    </div>
                    
                    {/* User Stats */}
                    <div className="profile-stats">
                        <div className="stat-item">
                            <div className="stat-number">{new Date().getFullYear() - new Date(user.metadata.creationTime).getFullYear()}</div>
                            <div className="stat-label">Years Active</div>
                        </div>
                        <div className="stat-item">
                            <div className="stat-number">{new Date(user.metadata.creationTime).toLocaleDateString()}</div>
                            <div className="stat-label">Member Since</div>
                        </div>
                    </div>
                </div>

                {/* Profile Information */}
                <div className="profile-info">
                    <div className="profile-field">
                        <label><FontAwesomeIcon icon={faUser} /> Display Name</label>
                        {editing ? (
                            <input
                                type="text"
                                value={profile.displayName}
                                onChange={(e) => handleInputChange('displayName', e.target.value)}
                                placeholder="Enter your display name"
                                className="profile-input"
                                maxLength={50}
                            />
                        ) : (
                            <div className="profile-value">{profile.displayName || 'Not set'}</div>
                        )}
                    </div>

                    <div className="profile-field">
                        <label>📝 Bio</label>
                        {editing ? (
                            <textarea
                                value={profile.bio}
                                onChange={(e) => handleInputChange('bio', e.target.value)}
                                placeholder="Tell us about yourself..."
                                className="profile-textarea"
                                maxLength={500}
                                rows={4}
                            />
                        ) : (
                            <div className="profile-value bio-value">
                                {profile.bio || 'No bio added yet'}
                            </div>
                        )}
                        {editing && (
                            <small className="char-count">{profile.bio.length}/500 characters</small>
                        )}
                    </div>

                    <div className="profile-field">
                        <label><FontAwesomeIcon icon={faCalendar} /> Date of Birth</label>
                        {editing ? (
                            <input
                                type="date"
                                value={profile.dateOfBirth}
                                onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                                className="profile-input"
                            />
                        ) : (
                            <div className="profile-value">
                                {profile.dateOfBirth ? new Date(profile.dateOfBirth).toLocaleDateString() : 'Not set'}
                            </div>
                        )}
                    </div>

                    <div className="profile-field">
                        <label>📧 Email</label>
                        <div className="profile-value">{profile.email}</div>
                        <small className="profile-note">Email cannot be changed here</small>
                    </div>
                </div>

                {/* Action Buttons */}
                {editing && (
                    <div className="profile-actions">
                        <button 
                            className="save-btn" 
                            onClick={handleSave}
                            disabled={loading}
                        >
                            <FontAwesomeIcon icon={faSave} />
                            {loading ? 'Saving...' : 'Save Changes'}
                        </button>
                        <button 
                            className="cancel-btn" 
                            onClick={handleCancel}
                            disabled={loading}
                        >
                            <FontAwesomeIcon icon={faTimes} />
                            Cancel
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Profile; 