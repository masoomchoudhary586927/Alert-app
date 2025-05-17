import React, { useState, useEffect } from 'react';
import { FiClock, FiUser, FiAlertTriangle, FiShield, FiTruck, FiActivity } from 'react-icons/fi';
import { MdLocalPolice, MdEmergency } from 'react-icons/md';

const NewsPge = () => {
  const [news, setNews] = useState([]);
  const [activeCategory, setActiveCategory] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Enhanced mock data with more details
  useEffect(() => {
   const mockNewsData = [
  {
    id: 1,
    title: 'Police Department Launches Community Outreach Program',
    content: 'The Metropolitan Police Department has initiated a new community policing program aimed at strengthening relationships between officers and residents.',
    category: 'police',
    date: '2023-06-15',
    author: 'Chief Robert Parker',
    priority: 'high',
    location: 'Downtown District',
    imageUrl: 'https://images.unsplash.com/photo-1586511925558-a4c6376fe65f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 2,
    title: 'Fire Brigade Contains Major Chemical Plant Fire',
    content: 'After 18 hours of continuous effort, firefighters brought under control a massive blaze at the Greenfield Chemical Plant.',
    category: 'firebrigade',
    date: '2023-06-14',
    author: 'Captain Emily Rodriguez',
    priority: 'critical',
    location: 'Industrial Zone',
    imageUrl: 'https://images.unsplash.com/photo-1631729371254-42c2892f0e6e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80'
  },
  {
    id: 3,
    title: 'EMS Introduces AI-Powered Dispatch System',
    content: 'The city ambulance service has implemented a new artificial intelligence system that reduces response times by 22%.',
    category: 'ambulance',
    date: '2023-06-12',
    author: 'Dr. Michael Chen',
    priority: 'medium',
    location: 'Citywide',
    imageUrl: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=600&q=80'
  },
  // Additional entries
  {
    id: 9,
    title: 'Coastal Rescue Team Saves 12 From Sinking Yacht',
    content: 'Helicopter rescue teams worked with coast guard vessels to evacuate passengers during a sudden storm.',
    category: 'rescue',
    date: '2023-05-28',
    author: 'Commander James Holt',
    priority: 'critical',
    location: 'Eastern Bay',
    imageUrl: 'https://images.unsplash.com/photo-1551524559-8af4e6624178'
  },
  {
    id: 10,
    title: 'New Earthquake Early Warning System Activated',
    content: 'The city now has 30-second advance warning capability for seismic events over 4.0 magnitude.',
    category: 'disaster',
    date: '2023-05-25',
    author: 'Seismologist Dr. Amy Zhou',
    priority: 'high',
    location: 'Metropolitan Area',
    imageUrl: 'https://images.unsplash.com/photo-1508511268-6341e1f28dfd'
  },
  {
    id: 11,
    title: 'Police K-9 Unit Receives New Trauma Kits',
    content: 'All police dogs now equipped with specialized medical packs for field emergencies.',
    category: 'police',
    date: '2023-05-22',
    author: 'Officer Dan Wilson',
    priority: 'low',
    location: 'K-9 Training Center',
    imageUrl: 'https://images.unsplash.com/photo-1583511655826-05700442b31b'
  },
  {
    id: 12,
    title: 'Wildfire Response Protocol Updated',
    content: 'New evacuation procedures implemented based on last season\'s fire analysis.',
    category: 'firebrigade',
    date: '2023-05-20',
    author: 'Wildfire Specialist Tom Burke',
    priority: 'high',
    location: 'Western Region',
    imageUrl: 'https://images.unsplash.com/photo-1516054575922-f0b8eeadec1a'
  },
  {
    id: 13,
    title: 'Ambulance Fleet Gets Electric Upgrade',
    content: 'First 10 zero-emission emergency vehicles enter service this month.',
    category: 'ambulance',
    date: '2023-05-18',
    author: 'Fleet Manager Lisa Tran',
    priority: 'medium',
    location: 'Central Garage',
    imageUrl: 'https://images.unsplash.com/photo-1631729371254-42c2892f0e6e'
  },
  {
    id: 14,
    title: 'Disaster Relief Warehouse Expanded',
    content: 'New facility can now store enough supplies for 50,000 people for two weeks.',
    category: 'disaster',
    date: '2023-05-15',
    author: 'Logistics Director Paul Rivers',
    priority: 'medium',
    location: 'Industrial Park',
    imageUrl: 'https://images.unsplash.com/photo-1584036561566-baf8f5f1b144'
  },
  {
    id: 15,
    title: 'Anti-Terrorism Drill Concludes',
    content: 'Multi-agency exercise simulated chemical attack in subway system.',
    category: 'public safety',
    date: '2023-05-12',
    author: 'Security Chief Maria Gomez',
    priority: 'high',
    location: 'Transport Hub',
    imageUrl: 'https://images.unsplash.com/photo-1582732970804-906e5d29d8f4'
  },
  {
    id: 16,
    title: 'New Police Helicopter Enters Service',
    content: 'State-of-the-art aircraft features thermal imaging and crowd monitoring systems.',
    category: 'police',
    date: '2023-05-10',
    author: 'Aviation Unit Lt. Chris Flynn',
    priority: 'medium',
    location: 'Air Operations Base',
    imageUrl: 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b'
  },
  {
    id: 17,
    title: 'Fire Investigation Lab Upgraded',
    content: 'New arson detection equipment can analyze samples 40% faster.',
    category: 'firebrigade',
    date: '2023-05-08',
    author: 'Fire Marshal Diane Clark',
    priority: 'low',
    location: 'Forensic Center',
    imageUrl: 'https://images.unsplash.com/photo-1573497491765-dccce02b29df'
  },
  {
    id: 18,
    title: 'EMS Pediatric Response Training',
    content: 'All paramedics completing specialized child emergency care certification.',
    category: 'ambulance',
    date: '2023-05-05',
    author: 'Training Officer Greg Simmons',
    priority: 'medium',
    location: 'Medical Academy',
    imageUrl: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e'
  },
  {
    id: 19,
    title: 'Tsunami Warning System Test Successful',
    content: 'Coastal alert sirens and mobile notifications worked at 98% effectiveness.',
    category: 'disaster',
    date: '2023-05-03',
    author: 'Oceanographer Dr. Ellen Park',
    priority: 'high',
    location: 'Coastal Areas',
    imageUrl: 'https://images.unsplash.com/photo-1508511268-6341e1f28dfd'
  },
  {
    id: 20,
    title: 'Cyberattack Response Plan Updated',
    content: 'New protocols for protecting emergency services IT infrastructure.',
    category: 'public safety',
    date: '2023-05-01',
    author: 'Cyber Security Director Raj Patel',
    priority: 'critical',
    location: 'Command Center',
    imageUrl: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b'
  },
  // Continuing with 30 more entries...
  {
    id: 21,
    title: 'Neighborhood Watch Program Expands',
    content: '200 new surveillance cameras installed in high-crime areas.',
    category: 'police',
    date: '2023-04-28',
    author: 'Community Liaison Officer Amy Wong',
    priority: 'medium',
    location: 'South District',
    imageUrl: 'https://images.unsplash.com/photo-1584036561566-baf8f5f1b144'
  },
  {
    id: 22,
    title: 'Firefighter Fitness Standards Revised',
    content: 'New physical requirements reflect modern firefighting challenges.',
    category: 'firebrigade',
    date: '2023-04-25',
    author: 'Training Captain Dave Wilson',
    priority: 'low',
    location: 'Training Academy',
    imageUrl: 'https://images.unsplash.com/photo-1544830332-7d41303e5d6c'
  },
  {
    id: 23,
    title: 'Ambulance Telemedicine Pilot Program',
    content: 'Paramedics can now consult with ER doctors via video during transport.',
    category: 'ambulance',
    date: '2023-04-22',
    author: 'Medical Director Sarah Lin',
    priority: 'high',
    location: 'Citywide',
    imageUrl: 'https://images.unsplash.com/photo-1579684385127-1ef15d508118'
  },
  // ... (continuing the pattern with more entries)
  {
    id: 50,
    title: 'Annual Emergency Services Awards',
    content: '25 officers, firefighters and paramedics honored for exceptional service.',
    category: 'public safety',
    date: '2023-03-01',
    author: 'Mayor Jessica Chen',
    priority: 'low',
    location: 'City Hall',
    imageUrl: 'https://images.unsplash.com/photo-1516054575922-f0b8eeadec1a'
  }
];

    setTimeout(() => {
      setNews(mockNewsData);
      setIsLoading(false);
    }, 1000);
  }, []);

  const filteredNews = news.filter(item => {
    const matchesCategory = activeCategory === 'all' || item.category === activeCategory;
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         item.content.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const categories = [
    { id: 'all', name: 'All News', icon: <FiActivity /> },
    { id: 'police', name: 'Police', icon: <MdLocalPolice /> },
    { id: 'firebrigade', name: 'Fire Brigade', icon: <FiAlertTriangle /> },
    { id: 'ambulance', name: 'Ambulance', icon: <MdEmergency /> },
    { id: 'disaster', name: 'Disaster', icon: <FiShield /> },
    { id: 'public safety', name: 'Public Safety', icon: <FiTruck /> }
  ];

  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'critical': return 'bg-red-500';
      case 'high': return 'bg-orange-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header with Search */}
      <header className="bg-gradient-to-r from-blue-800 to-blue-600 text-white py-12 px-4 shadow-md">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
            <div>
              <h1 className="text-3xl md:text-4xl text-white font-bold mb-2">Emergency Services News Hub</h1>
              <p className="text-blue-100 max-w-2xl">
                Real-time updates and announcements from police, fire, EMS, disaster response, and public safety teams
              </p>
            </div>
            <div className="w-full md:w-auto">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search news..."
                  className="w-full md:w-64 px-4 py-2 rounded-lg text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-300"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <svg
                  className="absolute right-3 top-2.5 h-5 w-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Category Filters */}
        <div className="mb-8 overflow-x-auto">
          <div className="flex space-x-2 pb-2">
            {categories.map(category => (
              <button
                key={category.id}
                className={`flex items-center px-4 py-2 rounded-full transition-all ${activeCategory === category.id ? 'bg-blue-600 text-white shadow-md' : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'}`}
                onClick={() => setActiveCategory(category.id)}
              >
                <span className="mr-2">{category.icon}</span>
                {category.name}
              </button>
            ))}
          </div>
        </div>

        {/* News Grid */}
        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredNews.length > 0 ? (
              filteredNews.map(item => (
                <div key={item.id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
                  <div className="relative">
                    <img 
                      src={item.imageUrl} 
                      alt={item.title} 
                      className="w-full h-48 object-cover"
                      loading="lazy"
                    />
                    <div className={`absolute top-4 left-4 px-3 py-1 rounded-full text-white text-sm font-semibold ${getPriorityColor(item.priority)}`}>
                      {item.priority.toUpperCase()}
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="flex justify-between items-center mb-2">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                        item.category === 'police' ? 'bg-blue-100 text-blue-800' :
                        item.category === 'firebrigade' ? 'bg-red-100 text-red-800' :
                        item.category === 'ambulance' ? 'bg-green-100 text-green-800' :
                        item.category === 'disaster' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-purple-100 text-purple-800'
                      }`}>
                        {item.category.toUpperCase()}
                      </span>
                      <span className="text-gray-500 text-sm flex items-center">
                        <FiClock className="mr-1" />
                        {formatDate(item.date)}
                      </span>
                    </div>
                    <h3 className="text-xl font-bold mb-3 text-gray-800">{item.title}</h3>
                    <p className="text-gray-600 mb-4 line-clamp-3">{item.content}</p>
                    <div className="flex justify-between items-center text-sm text-gray-500 border-t pt-3">
                      <div className="flex items-center">
                        <FiUser className="mr-1" />
                        <span>{item.author}</span>
                      </div>
                      <div>
                        <span className="flex items-center">
                          <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                            <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                          </svg>
                          {item.location}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-12">
                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="mt-2 text-lg font-medium text-gray-900">No news found</h3>
                <p className="mt-1 text-gray-500">Try adjusting your search or filter criteria</p>
              </div>
            )}
          </div>
        )}
      </main>

    </div>
  );
};

export default NewsPge;