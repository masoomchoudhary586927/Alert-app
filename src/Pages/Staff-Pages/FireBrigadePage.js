import React, { useEffect, useState, useCallback } from 'react';
import { 
  getFirestore, 
  collection, 
  getDocs, 
  doc, 
  updateDoc,
  onSnapshot,
  query,
  orderBy,
  where
} from 'firebase/firestore';
import { getAuth, onAuthStateChanged, signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { auth, app } from '../../firebase/firebase';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './FireBrigadePage.css';

// Constants for status values
const STATUS = {
  PENDING: 'pending',
  ACCEPTED: 'accepted',
  REJECTED: 'rejected',
  RESOLVED: 'resolved',
  IN_PROGRESS: 'in_progress'
};

const FireBrigadeDashboard = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [filter, setFilter] = useState('all');
  const navigate = useNavigate();
  const db = getFirestore(app);

  // Authentication state management
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser) {
        navigate('/login');
      } else {
        setUser(currentUser);
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  // Real-time complaints data fetching with filtering
  useEffect(() => {
    if (!user) return;

    let unsubscribe;
    setLoading(true);

    const fetchComplaints = async () => {
      try {
        let complaintsQuery = query(
          collection(db, 'fireComplaints'),
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
        console.error("Error setting up complaints listener:", error);
        toast.error('Failed to load complaints');
        setLoading(false);
      }
    };

    fetchComplaints();

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [db, user, filter]);

  // Status update handler
  const handleStatusUpdate = useCallback(async (id, status) => {
    try {
      const complaintRef = doc(db, 'fireComplaints', id);
      await updateDoc(complaintRef, { 
        status,
        updatedAt: new Date().toISOString(),
        handledBy: user?.email || 'unknown' 
      });
      
      toast.success(`Status updated to ${status}`);
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error('Failed to update status');
    }
  }, [db, user]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast.info('Logged out successfully');
      navigate('/login');
    } catch (error) {
      console.error("Logout error:", error);
      toast.error('Logout failed');
    }
  };

  const getStatusBadgeClass = (status) => {
    switch (status?.toLowerCase()) {
      case STATUS.ACCEPTED:
        return 'status-accepted';
      case STATUS.REJECTED:
        return 'status-rejected';
      case STATUS.RESOLVED:
        return 'status-resolved';
      case STATUS.IN_PROGRESS:
        return 'status-in-progress';
      default:
        return 'status-pending';
    }
  };

  const renderComplaintCard = (complaint) => (
    <div key={complaint.id} className="complaint-card">
      <div className="complaint-header">
        <div>
          <h3>Case #{complaint.id.slice(0, 8)}</h3>
          {complaint.timestamp && (
            <small>
              Reported on: {new Date(complaint.timestamp).toLocaleString()}
            </small>
          )}
        </div>
        <span className={`status-badge ${getStatusBadgeClass(complaint.status)}`}>
          {complaint.status ? complaint.status.replace('_', ' ') : STATUS.PENDING}
        </span>
      </div>

      <div className="complaint-body">
        {complaint.description && (
          <div className="complaint-field">
            <label>Description</label>
            <p>{complaint.description}</p>
          </div>
        )}

        <div className="complaint-details-grid">
          {complaint.emergencyNumber && (
            <div className="complaint-field">
              <label>Emergency Contact</label>
              <p>
                <a href={`tel:${complaint.emergencyNumber}`}>
                  {complaint.emergencyNumber}
                </a>
              </p>
            </div>
          )}

          {complaint.location?.address && (
            <div className="complaint-field">
              <label>Location</label>
              <p>
                {complaint.location.address}
                {complaint.location.latitude && complaint.location.longitude && (
                  <span className="coordinates">
                    ({complaint.location.latitude.toFixed(4)}, {complaint.location.longitude.toFixed(4)})
                  </span>
                )}
              </p>
            </div>
          )}
        </div>

        {complaint.imageUrl && (
          <div className="complaint-field">
            <label>Evidence</label>
            <div className="evidence-container">
              <img 
                src={complaint.imageUrl} 
                alt="Fire complaint evidence" 
                className="evidence-image"
                onError={(e) => e.target.style.display = 'none'}
              />
            </div>
          </div>
        )}

        {complaint.fireType && (
          <div className="complaint-field">
            <label>Fire Type</label>
            <p>{complaint.fireType}</p>
          </div>
        )}

        {complaint.severity && (
          <div className="complaint-field">
            <label>Severity Level</label>
            <p className={`severity-${complaint.severity.toLowerCase()}`}>
              {complaint.severity}
            </p>
          </div>
        )}
      </div>

      <div className="action-buttons">
        <button 
          onClick={() => handleStatusUpdate(complaint.id, STATUS.ACCEPTED)}
          disabled={complaint.status === STATUS.ACCEPTED}
          className="btn-accept"
        >
          Accept
        </button>
        <button 
          onClick={() => handleStatusUpdate(complaint.id, STATUS.IN_PROGRESS)}
          disabled={complaint.status === STATUS.IN_PROGRESS}
          className="btn-progress"
        >
          In Progress
        </button>
        <button 
          onClick={() => handleStatusUpdate(complaint.id, STATUS.RESOLVED)}
          disabled={complaint.status === STATUS.RESOLVED}
          className="btn-resolve"
        >
          Resolve
        </button>
        <button 
          onClick={() => handleStatusUpdate(complaint.id, STATUS.REJECTED)}
          disabled={complaint.status === STATUS.REJECTED}
          className="btn-reject"
        >
          Reject
        </button>
      </div>
    </div>
  );

  return (
    <div className="fire-dashboard">
      <header className="dashboard-header">
        <div className="header-content">
          <h1>Fire Brigade Complaints Dashboard</h1>
          <div className="user-controls">
            {user && (
              <span className="user-email">{user.email}</span>
            )}
            <button onClick={handleLogout} className="logout-btn">
              Logout
            </button>
          </div>
        </div>
        
        <div className="filters">
          <button 
            className={filter === 'all' ? 'active' : ''}
            onClick={() => setFilter('all')}
          >
            All Cases
          </button>
          <button 
            className={filter === STATUS.PENDING ? 'active' : ''}
            onClick={() => setFilter(STATUS.PENDING)}
          >
            Pending
          </button>
          <button 
            className={filter === STATUS.ACCEPTED ? 'active' : ''}
            onClick={() => setFilter(STATUS.ACCEPTED)}
          >
            Accepted
          </button>
          <button 
            className={filter === STATUS.IN_PROGRESS ? 'active' : ''}
            onClick={() => setFilter(STATUS.IN_PROGRESS)}
          >
            In Progress
          </button>
          <button 
            className={filter === STATUS.RESOLVED ? 'active' : ''}
            onClick={() => setFilter(STATUS.RESOLVED)}
          >
            Resolved
          </button>
        </div>
      </header>

      <main className="dashboard-content">
        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading fire complaints...</p>
          </div>
        ) : complaints.length === 0 ? (
          <div className="empty-state">
            <img src="/no-complaints.svg" alt="No complaints" />
            <h3>No fire complaints found</h3>
            <p>There are currently no {filter !== 'all' ? filter.replace('_', ' ') : ''} complaints</p>
          </div>
        ) : (
          <div className="complaints-grid">
            {complaints.map(renderComplaintCard)}
          </div>
        )}
      </main>
    </div>
  );
};

export default FireBrigadeDashboard;