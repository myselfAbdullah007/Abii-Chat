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
        <div className="sign-in-container">
            <img className="sign-in-logo" src="/ABII.svg" alt="ABII ChatRoom" />
            <h1 className="sign-in-title">Welcome to ABII ChatRoom</h1>
            <p className="sign-in-subtitle">Connect, chat, and collaborate with your team</p>
            <button className="sign-in-button" onClick={signInWithGoogle}>
                <img className="sign-in-google" src="https://img.icons8.com/fluency/480/000000/google-logo.png" alt="Google Logo" />
                Sign in with Google
            </button>
        </div>
    );
}

export default Signin;
