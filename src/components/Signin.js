import React from 'react';
import firebase from 'firebase/app';
import 'firebase/auth'; // Ensure Firebase Auth is imported
import 'firebase/firestore';

function Signin() {

    const auth = firebase.auth(); // Initialize auth before the function
    const firestore = firebase.firestore();

    const signInWithGoogle = () => {
        const provider = new firebase.auth.GoogleAuthProvider();
        auth.signInWithPopup(provider)
            .then(async (result) => {
                // Handle successful sign-in
                const user = result.user;
                console.log('User signed in:', user);

                // Create or update user profile document
                if (user) {
                    const userRef = firestore.collection('users').doc(user.uid);
                    await userRef.set({
                        uid: user.uid,
                        displayName: user.displayName || '',
                        email: user.email || '',
                        photoURL: user.photoURL || '',
                        lastLoginAt: firebase.firestore.FieldValue.serverTimestamp()
                    }, { merge: true });
                }
            })
            .catch((error) => {
                if (error.code === 'auth/popup-closed-by-user') {
                    console.log('The popup was closed before the sign-in could be completed.');
                } else {
                    console.error('Sign-in error:', error);
                }
            });
    };

    return (
        <div className="modern-login-container">
            <div className="login-background">
                <div className="floating-shapes">
                    <div className="shape shape-1"></div>
                    <div className="shape shape-2"></div>
                    <div className="shape shape-3"></div>
                    <div className="shape shape-4"></div>
                </div>
            </div>
            
            <div className="login-content">
                <div className="login-card">
                    <div className="login-header">
                        <div className="logo-container">
                            <img className="login-logo" src="/ABII.svg" alt="ABII ChatRoom" />
                        </div>
                        <p className="login-subtitle">Your space for seamless communication</p>
                    </div>
                    
                    <div className="login-body">
                        <div className="feature-highlights">
                            <div className="feature-item">
                                <div className="feature-icon">💬</div>
                                <span>Real-time messaging</span>
                            </div>
                            <div className="feature-item">
                                <div className="feature-icon">🏠</div>
                                <span>Create & join rooms</span>
                            </div>
                            <div className="feature-item">
                                <div className="feature-icon">🔔</div>
                                <span>Smart notifications</span>
                            </div>
                        </div>
                        
                        <button className="modern-signin-btn" onClick={signInWithGoogle}>
                            <div className="signin-btn-content">
                                <img 
                                    className="google-icon" 
                                    src="https://img.icons8.com/fluency/48/000000/google-logo.png" 
                                    alt="Google"
                                />
                                <span className="signin-text">Continue with Google</span>
                            </div>
                            <div className="signin-btn-glow"></div>
                        </button>
                        
                        <p className="login-footer">
                            Secure authentication powered by Google
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Signin;
