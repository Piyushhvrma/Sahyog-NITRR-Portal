import React, { useState } from 'react';
import { FaMapMarkerAlt, FaLayerGroup, FaRoute, FaBuilding } from 'react-icons/fa';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix Leaflet marker icons in Vite/React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Campus buildings data with coordinates at NIT Raipur
const campusBuildings = [
  { id: 'admin', name: 'Administrative Building', coords: [21.2495, 81.6050], floors: ['Ground Floor', 'First Floor'] },
  { id: 'cse', name: 'Computer Science & Engineering Dept', coords: [21.2493, 81.6054], floors: ['Ground Floor', 'First Floor', 'Second Floor'] },
  { id: 'mech', name: 'Mechanical Engineering Dept', coords: [21.2488, 81.6048], floors: ['Ground Floor', 'First Floor'] },
  { id: 'library', name: 'Central Library', coords: [21.2498, 81.6060], floors: ['Ground Floor', 'First Floor', 'Reading Hall'] },
  { id: 'audi', name: 'Institute Auditorium', coords: [21.2502, 81.6052], floors: ['Main Hall', 'Balcony'] }
];

export default function CampusMapPage() {
  const [selectedBuilding, setSelectedBuilding] = useState(campusBuildings[1]);
  const [selectedFloor, setSelectedFloor] = useState(selectedBuilding.floors[0]);
  const [startPoint, setStartPoint] = useState('');
  const [endPoint, setEndPoint] = useState('');
  const [routeInfo, setRouteInfo] = useState(null);

  const handleBuildingChange = (building) => {
    setSelectedBuilding(building);
    setSelectedFloor(building.floors[0]);
    setRouteInfo(null);
  };

  const handleNavigate = (e) => {
    e.preventDefault();
    if (!startPoint || !endPoint) {
      alert("Please select both a starting point and a destination.");
      return;
    }
    setRouteInfo({
      from: startPoint,
      to: endPoint,
      distance: "approx. 120 meters",
      time: "2 mins walk",
      steps: [
        `Start at ${startPoint}`,
        `Proceed along the main corridor of ${selectedBuilding.name}`,
        `Take the stairs/elevator to ${selectedFloor}`,
        `Arrive at destination: ${endPoint}`
      ]
    });
  };

  return (
    <div style={{
      position: 'relative',
      zIndex: 50,
      width: '100%',
      minHeight: '100vh',
      backgroundColor: '#030712', // Solid dark background to block out any background images
      color: '#f8fafc',
      padding: '40px 16px'
    }}>
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header Section */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            NIT Raipur <span className="text-blue-500">Interactive Campus Map</span>
          </h1>
          <p className="text-sm sm:text-base text-slate-400 max-w-xl mx-auto">
            Explore college buildings floor-by-floor and find precise routes across campus.
          </p>
        </div>

        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Building & Floor Selector */}
          <div className="space-y-6">
            
            {/* Buildings List */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
              <h2 className="text-lg font-bold text-white flex items-center gap-2 mb-4">
                <FaBuilding className="text-blue-500" /> Campus Buildings
              </h2>
              <div className="space-y-2">
                {campusBuildings.map((b) => (
                  <button
                    key={b.id}
                    onClick={() => handleBuildingChange(b)}
                    className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 flex items-center justify-between ${
                      selectedBuilding.id === b.id
                        ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 ring-2 ring-blue-400/50'
                        : 'bg-slate-800/80 text-slate-300 hover:bg-slate-800 hover:text-white border border-slate-700/50'
                    }`}
                  >
                    <span>{b.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Floor Selector */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
              <h2 className="text-lg font-bold text-white flex items-center gap-2 mb-4">
                <FaLayerGroup className="text-blue-500" /> Floor Level
              </h2>
              <div className="flex flex-wrap gap-2">
                {selectedBuilding.floors.map((floor, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedFloor(floor)}
                    className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                      selectedFloor === floor
                        ? 'bg-indigo-600 text-white ring-2 ring-indigo-400/50 shadow-md'
                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700'
                    }`}
                  >
                    {floor}
                  </button>
                ))}
              </div>
            </div>

            {/* Navigation / Route Finder */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl">
              <h2 className="text-lg font-bold text-white flex items-center gap-2 mb-4">
                <FaRoute className="text-blue-500" /> Point-to-Point Navigation
              </h2>
              <form onSubmit={handleNavigate} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Starting Point / Room</label>
                  <input
                    type="text"
                    placeholder="e.g. Main Entrance, Lab 1"
                    value={startPoint}
                    onChange={(e) => setStartPoint(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Destination Room / Dept</label>
                  <input
                    type="text"
                    placeholder="e.g. HOD Cabin, Seminar Hall"
                    value={endPoint}
                    onChange={(e) => setEndPoint(e.target.value)}
                    className="w-full px-3.5 py-2 bg-slate-950 border border-slate-700 rounded-xl text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-xl shadow-lg transition-all text-sm"
                >
                  Find Route & Directions
                </button>
              </form>
            </div>

          </div>

          {/* Right Column: Interactive Leaflet Map Viewport */}
          <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
            
            <div className="flex justify-between items-center border-b border-slate-800 pb-4 mb-4">
              <div>
                <h3 className="text-xl font-bold text-white">{selectedBuilding.name}</h3>
                <p className="text-sm text-blue-400 font-medium">Viewing: {selectedFloor}</p>
              </div>
              <span className="px-3 py-1 bg-slate-800 text-slate-300 text-xs rounded-full border border-slate-700 font-semibold">
                Live Leaflet Map
              </span>
            </div>

            {/* Map Container with explicit height */}
            <div className="rounded-xl border border-slate-800 overflow-hidden" style={{ height: '450px', width: '100%' }}>
              <MapContainer 
                center={selectedBuilding.coords} 
                zoom={18} 
                scrollWheelZoom={false} 
                style={{ height: '100%', width: '100%' }}
                key={selectedBuilding.id}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                {campusBuildings.map((b) => (
                  <Marker 
                    key={b.id} 
                    position={b.coords}
                    eventHandlers={{
                      click: () => handleBuildingChange(b),
                    }}
                  >
                    <Popup>
                      <strong>{b.name}</strong> <br /> Selected Floor: {selectedFloor}
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
            </div>

            {routeInfo && (
              <div className="mt-4 text-left bg-slate-950 border border-blue-500/40 rounded-xl p-4 shadow-lg space-y-2">
                <div className="flex justify-between text-xs font-semibold text-blue-400">
                  <span>ROUTE FOUND</span>
                  <span>{routeInfo.distance} • {routeInfo.time}</span>
                </div>
                <ul className="text-xs text-slate-300 space-y-1 list-disc pl-4">
                  {routeInfo.steps.map((step, sIdx) => (
                    <li key={sIdx}>{step}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="mt-4 text-center text-xs text-slate-500">
              NIT Raipur Campus Navigation System • Powered by Leaflet & OpenStreetMap
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}