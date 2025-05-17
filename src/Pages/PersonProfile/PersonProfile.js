import React, { useState, useEffect } from 'react';
import { db, storage } from '../../firebase/firebase';
import { collection, query, where, getDocs, doc, updateDoc, addDoc } from 'firebase/firestore';
import { getAuth, updateProfile, signOut } from 'firebase/auth';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { Link, useNavigate } from 'react-router-dom';
import { FaUserEdit, FaPhone, FaEnvelope, FaCalendarAlt, FaMapMarkerAlt, FaHistory, FaPlus, FaEdit, FaTrash, FaSignOutAlt } from 'react-icons/fa';
import { IoMdAlert } from 'react-icons/io';
import { MdEmergency, MdSettings } from 'react-icons/md';
import './PersonProfile.css';

const PersonProfile = () => {
  const [userData, setUserData] = useState({
    name: '',
    email: '',
    phone: '',
    photoURL: '',
    emergencyContacts: []
  });
  const [emergencyHistory, setEmergencyHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [tempPhoto, setTempPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState('');
  const [activeTab, setActiveTab] = useState('profile');
  const [showAddContact, setShowAddContact] = useState(false);
  const [newContact, setNewContact] = useState({ name: '', phone: '', relation: '' });

  const auth = getAuth();
  const userId = auth.currentUser?.uid;
  const user = auth.currentUser;
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch user profile
        const usersRef = collection(db, 'users');
        const q = query(usersRef, where('uid', '==', userId));
        const querySnapshot = await getDocs(q);
        
        if (!querySnapshot.empty) {
          querySnapshot.forEach((doc) => {
            setUserData(doc.data());
            if (doc.data().photoURL) setPhotoPreview(doc.data().photoURL);
          });
        } else {
          setUserData({
            name: user?.displayName || '',
            email: user?.email || '',
            phone: '',
            photoURL: user?.photoURL || '',
            emergencyContacts: []
          });
          if (user?.photoURL) setPhotoPreview(user.photoURL);
        }
        
        // Fetch emergency history
        const emergenciesRef = collection(db, 'emergencyAlerts');
        const emergenciesQuery = query(emergenciesRef, where('userId', '==', userId));
        const emergenciesSnapshot = await getDocs(emergenciesQuery);
        
        const history = [];
        emergenciesSnapshot.forEach((doc) => {
          const data = doc.data();
          history.push({ 
            id: doc.id, 
            ...data,
            formattedDate: formatFirebaseDate(data.timestamp)
          });
        });
        
        setEmergencyHistory(history.sort((a, b) => b.timestamp?.seconds - a.timestamp?.seconds));
        
      } catch (err) {
        console.error('Error:', err);
        setError('Failed to load profile data');
      } finally {
        setLoading(false);
      }
    };
    
    if (userId) fetchData();
  }, [userId]);

  const formatFirebaseDate = (timestamp) => {
    if (!timestamp?.seconds) return 'Unknown date';
    const date = new Date(timestamp.seconds * 1000);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

const handlePhotoChange = (e) => {
  const file = e.target.files[0];
  if (!file) return;

  // Validate file type
  if (!file.type.match('image.*')) {
    alert('Please select an image file');
    return;
  }

  // Validate file size (e.g., 2MB max)
  if (file.size > 2 * 1024 * 1024) {
    alert('Image must be less than 2MB');
    return;
  }

  setTempPhoto(file);
  const reader = new FileReader();
  reader.onloadend = () => {
    setPhotoPreview(reader.result);
  };
  reader.readAsDataURL(file);
};

  const uploadPhoto = async () => {
    if (!tempPhoto) return;
    
    try {
      const storageRef = ref(storage, `profile_photos/${userId}`);
      await uploadBytes(storageRef, tempPhoto);
      const downloadURL = await getDownloadURL(storageRef);
      
      // Update in Firestore
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('uid', '==', userId));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const docRef = doc(db, 'users', querySnapshot.docs[0].id);
        await updateDoc(docRef, { photoURL: downloadURL });
      }
      
      // Update in Auth
      await updateProfile(user, { photoURL: downloadURL });
      
      setUserData(prev => ({ ...prev, photoURL: downloadURL }));
      setPhotoPreview(downloadURL);
      setTempPhoto(null);
      
    } catch (err) {
      console.error('Error uploading photo:', err);
      alert('Failed to update profile photo');
    }
  };


const handleSaveProfile = async () => {
  try {
    let photoUrl = user.photoURL || ''; // Start with the existing valid photo URL

    // Step 1: Upload photo if there's a new one
    if (tempPhoto) {
      try {
        const storageRef = ref(storage, `profile_photos/${userId}`);
        await uploadBytes(storageRef, tempPhoto);
        photoUrl = await getDownloadURL(storageRef); // ✅ Safe, short URL from Firebase
      } catch (uploadError) {
        console.error("Upload failed:", uploadError);
        alert("Failed to upload image. Please try again.");
        return; // Stop here if upload fails
      }
    }

    // Step 2: Save to Firestore
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('uid', '==', userId));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      await addDoc(usersRef, {
        uid: userId,
        ...userData,
        photoURL: photoUrl // ✅ Firebase-hosted photo URL
      });
    } else {
      const docRef = doc(db, 'users', querySnapshot.docs[0].id);
      await updateDoc(docRef, {
        name: userData.name,
        phone: userData.phone,
        emergencyContacts: userData.emergencyContacts,
        photoURL: photoUrl
      });
    }

    // Step 3: Update Firebase Auth profile
    await updateProfile(user, {
      displayName: userData.name,
      photoURL: photoUrl // ✅ Must be <1024 chars and NOT base64!
    });

    setEditMode(false);
    alert('Profile updated successfully!');
  } catch (err) {
    console.error('Error saving profile:', err);
    alert('Failed to update profile');
  }
};

  // try {
  //   let photoUrl = userData.photoURL; // Default to existing URL

  //   if (tempPhoto) {
  //     try {
  //       const storageRef = ref(storage, `profile_photos/${userId}`);
  //       await uploadBytes(storageRef, tempPhoto);
  //       photoUrl = await getDownloadURL(storageRef);
  //       alert('Save successfully chnaged');
  //     } catch (uploadError) {
  //       console.error("Upload failed:");
  //       throw new Error("Failed to upload image. Check CORS configuration.");
  //     }
  //   }
//    alert('Save successfully changed');
//     // Update Firestore and Auth (same as before)
//     // ...
//   } catch (err) {
//     console.error("Save failed:");
//     alert("Failed to save profile.");
//   }
// };

  const handleAddContact = () => {
    if (!newContact.name || !newContact.phone) {
      alert('Please fill in all required fields');
      return;
    }
    
    setUserData(prev => ({
      ...prev,
      emergencyContacts: [...prev.emergencyContacts, newContact]
    }));
    
    setNewContact({ name: '', phone: '', relation: '' });
    setShowAddContact(false);
  };

  const handleRemoveContact = (index) => {
    const updatedContacts = [...userData.emergencyContacts];
    updatedContacts.splice(index, 1);
    setUserData(prev => ({ ...prev, emergencyContacts: updatedContacts }));
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (err) {
      console.error('Error signing out:', err);
      alert('Failed to log out');
    }
  };

  const getEmergencyTypeIcon = (type) => {
    switch (type) {
      case 'Fire': return '🔥';
      case 'Medical': return '🚑';
      case 'Police': return '👮';
      case 'Disaster': return '🌪️';
      default: return '🚨';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'activated': return 'var(--warning)';
      case 'notification_sent': return 'var(--info)';
      case 'resolved': return 'var(--success)';
      case 'notification_failed': return 'var(--danger)';
      default: return 'var(--gray)';
    }
  };

  if (loading) {
    return (
      <div className="profile-loading-container">
        <div className="loading-spinner"></div>
        <p>Loading your emergency profile...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="profile-error-container">
        <div className="error-icon">⚠️</div>
        <h3>Error Loading Profile</h3>
        <p>{error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="retry-button"
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="emergency-profile-enhanced">
      {/* Header Section */}
      <header className="profile-header">
        <div className="header-content">
          <h1>Emergency Profile</h1>
          <p>Manage your safety information and view emergency history</p>
        </div>
      </header>

      {/* Main Content */}
      <div className="profile-main-container">
        {/* Sidebar */}
        <aside className="profile-sidebar">
          <div className="profile-card">
            <div className="avatar-container">
              {photoPreview ? (
                <img src={photoPreview} alt="Profile" className="profile-avatar" />
              ) : (
                <div className="avatar-placeholder">
                  {userData.name.charAt(0).toUpperCase()}
                </div>
              )}
              {editMode && (
                <div className="avatar-edit">
                  <label htmlFor="profile-photo">
                    
                  </label>
                </div>
              )}
            </div>
            
            <div className="profile-info">
              <h2 className="profile-name">
                {editMode ? (
                  <input
                    type="text"
                    value={userData.name}
                    onChange={(e) => setUserData({...userData, name: e.target.value})}
                    placeholder="Your Name"
                  />
                ) : (
                  userData.name || 'Your Name'
                )}
              </h2>
              
              <div className="profile-meta">
                <div className="meta-item">
                  <FaEnvelope className="meta-icon" />
                  <span>{userData.email}</span>
                </div>
                <div className="meta-item">
                  <FaPhone className="meta-icon" />
                  {editMode ? (
                    <input
                      type="tel"
                      value={userData.phone}
                      onChange={(e) => setUserData({...userData, phone: e.target.value})}
                      placeholder="Phone number"
                    />
                  ) : (
                    <span>{userData.phone || 'Not provided'}</span>
                  )}
                </div>
                <div className="meta-item">
                  <FaCalendarAlt className="meta-icon" />
                  <span>
                    Member since: {new Date(user.metadata.creationTime).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="profile-actions">
              {editMode ? (
                <>
                  <button 
                    className="save-button"
                    onClick={handleSaveProfile}
                  >
                    Save Changes
                  </button>
                  <button 
                    className="cancel-button"
                    onClick={() => setEditMode(false)}
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <>
                  <button 
                    className="edit-button"
                    onClick={() => setEditMode(true)}
                  >
                    <FaEdit /> Edit Profile
                  </button>
                  <button 
                    className="logout-button"
                    onClick={handleLogout}
                  >
                    <FaSignOutAlt /> Log Out
                  </button>
                </>
              )}
            </div>
          </div>
          
          <nav className="profile-nav">
            <button
              className={`nav-button ${activeTab === 'profile' ? 'active' : ''}`}
              onClick={() => setActiveTab('profile')}
            >
              <FaUserEdit /> Profile
            </button>
            <button
              className={`nav-button ${activeTab === 'emergency' ? 'active' : ''}`}
              onClick={() => setActiveTab('emergency')}
            >
              <IoMdAlert /> Emergency Contacts
            </button>
            <button
              className={`nav-button ${activeTab === 'history' ? 'active' : ''}`}
              onClick={() => setActiveTab('history')}
            >
              <FaHistory /> Emergency History
            </button>
          </nav>
        </aside>

        {/* Main Content Area */}
        <main className="profile-content">
          {activeTab === 'profile' && (
            <div className="profile-details">
              <h2 className="section-title">Personal Information</h2>
              <div className="details-grid">
                <div className="detail-card">
                  <h3>Emergency Preparedness</h3>
                  <div className="progress-container">
                    <div className="progress-bar" style={{ width: '75%' }}></div>
                    <span>75% Complete</span>
                  </div>
                  <ul className="checklist">
                    <li className="completed">Basic Information</li>
                    <li className={userData.phone ? 'completed' : ''}>Phone Number</li>
                    <li className={userData.emergencyContacts.length > 0 ? 'completed' : ''}>Emergency Contacts</li>
                    <li>Medical Information</li>
                  </ul>
                </div>
                
                <div className="detail-card">
                  <h3>Recent Activity</h3>
                  {emergencyHistory.slice(0, 3).map(emergency => (
                    <div key={emergency.id} className="activity-item">
                      <div className="activity-icon">
                        {getEmergencyTypeIcon(emergency.type)}
                      </div>
                      <div className="activity-details">
                        <p className="activity-title">{emergency.type || 'Emergency Alert'}</p>
                        <p className="activity-date">{emergency.formattedDate}</p>
                      </div>
                    </div>
                  ))}
                  {emergencyHistory.length === 0 && (
                    <p className="no-activity">No recent emergency activity</p>
                  )}
                </div>
                
                <div className="detail-card">
                  <h3>Quick Actions</h3>
                  <div className="quick-actions">
                    <Link to="/emergency" className="action-button emergency">
                      <MdEmergency /> Emergency Alert
                    </Link>
                    <Link to="/settings" className="action-button settings">
                      <MdSettings /> Settings
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'emergency' && (
            <div className="emergency-contacts">
              <div className="section-header">
                <h2 className="section-title">Emergency Contacts</h2>
                <button 
                  className="add-button"
                  onClick={() => setShowAddContact(true)}
                >
                  <FaPlus /> Add Contact
                </button>
              </div>
              
              {showAddContact && (
                <div className="add-contact-form">
                  <h3>Add New Emergency Contact</h3>
                  <div className="form-group">
                    <label>Name*</label>
                    <input
                      type="text"
                      value={newContact.name}
                      onChange={(e) => setNewContact({...newContact, name: e.target.value})}
                      placeholder="Contact name"
                    />
                  </div>
                  <div className="form-group">
                    <label>Phone Number*</label>
                    <input
                      type="tel"
                      value={newContact.phone}
                      onChange={(e) => setNewContact({...newContact, phone: e.target.value})}
                      placeholder="+1 (123) 456-7890"
                    />
                  </div>
                  <div className="form-group">
                    <label>Relationship</label>
                    <input
                      type="text"
                      value={newContact.relation}
                      onChange={(e) => setNewContact({...newContact, relation: e.target.value})}
                      placeholder="Family, Friend, Doctor, etc."
                    />
                  </div>
                  <div className="form-actions">
                    <button 
                      className="save-button"
                      onClick={handleAddContact}
                    >
                      Save Contact
                    </button>
                    <button 
                      className="cancel-button"
                      onClick={() => setShowAddContact(false)}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
              
              {userData.emergencyContacts.length > 0 ? (
                <div className="contacts-grid">
                  {userData.emergencyContacts.map((contact, index) => (
                    <div key={index} className="contact-card">
                      <div className="contact-avatar">
                        {contact.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="contact-info">
                        <h3>{contact.name}</h3>
                        <p className="contact-phone">{contact.phone}</p>
                        {contact.relation && (
                          <p className="contact-relation">{contact.relation}</p>
                        )}
                      </div>
                      {editMode && (
                        <button 
                          className="remove-button"
                          onClick={() => handleRemoveContact(index)}
                        >
                          <FaTrash />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="no-contacts">
                  <p>You haven't added any emergency contacts yet.</p>
                  <button 
                    className="add-button"
                    onClick={() => setShowAddContact(true)}
                  >
                    <FaPlus /> Add Your First Contact
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'history' && (
            <div className="emergency-history">
              <h2 className="section-title">Emergency History</h2>
              
              {emergencyHistory.length > 0 ? (
                <div className="timeline">
                  {emergencyHistory.map((emergency) => (
                    <div key={emergency.id} className="timeline-item">
                      <div className="timeline-marker">
                        <div 
                          className="marker-icon"
                          style={{ backgroundColor: getStatusColor(emergency.status) }}
                        >
                          {getEmergencyTypeIcon(emergency.type)}
                        </div>
                        <div className="marker-line"></div>
                      </div>
                      <div className="timeline-content">
                        <div className="timeline-header">
                          <h3>{emergency.type || 'Emergency Alert'}</h3>
                          <span className="timeline-date">{emergency.formattedDate}</span>
                        </div>
                        <div className="timeline-details">
                          {emergency.location?.address && (
                            <div className="detail-item">
                              <FaMapMarkerAlt className="detail-icon" />
                              <span>{emergency.location.address}</span>
                            </div>
                          )}
                          <div className="detail-item">
                            <span className="detail-label">Status:</span>
                            <span 
                              className="status-badge"
                              style={{ backgroundColor: getStatusColor(emergency.status) }}
                            >
                              {emergency.status.replace(/_/g, ' ')}
                            </span>
                          </div>
                          {emergency.description && (
                            <div className="detail-item">
                              <p className="emergency-description">{emergency.description}</p>
                            </div>
                          )}
                        </div>
                        <Link 
                          to={`/emergency/details/${emergency.id}`} 
                          className="details-link"
                        >
                          View Details
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="no-history">
                  <div className="empty-state">
                    <IoMdAlert className="empty-icon" />
                    <h3>No Emergency History</h3>
                    <p>You haven't activated any emergency alerts yet.</p>
                    <Link to="/emergency" className="emergency-button">
                      <MdEmergency /> Emergency Alert
                    </Link>
                  </div>
                </div>
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default PersonProfile;