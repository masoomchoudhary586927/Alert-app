import React, { useState } from 'react';
import './Contact.css';
import Navbar from '../../components/auth/Navbar/Navbar';
import { db } from '../../firebase/firebase'; // 👈 import your firebase config
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'; // 👈 import Firestore functions
import Footer from '../Footer/Footer';

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    message: ''
  });

  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false); // optional: for showing button loading state

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    if (!formData.message.trim()) newErrors.message = 'Message is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (validateForm()) {
      setLoading(true);
      try {
        await addDoc(collection(db, 'contactMessages'), {
          name: formData.name,
          email: formData.email,
          message: formData.message,
          createdAt: serverTimestamp()
        });

        console.log('Form data saved to Firestore');
        setSubmitted(true);
        setFormData({ name: '', email: '', message: '' });
        setTimeout(() => setSubmitted(false), 5000);
      } catch (error) {
        console.error('Error saving form data:', error);
        alert('Something went wrong. Please try again.');
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <>
  
      <div className="contact-container">
        <div className="contact-content">
          <h1 className="contact-title">Contact Us</h1>
          <p className="contact-subtitle">Have questions? We'd love to hear from you.</p>
          
          {submitted && (
            <div className="alert alert-success">
              Thank you for your message! We'll get back to you soon.
            </div>
          )}

          <form onSubmit={handleSubmit} className="contact-form">
            <div className="form-group">
              <label htmlFor="name">Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className={errors.name ? 'error' : ''}
              />
              {errors.name && <span className="error-message">{errors.name}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className={errors.email ? 'error' : ''}
              />
              {errors.email && <span className="error-message">{errors.email}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="message">Message</label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                rows="5"
                className={errors.message ? 'error' : ''}
              ></textarea>
              {errors.message && <span className="error-message">{errors.message}</span>}
            </div>

            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? 'Sending...' : 'Send Message'}
            </button>
          </form>

          <div className="contact-info">
            <h2>Other Ways to Reach Us</h2>
            <div className="info-grid">
              <div className="info-item">
                <i className="icon">📧</i>
                <h3>Email</h3>
                <p>support@example.com</p>
              </div>
              <div className="info-item">
                <i className="icon">📱</i>
                <h3>Phone</h3>
                <p>+1 (555) 123-4567</p>
              </div>
              <div className="info-item">
                <i className="icon">🏢</i>
                <h3>Office</h3>
                <p>123 Business Ave, Suite 100<br />San Francisco, CA 94107</p>
              </div>
            </div>
          </div>
        </div>
      </div>
  
    </>
  );
};

export default ContactPage;
