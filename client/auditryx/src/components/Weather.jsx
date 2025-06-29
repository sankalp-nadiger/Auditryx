import React, { useState, useEffect } from 'react';
import { useApp } from '../App.jsx';
import { ChevronDown, ChevronUp, MapPin, Thermometer, Calendar, Bot, AlertCircle } from 'lucide-react';
import Header from './ui/Header.jsx';

const SupplierWeather = () => {
  const { data } = useApp();
  const [allSuppliers, setAllSuppliers] = useState([]);
  const [selectedSupplierId, setSelectedSupplierId] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [todayWeather, setTodayWeather] = useState(null);
  const [weatherHistory, setWeatherHistory] = useState([]);
  const [deliveryDate, setDeliveryDate] = useState("");
  const [impactResult, setImpactResult] = useState(null);
  const [checkingImpact, setCheckingImpact] = useState(false);
  // Handle check weather impact
  const handleCheckWeatherImpact = async () => {
    if (!selectedSupplierId || !todayWeather || !deliveryDate) return;
    setCheckingImpact(true);
    setImpactResult(null);
    try {
      const res = await fetch(`http://localhost:8000/weather/check-weather-impact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          supplier_id: selectedSupplierId,
          latitude: todayWeather?.lat || 0,
          longitude: todayWeather?.lon || 0,
          delivery_date: deliveryDate
        })
      });
      const data = await res.json();
      setImpactResult(data);
    } catch (e) {
      setImpactResult({ error: "Failed to check weather impact." });
    } finally {
      setCheckingImpact(false);
    }
  };
  // Fetch all suppliers on mount
  useEffect(() => {
    const fetchSuppliers = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/suppliers`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          credentials: 'include',
        });
        if (res.ok) {
          const json = await res.json();
          setAllSuppliers(json);
        } else {
          setAllSuppliers([]);
        }
      } catch {
        setAllSuppliers([]);
      }
    };
    fetchSuppliers();
  }, []);

  useEffect(() => {
    if (!selectedSupplierId) {
      setTodayWeather(null);
      setWeatherHistory([]);
      setError(null);
      setLoading(false);
      return;
    }
    const fetchAllData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [todayResponse, historyResponse] = await Promise.all([
          fetch(`http://localhost:8000/weather/today/${selectedSupplierId}`),
          fetch(`http://localhost:8000/weather/history/${selectedSupplierId}`)
        ]);
        if (!todayResponse.ok) throw new Error('Failed to fetch today\'s weather');
        if (!historyResponse.ok) throw new Error('Failed to fetch weather history');
        const todayData = await todayResponse.json();
        const historyData = await historyResponse.json();
        console.log('historyData', historyData);
        setTodayWeather(todayData);
        // Normalize history data for frontend
        if (historyData && Array.isArray(historyData.history)) {
          setWeatherHistory({
            ...historyData,
            history: historyData.history.map(day => ({
              date: day.date,
              temperature: day.temperature,
              condition: day.condition,
              humidity: day.humidity
            }))
          });
        } else {
          setWeatherHistory({ history: [] });
        }
      } catch (err) {
        setError(err.message);
        setTodayWeather(null);
        setWeatherHistory([]);
      } finally {
        setLoading(false);
      }
    };
    fetchAllData();
  }, [selectedSupplierId]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const getWeatherIcon = (condition) => {
    const icons = {
      'clear': '☀️',
      'sunny': '☀️',
      'cloudy': '☁️',
      'partly cloudy': '⛅',
      'overcast': '☁️',
      'rain': '🌧️',
      'rainy': '🌧️',
      'drizzle': '🌦️',
      'thunderstorm': '⛈️',
      'snow': '🌨️',
      'fog': '🌫️',
      'mist': '🌫️'
    };
    
    const lowerCondition = condition?.toLowerCase() || '';
    return Object.keys(icons).find(key => lowerCondition.includes(key)) 
      ? icons[Object.keys(icons).find(key => lowerCondition.includes(key))]
      : '🌤️';
  };


  // UI: Supplier selection
  return (
    <div className="fixed top-0 left-0 right-0 bottom-0 bg-white overflow-y-auto">
      <Header />
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Select Supplier to Monitor Weather</h2>
          <select
            className="w-full p-3 border border-gray-300 rounded-lg mb-4"
            value={selectedSupplierId}
            onChange={e => setSelectedSupplierId(e.target.value)}
          >
            <option value="">-- Select Supplier --</option>
            {allSuppliers && allSuppliers.length > 0 ? (
              allSuppliers.map(s => (
                <option key={s.id || s.supplier_id || s.name} value={s.id || s.supplier_id || s.name}>
                  {s.name} {s.city ? `(${s.city})` : ''}
                </option>
              ))
            ) : (
              <option disabled>No suppliers found</option>
            )}
          </select>
        </div>

        {loading && selectedSupplierId && (
          <div className="flex items-center justify-center min-h-[200px]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="ml-4 text-gray-600">Loading weather data...</p>
          </div>
        )}

        {error && (
          <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full mx-4 mx-auto">
            <div className="flex items-center text-red-600 mb-4">
              <AlertCircle className="h-6 w-6 mr-2" />
              <h2 className="text-lg font-semibold">Error Loading Data</h2>
            </div>
            <p className="text-gray-700">{error}</p>
            <button
              onClick={() => setSelectedSupplierId('')}
              className="mt-4 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
            >
              Choose Another Supplier
            </button>
          </div>
        )}


        {!loading && !error && todayWeather && (
          <>
            {/* Today's Weather Section */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <div className="flex items-center mb-4">
                <Thermometer className="h-5 w-5 text-orange-600 mr-2" />
                <h2 className="text-xl font-bold text-gray-900">Today's Weather</h2>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <span className="text-4xl mr-4">
                    {getWeatherIcon(todayWeather.condition)}
                  </span>
                  <div>
                    <p className="text-3xl font-bold text-gray-900">
                      {todayWeather.temperature}°C
                    </p>
                    <p className="text-gray-600 capitalize">
                      {todayWeather.condition}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  {/* Optionally show humidity */}
                  {todayWeather.humidity && (
                    <p className="text-sm text-gray-600">
                      Humidity: {todayWeather.humidity}%
                    </p>
                  )}
                </div>
              </div>
              {/* Delivery Date & Weather Impact */}
              <div className="mt-6">
                <label className="block mb-2 font-medium">Expected Delivery Date:</label>
                <input
                  type="date"
                  className="border p-2 rounded mr-2"
                  value={deliveryDate}
                  onChange={e => setDeliveryDate(e.target.value)}
                />
                <button
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
                  onClick={handleCheckWeatherImpact}
                  disabled={!deliveryDate || checkingImpact}
                >
                  {checkingImpact ? "Checking..." : "Check Weather Impact"}
                </button>
                {impactResult && (
                  <div className="mt-4 p-4 bg-gray-50 rounded">
                    {impactResult.error && <p className="text-red-600">{impactResult.error}</p>}
                    {impactResult.recommendation && <>
                      <p className="font-semibold mb-2">AI Recommendation for <span className="text-blue-700">{impactResult.supplier}</span> on <span className="text-blue-700">{impactResult.date}</span>:</p>
                      {/* Render markdown-style response as HTML */}
                      <div className="prose prose-sm max-w-none mb-2" dangerouslySetInnerHTML={{ __html: impactResult.recommendation.replace(/\n/g, '<br/>').replace(/\*\*/g, '<b>').replace(/\*/g, '<li>') }} />
                      <p className="text-sm text-gray-700">Compliance Updated: {impactResult.compliance_updated ? "Yes" : "No"}</p>
                    </>}
                  </div>
                )}
              </div>
            </div>

            {/* Weather History Section */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <div className="flex items-center mb-4">
                <Calendar className="h-5 w-5 text-green-600 mr-2" />
                <h2 className="text-xl font-bold text-gray-900">7-Day Weather History</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4">
                {(weatherHistory.history || []).map((day, index) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-4 text-center">
                    <p className="text-sm font-medium text-gray-700 mb-2">
                      {formatDate(day.date)}
                    </p>
                    <div className="text-2xl mb-2">
                      {getWeatherIcon(day.condition)}
                    </div>
                    <p className="text-lg font-semibold text-gray-900">
                      {day.temperature}°C
                    </p>
                    <p className="text-xs text-gray-600 capitalize mt-1">
                      {day.condition}
                    </p>
                    {day.humidity && (
                      <p className="text-xs text-gray-500 mt-1">
                        {day.humidity}% humidity
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* AI Recommendations Section removed */}
      </div>
    </div>
  );
};

export default SupplierWeather;