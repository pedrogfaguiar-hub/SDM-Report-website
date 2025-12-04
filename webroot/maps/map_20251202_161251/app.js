// Location configuration based on Excel
const LOCATIONS = {
    'Germany': { lat: 52.5200, lng: 13.4050, name: 'Germany' },
    'India': { lat: 28.6139, lng: 77.2090, name: 'India' },
    'Japan': { lat: 35.6895, lng: 139.6917, name: 'Japan' },
    'Romania': { lat: 44.4268, lng: 26.1025, name: 'Romania' },
    'Sweden': { lat: 59.3293, lng: 18.0686, name: 'Sweden' },
    'USA': { lat: 38.8951, lng: -77.0364, name: 'USA' },
    'Korea': { lat: 37.5665, lng: 126.9780, name: 'Korea' },
    'France': { lat: 48.8566, lng: 2.3522, name: 'France' },
    'China': { lat: 39.9042, lng: 116.4074, name: 'China' },
    'Canada': { lat: 45.4215, lng: -75.6993, name: 'Canada' }
};

// Priority colors based on Excel
const PRIORITY_COLORS = {
    'P1': 'rgb(230,81,0)',    // High priority - Orange/Red
    'P2': 'rgb(255,234,0)',   // Medium priority - Yellow
    'NO_ISSUE': 'rgb(2,136,209)'  // No incidents - Blue
};

// Icon configuration for markers
const MARKER_ICONS = {
    'P1': 'fa-solid fa-exclamation',      // ! for P1
    'P2': 'fa-solid fa-minus',            // - for P2
    'NO_ISSUE': 'fa-solid fa-check'       // ✓ for NO_ISSUE
};

// Stadia Maps API Key
const STADIA_API_KEY = '718273af-ee92-41d4-9740-170f3d3fd20d';

// Global variables
let map;
let markers = [];
let incidentsData = null;

// Direct JSON file URL (no Flask API required)
const API_URL = 'backend/incidents_data.json';

// Polling interval (ms) - change during development if you want faster updates
const POLL_INTERVAL_MS = 30_000; // 30 seconds

// Helper: fetch JSON with cache-busting query param
function fetchIncidentsJSON(url) {
    const cacheBustedUrl = `${url}?_=${Date.now()}`;
    const fetchOptions = { cache: 'no-store' };
    return fetch(cacheBustedUrl, fetchOptions).then(resp => {
        if (!resp.ok) throw new Error(`HTTP ${resp.status} ${resp.statusText}`);
        return resp.json();
    });
}

// Create base tile layer with Stadia if key available, otherwise fall back to OSM
function createBaseTileLayer() {
    const stadiaKey = (typeof STADIA_API_KEY !== 'undefined') ? STADIA_API_KEY : null;
    const stadiaUrl = stadiaKey ? `https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}{r}.png?api_key=${encodeURIComponent(stadiaKey)}` : null;
    const osmUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
    const osmAttribution = '&copy; OpenStreetMap contributors';

    try {
        if (stadiaUrl) {
            return L.tileLayer(stadiaUrl, {
                attribution: '&copy; <a href="https://stadiamaps.com/">Stadia Maps</a>, &copy; <a href="https://openmaptiles.org/">OpenMapTiles</a> &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors',
                maxZoom: 20,
                detectRetina: true
            });
        }
        throw new Error('No Stadia API key configured');
    } catch (e) {
        console.warn('Stadia tiles unavailable, falling back to OSM:', e && e.message);
        return L.tileLayer(osmUrl, { attribution: osmAttribution, maxZoom: 19, detectRetina: true });
    }
}

// Map initialization
function initMap() {
    // Create map centered on the world
    map = L.map('map').setView([30, 0], 2);

    // Add Stadia Maps tile layer
    const baseLayer = createBaseTileLayer();
    baseLayer.addTo(map);

    // Create initial markers (no incidents)
    createInitialMarkers();

    // Automatically load incidents from JSON file
    loadIncidentsFromAPI();
}

// Create initial markers for all locations
function createInitialMarkers() {
    Object.values(LOCATIONS).forEach(location => {
        createMarker(location, [], 'NO_ISSUE');
    });
}

// Create a marker on the map
function createMarker(location, incidents, priorityType) {
    const color = PRIORITY_COLORS[priorityType];
    const iconClass = MARKER_ICONS[priorityType];

    const icon = L.divIcon({
        className: 'custom-pin-icon',
        html: `
            <div class="map-pin" style="background-color: ${color};">
                <i class="${iconClass}" style="color: white;"></i>
            </div>
            <div class="map-pin-point" style="border-top-color: ${color};"></div>
        `,
        iconSize: [24, 34],
        iconAnchor: [12, 34],
        popupAnchor: [0, -34]
    });

    const marker = L.marker([location.lat, location.lng], { icon: icon }).addTo(map);

    // Create popup content
    const popupContent = createPopupContent(location.name, incidents);
    marker.bindPopup(popupContent);

    markers.push(marker);
    return marker;
}

// Create popup content
function createPopupContent(locationName, incidents) {
    let content = `<div class="popup-content">
        <h4>${locationName}</h4>`;

    if (incidents.length === 0) {
        content += `<p class="no-incidents">No incidents registered</p>`;
    } else {
        content += `<p><strong>Total incidents: ${incidents.length}</strong></p>`;
        incidents.forEach((incident, index) => {
            const incidentNumber = index + 1;
            const incidentId = incident.incident_id || `#${incidentNumber}`;
            content += `
                <div class="incident-item">
                    <div class="incident-header">
                        <span class="incident-number">${incidentId}</span>
                        <span class="incident-priority">Priority: ${incident.priority}</span>
                    </div>
                    <div class="incident-description">${incident.description || 'No description'}</div>
                </div>`;
        });
    }

    content += `</div>`;
    return content;
}

// Determine pin priority type based on incidents
function determinePinPriority(incidents) {
    if (incidents.length === 0) {
        return 'NO_ISSUE';
    }

    // Check if there's any P1 incident
    const hasP1 = incidents.some(incident =>
        incident.priority && incident.priority.toUpperCase() === 'P1'
    );

    if (hasP1) {
        return 'P1';
    }

    // Check if there's any P2 incident
    const hasP2 = incidents.some(incident =>
        incident.priority && incident.priority.toUpperCase() === 'P2'
    );

    if (hasP2) {
        return 'P2';
    }

    // If there are incidents but none are P1 or P2, use P2 as default
    return 'P2';
}

// Process incidents JSON and update the map
function processIncidents(data) {
    incidentsData = data;

    // Group incidents by location
    const incidentsByLocation = {};

    // Initialize all locations with empty array
    Object.keys(LOCATIONS).forEach(locationName => {
        incidentsByLocation[locationName] = [];
    });

    // Process each incident
    if (Array.isArray(data)) {
        data.forEach(incident => {
            const locationName = incident.location;

            // Check if the location exists in our map
            if (LOCATIONS[locationName]) {
                if (!incidentsByLocation[locationName]) {
                    incidentsByLocation[locationName] = [];
                }
                incidentsByLocation[locationName].push(incident);
            }
        });
    } else if (typeof data === 'object') {
        // If JSON is an object with locations as keys
        Object.keys(data).forEach(locationName => {
            if (LOCATIONS[locationName]) {
                const locationIncidents = Array.isArray(data[locationName])
                    ? data[locationName]
                    : [data[locationName]];
                incidentsByLocation[locationName] = locationIncidents;
            }
        });
    }

    // Update markers
    updateMarkers(incidentsByLocation);

    // Log information
    const totalIncidents = Object.values(incidentsByLocation)
        .reduce((sum, incidents) => sum + incidents.length, 0);
    console.log(`✅ ${totalIncidents} incidents loaded across ${Object.keys(incidentsByLocation).length} locations.`);
}

// Update all markers on the map
function updateMarkers(incidentsByLocation) {
    // Clear existing markers
    clearMarkers();

    // Create new markers with appropriate icons
    Object.keys(LOCATIONS).forEach(locationName => {
        const location = LOCATIONS[locationName];
        const incidents = incidentsByLocation[locationName] || [];
        const priorityType = determinePinPriority(incidents);

        createMarker(location, incidents, priorityType);
    });
}

// Clear all markers from the map
function clearMarkers() {
    markers.forEach(marker => {
        map.removeLayer(marker);
    });
    markers = [];
}


// Load incidents from JSON file (direct access, no API required)
async function loadIncidentsFromAPI() {
    const url = API_URL;
    try {
        const result = await fetchIncidentsJSON(url);
        if (result && result.incidents && result.incidents.length >= 0) {
            if (result.incidents.length === 0) {
                clearMarkers();
                createInitialMarkers();
            } else {
                processIncidents(result.incidents);
            }
        } else {
            console.warn('⚠️ No incidents data found in JSON file', result);
            clearMarkers();
            createInitialMarkers();
        }
    } catch (err) {
        console.error('❌ Error loading incidents from JSON file (first attempt):', err);
        // Short retry after a small delay to handle atomic-replace race conditions
        setTimeout(async () => {
            try {
                const retryResult = await fetchIncidentsJSON(url);
                if (retryResult && retryResult.incidents) {
                    processIncidents(retryResult.incidents);
                } else {
                    console.warn('⚠️ Retry returned no incidents', retryResult);
                }
            } catch (err2) {
                console.error('❌ Retry failed to load incidents JSON:', err2);
            }
        }, 1500);
    }
}

// Initialize the map when page loads
window.addEventListener('load', initMap);

// Auto-refresh map data every 30 seconds
// Start polling using configured interval
loadIncidentsFromAPI();
setInterval(() => {
    console.log('🔄 Auto-refreshing map data...');
    loadIncidentsFromAPI();
}, POLL_INTERVAL_MS);
