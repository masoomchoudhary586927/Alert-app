import { useState } from 'react';
import { db } from '../../firebase/firebase'; // ✅ your firebase config
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
 // ✅ Firestore functions

const ComplaintPage = ({ service, emergencyNumber, onSubmit, onCancel, locationAccess }) => {
  const [complaint, setComplaint] = useState('');
  const [image, setImage] = useState(null);
  const [location, setLocation] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleImageChange = (e) => {
    setImage(e.target.files[0]);
  };

  const handleGetLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
        },
        (error) => {
          alert(`Error getting location: ${error.message}`);
        }
      );
    } else {
      alert("Geolocation is not supported by your browser");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await addDoc(collection(db, "complaints"), {
        service,
        emergencyNumber,
        complaint,
        location: location ? {
          latitude: location.latitude,
          longitude: location.longitude
        } : null,
        imageName: image ? image.name : null, // (optional: you can store image in Storage later)
        submittedAt: serverTimestamp()
      });

      alert(`Your ${service} emergency complaint has been submitted successfully!`);
      setComplaint('');
      setLocation(null);
      setImage(null);
      onSubmit(); // close form
    } catch (error) {
      console.error("Error submitting complaint:", error.message);
      alert("Error submitting complaint. Try again later.");
    }

    setIsSubmitting(false);
  };

  return (
    <>
    <div className="complain-container">
      <h2>{service} Emergency Report</h2>
      <div className="service-notice">
        You are reporting to: <strong>{service} Department</strong> (Emergency: {emergencyNumber})
      </div>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="complaint">Describe your emergency:</label>
          <textarea
            id="complaint"
            value={complaint}
            onChange={(e) => setComplaint(e.target.value)}
            required
            placeholder={`Please describe the ${service.toLowerCase()} emergency in detail...`}
          />
        </div>

        <div className="form-group">
          <label htmlFor="image">Upload photo evidence (optional):</label>
          <input
            type="file"
            id="image"
            accept="image/*"
            onChange={handleImageChange}
          />
        </div>

        <div className="form-group">
          <label>Location information:</label>
          {locationAccess ? (
            <>
              <button
                type="button"
                className="location-button"
                onClick={handleGetLocation}
                disabled={!!location}
              >
                {location ? 'Location Captured' : 'Share My Current Location'}
              </button>
              {location && (
                <div className="location-info">
                  Latitude: {location.latitude.toFixed(6)}, Longitude: {location.longitude.toFixed(6)}
                </div>
              )}
            </>
          ) : (
            <div className="location-warning">
              Location sharing is disabled. Please enable it for accurate emergency response.
            </div>
          )}
        </div>

        <div className="button-group">
          <button
            type="button"
            className="cancel-button"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="submit-button"
            disabled={isSubmitting || !complaint}
          >
            {isSubmitting ? 'Submitting...' : `Submit to ${service}`}
          </button>
        </div>
      </form>
    </div>
    </>
  );
};


export default ComplaintPage;