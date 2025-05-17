import React from 'react';
import './AboutPage.css';
import { Link } from 'react-router-dom';


const AboutPage = () => {
  return (
    <>
  
    <div className="about-page">
      {/* Hero Section */}
      <section className="about-hero">
        <div className="hero-content">
          <h1>Protecting Communities Through Rapid Response</h1>
          <p className="hero-subtitle">Our mission is to save lives and minimize damage during emergencies</p>
        </div>
      </section>

      {/* Mission Section */}
      <section className="mission-section">
        <div className="container">
          <div className="mission-content">
            <h2>Our Mission</h2>
            <div className="divider"></div>
            <p>
              We are dedicated to revolutionizing emergency response through technology, 
              ensuring help arrives faster and more efficiently when every second counts. 
              Our platform connects those in need with the nearest available emergency services.
            </p>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section">
        <div className="container">
          <div className="stats-grid">
            <div className="stat-card">
              <h3>500K+</h3>
              <p>Emergencies Responded To</p>
            </div>
            <div className="stat-card">
              <h3>92%</h3>
              <p>Response Rate Under 5 Minutes</p>
            </div>
            <div className="stat-card">
              <h3>24/7</h3>
              <p>Always Available Support</p>
            </div>
            <div className="stat-card">
              <h3>100+</h3>
              <p>Communities Protected</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="how-it-works">
        <div className="container">
          <h2>How Our Emergency System Works</h2>
          <div className="divider"></div>
          <div className="steps-container">
            <div className="step">
              <div className="step-number">1</div>
              <h3>Emergency Detected</h3>
              <p>User reports emergency through our app or automated systems detect crisis situations</p>
            </div>
            <div className="step">
              <div className="step-number">2</div>
              <h3>Instant Alert</h3>
              <p>Our system immediately notifies the nearest available emergency responders</p>
            </div>
            <div className="step">
              <div className="step-number">3</div>
              <h3>Rapid Dispatch</h3>
              <p>First responders are dispatched with precise location and situation details</p>
            </div>
            <div className="step">
              <div className="step-number">4</div>
              <h3>Ongoing Support</h3>
              <p>We provide real-time updates and guidance until help arrives</p>
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="values-section">
        <div className="container">
          <h2>Our Core Values</h2>
          <div className="divider"></div>
          <div className="values-grid">
            <div className="value-card">
              <div className="value-icon">
                <i className="fas fa-clock"></i>
              </div>
              <h3>Speed</h3>
              <p>Every second counts in emergencies. We optimize our systems for the fastest possible response times.</p>
            </div>
            <div className="value-card">
              <div className="value-icon">
                <i className="fas fa-shield-alt"></i>
              </div>
              <h3>Reliability</h3>
              <p>Our systems maintain 99.99% uptime, ensuring help is always available when needed most.</p>
            </div>
            <div className="value-card">
              <div className="value-icon">
                <i className="fas fa-heart"></i>
              </div>
              <h3>Compassion</h3>
              <p>We treat every emergency with the care and attention we would want for our own families.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="container">
          <h2>Ready to Make Your Community Safer?</h2>
          <p>Join thousands of communities already protected by our emergency response system</p>
          <div className="cta-buttons">
           <Link to="/home" className="primary-button" >Get Started</Link>
            <Link to='/team' className="secondary-button">Contact Our Team</Link>
          </div>
        </div>
      </section>
    </div>
  
    </>
  );
};

export default AboutPage;