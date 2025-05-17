import React from 'react';
import './Footer.css';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        <div className="footer-section">
          <h2>About</h2>
          <p>We provide critical information on emergency services and government schemes to ensure the safety and well-being of citizens.</p>
        </div>
        
        <div className="footer-section">
          <h2>Emergency Numbers</h2>
          <ul>
            <li><strong>Police:</strong> 100</li>
            <li><strong>Fire Brigade:</strong> 101</li>
            <li><strong>Ambulance:</strong> 108</li>
            <li><strong>Emergency Helpline:</strong> 112</li>
          </ul>
        </div>

        <div className="footer-section">
          <h2>Government Schemes</h2>
          <ul>
            <li><Link to="/scheme/ambulance">Sanjeevani Scheme (Ambulance)</Link></li>
            <li><Link to="/scheme/fire-safety">Fire Safety Equipment Subsidy</Link></li>
            <li><Link to="/scheme/women-safety">Mission Shakti (Self-Defense)</Link></li>
          </ul>
        </div>

</div>
      <div className="footer-bottom">
        <p>&copy; 2025 Alert. All Rights Reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
