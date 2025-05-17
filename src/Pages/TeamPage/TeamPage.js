import React from 'react';
import { FaLinkedin, FaTwitter, FaEnvelope, FaPhone, FaServer, FaDatabase, FaMobile, FaShieldAlt } from 'react-icons/fa';
import { DiMongodb, DiReact, DiNodejs, DiFirebase } from 'react-icons/di';

const TeamPage = () => {
  const teamMembers = [
    {
      id: 1,
      name: 'Masoom Choudhary',
      role: 'Full Stack Developer',
      bio: 'Full Stack Developer skilled in building responsive web applications using React, Node.js, and MongoDB. Passionate about clean code, user experience, and scalable backend systems. Always eager to learn and innovate in fast-paced development environments.',
      image: "https://res.cloudinary.com/drfnb7ltd/image/upload/v1747502444/e7cxplotexlgpfnujb8x.jpg",
      social: {
        linkedin: 'https://www.linkedin.com/in/masoom-choudhary-9776a3333/',
        twitter: '#',
        email: 'masoomchoudhary4124@gmail.com',
        phone: '917415360209'
      },

      technologies: [
        { name: 'React', icon: <DiReact className="text-blue-500" /> },
        { name: 'Node.js', icon: <DiNodejs className="text-green-500" /> },
        { name: 'Firebase', icon: <DiFirebase className="text-orange-500" /> },
         { name: 'Express', icon: <FaServer className="text-gray-500" /> },
        { name: 'Firebase', icon: <DiFirebase className="text-orange-500" /> }
      ]
    },
    {
      id: 2,
      name: 'Siddhesh Joshi',
      role: 'UI and Frontend Develeoper',
      bio: 'UI and Frontend Developer passionate about crafting intuitive, responsive, and visually appealing user interfaces using React, HTML, CSS, and JavaScript. Dedicated to enhancing user experience through clean design and modern web technologies.',
      image: 'https://res.cloudinary.com/drfnb7ltd/image/upload/v1747502652/xgmmq2jplbkcdbwugh75.jpg',
      social: {
        linkedin: 'https://www.linkedin.com/in/siddhesh-joshi-2936b8313?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app',
        twitter: '#',
        email: 'Siddheshjoshi@gmail.com',
        phone: '916264346578'
      },
    
      technologies: [
        { name: 'MongoDB', icon: <DiMongodb className="text-green-600" /> },
        { name: 'React' , icon: <DiReact className="text-blue-500" />},
        { name: 'React Native', icon: <FaMobile className="text-blue-400" /> },
       
      ]
    },
    {
      id: 3,
      name: 'Shruti Trivedi',
      role: 'Frontend Developer',
      bio: 'Frontend Developer skilled in building fast, responsive, and user-friendly web applications using React, JavaScript, HTML, and CSS. Passionate about clean code, seamless user experiences, and modern UI design.',
      image: 'https://res.cloudinary.com/drfnb7ltd/image/upload/v1747502634/e3owbyslz4pxo3csnaum.jpg',
      social: {
        linkedin: 'https://www.linkedin.com/in/shruti-trivedi-90b202260?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app',
        twitter: '#',
        email: 'shrutitrivedi@gmail.com',
        phone: '919406622559'
      },
     
      technologies: [
        { name: 'React' , icon: <DiReact className="text-blue-500" />},
        { name: 'React Native', icon: <FaMobile className="text-blue-400" /> },
      ]
    },
    {
      id: 4,
      name: 'Sourabh Mishar',
      role: 'Backend Developer',
      bio: 'Backend Developer focused on building robust, scalable, and secure server-side applications using Node.js, Express, and MongoDB. Experienced in REST APIs, database design, and cloud integration to power seamless user experiences.',
      image: 'https://res.cloudinary.com/drfnb7ltd/image/upload/v1747502670/par2lxupmgywal8blo5j.jpg',
      social: {
        linkedin: 'https://www.linkedin.com/in/sourabh-mishra-76375725b?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app',
        twitter: '#',
        email: 'sourabhmishra@gmail.com',
        phone: '919039788522'
      },
      
      technologies: [
        { name: 'React', icon: <DiReact className="text-blue-500" /> },
        { name: 'Firebase', icon: <DiFirebase className="text-orange-500" /> },
        { name: 'Security', icon: <FaShieldAlt className="text-yellow-500" /> }
      ]
    }
  ];

  const technologiesUsed = [
    { name: 'MongoDB', icon: <DiMongodb size={40} className="text-green-600" />, description: 'NoSQL database for flexible data storage' },
    { name: 'Express', icon: <FaServer size={40} className="text-gray-500" />, description: 'Backend framework for building APIs' },
    { name: 'React', icon: <DiReact size={40} className="text-blue-500" />, description: 'Frontend library for building user interfaces' },
    { name: 'Node.js', icon: <DiNodejs size={40} className="text-green-500" />, description: 'JavaScript runtime for server-side development' },
    { name: 'Firebase', icon: <DiFirebase size={40} className="text-orange-500" />, description: 'Platform for realtime database and authentication' },
    { name: 'React Native', icon: <FaMobile size={40} className="text-blue-400" />, description: 'Framework for building mobile applications' }
  ];

  return (
    <div className="team-page bg-gray-50 py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Team Introduction */}
        <div className="text-center mb-16">
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            Public Safety Leadership Team
          </h2>
          <p className="mt-4 text-xl text-gray-600 max-w-3xl mx-auto">
            Our cross-functional team combines decades of emergency service experience with cutting-edge technology solutions to keep our community safe.
          </p>
        </div>

        {/* Team Members Grid */}
        <div className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-4">
          {teamMembers.map((member) => (
            <div 
              key={member.id}
              className="bg-white rounded-lg shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-2"
            >
              <div className="aspect-w-3 aspect-h-2">
                <img 
                  className="object-cover h-64 w-full"
                  src={member.image} 
                  alt={member.name}
                  loading="lazy"
                />
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900">{member.name}</h3>
                <p className="text-indigo-600 font-medium mt-1">{member.role}</p>
                <p className="mt-4 text-gray-600">{member.bio}</p>
                
                {/* Projects Section */}
               
                {/* Technologies Section */}
                <div className="mt-6">
                  <h4 className="font-semibold text-gray-800">Technologies:</h4>
                  <div className="mt-2 flex space-x-3">
                    {member.technologies.map((tech, index) => (
                      <div key={index} className="flex flex-col items-center">
                        <div className="text-2xl">{tech.icon}</div>
                        <span className="text-xs text-gray-500 mt-1">{tech.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
                
                {/* Social Links */}
                <div className="mt-6 flex space-x-4">
                  <a 
                    href={member.social.linkedin} 
                    className="text-gray-400 hover:text-indigo-600"
                    aria-label={`${member.name} LinkedIn`}
                  >
                    <FaLinkedin className="h-5 w-5" />
                  </a>
                  <a 
                    href={member.social.twitter} 
                    className="text-gray-400 hover:text-indigo-600"
                    aria-label={`${member.name} Twitter`}
                  >
                    <FaTwitter className="h-5 w-5" />
                  </a>
                  <a 
                    href={`mailto:${member.social.email}`} 
                    className="text-gray-400 hover:text-indigo-600"
                    aria-label={`Email ${member.name}`}
                  >
                    <FaEnvelope className="h-5 w-5" />
                  </a>
                  <a 
                    href={`tel:${member.social.phone}`} 
                    className="text-gray-400 hover:text-indigo-600"
                    aria-label={`Call ${member.name}`}
                  >
                    <FaPhone className="h-5 w-5" />
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Technology Stack Section */}
        <div className="mt-24">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              Our Technology Stack
            </h2>
            <p className="mt-4 text-xl text-gray-600 max-w-3xl mx-auto">
              We leverage modern technologies including the MERN stack and Firebase to build robust public safety solutions
            </p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
            {technologiesUsed.map((tech, index) => (
              <div 
                key={index}
                className="bg-white p-6 rounded-lg shadow-md text-center hover:shadow-lg transition-shadow"
              >
                <div className="flex justify-center">
                  {tech.icon}
                </div>
                <h3 className="mt-4 text-lg font-medium text-gray-900">{tech.name}</h3>
                <p className="mt-2 text-sm text-gray-500">{tech.description}</p>
              </div>
            ))}
          </div>
        </div>

    
      </div>
    </div>
  );
};

export default TeamPage;