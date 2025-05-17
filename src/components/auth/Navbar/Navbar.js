import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './Navbar.css';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">Alert</Link>
        
        {/* Hamburger menu for mobile */}
        <div 
          className={`hamburger ${isOpen ? 'active' : ''}`} 
          onClick={toggleMenu}
        >
          <span className="bar"></span>
          <span className="bar"></span>
          <span className="bar"></span>
        </div>

        {/* Navigation links */}
        <div className={`nav-links ${isOpen ? 'active' : ''}`}>
          <Link to="/home" className="nav-link" onClick={() => setIsOpen(false)}>Home</Link>
          <Link to="/about" className="nav-link" onClick={() => setIsOpen(false)}>About</Link>
          <Link to="/news" className="nav-link" onClick={() => setIsOpen(false)}>News</Link>
          <Link to="/team" className="nav-link" onClick={() => setIsOpen(false)}>Team</Link>
          <Link to="/contact" className="nav-link" onClick={() => setIsOpen(false)}>Contact Us</Link>
          <Link to="/profile" className="nav-link" onClick={() => setIsOpen(false)}>Profile</Link> {/* ✅ Added Profile */}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
