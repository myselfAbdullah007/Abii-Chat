import React from 'react';
import firebase from 'firebase/app';
import 'firebase/auth'; // Ensure Firebase Auth is imported

function Signin() {

    const auth = firebase.auth(); // Initialize auth before the function

    const signInWithGoogle = () => {
        const provider = new firebase.auth.GoogleAuthProvider();
        auth.signInWithPopup(provider)
            .then((result) => {
                // Handle successful sign-in
                console.log('User signed in:', result.user);
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
        <>
            <img className="sign-in-image" src="../SignIn.png" alt="Sign In" />
            <button className="sign-in-button" onClick={signInWithGoogle}>
                <img className="sign-in-google" src="https://img.icons8.com/fluency/480/000000/google-logo.png" alt="Google Logo" />
                Sign in with Google
            </button>
        </>
    );
}

export default Signin;
