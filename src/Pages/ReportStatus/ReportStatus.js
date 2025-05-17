import React, { useState, useEffect } from 'react';
import './ReportStatus.css';
import { db } from '../../firebase/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { Link } from 'react-router-dom';

const ReportStatus = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('all');

  const auth = getAuth();
  const userId = auth.currentUser?.uid;

  useEffect(() => {
    if (!userId) return;

    const fetchComplaints = async () => {
      try {
        setLoading(true);
        const services = ['policeComplaints', 'fireComplaints', 'medicalComplaints', 'disasterComplaints'];
        let allComplaints = [];

        for (const service of services) {
          const q = query(collection(db, service), where('userId', '==', userId));
          const querySnapshot = await getDocs(q);
          querySnapshot.forEach((doc) => {
            allComplaints.push({
              id: doc.id,
              service: service.replace('Complaints', ''),
              ...doc.data()
            });
          });
        }

        // Sort by timestamp descending (newest first)
        allComplaints.sort((a, b) => b.timestamp?.toDate() - a.timestamp?.toDate());
        setComplaints(allComplaints);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching complaints:', err);
        setError('Failed to load complaints');
        setLoading(false);
      }
    };

    fetchComplaints();
  }, [userId]);

  const filteredComplaints = activeTab === 'all' 
    ? complaints 
    : complaints.filter(complaint => complaint.service.toLowerCase() === activeTab.toLowerCase());

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'pending': return 'orange';
      case 'resolved': return 'green';
      case 'rejected': return 'red';
      case 'in progress': return 'blue';
      default: return 'gray';
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return 'N/A';
    const date = timestamp.toDate();
    return date.toLocaleString();
  };

  const getServiceIcon = (service) => {
    switch (service.toLowerCase()) {
      case 'police': return '🚨';
      case 'fire': return '🔥';
      case 'medical': return '🚑';
      case 'disaster': return '🌪️';
      default: return '❓';
    }
  };

  if (loading) {
    return (
      <div className="report-status-container">
     
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading your complaints...</p>
        </div>
       
      </div>
    );
  }

  if (error) {
    return (
      <div className="report-status-container">
     
        <div className="error-container">
          <p className="error-message">{error}</p>
          <button onClick={() => window.location.reload()}>Try Again</button>
        </div>
       
      </div>
    );
  }

  return (
    <div className="report-status-container">
 
      <header className="status-header">
        <h1>Your Complaint Status</h1>
        <p>Track all your submitted emergency complaints</p>
      </header>

      <div className="status-tabs">
        <button 
          className={activeTab === 'all' ? 'active' : ''} 
          onClick={() => setActiveTab('all')}
        >
          All Complaints
        </button>
        <button 
          className={activeTab === 'police' ? 'active' : ''} 
          onClick={() => setActiveTab('police')}
        >
          Police
        </button>
        <button 
          className={activeTab === 'fire' ? 'active' : ''} 
          onClick={() => setActiveTab('fire')}
        >
          Fire
        </button>
        <button 
          className={activeTab === 'medical' ? 'active' : ''} 
          onClick={() => setActiveTab('medical')}
        >
          Medical
        </button>
        <button 
          className={activeTab === 'disaster' ? 'active' : ''} 
          onClick={() => setActiveTab('disaster')}
        >
          Disaster
        </button>
      </div>

      {filteredComplaints.length === 0 ? (
        <div className="no-complaints">
          <p>No complaints found for this category.</p>
          <Link to="/emergencyalert">
            <button className="submit-new-btn">Submit New Complaint</button>
          </Link>
        </div>
      ) : (
        <div className="complaints-list">
          {filteredComplaints.map((complaint) => (
            <div key={complaint.id} className="complaint-card">
              <div className="complaint-header">
                <span className="service-icon">{getServiceIcon(complaint.service)}</span>
                <h3>{complaint.service} Complaint</h3>
                <span 
                  className="status-badge" 
                  style={{ backgroundColor: getStatusColor(complaint.status) }}
                >
                  {complaint.status}
                </span>
              </div>
              
              <div className="complaint-details">
                <p><strong>Submitted:</strong> {formatDate(complaint.timestamp)}</p>
                <p><strong>Emergency Type:</strong> {complaint.emergencyType || 'N/A'}</p>
                <p><strong>Emergency Number:</strong> {complaint.emergencyNumber || 'N/A'}</p>
                <p><strong>Description:</strong> {complaint.description}</p>
                <p><strong>Location:</strong> {complaint.location?.address || 'Location not available'}</p>
                
                {complaint.imageUrl && (
                  <div className="complaint-image">
                    <p><strong>Attached Image:</strong></p>
                    <img 
                      src={complaint.imageUrl} 
                      alt="Complaint evidence" 
                      onClick={() => window.open(complaint.imageUrl, '_blank')}
                    />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="back-to-emergency">
        <Link to="/emergencyalert">
          <button className="back-btn">← Back to Emergency Page</button>
        </Link>
      </div>

    </div>
  );
};

export default ReportStatus;