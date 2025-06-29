import { useEffect, useState } from 'react';
import { useApp } from '../App.jsx';
import { useNavigate } from 'react-router-dom';
import { Users, Shield, Bot, MapPin, CheckCircle, AlertTriangle, XCircle, Eye } from 'lucide-react';
import Header from './ui/Header.jsx';

const Dashboard = () => {
    const { user } = useApp();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [recLoading, setRecLoading] = useState(false);
    const [recError, setRecError] = useState(null);
    const [recommendations, setRecommendations] = useState([]);
    const [showRecommendations, setShowRecommendations] = useState(false);
    const [userLocation, setUserLocation] = useState(null);
    const [locationError, setLocationError] = useState(null);
    const [viewMode, setViewMode] = useState('best'); 
const [bestSupplier, setBestSupplier] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchDashboard = async () => {
            setLoading(true);
            const token = localStorage.getItem('token');
            if (!token) {
                setLoading(false);
                return;
            }
            try {
                const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/auth/dashboard-data`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json',
                        'Accept': 'application/json',
                    },
                    credentials: 'include'
                });
                if (res.ok) {
                    const json = await res.json();
                    setData(json);
                }
            } catch (e) {
                // handle error
            } finally {
                setLoading(false);
            }
        };
        fetchDashboard();
    }, []);

    // Get user's current location
    const getCurrentLocation = () => {
        return new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
                reject(new Error('Geolocation is not supported by this browser'));
                return;
            }

            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const location = {
                        lat: position.coords.latitude,
                        lon: position.coords.longitude
                    };
                    setUserLocation(location);
                    setLocationError(null);
                    resolve(location);
                },
                (error) => {
                    let errorMessage;
                    switch (error.code) {
                        case error.PERMISSION_DENIED:
                            errorMessage = "Location access denied by user";
                            break;
                        case error.POSITION_UNAVAILABLE:
                            errorMessage = "Location information unavailable";
                            break;
                        case error.TIMEOUT:
                            errorMessage = "Location request timed out";
                            break;
                        default:
                            errorMessage = "An unknown error occurred";
                            break;
                    }
                    setLocationError(errorMessage);
                    reject(new Error(errorMessage));
                },
                {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 600000 // 10 minutes
                }
            );
        });
    };

    const handleGetRecommendations = async () => {
        setRecLoading(true);
        setRecError(null);
        setShowRecommendations(true);
        
        try {
            let location = userLocation;
            if (!location) {
                try {
                    location = await getCurrentLocation();
                } catch (locationErr) {
                    location = { lat: 10.1, lon: 77.2 }; // Default 
                    setRecError(`Using default location due to: ${locationErr.message}`);
                }
            }

            const res = await fetch(
                `${import.meta.env.VITE_BACKEND_URL}/weather/recommend-supplier?user_lat=${location.lat}&user_lon=${location.lon}`,
                {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`,
                        'Content-Type': 'application/json',
                    },
                }
            );
            
            if (!res.ok) throw new Error('Failed to fetch recommendations');
            const data = await res.json();
            if (data.best_supplier) {
    setBestSupplier(data.best_supplier);
}
if (data.results && data.results.length > 0) {
    setRecommendations(data.results);
}
            console.log('AI Recommendations:', data);
            setRecommendations(data.results || []);
        } catch (err) {
            setRecError(err.message);
        } finally {
            setRecLoading(false);
        }
    };

    // Auto-get location on component mount
    useEffect(() => {
        getCurrentLocation().catch(() => {
       
        });
    }, []);

    // Function to parse and format AI recommendation text
    const formatRecommendation = (text) => {
        if (!text) return null;

        const lines = text.split('\n').filter(line => line.trim());
        const sections = [];
        let currentSection = null;

        lines.forEach(line => {
            const trimmed = line.trim();
         
            if (trimmed.startsWith('##')) {
                if (currentSection) sections.push(currentSection);
                currentSection = {
                    type: 'header',
                    content: trimmed.replace('##', '').trim(),
                    items: []
                };
            }
            else if (/^\d+\./.test(trimmed)) {
                const item = {
                    type: 'section',
                    title: trimmed,
                    content: []
                };
                if (currentSection) {
                    currentSection.items.push(item);
                }
            }

            else if (trimmed.startsWith('**') && trimmed.includes(':**')) {
                const item = {
                    type: 'subsection',
                    title: trimmed.replace(/\*\*/g, '').replace(':', ''),
                    content: []
                };
                if (currentSection && currentSection.items.length > 0) {
                    const lastItem = currentSection.items[currentSection.items.length - 1];
                    if (lastItem.type === 'section') {
                        lastItem.content.push(item);
                    }
                }
            }
          
            else if (trimmed.startsWith('***') && trimmed.includes(':')) {
                const bulletPoint = trimmed.replace(/\*\*\*/g, '');
                if (currentSection && currentSection.items.length > 0) {
                    const lastItem = currentSection.items[currentSection.items.length - 1];
                    if (lastItem.type === 'section' && lastItem.content.length > 0) {
                        const lastSubsection = lastItem.content[lastItem.content.length - 1];
                        if (lastSubsection.type === 'subsection') {
                            lastSubsection.content.push(bulletPoint);
                        }
                    }
                }
            }
      
            else if (trimmed && !trimmed.startsWith('*')) {
                if (currentSection && currentSection.items.length > 0) {
                    const lastItem = currentSection.items[currentSection.items.length - 1];
                    if (lastItem.type === 'section') {
                        if (lastItem.content.length > 0 && lastItem.content[lastItem.content.length - 1].type === 'subsection') {
                            lastItem.content[lastItem.content.length - 1].content.push(trimmed);
                        } else {
                            lastItem.content.push(trimmed);
                        }
                    }
                }
            }
        });

        if (currentSection) sections.push(currentSection);
        return sections;
    };


    const getActionStyle = (recommendation) => {
        const text = recommendation.toLowerCase();
        if (text.includes('approve') || text.includes('select them today')) {
            return { icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50' };
        } else if (text.includes('monitor') || text.includes('trial')) {
            return { icon: Eye, color: 'text-yellow-600', bg: 'bg-yellow-50' };
        } else if (text.includes('avoid') || text.includes('no')) {
            return { icon: XCircle, color: 'text-red-600', bg: 'bg-red-50' };
        }
        return { icon: AlertTriangle, color: 'text-gray-600', bg: 'bg-gray-50' };
    };

    if (loading) {
        return <div>Loading...</div>;
    }
    if (!data) {
        return <div>No dashboard data found.</div>;
    }


    const hasEnoughSuppliers = data.suppliers >= 2;

    return (
    <div className="fixed top-0 left-0 right-0 bottom-0 bg-gray-50 overflow-y-auto">
        <Header />

        <div className="px-4 sm:px-6 lg:px-8 py-6 max-w-7xl mx-auto">
           
            {/* Header */}
            <div className="mb-8 flex flex-col items-center justify-center gap-4">
                <div className="w-full flex flex-col items-center justify-center">
                    <h1 className="text-3xl font-extrabold text-gray-900 text-center">
                        Welcome{user && user.full_name ? `, ${user.full_name}` : user && user.email ? `, ${user.email}` : ''}!
                    </h1>
                    <p className="text-gray-600 mt-2 text-base text-center">Here's your procurement dashboard overview.</p>
                </div>
                {user && user.email && (
                    <div className="mt-2 text-sm text-gray-500 text-center">
                        Logged in as <span className="font-semibold">{user.email}</span>
                    </div>
                )}
                
                {/* Location Status */}
                <div className="flex items-center gap-2 text-sm">
                    <MapPin className="w-4 h-4" />
                    {userLocation ? (
                        <span className="text-green-600">
                            Location detected ({userLocation.lat.toFixed(2)}, {userLocation.lon.toFixed(2)})
                        </span>
                    ) : locationError ? (
                        <span className="text-amber-600">Using default location</span>
                    ) : (
                        <span className="text-gray-500">Detecting location...</span>
                    )}
                </div>
            </div>

            {/* Stats Cards */}
            <div className="flex flex-col items-center justify-center mb-12">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-green-500 rounded-xl">
                                <Users className="text-white w-6 h-6" />
                            </div>
                            <div>
                                <h2 className="text-gray-600 text-sm font-medium">Suppliers</h2>
                                <p className="text-2xl font-bold text-gray-900">{data.suppliers}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow duration-200">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-blue-500 rounded-xl">
                                <Shield className="text-white w-6 h-6" />
                            </div>
                            <div>
                                <h2 className="text-gray-600 text-sm font-medium">Compliance Records</h2>
                                <p className="text-2xl font-bold text-gray-900">{data.compliance_records}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Sections Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Recent Suppliers */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100">
                    <div className="p-6 border-b border-gray-100">
                        <h2 className="text-gray-900 text-lg font-semibold">Recent Suppliers</h2>
                    </div>
                    <div className="p-6 h-80 overflow-y-auto">
                        {data.recent_suppliers && data.recent_suppliers.length > 0 ? (
                            <div className="space-y-4">
                                {data.recent_suppliers.map((s, idx) => (
                                    <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg flex-shrink-0">
                                        <div>
                                            <p className="text-base text-gray-900 font-semibold">{s.name}</p>
                                            <p className="text-sm text-gray-500 mt-1">
                                                {s.country} {s.last_audit && `• Last Audit: ${s.last_audit}`}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <p className="text-gray-500 text-sm">No recent suppliers.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Recent Compliance Records */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100">
                    <div className="p-6 border-b border-gray-100">
                        <h2 className="text-gray-900 text-lg font-semibold">Recent Compliance Records</h2>
                    </div>
                    <div className="p-6 h-80 overflow-y-auto">
                        {data.recent_compliance && data.recent_compliance.length > 0 ? (
                            <div className="space-y-4">
                                {data.recent_compliance.map((c, idx) => (
                                    <div key={idx} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg flex-shrink-0">
                                        <div className="flex-1">
                                            <p className="text-base text-gray-900 font-semibold">{c.supplier}</p>
                                            <p className="text-sm text-gray-500 mt-1">
                                                {c.metric} • {c.status} • {c.date_recorded}
                                            </p>
                                        </div>
                                        {c.result !== undefined && (
                                            <span className="text-sm text-blue-600 font-medium ml-4">
                                                Result: {c.result}
                                            </span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <p className="text-gray-500 text-sm">No recent compliance records.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
            
            {hasEnoughSuppliers && (
                <div className="mt-8 mb-8 flex flex-col items-center justify-center w-full">
                    <button
                        onClick={handleGetRecommendations}
                        disabled={recLoading}
                        className="inline-flex items-center bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white font-semibold px-6 py-3 rounded-lg shadow transition-colors"
                    >
                        <Bot className="w-5 h-5 mr-2" />
                        {recLoading ? 'Getting Recommendations...' : 'Get AI Supplier Recommendations'}
                    </button>
                    
                    {showRecommendations && (
                        <div className="mt-6 bg-white rounded-lg shadow-md p-6 max-w-4xl w-full">
                            <div className="flex items-center justify-between mb-4">
                                <h2 className="text-xl font-bold text-gray-900 flex items-center">
                                    <Bot className="w-5 h-5 text-purple-600 mr-2" />
                                    AI Supplier Recommendations
                                </h2>
                                {!recLoading && recommendations.length > 1 && (
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => setViewMode('best')}
                                            className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
                                                viewMode === 'best' 
                                                    ? 'bg-purple-100 text-purple-700 border border-purple-200' 
                                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-200'
                                            }`}
                                        >
                                            Best Match
                                        </button>
                                        <button
                                            onClick={() => setViewMode('all')}
                                            className={`px-4 py-2 rounded text-sm font-medium transition-colors ${
                                                viewMode === 'all' 
                                                    ? 'bg-purple-100 text-purple-700 border border-purple-200' 
                                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-200'
                                            }`}
                                        >
                                            View All ({recommendations.length})
                                        </button>
                                    </div>
                                )}
                            </div>

                            {recLoading && (
                                <div className="text-gray-600 flex items-center">
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-600 mr-2"></div>
                                    Analyzing suppliers based on your location, weather conditions, and compliance data...
                                </div>
                            )}
                            {recError && (
                                <div className="text-amber-600 bg-amber-50 p-3 rounded-lg mb-4">
                                    <strong>Note:</strong> {recError}
                                </div>
                            )}
                            {!recLoading && !recError && recommendations.length === 0 && (
                                <div className="text-gray-600 italic">No recommendations available.</div>
                            )}
                            
                            {!recLoading && recommendations.length > 0 && (
                                <>
                                    {/* Best Supplier View */}
                                    {viewMode === 'best' && (
                                        <div className="space-y-6">
                                            {(() => {
                                                // Find the best supplier (first one or the one with highest feasibility score)
                                                const bestRec = recommendations[0];
                                                return (
                                                    <div className="border-2 border-green-200 rounded-lg p-6 bg-gradient-to-br from-green-50 to-emerald-50 hover:shadow-lg transition-shadow">
                                                        <div className="flex items-center mb-4">
                                                            <CheckCircle className="w-6 h-6 text-green-600 mr-2" />
                                                            <span className="text-green-800 font-bold text-lg">🏆 Top Recommended Supplier</span>
                                                        </div>
                                                        
                                                        {bestRec.error ? (
                                                            <div className="text-red-600">
                                                                <h3 className="font-semibold text-gray-900 mb-2">{bestRec.supplier}</h3>
                                                                <p className="text-sm">{bestRec.error}</p>
                                                            </div>
                                                        ) : (
                                                            <>
                                                                <div className="flex justify-between items-start mb-6">
                                                                    <h3 className="font-bold text-gray-900 text-2xl">
                                                                        {bestRec.supplier}
                                                                    </h3>
                                                                    <div className="text-right text-sm text-gray-600 bg-white/70 rounded-lg p-3">
                                                                        <div className="font-medium">Distance: {bestRec.distance_km} km</div>
                                                                        <div>{bestRec.weather ? bestRec.weather.charAt(0).toUpperCase() + bestRec.weather.slice(1) : ''}, {bestRec.temperature}°C</div>
                                                                        {bestRec.feasibility_score && (
                                                                            <div className="text-green-600 font-semibold mt-2">
                                                                                Score: {bestRec.feasibility_score}/10
                                                                            </div>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                                
                                                                {/* Formatted Recommendation */}
                                                                <div className="bg-white/80 rounded-lg p-4 mb-4">
                                                                    {!bestRec.recommendation ? (
                                                                        <div className="text-center py-4">
                                                                            <p className="text-gray-500 italic">No recommendation available for this supplier</p>
                                                                        </div>
                                                                    ) : (() => {
                                                                        const formattedSections = formatRecommendation(bestRec.recommendation);
                                                                        return formattedSections && formattedSections.length > 0 ? (
                                                                            <div className="space-y-4">
                                                                                {formattedSections.map((section, sectionIdx) => (
                                                                                    <div key={sectionIdx}>
                                                                                        <h4 className="font-bold text-lg text-gray-900 mb-3">
                                                                                            {section.content}
                                                                                        </h4>
                                                                                        {section.items.map((item, itemIdx) => (
                                                                                            <div key={itemIdx} className="mb-4">
                                                                                                <h5 className="font-semibold text-gray-800 mb-2">
                                                                                                    {item.title}
                                                                                                </h5>
                                                                                                {item.content.map((content, contentIdx) => (
                                                                                                    <div key={contentIdx} className="ml-4 mb-2">
                                                                                                        {typeof content === 'string' ? (
                                                                                                            <p className="text-gray-700">{content}</p>
                                                                                                        ) : content.type === 'subsection' ? (
                                                                                                            <div className="mb-3">
                                                                                                                <h6 className="font-medium text-gray-800 mb-1">
                                                                                                                    {content.title}
                                                                                                                </h6>
                                                                                                                {content.content.map((subContent, subIdx) => (
                                                                                                                    <div key={subIdx} className="ml-4 mb-1">
                                                                                                                        {subContent.includes(':') ? (
                                                                                                                            <div className="flex">
                                                                                                                                <span className="font-medium text-gray-700 mr-1">
                                                                                                                                    {subContent.split(':')[0]}:
                                                                                                                                </span>
                                                                                                                                <span className="text-gray-600">
                                                                                                                                    {subContent.split(':').slice(1).join(':')}
                                                                                                                                </span>
                                                                                                                            </div>
                                                                                                                        ) : (
                                                                                                                            <p className="text-gray-600">{subContent}</p>
                                                                                                                        )}
                                                                                                                    </div>
                                                                                                                ))}
                                                                                                            </div>
                                                                                                        ) : null}
                                                                                                    </div>
                                                                                                ))}
                                                                                            </div>
                                                                                        ))}
                                                                                    </div>
                                                                                ))}
                                                                            </div>
                                                                        ) : (
                                                                            <div className="text-gray-700 whitespace-pre-line">
                                                                                {bestRec.recommendation}
                                                                            </div>
                                                                        );
                                                                    })()}
                                                                </div>

                                                                {/* Action Recommendation with Icon */}
                                                                {bestRec.recommendation && (
                                                                    <div className="mb-4">
                                                                        {(() => {
                                                                            const actionStyle = getActionStyle(bestRec.recommendation);
                                                                            const ActionIcon = actionStyle.icon;
                                                                            let actionText = 'Further Review Needed';
                                                                            
                                                                            if (bestRec.recommendation.toLowerCase().includes('monitor')) {
                                                                                actionText = 'Monitor & Evaluate';
                                                                            } else if (bestRec.recommendation.toLowerCase().includes('approve')) {
                                                                                actionText = 'Approved for Selection';
                                                                            } else if (bestRec.recommendation.toLowerCase().includes('avoid')) {
                                                                                actionText = 'Avoid Selection';
                                                                            }
                                                                            
                                                                            return (
                                                                                <div className={`flex items-center p-4 rounded-lg border-2 ${actionStyle.bg} ${actionStyle.color.replace('text-', 'border-')}`}>
                                                                                    <ActionIcon className={`w-6 h-6 ${actionStyle.color} mr-3`} />
                                                                                    <span className={`font-bold text-lg ${actionStyle.color}`}>
                                                                                        {actionText}
                                                                                    </span>
                                                                                </div>
                                                                            );
                                                                        })()}
                                                                    </div>
                                                                )}

                                                                {/* Confidence Score */}
                                                                {bestRec.confidence_score && (
                                                                    <div className="flex items-center bg-white/80 rounded-lg p-3">
                                                                        <span className="text-sm font-medium text-gray-700 mr-3">Confidence:</span>
                                                                        <div className="bg-gray-200 rounded-full h-3 w-32 mr-3">
                                                                            <div 
                                                                                className="bg-gradient-to-r from-purple-500 to-purple-600 h-3 rounded-full transition-all duration-500" 
                                                                                style={{ width: `${bestRec.confidence_score * 100}%` }}
                                                                            ></div>
                                                                        </div>
                                                                        <span className="text-sm font-bold text-gray-800">
                                                                            {Math.round(bestRec.confidence_score * 100)}%
                                                                        </span>
                                                                    </div>
                                                                )}
                                                            </>
                                                        )}
                                                    </div>
                                                );
                                            })()}
                                            
                                            {recommendations.length > 1 && (
                                                <div className="text-center pt-4">
                                                    <button
                                                        onClick={() => setViewMode('all')}
                                                        className="text-purple-600 hover:text-purple-700 text-sm font-medium underline"
                                                    >
                                                        View all {recommendations.length} recommendations →
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* All Suppliers View */}
                                    {viewMode === 'all' && (
                                        <div className="space-y-6">
                                            {recommendations.map((rec, idx) => (
                                                <div key={idx} className={`rounded-lg p-6 hover:shadow-md transition-shadow ${
                                                    idx === 0 ? 'border-2 border-green-200 bg-green-50' : 'border border-gray-200 bg-white'
                                                }`}>
                                                    {idx === 0 && (
                                                        <div className="flex items-center mb-3">
                                                            <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                                                            <span className="text-green-800 font-semibold">Top Choice</span>
                                                        </div>
                                                    )}
                                                    
                                                    {rec.error ? (
                                                        <div className="text-red-600">
                                                            <h3 className="font-semibold text-gray-900 mb-2">{rec.supplier}</h3>
                                                            <p className="text-sm">{rec.error}</p>
                                                        </div>
                                                    ) : (
                                                        <>
                                                            <div className="flex justify-between items-start mb-4">
                                                                <h3 className="font-bold text-gray-900 text-xl">
                                                                    {rec.supplier}
                                                                </h3>
                                                                <div className="text-right text-sm text-gray-500">
                                                                    <div>Distance: {rec.distance_km} km</div>
                                                                    <div>{rec.weather ? rec.weather.charAt(0).toUpperCase() + rec.weather.slice(1) : ''}, {rec.temperature}°C</div>
                                                                    {rec.feasibility_score && (
                                                                        <div className="text-purple-600 font-semibold mt-1">
                                                                            Score: {rec.feasibility_score}/10
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                            
                                                            {/* Formatted Recommendation */}
                                                            <div className="bg-gray-50 rounded-lg p-4 mb-4">
                                                                {!rec.recommendation ? (
                                                                    <div className="text-center py-4">
                                                                        <p className="text-gray-500 italic">No recommendation available for this supplier</p>
                                                                    </div>
                                                                ) : (() => {
                                                                    const formattedSections = formatRecommendation(rec.recommendation);
                                                                    return formattedSections && formattedSections.length > 0 ? (
                                                                        <div className="space-y-4">
                                                                            {formattedSections.map((section, sectionIdx) => (
                                                                                <div key={sectionIdx}>
                                                                                    <h4 className="font-bold text-lg text-gray-900 mb-3">
                                                                                        {section.content}
                                                                                    </h4>
                                                                                    {section.items.map((item, itemIdx) => (
                                                                                        <div key={itemIdx} className="mb-4">
                                                                                            <h5 className="font-semibold text-gray-800 mb-2">
                                                                                                {item.title}
                                                                                            </h5>
                                                                                            {item.content.map((content, contentIdx) => (
                                                                                                <div key={contentIdx} className="ml-4 mb-2">
                                                                                                    {typeof content === 'string' ? (
                                                                                                        <p className="text-gray-700">{content}</p>
                                                                                                    ) : content.type === 'subsection' ? (
                                                                                                        <div className="mb-3">
                                                                                                            <h6 className="font-medium text-gray-800 mb-1">
                                                                                                                {content.title}
                                                                                                            </h6>
                                                                                                            {content.content.map((subContent, subIdx) => (
                                                                                                                <div key={subIdx} className="ml-4 mb-1">
                                                                                                                    {subContent.includes(':') ? (
                                                                                                                        <div className="flex">
                                                                                                                            <span className="font-medium text-gray-700 mr-1">
                                                                                                                                {subContent.split(':')[0]}:
                                                                                                                            </span>
                                                                                                                            <span className="text-gray-600">
                                                                                                                                {subContent.split(':').slice(1).join(':')}
                                                                                                                            </span>
                                                                                                                        </div>
                                                                                                                    ) : (
                                                                                                                        <p className="text-gray-600">{subContent}</p>
                                                                                                                    )}
                                                                                                                </div>
                                                                                                            ))}
                                                                                                        </div>
                                                                                                    ) : null}
                                                                                                </div>
                                                                                            ))}
                                                                                        </div>
                                                                                    ))}
                                                                                </div>
                                                                            ))}
                                                                        </div>
                                                                    ) : (
                                                                        <div className="text-gray-700 whitespace-pre-line">
                                                                            {rec.recommendation}
                                                                        </div>
                                                                    );
                                                                })()}
                                                            </div>

                                                            {/* Action Recommendation with Icon */}
                                                            {rec.recommendation && (
                                                                <div className="mb-4">
                                                                    {(() => {
                                                                        const actionStyle = getActionStyle(rec.recommendation);
                                                                        const ActionIcon = actionStyle.icon;
                                                                        let actionText = 'Further Review Needed';
                                                                        
                                                                        if (rec.recommendation.toLowerCase().includes('monitor')) {
                                                                            actionText = 'Monitor & Evaluate';
                                                                        } else if (rec.recommendation.toLowerCase().includes('approve')) {
                                                                            actionText = 'Approved for Selection';
                                                                        } else if (rec.recommendation.toLowerCase().includes('avoid')) {
                                                                            actionText = 'Avoid Selection';
                                                                        }
                                                                        
                                                                        return (
                                                                            <div className={`flex items-center p-3 rounded-lg ${actionStyle.bg}`}>
                                                                                <ActionIcon className={`w-5 h-5 ${actionStyle.color} mr-2`} />
                                                                                <span className={`font-medium ${actionStyle.color}`}>
                                                                                    Recommended Action: {actionText}
                                                                                </span>
                                                                            </div>
                                                                        );
                                                                    })()}
                                                                </div>
                                                            )}

                                                            {/* Confidence Score */}
                                                            {rec.confidence_score && (
                                                                <div className="flex items-center">
                                                                    <span className="text-sm text-gray-500 mr-2">Confidence:</span>
                                                                    <div className="bg-gray-200 rounded-full h-2 w-20">
                                                                        <div 
                                                                            className="bg-purple-600 h-2 rounded-full" 
                                                                            style={{ width: `${rec.confidence_score * 100}%` }}
                                                                        ></div>
                                                                    </div>
                                                                    <span className="text-sm text-gray-600 ml-2">
                                                                        {Math.round(rec.confidence_score * 100)}%
                                                                    </span>
                                                                </div>
                                                            )}
                                                        </>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    )}
                </div>
            )}

  
            {!hasEnoughSuppliers && (
                <div className="mt-8 mb-8 flex flex-col items-center justify-center w-full">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 max-w-md text-center">
                        <Bot className="w-12 h-12 text-blue-500 mx-auto mb-3" />
                        <h3 className="text-lg font-semibold text-blue-900 mb-2">
                            AI Recommendations Coming Soon
                        </h3>
                        <p className="text-blue-700 text-sm">
                            Add at least 2 suppliers to unlock AI-powered recommendations based on compliance data, location, and weather conditions.
                        </p>
                        <p className="text-blue-600 text-xs mt-2">
                            Current suppliers: {data.suppliers}
                        </p>
                    </div>
                </div>
            )}
        </div>
    </div>
);
};

export default Dashboard;