import React, { useState } from 'react';
import { FaSearch, FaUser } from 'react-icons/fa';

const domainSections = [
  {
    title: "Event Management (EM)",
    id: "em",
    members: [
      { name: "Akshad Ajay Gajapure", role: "Head", branch: "Chem" },
      { name: "Anish Gupta", role: "Head", branch: "Mining" },
      { name: "Deepanshu Sahu", role: "Head", branch: "IT" },
      { name: "Gaurav Kumar", role: "Head", branch: "Civil" },
      { name: "Lishanshu Dewangan", role: "Head", branch: "Mining" },
      { name: "Ashika Jain", role: "Core", branch: "EE" },
      { name: "Atharv Singh", role: "Core", branch: "Mining" },
      { name: "Bangarugari Ramya", role: "Core", branch: "Mining" },
      { name: "Deepak Sahu", role: "Core", branch: "Biotech" },
      { name: "Lakshya Bhadoriya", role: "Core", branch: "Chem" },
      { name: "M Vishwanath", role: "Core", branch: "IT" },
      { name: "Mohini Vastarakar", role: "Core", branch: "Mech" },
      { name: "Pawni Agrawal", role: "Core", branch: "Meta" },
      { name: "Polepally Hasini", role: "Core", branch: "EE" },
      { name: "Puran Nath Bhargav", role: "Core", branch: "Meta" },
      { name: "Sahil Sahu", role: "Core", branch: "Meta" },
      { name: "Samiksha Sahu", role: "Core", branch: "EE" },
      { name: "Thrisha Cheepurupalli", role: "Core", branch: "Chem" },
      { name: "Ananya Mondal", role: "Mentor", branch: "Chem" },
      { name: "Ashish Bhaskar", role: "Mentor", branch: "Meta" },
      { name: "Astha Keshariya", role: "Mentor", branch: "ECE" },
      { name: "Bhoomi Chhablani", role: "Mentor", branch: "IT" },
      { name: "Devisha Sahu", role: "Mentor", branch: "Meta" },
      { name: "Dharavath Rajeshwari", role: "Mentor", branch: "Chem" },
      { name: "Dungar Ram", role: "Mentor", branch: "Chem" },
      { name: "Kumari Deepsikha", role: "Mentor", branch: "IT" },
      { name: "Prem Biswas", role: "Mentor", branch: "Chem" },
      { name: "Rahul Kannaojiya", role: "Mentor", branch: "Chem" },
      { name: "Rishabh Shukla", role: "Mentor", branch: "Mining" },
      { name: "Rishabh Shukla", role: "Mentor", branch: "EE" },
      { name: "Rishabh Shukla", role: "Mentor", branch: "CSE" },
      { name: "Rishabh Shukla", role: "Mentor", branch: "CSE" },
      { name: "Rishabh Shukla", role: "Mentor", branch: "Mining" },
      { name: "Rishabh Shukla", role: "Mentor", branch: "Mining" },
      { name: "Rishabh Shukla", role: "Mentor", branch: "Chem" },
    ]
  },
  {
    title: "Public Relations (PR)",
    id: "pr",
    members: [
      { name: "Ankita Singh", role: "Head", branch: "Chem" },
      { name: "Avik Mandal", role: "Head", branch: "Chem" },
      { name: "Sarita Patel", role: "Head", branch: "Mining" },
      { name: "Tejas Shriramwar", role: "Head", branch: "Chem" },
      { name: "Aditya Upadhyay", role: "Core", branch: "EE" },
      { name: "Arif Ansari", role: "Core", branch: "Chem" },
      { name: "Arpit Jaiswal", role: "Core", branch: "EE" },
      { name: "Baby Afrida", role: "Core", branch: "Meta" },
      { name: "Lucky Singh", role: "Core", branch: "Chem" },
      { name: "Nupur Deshmukh", role: "Core", branch: "Chem" },
      { name: "Prabhat Pathak", role: "Core", branch: "Chem" },
      { name: "Prem Kshirsagar", role: "Core", branch: "Chem" },
      { name: "Saurav Kumar", role: "Core", branch: "Civil" },
      { name: "Shivang Vaidya", role: "Core", branch: "Chem" },
      { name: "Soham Wankhade", role: "Core", branch: "EE" },
      { name: "Suryansh Singh", role: "Core", branch: "ECE" },
      { name: "Alok Pandey", role: "Mentor", branch: "Civil" },
      { name: "Arpit", role: "Mentor", branch: "Mining" },
      { name: "Dhruv Sharma", role: "Mentor", branch: "Chem" },
      { name: "Honey Poptani", role: "Mentor", branch: "BioMed" },
      { name: "Lekhank Chandrakar", role: "Mentor", branch: "Biotech" },
      { name: "Mayank Kumar Sahu", role: "Mentor", branch: "CSE" },
      { name: "Mayas Maithil", role: "Mentor", branch: "CSE" },
      { name: "Nidhi Kumri", role: "Mentor", branch: "Meta" },
      { name: "Nihal Nayak", role: "Mentor", branch: "Chem" },
      { name: "Om Shrivastava", role: "Mentor", branch: "Chem" },
      { name: "Rohnit Sinha", role: "Mentor", branch: "Meta" },
      { name: "Tejas Chandrakar", role: "Mentor", branch: "Civil" },
      { name: "Vidhi Homshankar Katre", role: "Mentor", branch: "CSE" },
      { name: "Vishnu Gurar", role: "Mentor", branch: "Chem" },
      { name: "Aman Patel", role: "Mentor", branch: "Meta" },
    ]
  },
  {
    title: "Design Team",
    id: "design",
    members: [
      { name: "Arpita Hira", role: "Head", branch: "Mech" },
      { name: "MD Shahid Alam", role: "Head", branch: "Civil" },
      { name: "Aditya Kumar", role: "Core", branch: "Civil" },
      { name: "Ayush Kumar Ram", role: "Core", branch: "CSE" },
      { name: "Babita Khutey", role: "Core", branch: "ECE" },
      { name: "Dova Sathvika", role: "Core", branch: "IT" },
      { name: "Shubham Kumar", role: "Core", branch: "Mining" },
      { name: "Amit Kumawat", role: "Mentor", branch: "Civil" },
      { name: "Jyoti Rajput", role: "Mentor", branch: "Chem" },
      { name: "Mahi Swarnkar", role: "Mentor", branch: "BioMed" },
      { name: "Rupesh Kumar K", role: "Mentor", branch: "Chem" },
      { name: "Sahil Sinha", role: "Mentor", branch: "Meta" },
      { name: "Sweta Kumari", role: "Mentor", branch: "Chem" },
      { name: "Ujjaini Mondal", role: "Mentor", branch: "" },
    ]
  },
  {
    title: "Video Editing (VE)",
    id: "ve",
    members: [
      { name: "Adarsh Kumar", role: "Head", branch: "Chem" },
      { name: "Chiranjeev Anil Shekokar", role: "Core", branch: "IT" },
      { name: "Vivek Yadav", role: "Core", branch: "IT" },
      { name: "Amil Ghoshi Thakur", role: "Mentor", branch: "IT" },
      { name: "Aryan Verma", role: "Mentor", branch: "IT" },
      { name: "Prince Kumar", role: "Mentor", branch: "IT" },
      { name: "Vedant Agarwal", role: "Mentor", branch: "IT" },
    ]
  },
  {
    title: "Documentation Team",
    id: "documentation",
    members: [
      { name: "Divyanshi Soni", role: "Head", branch: "IT" },
      { name: "Rubeena Roy", role: "Head", branch: "IT" },
      { name: "Aditya Singh", role: "Core", branch: "IT" },
      { name: "Apurva Choudhary", role: "Core", branch: "IT" },
      { name: "Astha Shukla", role: "Core", branch: "IT" },
      { name: "Palak Patil", role: "Core", branch: "IT" },
      { name: "Praveen Sahu", role: "Core", branch: "IT" },
      { name: "Pushkar Sahu", role: "Core", branch: "IT" },
      { name: "Panduru Shushma", role: "Core", branch: "IT" },
      { name: "Anuj Chandra Jha", role: "Mentor", branch: "IT" },
      { name: "Mitali Saini", role: "Mentor", branch: "IT" },
      { name: "Pratyush Raj", role: "Mentor", branch: "CSE" },
      { name: "Shreyansh Suryawanshi", role: "Mentor", branch: "IT" },
      { name: "Vinit Gandhi", role: "Mentor", branch: "IT" },
      { name: "Yashasvi Saluja", role: "Mentor", branch: "IT" },
      { name: "Sanistha Yadav", role: "Mentor", branch: "IT" },
    ]
  },
  {
    title: "Sponsorship Team",
    id: "spons",
    members: [
      { name: "Himanshu", role: "Head", branch: "IT" },
      { name: "Piyush Verma", role: "Head", branch: "IT" },
      { name: "Aakansha Singh", role: "Mentor", branch: "IT" },
      { name: "Kshitij Sharma", role: "Mentor", branch: "IT" },
      { name: "Rishabh Gupta", role: "Mentor", branch: "IT" },
      { name: "Sairaj Gupta", role: "Mentor", branch: "IT" },
      { name: "Sanyam Gupta", role: "Mentor", branch: "IT" },
      { name: "Shashank Sharma", role: "Mentor", branch: "IT" },
      { name: "Suraj Gond", role: "Mentor", branch: "IT" },
      { name: "Yashasva Bhalla", role: "Mentor", branch: "IT" },
      { name: "Darshit Golchha", role: "Core", branch: "IT" },
      { name: "Dipika Sinha", role: "Core", branch: "IT" },
      { name: "Harsh Matlani", role: "Core", branch: "IT" },
      { name: "Sejal Jain", role: "Core", branch: "IT" },
      { name: "Abhishek Dubey", role: "Core", branch: "IT" },
      { name: "Vishal Gupta", role: "Core", branch: "IT" },
      { name: "Rituraj S Yadav", role: "Core", branch: "IT" },
    ]
  },
  {
    title: "Marketing & Analytics (M&A)",
    id: "ma",
    members: [
      { name: "Ayush Sahu", role: "Head", branch: "IT" },
      { name: "Rishabh Sarwa", role: "Head", branch: "IT" },
      { name: "Sameer Dansena", role: "Core", branch: "IT" },
      { name: "Vanshika Diwan", role: "Core", branch: "IT" },
      { name: "Aditi Sharma", role: "Mentor", branch: "IT" },
      { name: "Archit Tiwari", role: "Mentor", branch: "IT" },
      { name: "Ashutosh", role: "Mentor", branch: "IT" },
      { name: "Piyush Kumar Sahu", role: "Mentor", branch: "IT" },
    ]
  }
];

export default function TeamPage() {
  const [selectedDomain, setSelectedDomain] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredSections = domainSections.map(section => {
    const matchesDomainFilter = selectedDomain === 'all' || section.id === selectedDomain;
    if (!matchesDomainFilter) return null;

    const filteredMembers = section.members.filter(member =>
      member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.role.toLowerCase().includes(searchQuery.toLowerCase()) ||
      member.branch.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (filteredMembers.length === 0) return null;

    return {
      ...section,
      members: filteredMembers
    };
  }).filter(Boolean);

  return (
    <div className="w-full min-h-screen bg-slate-950 text-slate-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-12">
        
        {/* Header Section */}
        <div className="text-center space-y-3">
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white">
            Sahyog Club <span className="text-blue-500">Team Directory</span>
          </h1>
          <p className="text-base sm:text-lg text-slate-400 max-w-2xl mx-auto">
            Explore our talented members and domain heads organized cleanly below.
          </p>
        </div>

        {/* Filter Tabs & Search Bar */}
        <div className="flex flex-col lg:flex-row justify-between items-center gap-4 bg-slate-900/90 p-4 rounded-2xl border border-slate-800 shadow-xl backdrop-blur-md">
          
          <div className="flex flex-wrap justify-center gap-2">
            {[
              { id: 'all', label: 'All Domains' },
              { id: 'em', label: 'Event Management' },
              { id: 'pr', label: 'PR' },
              { id: 'design', label: 'Design' },
              { id: 've', label: 'Video Editing' },
              { id: 'documentation', label: 'Documentation' },
              { id: 'spons', label: 'Sponsorship' },
              { id: 'ma', label: 'M&A' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedDomain(tab.id)}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 ${
                  selectedDomain === tab.id
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30 ring-2 ring-blue-400/50'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700/60'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="relative w-full lg:w-72">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
              <FaSearch size={14} />
            </span>
            <input
              type="text"
              placeholder="Search member, role, branch..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-inner"
            />
          </div>
        </div>

        {/* Sections */}
        {filteredSections.length > 0 ? (
          <div className="space-y-16">
            {filteredSections.map((section) => (
              <div key={section.id} className="space-y-6">
                
                {/* Section Heading with blue underline */}
                <div className="text-center sm:text-left">
                  <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-wide inline-block pb-2 border-b-2 border-blue-500">
                    {section.title}
                  </h2>
                </div>

                {/* Grid Container */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
                  gap: '24px'
                }}>
                  {section.members.map((member, idx) => (
                    <div 
                      key={idx}
                      style={{
                        backgroundColor: '#224fb0',
                        border: '1px solid #1f2937',
                        borderRadius: '16px',
                        padding: '24px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        textAlign: 'center',
                        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3)'
                      }}
                    >
                      {/* Avatar Box */}
                      <div style={{
                        width: '100px',
                        height: '100px',
                        borderRadius: '12px',
                        backgroundColor: '#0a1429',
                        border: '1px solid #1f2937',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: '20px'
                      }}>
                        <FaUser style={{ color: '#374151', fontSize: '36px' }} />
                      </div>

                      {/* Name */}
                      <h3 style={{
                        fontSize: '16px',
                        fontWeight: 'bold',
                        color: '#ffffff',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        marginBottom: '4px'
                      }}>
                        {member.name}
                      </h3>

                      {/* Role (displays just Head, Core, or Mentor) */}
                      <p style={{
                        fontSize: '13px',
                        color: '#9ca3af',
                        fontWeight: '500',
                        marginBottom: '20px'
                      }}>
                        {member.role}
                      </p>

                      {/* Branch Badge */}
                      {member.branch && (
                        <div style={{
                          marginTop: 'auto',
                          backgroundColor: '#13203b',
                          border: '1px solid #1f2937',
                          borderRadius: '8px',
                          padding: '6px 16px',
                        }}>
                          <span style={{
                            fontSize: '11px',
                            fontWeight: 'bold',
                            letterSpacing: '0.05em',
                            color: '#d1d5db',
                            textTransform: 'uppercase'
                          }}>
                            BRANCH: {member.branch}
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-slate-900 rounded-2xl border border-slate-800">
            <p className="text-slate-400 text-base">No team members found matching your search criteria.</p>
          </div>
        )}

      </div>
    </div>
  );
}