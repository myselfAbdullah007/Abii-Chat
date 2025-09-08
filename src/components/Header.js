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
            >
                <FontAwesomeIcon icon={faBars} />
            </button>
            <h1>Abii ChatRoom</h1>
        </div>
        <Signout />
    </header>
  );
}

export default Header;
