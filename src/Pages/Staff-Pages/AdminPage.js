import React, { useEffect, useState } from 'react';
import { getFirestore, collection, getDocs } from 'firebase/firestore';
import { app, auth } from '../../firebase/firebase';
import { signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, 
  ResponsiveContainer, LineChart, Line, CartesianGrid
} from 'recharts';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [data, setData] = useState({
    police: [],
    ambulance: [],
    fire: [],
    disaster: [],
  });
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    type: 'all',
    status: 'all',
    fromDate: '',
    toDate: ''
  });

  const navigate = useNavigate();
  const db = getFirestore(app);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch complaints data
      const collections = {
        police: 'policeComplaints',
        ambulance: 'medicalComplaints',
        fire: 'fireComplaints',
        disaster: 'disasterComplaints',
      };

      const result = {};
      for (const key in collections) {
        const snapshot = await getDocs(collection(db, collections[key]));
        result[key] = snapshot.docs.map(doc => ({ 
          id: doc.id, 
          ...doc.data(),
          type: key // Add type to each complaint
        }));
      }
      setData(result);

      // Fetch users from Firestore
      const usersSnapshot = await getDocs(collection(db, 'users'));
      const usersData = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setUsers(usersData);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/login');
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const applyFilters = () => {
    // Filters will be applied when rendering complaints
    setActiveTab('complaints');
  };

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];
  const STATUS_COLORS = {
    pending: '#FFBB28',
    'in-progress': '#0088FE',
    resolved: '#00C49F'
  };

  // Prepare data for charts
  const complaintSummary = [
    { name: 'Police', value: data.police.length },
    { name: 'Ambulance', value: data.ambulance.length },
    { name: 'Fire Brigade', value: data.fire.length },
    { name: 'Disaster', value: data.disaster.length },
  ];

  // New: Complaint status distribution chart data
  const statusDistributionData = [
    { name: 'Pending', value: Object.values(data).flat().filter(c => !c.status || c.status === 'pending').length },
    { name: 'In Progress', value: Object.values(data).flat().filter(c => c.status === 'in-progress').length },
    { name: 'Resolved', value: Object.values(data).flat().filter(c => c.status === 'resolved').length },
  ];

  // New: Complaints over time chart data
  const complaintsOverTimeData = () => {
    const allComplaints = Object.values(data).flat();
    const complaintsByDate = {};
    
    allComplaints.forEach(complaint => {
      if (complaint.timestamp) {
        const date = new Date(complaint.timestamp.seconds * 1000).toLocaleDateString();
        complaintsByDate[date] = (complaintsByDate[date] || 0) + 1;
      }
    });
    
    return Object.entries(complaintsByDate).map(([date, count]) => ({
      date,
      complaints: count
    })).sort((a, b) => new Date(a.date) - new Date(b.date));
  };

  const statusCounts = (complaints) => {
    return complaints.reduce((acc, curr) => {
      const status = curr.status || 'pending';
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {});
  };

  const filteredUsers = users.filter(user => 
    user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.uid?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Filter complaints based on selected filters
  const filteredComplaints = () => {
    let allComplaints = Object.values(data).flat();
    
    if (filters.type !== 'all') {
      allComplaints = allComplaints.filter(c => c.type === filters.type);
    }
    
    if (filters.status !== 'all') {
      allComplaints = allComplaints.filter(c => 
        (filters.status === 'pending' && (!c.status || c.status === 'pending')) ||
        c.status === filters.status
      );
    }
    
    if (filters.fromDate) {
      const fromDate = new Date(filters.fromDate);
      allComplaints = allComplaints.filter(c => 
        c.timestamp && new Date(c.timestamp.seconds * 1000) >= fromDate
      );
    }
    
    if (filters.toDate) {
      const toDate = new Date(filters.toDate);
      allComplaints = allComplaints.filter(c => 
        c.timestamp && new Date(c.timestamp.seconds * 1000) <= toDate
      );
    }
    
    return allComplaints;
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading dashboard data...</p>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <header className="dashboard-header">
        <div className="header-content">
          <h1>Emergency Response Admin Dashboard</h1>
          <div className="header-actions">
            <button className="refresh-btn" onClick={fetchData}>
              Refresh Data
            </button>
            <button className="logout-btn" onClick={handleLogout}>
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="dashboard-nav">
        <button 
          className={`nav-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => setActiveTab('dashboard')}
        >
          Dashboard
        </button>
        <button 
          className={`nav-btn ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          User Management
        </button>
        <button 
          className={`nav-btn ${activeTab === 'complaints' ? 'active' : ''}`}
          onClick={() => setActiveTab('complaints')}
        >
          All Complaints
        </button>
      </div>

      <div className="dashboard-content">
        {activeTab === 'dashboard' && (
          <>
            {/* Summary Cards */}
            <div className="summary-cards">
              <div className="summary-card total-complaints">
                <h3>Total Complaints</h3>
                <p>{complaintSummary.reduce((sum, item) => sum + item.value, 0)}</p>
              </div>
              <div className="summary-card active-complaints">
                <h3>Active Complaints</h3>
                <p>{Object.values(data).flat().filter(c => !c.status || c.status === 'pending').length}</p>
              </div>
              <div className="summary-card in-progress-complaints">
                <h3>In Progress</h3>
                <p>{Object.values(data).flat().filter(c => c.status === 'in-progress').length}</p>
              </div>
              <div className="summary-card resolved-complaints">
                <h3>Resolved Complaints</h3>
                <p>{Object.values(data).flat().filter(c => c.status === 'resolved').length}</p>
              </div>
            </div>

            {/* Charts Section */}
            <div className="charts-section">
              <div className="chart-container">
                <h2>Complaint Distribution by Type</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={complaintSummary}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {complaintSummary.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value} complaints`, 'Count']} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="chart-container">
                <h2>Complaint Status Distribution</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={statusDistributionData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" name="Complaints">
                      {statusDistributionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={STATUS_COLORS[entry.name.toLowerCase()]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="chart-container wide-chart">
                <h2>Complaints Over Time</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={complaintsOverTimeData()}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Line 
                      type="monotone" 
                      dataKey="complaints" 
                      name="Complaints" 
                      stroke="#8884d8" 
                      activeDot={{ r: 8 }} 
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Recent Complaints Section */}
            <div className="recent-complaints">
              <h2>Recent Complaints</h2>
              <div className="complaints-grid">
                {Object.values(data)
                  .flat()
                  .sort((a, b) => b.timestamp?.seconds - a.timestamp?.seconds)
                  .slice(0, 6)
                  .map(c => (
                    <div key={c.id} className="complaint-card">
                      <div className="card-header">
                        <span className="complaint-id">#{c.id.slice(0, 8)}</span>
                        <span className="complaint-type">{c.type}</span>
                        <span className={`status-badge ${c.status || 'pending'}`}>
                          {c.status || 'Pending'}
                        </span>
                      </div>
                      <div className="card-body">
                        <h4>{c.title || 'No Title'}</h4>
                        <p className="description">{c.description || 'No description provided'}</p>
                        {c.timestamp && (
                          <p className="timestamp">
                            <i className="far fa-clock"></i> {new Date(c.timestamp.seconds * 1000).toLocaleString()}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </>
        )}

        {activeTab === 'users' && (
          <div className="users-management">
            <div className="users-header">
              <h2>User Management</h2>
              <div className="search-box">
                <input
                  type="text"
                  placeholder="Search by email, name, or UID"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>

            <div className="users-table-container">
              <table className="users-table">
                <thead>
                  <tr>
                    <th>Email</th>
                    <th>Name</th>
                    <th>Role</th>
                    <th>Last Active</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map(user => (
                    <tr key={user.uid}>
                      <td>{user.email}</td>
                      <td>{user.name || 'N/A'}</td>
                      <td>
                        <span className={`role-badge ${user.role}`}>
                          {user.role || 'user'}
                        </span>
                      </td>
                      <td>{user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString() : 'Never'}</td>
                      <td>
                        <button className="action-btn edit-btn">Edit</button>
                        <button className="action-btn delete-btn">Delete</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredUsers.length === 0 && (
                <div className="no-results">
                  No users found matching your search criteria
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'complaints' && (
          <div className="all-complaints">
            <div className="complaints-header">
              <h2>All Complaints</h2>
              <div className="complaints-filters">
                <select 
                  name="type" 
                  value={filters.type} 
                  onChange={handleFilterChange}
                >
                  <option value="all">All Types</option>
                  <option value="police">Police</option>
                  <option value="ambulance">Ambulance</option>
                  <option value="fire">Fire</option>
                  <option value="disaster">Disaster</option>
                </select>

                <select 
                  name="status" 
                  value={filters.status} 
                  onChange={handleFilterChange}
                >
                  <option value="all">All Statuses</option>
                  <option value="pending">Pending</option>
                  <option value="in-progress">In Progress</option>
                  <option value="resolved">Resolved</option>
                </select>

                <input 
                  type="date" 
                  name="fromDate" 
                  value={filters.fromDate}
                  onChange={handleFilterChange}
                  placeholder="From date"
                />

                <input 
                  type="date" 
                  name="toDate" 
                  value={filters.toDate}
                  onChange={handleFilterChange}
                  placeholder="To date"
                />

                <button className="apply-filters" onClick={applyFilters}>
                  Apply Filters
                </button>
              </div>
            </div>

            <div className="filter-results">
              <p>Showing {filteredComplaints().length} complaints matching your filters</p>
            </div>

            <div className="complaints-list">
              {filteredComplaints().length > 0 ? (
                <div className="complaints-grid-full">
                  {filteredComplaints()
                    .sort((a, b) => b.timestamp?.seconds - a.timestamp?.seconds)
                    .map(c => (
                      <div key={c.id} className="complaint-card-full">
                        <div className="card-header">
                          <span className="complaint-id">#{c.id.slice(0, 8)}</span>
                          <span className="complaint-type">{c.type}</span>
                          <span className={`status-badge ${c.status || 'pending'}`}>
                            {c.status || 'Pending'}
                          </span>
                        </div>
                        <div className="card-body">
                          <h4>{c.title || 'No Title'}</h4>
                          <p className="description">{c.description || 'No description provided'}</p>
                          {c.location && (
                            <p className="location">
                              <i className="fas fa-map-marker-alt"></i> {c.location.address || 'Location not specified'}
                            </p>
                          )}
                          {c.timestamp && (
                            <p className="timestamp">
                              <i className="far fa-clock"></i> {new Date(c.timestamp.seconds * 1000).toLocaleString()}
                            </p>
                          )}
                        </div>
                        <div className="card-actions">
                          <button className="action-btn view-btn">View Details</button>
                          <button className="action-btn assign-btn">Assign</button>
                          {c.status !== 'resolved' && (
                            <button className="action-btn resolve-btn">Mark Resolved</button>
                          )}
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                <div className="no-complaints">
                  <p>No complaints found matching your filters</p>
                  <button 
                    className="clear-filters-btn"
                    onClick={() => setFilters({
                      type: 'all',
                      status: 'all',
                      fromDate: '',
                      toDate: ''
                    })}
                  >
                    Clear Filters
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;