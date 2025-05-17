import React, { useState, useEffect, useCallback } from 'react';
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  doc,
  updateDoc
} from 'firebase/firestore';
import { db, auth } from '../../firebase/firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import './AmbulancePage.css';

const STATUS = {
  PENDING: 'pending',
  DISPATCHED: 'dispatched',
  ON_ROUTE: 'on_route',
  COMPLETED: 'completed',
};

const getStatusBadgeClass = (status) => {
  switch (status?.toLowerCase()) {
    case STATUS.DISPATCHED:
      return 'status-dispatched';
    case STATUS.ON_ROUTE:
      return 'status-on-route';
    case STATUS.COMPLETED:
      return 'status-completed';
    default:
      return 'status-pending';
  }
};

const AmbulancePage = () => {
  const [user] = useAuthState(auth);
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;

    let unsubscribe;
    setLoading(true);

    const fetchComplaints = async () => {
      try {
        let complaintsQuery = query(
          collection(db, 'medicalComplaints'),
          orderBy('timestamp', 'desc')
        );

        if (filter !== 'all') {
          complaintsQuery = query(
            complaintsQuery,
            where('status', '==', filter)
          );
        }

        unsubscribe = onSnapshot(complaintsQuery, (snapshot) => {
          const complaintsData = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }));
          setComplaints(complaintsData);
          setLoading(false);
        });

      } catch (error) {
        console.error("Error fetching complaints:", error);
        toast.error('Failed to load medical complaints');
        setLoading(false);
      }
    };

    fetchComplaints();
    return () => unsubscribe && unsubscribe();
  }, [user, filter]);

  const handleStatusUpdate = useCallback(async (id, status) => {
    try {
      const complaintRef = doc(db, 'medicalComplaints', id);
      await updateDoc(complaintRef, {
        status,
        updatedAt: new Date().toISOString(),
        handledBy: user?.email || 'unknown'
      });
      toast.success(`Status updated to ${status.replace('_', ' ')}`);
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error('Failed to update status');
    }
  }, [user]);

  const handleLogout = () => {
    auth.signOut().then(() => {
      navigate('/login');
    });
  };

  return (
    <div className="ambulance-page">
      <header className="dashboard-header">
        <div className="header-content">
          <h1>🚑 Ambulance Emergency Dashboard</h1>
          <div className="user-controls">
            {user && <span className="user-email">{user.email}</span>}
            <button onClick={handleLogout} className="logout-btn">Logout</button>
          </div>
        </div>
        <div className="filters">
          {['all', STATUS.PENDING, STATUS.DISPATCHED, STATUS.ON_ROUTE, STATUS.COMPLETED].map(stat => (
            <button
              key={stat}
              className={filter === stat ? 'active' : ''}
              onClick={() => setFilter(stat)}
            >
              {stat === 'all' ? 'All' : stat.replace('_', ' ').toUpperCase()}
            </button>
          ))}
        </div>
      </header>

      <main className="complaints-list">
        {loading ? (
          <p className="loading">Loading complaints...</p>
        ) : complaints.length === 0 ? (
          <p className="no-data">No complaints found.</p>
        ) : (
          complaints.map(complaint => (
            <div key={complaint.id} className="complaint-card">
              <div className="complaint-header">
                <h3>Case ID: {complaint.id.slice(0, 8).toUpperCase()}</h3>
                <span className={`status-badge ${getStatusBadgeClass(complaint.status)}`}>
                  {complaint.status?.replace('_', ' ') || STATUS.PENDING}
                </span>
              </div>

              <div className="complaint-body">
                {complaint.description && (
                  <div className="complaint-field">
                    <label>Emergency Description</label>
                    <p>{complaint.description}</p>
                  </div>
                )}
                {complaint.emergencyNumber && (
                  <div className="complaint-field">
                    <label>Contact Number</label>
                    <p>
                      <a href={`tel:${complaint.emergencyNumber}`}>
                        {complaint.emergencyNumber}
                      </a>
                    </p>
                  </div>
                )}
                {complaint.patientCondition && (
                  <div className="complaint-field">
                    <label>Patient Condition</label>
                    <p>{complaint.patientCondition}</p>
                  </div>
                )}
                {complaint.location && (
                  <div className="complaint-field">
                    <label>Emergency Location</label>
                    <p>
                      {complaint.location.address || 'No address'}
                      {complaint.location.latitude && complaint.location.longitude && (
                        <span className="coordinates">
                          ({complaint.location.latitude.toFixed(4)}, {complaint.location.longitude.toFixed(4)})
                        </span>
                      )}
                    </p>
                    {complaint.location.service && (
                      <p><strong>Service:</strong> {complaint.location.service}</p>
                    )}
                  </div>
                )}
                {complaint.imageUrl && (
                  <div className="complaint-field">
                    <label>Reference Image</label>
                    <img
                      src={complaint.imageUrl}
                      alt="Reference"
                      className="evidence-image"
                      onError={(e) => (e.target.style.display = 'none')}
                    />
                  </div>
                )}
              </div>

              <div className="action-buttons">
                <button
                  onClick={() => handleStatusUpdate(complaint.id, STATUS.DISPATCHED)}
                  disabled={complaint.status === STATUS.DISPATCHED}
                  className="dispatch-btn"
                >
                  Dispatch Ambulance
                </button>
                <button
                  onClick={() => handleStatusUpdate(complaint.id, STATUS.ON_ROUTE)}
                  disabled={complaint.status === STATUS.ON_ROUTE}
                  className="enroute-btn"
                >
                  Ambulance En Route
                </button>
                <button
                  onClick={() => handleStatusUpdate(complaint.id, STATUS.COMPLETED)}
                  disabled={complaint.status === STATUS.COMPLETED}
                  className="complete-btn"
                >
                  Mark Completed
                </button>
              </div>
            </div>
          ))
        )}
      </main>
    </div>
  );
};

export default AmbulancePage;
