import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import MapPicker from '../../components/MapPicker';
import api from '../../services/api';
import {
  Sparkles,
  Upload,
  AlertCircle,
  CheckCircle2,
  Info,
  ArrowRight,
  ShieldAlert,
  Loader2,
  MapPin,
  Check
} from 'lucide-react';

const CATEGORIES = [
  'Potholes & Damaged Roads',
  'Garbage Accumulation & Sanitation',
  'Blocked Drainage & Waterlogging',
  'Broken Streetlights & Electrical',
  'Water Leakage & Pipeline Issues',
  'Damaged Footpaths & Public Infrastructure',
  'Other Civic Grievances'
];

const SubmitComplaint = () => {
  const navigate = useNavigate();

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [latitude, setLatitude] = useState(28.6315);
  const [longitude, setLongitude] = useState(77.2195);
  const [address, setAddress] = useState('');
  const [landmark, setLandmark] = useState('');
  const [city, setCity] = useState('New Delhi');
  const [pincode, setPincode] = useState('');

  // Image upload state
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  // AI Assistant State
  const [aiAnalyzing, setAiAnalyzing] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState(null);
  const [aiAccepted, setAiAccepted] = useState(false);

  // Submission State
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [resultSuccess, setResultSuccess] = useState(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('Image file is too large. Maximum allowed size is 5MB.');
        return;
      }
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      setError('');
    }
  };

  const handleLocationChange = (lat, lng) => {
    setLatitude(lat);
    setLongitude(lng);
  };

  // Trigger AI Category Prediction
  const handleAnalyzeWithAI = async () => {
    if (!description || description.trim().length < 8) {
      setError('Please provide at least 8 characters in the description for AI classification.');
      return;
    }

    setAiAnalyzing(true);
    setError('');

    try {
      const res = await api.post('/complaints/test-ai-prediction', {
        text: description
      });

      if (res.data.success && res.data.prediction) {
        setAiSuggestion(res.data.prediction);
        // Automatically prefill category if user hasn't selected one
        if (!category) {
          setCategory(res.data.prediction.category);
          setAiAccepted(true);
        }
      }
    } catch (err) {
      console.warn('AI service temporary offline, using heuristics:', err);
    } finally {
      setAiAnalyzing(false);
    }
  };

  const handleAcceptAISuggestion = () => {
    if (aiSuggestion) {
      setCategory(aiSuggestion.category);
      setAiAccepted(true);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!title.trim() || !description.trim()) {
      setError('Title and description are required.');
      return;
    }

    setSubmitting(true);

    try {
      const formData = new FormData();
      formData.append('title', title.trim());
      formData.append('description', description.trim());
      formData.append('category', category || (aiSuggestion?.category || 'Potholes & Damaged Roads'));
      formData.append('latitude', latitude);
      formData.append('longitude', longitude);
      formData.append('address', address);
      formData.append('landmark', landmark);
      formData.append('city', city);
      formData.append('pincode', pincode);

      if (imageFile) {
        formData.append('image', imageFile);
      }

      const res = await api.post('/complaints', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (res.data.success) {
        setResultSuccess(res.data);
      }
    } catch (err) {
      console.error('Submission error:', err);
      setError(err.response?.data?.message || 'Failed to submit complaint. Please check fields.');
    } finally {
      setSubmitting(false);
    }
  };

  // If successfully submitted, show receipt confirmation card
  if (resultSuccess) {
    const { complaint, duplicateAlert } = resultSuccess;
    return (
      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-sm space-y-6 text-center animate-in fade-in zoom-in-95 duration-200">
          
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-9 h-9" />
          </div>

          <div className="space-y-1">
            <h2 className="text-2xl font-extrabold text-slate-900">Complaint Registered Successfully!</h2>
            <p className="text-xs text-slate-500">
              Your issue has been logged into the municipal database and routed to field maintenance.
            </p>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-left space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200 pb-2">
              <span className="text-xs text-slate-500 font-semibold">Unique Complaint ID:</span>
              <span className="font-mono text-sm font-extrabold text-blue-700 bg-blue-50 px-3 py-0.5 rounded border border-blue-200">
                {complaint.complaintId}
              </span>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500">Category:</span>
              <span className="font-semibold text-slate-800">{complaint.category}</span>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500">Assigned Department:</span>
              <span className="font-semibold text-slate-800">
                {complaint.departmentId?.name || 'Municipal Maintenance Division'}
              </span>
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500">Recommended Priority:</span>
              <span className={`font-bold ${
                complaint.priority === 'High' ? 'text-red-600' : 'text-amber-600'
              }`}>
                {complaint.priority} Priority
              </span>
            </div>
          </div>

          {/* Duplicate Alert Notice if Detected */}
          {duplicateAlert && (
            <div className="p-4 bg-amber-50 border border-amber-300 rounded-xl text-left space-y-1">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-800">
                <AlertCircle className="w-4 h-4 text-amber-600" />
                <span>AI Duplicate Detection Notice</span>
              </div>
              <p className="text-xs text-amber-700 leading-relaxed">
                {duplicateAlert.message} (Matched ID: <strong className="font-mono">{duplicateAlert.matchedComplaintId}</strong> with {(duplicateAlert.similarityScore * 100).toFixed(0)}% text & proximity similarity).
              </p>
              <p className="text-[11px] text-amber-600 italic">
                Your report has been preserved and grouped for municipal authority inspection.
              </p>
            </div>
          )}

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={() => navigate(`/complaints/${complaint.complaintId}`)}
              className="w-full sm:w-auto px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-lg shadow transition-all flex items-center justify-center gap-2"
            >
              <span>Track Live Status</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                setResultSuccess(null);
                setTitle('');
                setDescription('');
                setCategory('');
                setImageFile(null);
                setImagePreview(null);
                setAiSuggestion(null);
              }}
              className="w-full sm:w-auto px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-lg transition-all"
            >
              Report Another Issue
            </button>
          </div>

        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Title */}
      <div className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Report a Civic Grievance
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Provide problem details, upload an on-site photo, and pin the exact street location.
        </p>
      </div>

      {error && (
        <div className="p-4 text-xs bg-red-50 text-red-700 border border-red-200 rounded-xl flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Submission Form */}
      <form onSubmit={handleSubmit} className="space-y-8">
        
        {/* Step 1: Issue Description & AI Analysis */}
        <div className="bg-white p-6 sm:p-7 rounded-xl border border-slate-200/90 shadow-sm space-y-5">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-800 border-b border-slate-100 pb-3">
            <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-bold">1</span>
            <span>Describe the Civic Issue</span>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Complaint Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Deep crater pothole near Outer Ring Road bus stand"
              className="w-full text-xs rounded-md border border-slate-300 py-2.5 px-3 focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-slate-700">
                Detailed Description <span className="text-red-500">*</span>
              </label>
              <button
                type="button"
                onClick={handleAnalyzeWithAI}
                disabled={aiAnalyzing || !description}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200 px-2.5 py-1 rounded transition-colors disabled:opacity-50"
              >
                {aiAnalyzing ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Analyzing with ML...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                    <span>Analyze Category with AI</span>
                  </>
                )}
              </button>
            </div>
            <textarea
              required
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the severity, duration, hazards, and exact nature of the problem (e.g. 'Water is continuously leaking from a pipe under the pavement flooding the street...')"
              className="w-full text-xs rounded-md border border-slate-300 p-3 focus:ring-2 focus:ring-blue-500 focus:outline-none leading-relaxed"
            />
            <p className="text-[11px] text-slate-400 mt-1">
              Tip: Mentioning hazards like "accident", "hospital", "children", or "live wire" triggers high-priority recommendations.
            </p>
          </div>

          {/* AI Category Assistant Card */}
          {aiSuggestion && (
            <div className="p-4 bg-gradient-to-r from-blue-50/70 via-indigo-50/50 to-blue-50/70 rounded-xl border border-blue-200 space-y-3 animate-in fade-in duration-200">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-blue-900 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-blue-600" />
                  AI Classification Result
                </span>
                <span className="text-[11px] font-semibold text-blue-700 bg-white px-2 py-0.5 rounded border border-blue-200">
                  Confidence: {(aiSuggestion.confidence * 100).toFixed(1)}%
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-slate-500 text-[11px]">Suggested Category:</span>
                  <p className="font-bold text-slate-800">{aiSuggestion.category}</p>
                </div>
                <div>
                  <span className="text-slate-500 text-[11px]">Recommended Department:</span>
                  <p className="font-bold text-slate-800">{aiSuggestion.suggested_department}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleAcceptAISuggestion}
                  className={`text-xs font-semibold px-3 py-1.5 rounded-md transition-all flex items-center gap-1.5 ${
                    category === aiSuggestion.category
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'bg-blue-600 hover:bg-blue-500 text-white'
                  }`}
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>{category === aiSuggestion.category ? 'AI Suggestion Applied' : 'Accept AI Category'}</span>
                </button>
                <span className="text-[11px] text-slate-500">or override manually below</span>
              </div>
            </div>
          )}

          {/* Category Dropdown */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Selected Civic Category <span className="text-red-500">*</span>
            </label>
            <select
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                setAiAccepted(false);
              }}
              required
              className="w-full text-xs rounded-md border border-slate-300 py-2.5 px-3 bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <option value="">Select or confirm category...</option>
              {CATEGORIES.map((cat, idx) => (
                <option key={idx} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

        </div>

        {/* Step 2: Issue Photograph Upload */}
        <div className="bg-white p-6 sm:p-7 rounded-xl border border-slate-200/90 shadow-sm space-y-4">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-800 border-b border-slate-100 pb-3">
            <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-bold">2</span>
            <span>Upload Issue Photograph</span>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <label className="flex flex-col items-center justify-center w-full sm:w-64 h-36 border-2 border-slate-300 border-dashed rounded-xl cursor-pointer hover:bg-slate-50 transition-colors">
              <Upload className="w-7 h-7 text-slate-400 mb-1" />
              <span className="text-xs font-semibold text-slate-700">Click to upload photo</span>
              <span className="text-[10px] text-slate-400 mt-0.5">JPEG, PNG, WebP up to 5MB</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="hidden"
              />
            </label>

            {imagePreview ? (
              <div className="relative h-36 w-48 rounded-xl overflow-hidden border border-slate-200 shadow-sm group">
                <img src={imagePreview} alt="Selected Issue" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => {
                    setImageFile(null);
                    setImagePreview(null);
                  }}
                  className="absolute top-1.5 right-1.5 bg-red-600/90 text-white text-[10px] px-2 py-0.5 rounded shadow opacity-90 hover:opacity-100"
                >
                  Remove
                </button>
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic">
                Photographs help municipal field crews verify problem severity and location immediately.
              </p>
            )}
          </div>
        </div>

        {/* Step 3: Location Pin & Address */}
        <div className="bg-white p-6 sm:p-7 rounded-xl border border-slate-200/90 shadow-sm space-y-5">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-800 border-b border-slate-100 pb-3">
            <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs flex items-center justify-center font-bold">3</span>
            <span>Pin Geographical Location</span>
          </div>

          {/* Interactive Leaflet Map Picker */}
          <MapPicker
            defaultLat={latitude}
            defaultLng={longitude}
            onLocationChange={handleLocationChange}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Street Address / Road Name
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="e.g. Near Metro Pillar 128, Janpath"
                className="w-full text-xs rounded-md border border-slate-300 py-2.5 px-3 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Prominent Landmark
              </label>
              <input
                type="text"
                value={landmark}
                onChange={(e) => setLandmark(e.target.value)}
                placeholder="e.g. Opposite Central Bank ATM"
                className="w-full text-xs rounded-md border border-slate-300 py-2.5 px-3 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                City / Municipal Zone
              </label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="New Delhi"
                className="w-full text-xs rounded-md border border-slate-300 py-2.5 px-3 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                PIN Code
              </label>
              <input
                type="text"
                value={pincode}
                onChange={(e) => setPincode(e.target.value)}
                placeholder="110001"
                className="w-full text-xs rounded-md border border-slate-300 py-2.5 px-3 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Submit Actions */}
        <div className="flex items-center justify-end gap-3 pt-4">
          <button
            type="button"
            onClick={() => navigate('/citizen/dashboard')}
            className="px-5 py-2.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="px-7 py-3 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs sm:text-sm rounded-lg shadow-md transition-all disabled:opacity-50 flex items-center gap-2"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Registering Complaint...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Submit Civic Complaint</span>
              </>
            )}
          </button>
        </div>

      </form>

    </div>
  );
};

export default SubmitComplaint;
