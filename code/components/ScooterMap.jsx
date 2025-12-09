"use client";

import React, { useEffect, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { MapContainer, TileLayer, Marker, Circle, Popup } from "react-leaflet";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Loader2,
  MapPin,
  Zap,
  AlertTriangle,
  CheckCircle,
  Battery,
  BatteryLow,
  Navigation,
  Shield,
  AlertCircle,
} from "lucide-react";

// Modern color palette with consistent gradients
const colors = {
  primary: {
    gradient: "linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)",
    solid: "#6366f1",
    light: "#a5b4fc",
  },
  success: {
    gradient: "linear-gradient(135deg, #10b981 0%, #059669 100%)",
    solid: "#10b981",
    light: "#34d399",
  },
  warning: {
    gradient: "linear-gradient(135deg, #f59e0b 0%, #d97706 100%)",
    solid: "#f59e0b",
    light: "#fbbf24",
  },
  danger: {
    gradient: "linear-gradient(135deg, #ef4444 0%, #dc2626 100%)",
    solid: "#ef4444",
    light: "#f87171",
  },
  surface: {
    primary: "rgba(15, 23, 42, 0.8)",
    secondary: "rgba(30, 41, 59, 0.6)",
    accent: "rgba(51, 65, 85, 0.4)",
  },
};

// Enhanced custom icon creation with consistent styling
const createCustomIcon = (
  gradient,
  iconSvg,
  size = [36, 36],
  pulseColor = null
) => {
  const pulseAnimation = pulseColor
    ? `
    <div style="
      position: absolute;
      top: -4px;
      left: -4px;
      width: ${size[0] + 8}px;
      height: ${size[1] + 8}px;
      border-radius: 50%;
      background: ${pulseColor};
      opacity: 0.3;
      animation: pulse 2s infinite;
    "></div>
  `
    : "";

  return L.divIcon({
    html: `
      <div class="icon-container">
        ${pulseAnimation}
        <div style="
          background: ${gradient};
          width: ${size[0]}px;
          height: ${size[1]}px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 3px solid white;
          box-shadow: 0 8px 32px rgba(0,0,0,0.4);
          position: relative;
          z-index: 1;
          transition: all 0.3s ease;
        ">
          ${iconSvg}
        </div>
      </div>
    `,
    className: "custom-div-icon",
    iconSize: size,
    iconAnchor: [size[0] / 2, size[1] / 2],
    popupAnchor: [0, -size[1] / 2],
  });
};

// Station Icon with enhanced styling
const stationIcon = createCustomIcon(
  colors.primary.gradient,
  `<svg width="20" height="20" fill="white" viewBox="0 0 24 24">
    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
  </svg>`,
  [40, 40]
);

// Enhanced scooter icons with status-based styling
const safeScooterIcon = createCustomIcon(
  colors.success.gradient,
  `<svg width="18" height="18" fill="white" viewBox="0 0 24 24">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
  </svg>`,
  [32, 32]
);

const warningScooterIcon = createCustomIcon(
  colors.warning.gradient,
  `<svg width="18" height="18" fill="white" viewBox="0 0 24 24">
    <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/>
  </svg>`,
  [32, 32],
  colors.warning.solid
);

const dangerScooterIcon = createCustomIcon(
  colors.danger.gradient,
  `<svg width="18" height="18" fill="white" viewBox="0 0 24 24">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm5 13.59L15.59 17 12 13.41 8.41 17 7 15.59 10.59 12 7 8.41 8.41 7 12 10.59 15.59 7 17 8.41 13.41 12 17 15.59z"/>
  </svg>`,
  [32, 32],
  colors.danger.solid
);

const addLeafletCustomStyles = () => {
  const styleId = "leaflet-custom-styles-enhanced-scooter-map";
  if (document.getElementById(styleId)) return;
  const style = document.createElement("style");
  style.id = styleId;
  style.innerHTML = `
    @keyframes pulse {
      0% { transform: scale(1); opacity: 0.3; }
      50% { transform: scale(1.1); opacity: 0.1; }
      100% { transform: scale(1); opacity: 0.3; }
    }
    
    .custom-div-icon {
      background: transparent !important;
      border: none !important;
    }
    
    .icon-container:hover .custom-div-icon > div {
      transform: scale(1.1);
      box-shadow: 0 12px 40px rgba(0,0,0,0.6);
    }
    
    .leaflet-popup-content-wrapper {
      background: linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.95) 100%);
      color: white;
      border-radius: 16px;
      box-shadow: 0 20px 64px rgba(0,0,0,0.5);
      border: 1px solid rgba(255,255,255,0.1);
      backdrop-filter: blur(20px);
      min-width: 280px;
    }
    
    .leaflet-popup-content {
      margin: 20px 24px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
      font-size: 14px;
      line-height: 1.6;
    }
    
    .leaflet-popup-tip {
      background: linear-gradient(135deg, rgba(15, 23, 42, 0.95) 0%, rgba(30, 41, 59, 0.95) 100%);
      border: 1px solid rgba(255,255,255,0.1);
    }
    
    .leaflet-popup-close-button {
      color: rgba(255,255,255,0.8) !important;
      font-size: 20px !important;
      font-weight: bold !important;
      padding: 12px !important;
      top: 8px !important;
      right: 8px !important;
      border-radius: 8px !important;
      transition: all 0.2s ease !important;
    }
    
    .leaflet-popup-close-button:hover {
      background: rgba(255,255,255,0.1) !important;
      color: white !important;
      transform: scale(1.1);
    }
    
    .status-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 8px 12px;
      border-radius: 20px;
      font-weight: 600;
      font-size: 12px;
      margin-top: 12px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.2);
    }
    
    .status-safe {
      background: linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(5, 150, 105, 0.2) 100%);
      color: #34d399;
      border: 1px solid rgba(16, 185, 129, 0.3);
    }
    
    .status-warning {
      background: linear-gradient(135deg, rgba(245, 158, 11, 0.2) 0%, rgba(217, 119, 6, 0.2) 100%);
      color: #fbbf24;
      border: 1px solid rgba(245, 158, 11, 0.3);
    }
    
    .status-danger {
      background: linear-gradient(135deg, rgba(239, 68, 68, 0.2) 0%, rgba(220, 38, 38, 0.2) 100%);
      color: #f87171;
      border: 1px solid rgba(239, 68, 68, 0.3);
    }
    
    .battery-indicator {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      margin: 12px 0;
      padding: 10px 14px;
      background: linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%);
      border-radius: 12px;
      border: 1px solid rgba(255,255,255,0.1);
      backdrop-filter: blur(10px);
    }
    
    .info-grid {
      display: grid;
      gap: 12px;
      margin-top: 16px;
    }
    
    .info-item {
      display: flex;
      align-items: center;
      gap: 10px;
      font-size: 13px;
      padding: 8px 0;
      border-bottom: 1px solid rgba(255,255,255,0.1);
    }
    
    .info-item:last-child {
      border-bottom: none;
    }
    
    .info-label {
      opacity: 0.7;
      min-width: 70px;
      font-weight: 500;
    }
    
    .info-value {
      font-weight: 600;
      color: #a5b4fc;
    }
    
    .popup-header {
      display: flex;
      align-items: center;
      gap: 8px;
      margin-bottom: 16px;
      padding-bottom: 12px;
      border-bottom: 1px solid rgba(255,255,255,0.1);
    }
    
    .popup-title {
      font-size: 16px;
      font-weight: 700;
      color: white;
    }
  `;
  document.head.appendChild(style);
};

const stations = [
  { id: "ST01", name: "Miriswaththa", lat: 7.123456, lng: 80.123456 },
  { id: "ST02", name: "Seeduwa", lat: 7.148497, lng: 79.873276 },
  { id: "ST03", name: "Minuwangoda", lat: 7.182689, lng: 79.961171 },
  { id: "ST04", name: "Divulapitiya", lat: 7.222404, lng: 80.017613 },
  { id: "ST05", name: "Katunayake", lat: 7.222445, lng: 80.017625 },
  { id: "ST06", name: "Udugampola", lat: 7.120498, lng: 79.983923 },
  { id: "ST07", name: "Kadawatha", lat: 7.006685, lng: 79.958184 },
  { id: "ST08", name: "Kochchikade", lat: 7.274298, lng: 79.862597 },
  { id: "ST09", name: "Paliyagoda", lat: 6.960975, lng: 79.880949 },
  { id: "ST10", name: "Boralesgamuwa", lat: 6.837024, lng: 79.903572 },
  { id: "ST11", name: "Thalawathugoda", lat: 6.877865, lng: 79.939505 },
  { id: "ST12", name: "Moratuwa", lat: 6.787022, lng: 79.884759 },
  { id: "ST13", name: "Borella", lat: 6.915059, lng: 79.881394 },
  { id: "ST14", name: "Padukka", lat: 6.847305, lng: 80.102153 },
  { id: "ST15", name: "Beruwala", lat: 7.222348, lng: 80.017553 },
  { id: "ST16", name: "Bandaragama", lat: 6.714853, lng: 79.989208 },
  { id: "ST17", name: "Maggona", lat: 7.222444, lng: 80.017606 },
  { id: "ST18", name: "Panadura", lat: 6.713372, lng: 79.906452 },
];

const scooters = [
  { id: "SC001", lat: 6.9278, lng: 79.8612, battery: 70 },
  { id: "SC002", lat: 6.935, lng: 79.85, battery: 30 },
  { id: "SC003", lat: 6.95, lng: 79.865, battery: 10 },
  { id: "SC004", lat: 7.9, lng: 80.9, battery: 100 },
  { id: "SC005", lat: 7.05, lng: 79.95, battery: 85 },
  { id: "SC006", lat: 6.842, lng: 79.8725, battery: 60 },
  { id: "SC007", lat: 6.9271, lng: 80.8612, battery: 45 },
  { id: "SC008", lat: 8.3114, lng: 80.4037, battery: 90 },
  { id: "SC009", lat: 9.6615, lng: 80.0255, battery: 20 },
  { id: "SC010", lat: 7.2906, lng: 80.6337, battery: 55 },
  { id: "SC011", lat: 6.0535, lng: 80.22, battery: 35 },
  { id: "SC012", lat: 6.4214, lng: 80.0064, battery: 75 },
  { id: "SC013", lat: 8.5784, lng: 81.233, battery: 65 },
  { id: "SC014", lat: 6.9442, lng: 81.0092, battery: 90 },
  { id: "SC015", lat: 6.9365, lng: 79.8758, battery: 40 },
  { id: "SC016", lat: 7.16, lng: 79.87, battery: 50 },
  { id: "SC017", lat: 6.711, lng: 81.2158, battery: 30 },
  { id: "SC018", lat: 8.033, lng: 80.983, battery: 85 },
  { id: "SC019", lat: 6.6685, lng: 80.1717, battery: 95 },
  { id: "SC020", lat: 7.7167, lng: 81.7, battery: 10 },
];

const getDistanceFromLatLng = (lat1, lon1, lat2, lon2) => {
  const R = 6371e3;
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(Δφ / 2) ** 2 + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const getScooterRangeMeters = (battery) => battery * 500; // 0.5 km per 1%

const getScooterStatus = (scooter, distanceToNearestStation, scooterRange) => {
  if (distanceToNearestStation > scooterRange) {
    return "danger";
  } else if (
    scooter.battery <= 25 ||
    distanceToNearestStation > scooterRange * 0.7
  ) {
    return "warning";
  }
  return "safe";
};

const getScooterIcon = (status) => {
  switch (status) {
    case "danger":
      return dangerScooterIcon;
    case "warning":
      return warningScooterIcon;
    default:
      return safeScooterIcon;
  }
};

const getBatteryIcon = (battery) => {
  if (battery <= 20) return <BatteryLow className="w-5 h-5 text-red-400" />;
  return <Battery className="w-5 h-5 text-green-400" />;
};

const getStatusIcon = (status) => {
  switch (status) {
    case "safe":
      return <Shield className="w-4 h-4 text-green-400" />;
    case "warning":
      return <AlertTriangle className="w-4 h-4 text-yellow-400" />;
    case "danger":
      return <AlertCircle className="w-4 h-4 text-red-400" />;
    default:
      return <CheckCircle className="w-4 h-4" />;
  }
};

const ScooterMap = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [mapStats, setMapStats] = useState({ safe: 0, warning: 0, danger: 0 });

  useEffect(() => {
    addLeafletCustomStyles();

    // Calculate stats
    const stats = { safe: 0, warning: 0, danger: 0 };
    scooters.forEach((scooter) => {
      const distanceToNearestStation = getNearestStationDistance(scooter);
      const scooterRange = getScooterRangeMeters(scooter.battery);
      const status = getScooterStatus(
        scooter,
        distanceToNearestStation,
        scooterRange
      );
      stats[status]++;
    });
    setMapStats(stats);

    setTimeout(() => setIsLoading(false), 1000);
  }, []);

  const getNearestStationDistance = (scooter) => {
    const distances = stations.map((station) =>
      getDistanceFromLatLng(scooter.lat, scooter.lng, station.lat, station.lng)
    );
    return Math.min(...distances);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Smart Fleet Monitor
          </h1>
          <p className="text-slate-400 text-lg">
            Intelligent monitoring with real-time danger zone detection and
            battery analytics{" "}
          </p>
        </div>

        {/* Enhanced Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="bg-gradient-to-br from-green-500/20 to-emerald-600/20 border-green-500/30 backdrop-blur-sm hover:scale-105 transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-green-300 mb-1">
                    Safe Scooters
                  </p>
                  <p className="text-3xl font-bold text-green-400">
                    {mapStats.safe}
                  </p>
                  <p className="text-xs text-green-300/60 mt-1">
                    Optimal battery & range
                  </p>
                </div>
                <div className="p-3 bg-green-500/20 rounded-full">
                  <Shield className="w-8 h-8 text-green-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-yellow-500/20 to-orange-600/20 border-yellow-500/30 backdrop-blur-sm hover:scale-105 transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-yellow-300 mb-1">
                    Warning Zone
                  </p>
                  <p className="text-3xl font-bold text-yellow-400">
                    {mapStats.warning}
                  </p>
                  <p className="text-xs text-yellow-300/60 mt-1">
                    Low battery or far from station
                  </p>
                </div>
                <div className="p-3 bg-yellow-500/20 rounded-full">
                  <AlertTriangle className="w-8 h-8 text-yellow-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-red-500/20 to-pink-600/20 border-red-500/30 backdrop-blur-sm hover:scale-105 transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-red-300 mb-1">
                    Critical Alert
                  </p>
                  <p className="text-3xl font-bold text-red-400">
                    {mapStats.danger}
                  </p>
                  <p className="text-xs text-red-300/60 mt-1">
                    Cannot reach station
                  </p>
                </div>
                <div className="p-3 bg-red-500/20 rounded-full">
                  <AlertCircle className="w-8 h-8 text-red-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Map Card */}
        <Card className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-slate-700/50 backdrop-blur-sm shadow-2xl">
          {/* <CardHeader className="bg-gradient-to-r from-slate-800/80 to-slate-900/80 text-white rounded-t-lg border-b border-slate-700/50">
            <div className="flex items-center gap-4">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <Navigation className="w-8 h-8 text-blue-400" />
              </div>
              <div>
                <CardTitle className="text-2xl font-bold">
                  Fleet Overview Dashboard
                </CardTitle>
                <CardDescription className="text-slate-300 mt-2">
                  Intelligent monitoring with real-time danger zone detection
                  and battery analytics
                </CardDescription>
              </div>
            </div>
          </CardHeader> */}
          <CardContent className="h-[700px] relative z-0 p-0">
            {isLoading ? (
              <div className="flex flex-col justify-center items-center h-full bg-slate-900 rounded-b-lg">
                <div className="relative">
                  <Loader2 className="w-16 h-16 animate-spin text-blue-400 mb-6" />
                  <div className="absolute inset-0 w-16 h-16 rounded-full bg-blue-400/20 animate-ping"></div>
                </div>
                <p className="text-slate-300 text-lg animate-pulse">
                  Initializing smart monitoring system...
                </p>
                <div className="flex gap-2 mt-4">
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                  <div
                    className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"
                    style={{ animationDelay: "0.1s" }}
                  ></div>
                  <div
                    className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"
                    style={{ animationDelay: "0.2s" }}
                  ></div>
                </div>
              </div>
            ) : (
              <div className="h-full rounded-b-lg overflow-hidden">
                <MapContainer
                  center={[6.9278, 79.8612]}
                  zoom={8}
                  style={{ height: "100%", width: "100%", zIndex: 0 }}
                >
                  <TileLayer
                    url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                    attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                  />

                  {/* Stations */}
                  {stations.map((station) => (
                    <Marker
                      key={station.id}
                      position={[station.lat, station.lng]}
                      icon={stationIcon}
                    >
                      <Popup className="custom-popup">
                        <div>
                          <div className="popup-header">
                            <MapPin className="w-5 h-5 text-blue-400" />
                            <span className="popup-title">{station.name}</span>
                          </div>
                          <div className="info-grid">
                            <div className="info-item">
                              <span className="info-label">Station ID:</span>
                              <span className="info-value">{station.id}</span>
                            </div>
                            <div className="info-item">
                              <span className="info-label">Type:</span>
                              <span className="info-value">Charging Hub</span>
                            </div>
                            <div className="info-item">
                              <span className="info-label">Status:</span>
                              <span className="info-value text-green-400">
                                Active
                              </span>
                            </div>
                          </div>
                        </div>
                      </Popup>
                    </Marker>
                  ))}

                  {/* Scooters */}
                  {scooters.map((scooter) => {
                    const scooterRange = getScooterRangeMeters(scooter.battery);
                    const distanceToNearestStation =
                      getNearestStationDistance(scooter);
                    const status = getScooterStatus(
                      scooter,
                      distanceToNearestStation,
                      scooterRange
                    );

                    return (
                      <React.Fragment key={scooter.id}>
                        <Marker
                          position={[scooter.lat, scooter.lng]}
                          icon={getScooterIcon(status)}
                        >
                          <Popup className="custom-popup">
                            <div>
                              <div className="popup-header">
                                <Zap className="w-5 h-5 text-blue-400" />
                                <span className="popup-title">
                                  Scooter {scooter.id}
                                </span>
                              </div>

                              <div className="battery-indicator">
                                {getBatteryIcon(scooter.battery)}
                                <span className="font-semibold">
                                  Battery: {scooter.battery}%
                                </span>
                              </div>

                              <div className="info-grid">
                                <div className="info-item">
                                  <Navigation className="w-4 h-4 text-blue-400" />
                                  <span className="info-label">Range:</span>
                                  <span className="info-value">
                                    {(scooterRange / 1000).toFixed(1)} km
                                  </span>
                                </div>
                                <div className="info-item">
                                  <MapPin className="w-4 h-4 text-blue-400" />
                                  <span className="info-label">Nearest:</span>
                                  <span className="info-value">
                                    {(distanceToNearestStation / 1000).toFixed(
                                      1
                                    )}{" "}
                                    km
                                  </span>
                                </div>
                              </div>

                              <div className={`status-badge status-${status}`}>
                                {getStatusIcon(status)}
                                {status.toUpperCase()}
                              </div>
                            </div>
                          </Popup>
                        </Marker>
                      </React.Fragment>
                    );
                  })}
                </MapContainer>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ScooterMap;
