import React, { useState, useEffect } from 'react';
import './EmergencyAlert.css';
import { db } from '../../firebase/firebase';
import { collection, addDoc, serverTimestamp, doc, updateDoc } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { Link } from 'react-router-dom';

const EmergencyAlert = () => {
  // State declarations
  const [name, setName] = useState('');
const [message, setMessage] = useState('');
  const [isSOSActive, setIsSOSActive] = useState(false);
  const [locationAccess, setLocationAccess] = useState(false);
  const [showComplaint, setShowComplaint] = useState(false);
  const [selectedService, setSelectedService] = useState('');
  const [complaintText, setComplaintText] = useState('');
  const [image, setImage] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [location, setLocation] = useState({
    coordinates: null,
    address: 'Fetching location...',
    error: null
  });
  const [smsStatus, setSmsStatus] = useState(null);
  const [lastComplaintId, setLastComplaintId] = useState(null);
  const [smsError, setSmsError] = useState(null);

  const auth = getAuth();
  const userId = auth.currentUser?.uid || 'anonymous';

  // Emergency contacts
  const emergencyContacts = {
    Fire: '+91101',
    Medical: '+91102',
    Police: '+91100',
    Disaster: '+91108',
    SOS: '+917415360209'
  };



  
  // Effect hooks
  useEffect(() => {
    requestLocationAccess();
  }, []);

  // Location functions
  const requestLocationAccess = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const coords = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          };
          setLocation(prev => ({ ...prev, coordinates: coords, error: null }));
          setLocationAccess(true);
          await getAddressFromCoordinates(coords.latitude, coords.longitude);
        },
        (error) => {
          console.error('Error getting location:', error);
          setLocation({ coordinates: null, address: 'Location access denied', error: error.message });
          setLocationAccess(false);
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    } else {
      setLocation({ coordinates: null, address: 'Geolocation not supported', error: 'Not supported' });
      setLocationAccess(false);
    }
  };

  const getAddressFromCoordinates = async (lat, lng) => {
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
      const data = await res.json();
      if (data?.display_name) {
        setLocation(prev => ({ ...prev, address: data.display_name }));
      } else {
        setLocation(prev => ({ ...prev, address: `Lat: ${lat}, Lng: ${lng}` }));
      }
    } catch (error) {
      console.error('Error fetching address:', error);
      setLocation(prev => ({ ...prev, address: `Lat: ${lat}, Lng: ${lng}`, error: 'Failed to fetch address' }));
      alert('⚠️ Could not automatically determine your address. Please ensure location services are enabled.');
    }
  };

  // SMS functions
 const sendSMS = async (complaint) => {
  try {
    const smsResponse = await fetch('http://localhost:5000/api/send-sms', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        to: '+917415360209', // ✅ Must be in E.164 format
        message: `🚨 Emergency Reported by ${selectedService}}\nLocation: ${location.address}\nMessage: ${complaintText}`
      })
    });

    const smsData = await smsResponse.json();
    if (!smsResponse.ok) {
      console.error("SMS API Error:", smsData);
      throw new Error(smsData.message || "SMS failed");
    }

    console.log("SMS sent successfully", smsData);
    return true;

  } catch (error) {
    console.error("SMS Error:", error);
    throw error;
  }
};
      

  const sendEmailFallback = async (to, message) => {
    try {
      const res = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: 'emergency@yourdomain.com',
          subject: 'SMS Failed - Emergency Alert',
          text: `Failed to send SMS to ${to}. Message: ${message}`
        })
      });
      
      if (!res.ok) {
        throw new Error('Email fallback failed');
      }
      
      console.log('Email fallback sent successfully');
    } catch (emailErr) {
      console.error('Email fallback failed:', emailErr);
      throw emailErr;
    }
  };

  const storeMessageLocally = async (to, message) => {
    try {
      await addDoc(collection(db, 'failedMessages'), {
        to,
        message,
        timestamp: serverTimestamp(),
        status: 'pending_retry',
        userId
      });
      console.log('Message stored locally for retry');
    } catch (err) {
      console.error('Failed to store message locally:', err);
      throw err;
    }
  };

  // Event handlers
  const handleSOSClick = async () => {
    setIsSOSActive(true);
    try {
      const emergencyType = 'General Emergency';
      const docRef = await addDoc(collection(db, 'emergencyAlerts'), {
        type: emergencyType,
        status: 'activated',
        timestamp: serverTimestamp(),
        locationAccess,
        service: emergencyType,
        userId,
        location: location.coordinates ? {
          latitude: location.coordinates.latitude,
          longitude: location.coordinates.longitude,
          address: location.address
        } : null,
        smsStatus: 'pending'
      });

      try {
        const smsResponse = await sendSMS(
          emergencyContacts.SOS,
          `🚨 SOS Alert Activated\nUser ID: ${userId}\nLocation: ${location.address}\n\n` +
          `Reply:\nACCEPT ${docRef.id} to accept\n` +
          `REJECT ${docRef.id} to reject`
        );

        await updateDoc(doc(db, 'emergencyAlerts', docRef.id), {
          smsStatus: 'sent',
          smsId: smsResponse?.sid || null,
          status: 'notification_sent'
        });

        alert('🚨 SOS activated! Authorities have been notified.');
      } catch (smsErr) {
        await updateDoc(doc(db, 'emergencyAlerts', docRef.id), {
          smsStatus: 'failed',
          smsError: smsErr.message,
          status: 'notification_failed'
        });
        alert(`⚠️ SOS activated but notification failed: ${smsErr.message}. Using fallback methods.`);
      }
    } catch (err) {
      console.error('SOS Activation Error:', err);
      alert(`❌ Failed to activate SOS: ${err.message}`);
    } finally {
      setTimeout(() => {
        setIsSOSActive(false);
        setSmsStatus(null);
      }, 5000);
    }
  };

  const handleServiceClick = (service) => {
    setSelectedService(service);
    setShowComplaint(true);
  };

  const handleCancelComplaint = () => {
    setShowComplaint(false);
    setSelectedService('');
    setImage(null);
    setComplaintText('');
  };

  const handleComplaintSubmit = async (e) => {
    e.preventDefault();

    if (!locationAccess || !location.coordinates) {
      alert('📍 Enable location access before submitting.');
      return;
    }

    try {
      setIsUploading(true);
      let imageUrl = null;

      if (image) {
        const formData = new FormData();
        formData.append('file', image);
        formData.append('upload_preset', 'MinorProject');
        formData.append('cloud_name', 'drfnb7ltd');

        const res = await fetch('https://api.cloudinary.com/v1_1/drfnb7ltd/image/upload', {
          method: 'POST',
          body: formData,
        });

        if (!res.ok) {
          const errorData = await res.json();
          console.error('Cloudinary Upload Error:', errorData);
          throw new Error(errorData.error?.message || 'Failed to upload image.');
        }

        const data = await res.json();
        imageUrl = data.secure_url;
      }

      const docRef = await addDoc(collection(db, selectedService.toLowerCase() + 'Complaints'), {
        service: selectedService,
        emergencyNumber: emergencyContacts[selectedService],
        description: complaintText,
        imageUrl,
        userId,
        location: {
          latitude: location.coordinates.latitude,
          longitude: location.coordinates.longitude,
          address: location.address
        },
        status: 'pending',
        timestamp: serverTimestamp(),
        smsStatus: 'pending'
      });

      setLastComplaintId(docRef.id);

      const smsResponse = await sendSMS(
        emergencyContacts[selectedService],
        `🚨 ${selectedService} Complaint\nID: ${docRef.id}\n` +
        `Location: ${location.address}\n` +
        `Desc: ${complaintText.substring(0, 100)}${complaintText.length > 100 ? '...' : ''}\n\n` +
        `Reply:\nACCEPT ${docRef.id} to accept\n` +
        `REJECT ${docRef.id} to reject`
      );

      await updateDoc(doc(db, selectedService.toLowerCase() + 'Complaints', docRef.id), {
        smsStatus: 'sent',
        smsId: smsResponse?.sid || null
      });

      alert(`${selectedService} complaint submitted successfully!`);
      setShowComplaint(false);
      setComplaintText('');
      setImage(null);
    } catch (err) {
      console.error('Complaint Submission Error:', err);
      alert(`❌ Error: ${err.message}`);
    } finally {
      setIsUploading(false);
    }

  alert("Complaint submitted successfully");
  };

  // Render
  return (
    <div className="emergency-app">
      
      <header className="app-header">
        <h1>Emergency Response System</h1>
        <p>Your safety is our priority</p>
      </header>

      {showComplaint ? (
        <div className="complaint-form-container">
          <div className="complaint-form">
            <h3>Submit a {selectedService} Complaint</h3>
            <form onSubmit={handleComplaintSubmit}>
              <div className="form-group">
                <label>Description</label>
                <textarea
                  value={complaintText}
                  onChange={(e) => setComplaintText(e.target.value)}
                  placeholder="Describe your emergency in detail..."
                  required
                />
              </div>
              <div className="form-group">
                <label>Attach Image (Optional)</label>
                <div className="image-upload">
                  <input
                    type="file"
                    id="complaint-image"
                    accept="image/*"
                    onChange={(e) => setImage(e.target.files[0])}
                  />
                  <label htmlFor="complaint-image" className="upload-btn">
                    {image ? 'Change Image' : 'Select Image'}
                  </label>
                  {image && (
                    <span className="file-name">{image.name}</span>
                  )}
                </div>
              </div>
              <div className="form-actions">
                <button
                  type="submit"
                  className="submit-btn"
                  disabled={isUploading}
                >
                  {isUploading ? (
                    <>
                      <span className="spinner"></span>
                      Submitting...
                    </>
                  ) : 'Submit Complaint'}
                </button>
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={handleCancelComplaint}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : (
        <div className="emergency-content">
          <div className={`alert-card ${isSOSActive ? 'active-alert' : ''}`}>
            <div className="alert-header">
              <div className="alert-icon">🚨</div>
              <div>
                <h2>Emergency Alert</h2>
                <p className="alert-subtitle">Select a service or activate SOS</p>
              </div>
            </div>
            <div className="alert-actions">
              <button
                className={`sos-button ${isSOSActive ? 'pulsing' : ''}`}
                onClick={handleSOSClick}
                disabled={isSOSActive}
              >
                <span className="sos-icon">🆘</span>
                {isSOSActive ? 'SOS Activated' : 'Activate SOS'}
              </button>
              {!locationAccess && (
                <button
                  className="location-button"
                  onClick={requestLocationAccess}
                >
                  <span className="location-icon">📍</span>
                  Enable Location
                </button>
              )}
            </div>
            {locationAccess ? (
              <div className="location-status">
                <span className="location-icon">📍</span>
                <span>{location.address}</span>
              </div>
            ) : (
              <div className="location-warning">
                <span>⚠️ Location access required for emergency services</span>
              </div>
            )}
            {smsStatus && (
              <div className={`sms-status ${smsStatus}`}>
                {smsStatus === 'sending' && 'Sending notification...'}
                {smsStatus === 'sent' && 'Notification sent successfully!'}
                {smsStatus === 'failed' && 'Notification failed - using fallback'}
              </div>
            )}
            {smsError && (
              <div className="sms-error-alert">
                <span>⚠️ SMS Notification Error: {smsError}</span>
                <span>Fallback methods have been attempted.</span>
              </div>
            )}
          </div>

          <div className="services-section">
            <h3 className="section-title">Emergency Services</h3>
            <div className="services-grid">
              {Object.entries(emergencyContacts)
                .filter(([service]) => service !== 'SOS')
                .map(([service, number]) => (
                  <div
                    key={service}
                    className={`service-card ${service.toLowerCase()}`}
                    onClick={() => handleServiceClick(service)}
                  >
                    <div className="service-icon">
                      {service === 'Fire' && '🔥'}
                      {service === 'Medical' && '🚑'}
                      {service === 'Police' && '🚨'}
                      {service === 'Disaster' && '🌪️'}
                    </div>
                    <div className="service-info">
                      <h4>{service}</h4>
                      <p>Emergency: {number.replace('+91', '')}</p>
                    </div>
                    <div className="service-arrow">→</div>
                  </div>
                ))}
            </div>
          </div>

          <Link to="/reportstatus" className="report-status-link">
            <button className="report-status-button">
              <span className="button-icon">📋</span>
              View My Complaints
            </button>
          </Link>
        </div>
      )}

 
    </div>
  );
};

export default EmergencyAlert;