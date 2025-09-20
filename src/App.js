import React, { useState, useEffect } from 'react';

//Import Styling
import './App.css';

//Import Firbase component
import firebase from 'firebase/app';
import 'firebase/firestore';
import 'firebase/auth';
import 'firebase/storage';
import 'firebase/analytics';

//Import FirebaseAuth component
import { useAuthState } from 'react-firebase-hooks/auth';

// Importing Component
import Header from './components/Header';
import SignIn from './components/Signin';
import ChatRoom from './components/ChatRoom';
import Navbar from './components/Navbar';
import GeneralChat from './components/GeneralChat';
import Profile from './components/Profile';
import UserProfile from './components/UserProfile';
import NotificationSystem from './components/NotificationSystem';

firebase.initializeApp({
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MSG_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID
})

const auth = firebase.auth();

function App() {
  const [user] = useAuthState(auth);
  const [activeRoomId, setActiveRoomId] = useState(null);
  const [activeSection, setActiveSection] = useState('general');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isNavbarCollapsed, setIsNavbarCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [viewingUserId, setViewingUserId] = useState(null);

  // Handle window resize and mobile viewport
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
      if (window.innerWidth > 768) {
        setIsMobileMenuOpen(false); // Close mobile menu on desktop
      }
    };

    // Fix for mobile viewport height issues
    const setVH = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    };

    handleResize();
    setVH();

    window.addEventListener('resize', handleResize);
    window.addEventListener('resize', setVH);
    window.addEventListener('orientationchange', setVH);
    
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('resize', setVH);
      window.removeEventListener('orientationchange', setVH);
    };
  }, []);

  const handleSectionChange = (section) => {
    setActiveSection(section);
    if (section === 'general') {
      setActiveRoomId(null);
    }
    // Close mobile menu when section changes
    if (isMobile) {
      setIsMobileMenuOpen(false);
    }
  };

  const toggleMobileMenu = () => {
    console.log('Toggle mobile menu clicked, current state:', isMobileMenuOpen);
    if (isMobile) {
      setIsMobileMenuOpen(!isMobileMenuOpen);
    } else {
      setIsNavbarCollapsed(!isNavbarCollapsed);
    }
    console.log('New state will be:', !isMobileMenuOpen);
  };

  const handleAvatarClick = React.useCallback((userId) => {
    setViewingUserId(userId);
  }, []);

  const closeUserProfile = () => {
    setViewingUserId(null);
  };



  return (
    <div className="App">
      {user && (
        <Header 
          onMobileMenuToggle={toggleMobileMenu}
          isMobileMenuOpen={isMobile ? isMobileMenuOpen : !isNavbarCollapsed}
        />
      )}

      {user ? (
        <section className="layout">
          {isMobile && <div className={`navbar-overlay ${isMobileMenuOpen ? 'open' : ''}`} onClick={() => setIsMobileMenuOpen(false)}></div>}
          <Navbar 
            activeSection={activeSection}
            onSectionChange={handleSectionChange}
            activeRoomId={activeRoomId}
            onSelectRoom={setActiveRoomId}
            isMobileMenuOpen={isMobile ? isMobileMenuOpen : !isNavbarCollapsed}
            isCollapsed={!isMobile && isNavbarCollapsed}
          />
          <div className={`main-content ${!isMobile && isNavbarCollapsed ? 'expanded' : ''}`}>

            {(() => {
              if (activeSection === 'general') {
                return <GeneralChat key="general-chat" onAvatarClick={handleAvatarClick} />;
              } else if (activeSection === 'profile') {
                return <Profile />;
                              } else if (activeSection === 'rooms' && activeRoomId) {
                  return <ChatRoom key={`room-${activeRoomId}`} roomId={activeRoomId} onAvatarClick={handleAvatarClick} />;
              } else if (activeSection === 'rooms') {
                return (
                  <div className="empty-state">
                    <h2>Welcome to Chat Rooms!</h2>
                    <p>Create a new room or join an existing one using a room code.</p>
                  </div>
                );
              } else {
                return (
                  <div className="empty-state">
                    <h2>Welcome to ABII ChatRoom!</h2>
                    <p>Select a section from the navbar to get started.</p>
                  </div>
                );
              }
            })()}
          </div>
          <NotificationSystem 
            user={user}
            activeRoomId={activeRoomId}
            activeSection={activeSection}
          />
        </section>
      ) : (
        <section className="sign-in-section">
          <SignIn />
        </section>
      )}
      
      {/* User Profile Modal */}
      {viewingUserId && (
        <UserProfile 
          userId={viewingUserId} 
          onClose={closeUserProfile} 
        />
      )}
    </div>
  );
}

export default App;
