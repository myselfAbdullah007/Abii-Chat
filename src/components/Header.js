import React from "react";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars } from '@fortawesome/free-solid-svg-icons';

// Importing Component
import Signout from "./Signout";

function Header({ onMobileMenuToggle, isMobileMenuOpen }) {
  
  const handleMenuClick = () => {
    if (onMobileMenuToggle) {
      onMobileMenuToggle();
    }
  };

  const logoMaskStyle = {
    WebkitMask: "url(/ABII.svg) no-repeat center / contain",
    mask: "url(/ABII.svg) no-repeat center / contain",
    background: "linear-gradient(135deg, var(--accent-primary), var(--accent-secondary))",
    width: "138px",
    height: "50px",
  };

  return (
    <header>
        <div className="header-left">
            <button 
                className="mobile-menu-toggle"
                onClick={handleMenuClick}
                aria-label="Toggle navigation"
            >
                <FontAwesomeIcon icon={faBars} />
                <span className="sr-only">Menu</span>
            </button>
            <div className="app-logo-mask" aria-label="ABII ChatRoom logo" style={logoMaskStyle} />
        </div>
        <Signout />
    </header>
  );
}

export default Header;
