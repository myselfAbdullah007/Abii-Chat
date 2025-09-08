import React from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars } from '@fortawesome/free-solid-svg-icons';

// Importing Component
import Signout from "./Signout";

function Header({ onMobileMenuToggle, isMobileMenuOpen }) {
  
  const handleMenuClick = () => {
    console.log('Header button clicked!');
    if (onMobileMenuToggle) {
      onMobileMenuToggle();
    } else {
      console.log('onMobileMenuToggle is not defined!');
    }
  };

  return (
    <header>
        <div className="header-left">
            <button 
                className="mobile-menu-toggle"
                onClick={handleMenuClick}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: '40px',
                  height: '40px',
                  background: '#2c3e50',
                  border: '1px solid #34495e',
                  borderRadius: '8px',
                  color: 'white',
                  cursor: 'pointer',
                  fontSize: '18px'
                }}
            >
                <FontAwesomeIcon icon={faBars} style={{ fontSize: '16px' }} />
                {/* Fallback hamburger if FontAwesome doesn't load */}
                <span style={{ display: 'none' }}>☰</span>
            </button>
            <h1>Abii ChatRoom</h1>
        </div>
        <Signout />
    </header>
  );
}

export default Header;
