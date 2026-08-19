import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  ArrowLeft, MapPin, Camera, Video, Upload, CheckCircle, AlertTriangle, 
  Sparkles, BrainCircuit, RefreshCw, X, ShieldAlert, FastForward, Play, Square 
} from 'lucide-react';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import { useAuth } from '../context/AuthContext';

// Safe custom DivIcon for GPS pin
const gpsMarkerIcon = L.divIcon({
  className: 'custom-gps-marker',
  html: `<div class="w-8 h-8 rounded-full bg-sky-500 border-2 border-white flex items-center justify-center text-white shadow-lg font-bold text-xs animate-bounce">📍</div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 32]
});

const complaintMarkerIcon = L.divIcon({
  className: 'custom-complaint-marker',
  html: `<div class="w-8 h-8 rounded-full bg-red-500 border-2 border-white flex items-center justify-center text-white shadow-lg font-bold text-xs">📍</div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 32]
});

// Component to handle map camera centering automatically
function MapController({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, 15);
    }
  }, [center, map]);
  return null;
}

// Click events wrapper to let user manually pick pin coordinate on map
function MapClickHandler({ onLocationSelect }) {
  useMapEvents({
    click(e) {
      onLocationSelect([e.latlng.lat, e.latlng.lng]);
    }
  });
  return null;
}

export default function ReportIssue() {
  const navigate = useNavigate();
  const routeLocation = useLocation();
  const { token, apiFetch } = useAuth();

  // Wizard Steps: 'form' -> 'media' -> 'ai_loading' -> 'ai_results' -> 'confirm' -> 'success'
  const [step, setStep] = useState('form');

  // Form Inputs
  const [category, setCategory] = useState(routeLocation.state?.category || 'Roads & Potholes');
  const [subcategory, setSubcategory] = useState('');
  const [description, setDescription] = useState(routeLocation.state?.description || '');

  // Geolocation states
  const [latitude, setLatitude] = useState(21.1458);
  const [longitude, setLongitude] = useState(79.0882);
  const [accuracy, setAccuracy] = useState(null);
  const [gpsTimestamp, setGpsTimestamp] = useState(null);
  const [locationName, setLocationName] = useState('Dharampeth, Nagpur');

  // Camera states
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [capturedPhoto, setCapturedPhoto] = useState(null);
  const videoRef = useRef(null);

  // Video recording states
  const [isRecording, setIsRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [recordedVideoUrl, setRecordedVideoUrl] = useState(null);
  const [recordedChunks, setRecordedChunks] = useState([]);

  // File Upload states
  const [mediaFile, setMediaFile] = useState(null);
  const [mediaType, setMediaType] = useState(''); // 'image' | 'video'
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);

  // AI Mock Analysis States
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [aiPredictiveRisk, setAiPredictiveRisk] = useState(null);

  // Loading animation triggers
  const [loadingText, setLoadingText] = useState('');
  
  // Clean resources on exit
  useEffect(() => {
    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject;
        stream.getTracks().forEach(t => t.stop());
      }
    };
  }, []);

  // 1. Geolocation handler
  const handleGetLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLatitude(pos.coords.latitude);
          setLongitude(pos.coords.longitude);
          setAccuracy(pos.coords.accuracy.toFixed(1));
          setGpsTimestamp(new Date(pos.timestamp).toLocaleTimeString());
          setLocationName('GPS Captured Location (Nagpur Zone)');
        },
        (err) => {
          console.error(err);
          // Defaults for Dharampeth
          setLatitude(21.1425);
          setLongitude(79.0601);
          setAccuracy(15.2);
          setGpsTimestamp(new Date().toLocaleTimeString());
        },
        { enableHighAccuracy: true }
      );
    }
  };

  // 2. Camera Photo Capturer
  const startCamera = async () => {
    setIsCameraActive(true);
    setCapturedPhoto(null);
    setRecordedVideoUrl(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' }
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (err) {
      console.error('Camera Access Error:', err);
      setIsCameraActive(false);
    }
  };

  const capturePhoto = () => {
    const video = videoRef.current;
    if (!video) return;

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob((blob) => {
      const file = new File([blob], `capture-${Date.now()}.jpg`, { type: 'image/jpeg' });
      setMediaFile(file);
      setMediaType('image');
      setCapturedPhoto(URL.createObjectURL(file));

      // Stop camera stream
      const stream = video.srcObject;
      stream.getTracks().forEach(track => track.stop());
      setIsCameraActive(false);
    }, 'image/jpeg');
  };

  // 3. Video Recorder
  const startRecording = async () => {
    setIsRecording(true);
    setRecordedChunks([]);
    setRecordedVideoUrl(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
        audio: true
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }

      const recorder = new MediaRecorder(stream);
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          setRecordedChunks(prev => [...prev, e.data]);
        }
      };

      recorder.onstop = () => {
        const streamTracks = stream.getTracks();
        streamTracks.forEach(t => t.stop());
      };

      recorder.start();
      setMediaRecorder(recorder);
    } catch (err) {
      console.error(err);
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && isRecording) {
      mediaRecorder.stop();
      setIsRecording(false);
    }
  };

  useEffect(() => {
    if (recordedChunks.length > 0 && !isRecording) {
      const blob = new Blob(recordedChunks, { type: 'video/mp4' });
      const file = new File([blob], `video-${Date.now()}.mp4`, { type: 'video/mp4' });
      setMediaFile(file);
      setMediaType('video');
      setRecordedVideoUrl(URL.createObjectURL(file));
    }
  }, [recordedChunks, isRecording]);

  // 4. File uploader & progress simulation
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setMediaFile(file);
    const type = file.type.startsWith('video/') ? 'video' : 'image';
    setMediaType(type);
    if (type === 'image') {
      setCapturedPhoto(URL.createObjectURL(file));
      setRecordedVideoUrl(null);
    } else {
      setRecordedVideoUrl(URL.createObjectURL(file));
      setCapturedPhoto(null);
    }
  };

  const executeUploadAndAIAnalysis = async () => {
    if (!mediaFile) {
      setStep('ai_loading');
      triggerAiLoadingSimulation();
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);

    // Simulate progress bar increments
    const interval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 90) {
          clearInterval(interval);
          return 90;
        }
        return prev + 15;
      });
    }, 150);

    try {
      // Simulate real server media upload
      const formData = new FormData();
      formData.append('media', mediaFile);
      formData.append('latitude', latitude);
      formData.append('longitude', longitude);

      const res = await fetch('/api/complaints/media', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!res.ok) throw new Error('File upload failed.');

      setUploadProgress(100);
      setTimeout(() => {
        setIsUploading(false);
        setStep('ai_loading');
        triggerAiLoadingSimulation();
      }, 500);

    } catch (err) {
      console.error(err);
      setIsUploading(false);
      clearInterval(interval);
    }
  };

  // AI loading screens interval
  const triggerAiLoadingSimulation = () => {
    const screens = [
      'Analyzing uploaded media...',
      'Detecting civic issue...',
      'Assessing severity...',
      'Checking location context...',
      'Generating prediction...'
    ];

    let idx = 0;
    setLoadingText(screens[0]);

    const loadInterval = setInterval(() => {
      idx++;
      if (idx < screens.length) {
        setLoadingText(screens[idx]);
      } else {
        clearInterval(loadInterval);
        fetchAiReports();
      }
    }, 900);
  };

  // Fetch AI Prediction Analysis
  const fetchAiReports = async () => {
    try {
      // 1. Detections/Severity
      const apiPath = mediaType === 'video' ? '/api/ai/analyze-video' : '/api/ai/analyze-image';
      const analyzeRes = await apiFetch(apiPath, {
        method: 'POST',
        body: JSON.stringify({ mediaPath: '/uploads/temp-file.jpg' })
      });

      // 2. Predictive Risk details
      const predictRes = await apiFetch('/api/ai/predict', {
        method: 'POST',
        body: JSON.stringify({ latitude, longitude, category })
      });

      setAiAnalysis(analyzeRes);
      setAiPredictiveRisk(predictRes);
      setStep('ai_results');
    } catch (err) {
      console.error(err);
      setStep('form');
    }
  };

  // Form Submit
  const handleFinalSubmit = async () => {
    try {
      const res = await apiFetch('/api/complaints/create', {
        method: 'POST',
        body: JSON.stringify({
          category,
          subcategory,
          description,
          locationName,
          latitude,
          longitude,
          locationAccuracy: accuracy,
          mediaPath: mediaType === 'video' ? recordedVideoUrl : capturedPhoto,
          mediaType,
          priority: aiPredictiveRisk?.priorityScore > 90 ? 'Critical' : 'High',
          aiScore: aiPredictiveRisk?.priorityScore || 80,
          aiCategory: aiAnalysis?.detections[0]?.category,
          aiConfidence: aiAnalysis?.detections[0]?.confidence,
          severityScore: aiAnalysis?.severityBreakdown?.issueSeverity,
          priorityScore: aiPredictiveRisk?.priorityScore,
          publicImpactScore: aiAnalysis?.severityBreakdown?.publicImpact,
          predictedRisk: JSON.stringify(aiPredictiveRisk?.predictedRisk),
          recommendedDepartment: aiAnalysis?.recommendedDepartment,
          recommendedAction: aiAnalysis?.recommendedAction
        })
      });

      if (res.success) {
        setStep('success');
        setTimeout(() => navigate('/citizen'), 3000);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="py-8 px-4 sm:px-6 lg:px-8 bg-slate-50 min-h-screen">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header */}
        <button
          onClick={() => navigate('/citizen')}
          className="flex items-center gap-2 text-slate-600 hover:text-slate-900 font-semibold text-sm transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </button>

        {/* Step 1: Initial Form & Geolocation Map */}
        {step === 'form' && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
            <div className="border-b border-slate-100 pb-3">
              <h1 className="text-xl font-extrabold text-slate-900">1. Civic Grievance Details</h1>
              <p className="text-xs text-slate-500">Provide description & pin target coordinates below.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg p-2.5 text-xs focus:outline-none focus:border-sky-500"
                >
                  <option value="Roads & Potholes">Roads & Potholes</option>
                  <option value="Water Supply">Water Supply</option>
                  <option value="Garbage">Garbage</option>
                  <option value="Drainage">Drainage</option>
                  <option value="Street Lights">Street Lights</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Subcategory</label>
                <input
                  type="text"
                  value={subcategory}
                  onChange={(e) => setSubcategory(e.target.value)}
                  placeholder="e.g. Waterlogging depth, Pothole counts"
                  className="w-full border border-slate-200 rounded-lg p-2.5 text-xs focus:outline-none focus:border-sky-500"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">Description</label>
              <textarea
                rows="3"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Give descriptive markers..."
                className="w-full border border-slate-200 rounded-lg p-2.5 text-xs focus:outline-none focus:border-sky-500"
              ></textarea>
            </div>

            {/* Geolocation Section */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-slate-700">Grievance GPS Target</label>
                <button
                  type="button"
                  onClick={handleGetLocation}
                  className="flex items-center gap-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold py-1.5 px-3 rounded-lg border border-slate-200 transition-colors"
                >
                  <MapPin className="w-3.5 h-3.5 text-sky-600" />
                  Use My Current Location
                </button>
              </div>

              {/* Coordinates display bar */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-slate-50 p-3 rounded-lg border border-slate-200 text-[10px] font-mono text-slate-600">
                <div><strong>Latitude:</strong> {latitude.toFixed(6)}</div>
                <div><strong>Longitude:</strong> {longitude.toFixed(6)}</div>
                <div><strong>Accuracy:</strong> {accuracy ? `${accuracy} meters` : 'TBD'}</div>
                <div><strong>GPS Sync:</strong> {gpsTimestamp || 'Pending'}</div>
              </div>

              {/* Interactive OpenStreetMap Container */}
              <div className="h-64 rounded-xl overflow-hidden border border-slate-200 relative z-10 shadow-inner">
                <MapContainer 
                  center={[latitude, longitude]} 
                  zoom={13} 
                  className="w-full h-full"
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <MapController center={[latitude, longitude]} />
                  <MapClickHandler onLocationSelect={([lat, lon]) => {
                    setLatitude(lat);
                    setLongitude(lon);
                    setAccuracy(6.8); // Selected manual precision multiplier
                  }} />
                  <Marker position={[latitude, longitude]} icon={gpsMarkerIcon} />
                </MapContainer>
              </div>
            </div>

            <button
              onClick={() => setStep('media')}
              className="w-full bg-nagpur-navy hover:bg-nagpur-navy-light text-white font-bold py-2.5 rounded-lg text-xs tracking-wider uppercase transition-colors"
            >
              Continue to Media Upload
            </button>
          </div>
        )}

        {/* Step 2: Media Capturer wizard */}
        {step === 'media' && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
            <div className="border-b border-slate-100 pb-3">
              <h1 className="text-xl font-extrabold text-slate-900">2. Take Photo / Record Video</h1>
              <p className="text-xs text-slate-500">Capture visual evidence live or upload an existing file.</p>
            </div>

            {/* Live Camera Area */}
            {isCameraActive && (
              <div className="space-y-4">
                <video ref={videoRef} className="w-full max-h-72 rounded-lg bg-black object-cover" autoPlay playsInline muted />
                <div className="flex gap-2 justify-center">
                  <button
                    onClick={capturePhoto}
                    className="flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2 rounded-lg text-xs"
                  >
                    <Camera className="w-4 h-4" />
                    Capture Photo
                  </button>
                  <button
                    onClick={() => {
                      if (videoRef.current?.srcObject) {
                        videoRef.current.srcObject.getTracks().forEach(t => t.stop());
                      }
                      setIsCameraActive(false);
                    }}
                    className="bg-slate-200 hover:bg-slate-300 text-slate-700 font-bold px-4 py-2 rounded-lg text-xs"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {isRecording && (
              <div className="space-y-4 text-center">
                <video ref={videoRef} className="w-full max-h-72 rounded-lg bg-black object-cover" autoPlay playsInline muted />
                <button
                  onClick={stopRecording}
                  className="flex items-center gap-1.5 bg-red-600 hover:bg-red-700 text-white font-bold px-5 py-2.5 rounded-lg text-xs mx-auto animate-pulse"
                >
                  <Square className="w-4 h-4" />
                  Stop Recording Video
                </button>
              </div>
            )}

            {/* Quick Actions Panel */}
            {!isCameraActive && !isRecording && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <button
                  onClick={startCamera}
                  className="flex flex-col items-center justify-center border-2 border-dashed border-slate-200 hover:border-sky-500 hover:bg-slate-50 rounded-xl p-5 text-slate-600 hover:text-sky-600 transition-all"
                >
                  <Camera className="w-8 h-8 mb-2" />
                  <span className="text-xs font-bold">Take Live Photo</span>
                </button>

                <button
                  onClick={startRecording}
                  className="flex flex-col items-center justify-center border-2 border-dashed border-slate-200 hover:border-sky-500 hover:bg-slate-50 rounded-xl p-5 text-slate-600 hover:text-sky-600 transition-all"
                >
                  <Video className="w-8 h-8 mb-2" />
                  <span className="text-xs font-bold">Record Live Video</span>
                </button>

                <div className="relative flex flex-col items-center justify-center border-2 border-dashed border-slate-200 hover:border-sky-500 hover:bg-slate-50 rounded-xl p-5 text-slate-600 hover:text-sky-600 transition-all cursor-pointer">
                  <input
                    type="file"
                    accept="image/*,video/*"
                    onChange={handleFileUpload}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                  <Upload className="w-8 h-8 mb-2" />
                  <span className="text-xs font-bold">Upload Local File</span>
                </div>
              </div>
            )}

            {/* Previews & upload status */}
            {(capturedPhoto || recordedVideoUrl) && (
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-4">
                <span className="text-xs font-bold text-slate-500 block uppercase">evidence file preview</span>
                <div className="rounded-lg overflow-hidden border border-slate-200 bg-white max-h-48 flex items-center justify-center">
                  {recordedVideoUrl ? (
                    <video src={recordedVideoUrl} controls className="max-h-44 w-full object-contain" />
                  ) : (
                    <img src={capturedPhoto} alt="Captured preview" className="max-h-44 w-full object-contain" />
                  )}
                </div>

                {isUploading ? (
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between font-bold text-slate-600">
                      <span>Uploading...</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-2">
                      <div className="bg-sky-500 h-2 rounded-full transition-all" style={{ width: `${uploadProgress}%` }}></div>
                    </div>
                  </div>
                ) : uploadProgress === 100 ? (
                  <div className="text-xs text-emerald-600 font-bold">Upload Complete ✓</div>
                ) : null}
              </div>
            )}

            {/* Buttons */}
            <div className="flex gap-3 pt-4 border-t border-slate-100">
              <button
                onClick={() => setStep('form')}
                className="w-1/2 py-2.5 border border-slate-200 text-slate-600 font-bold rounded-lg text-xs hover:bg-slate-50 uppercase"
              >
                Back
              </button>
              <button
                onClick={executeUploadAndAIAnalysis}
                disabled={isUploading}
                className="w-1/2 bg-sky-600 hover:bg-sky-700 text-white font-bold py-2.5 rounded-lg text-xs uppercase"
              >
                Upload & Analyze
              </button>
            </div>
          </div>
        )}

        {/* Step 3: AI Loading analysis animation */}
        {step === 'ai_loading' && (
          <div className="bg-slate-900 text-white rounded-2xl p-8 text-center space-y-6 shadow-xl py-16 animate-pulse">
            <BrainCircuit className="w-16 h-16 text-nagpur-yellow mx-auto animate-spin" />
            <h3 className="text-lg font-extrabold uppercase tracking-widest text-slate-200">AI Civic Analysis</h3>
            <p className="text-xs text-slate-400 font-mono">{loadingText}</p>
          </div>
        )}

        {/* Step 4: AI Analysis Results dashboard visualizers */}
        {step === 'ai_results' && aiAnalysis && aiPredictiveRisk && (
          <div className="space-y-6">
                 {/* Visual breakdown panel */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
              <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                <h3 className="font-extrabold text-slate-900 text-base flex items-center gap-1.5">
                  <Sparkles className="w-5 h-5 text-nagpur-yellow fill-current" />
                  AI Intelligence Verdict & Damage Assessment
                </h3>
                <span className="text-[9px] bg-sky-50 text-sky-700 border border-sky-200 font-bold px-1.5 py-0.5 rounded">{aiAnalysis.aiMode}</span>
              </div>

              {/* Confidence safety warning */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-[10px] text-slate-500 font-medium leading-normal">
                💡 <strong>Safety Statement:</strong> {aiAnalysis.disclaimer}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* 1. Detections list */}
                <div className="space-y-3">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block tracking-wider">AI Issue Detection</span>
                  <div className="space-y-2">
                    {aiAnalysis.detections.map((det, idx) => (
                      <div key={idx} className="space-y-1 text-xs">
                        <div className="flex justify-between font-semibold">
                          <span className="text-slate-700">{det.category}</span>
                          <span className="font-mono text-sky-600 font-bold">{det.confidence}%</span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-1.5">
                          <div className="bg-sky-500 h-1.5 rounded-full" style={{ width: `${det.confidence}%` }}></div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="text-[10px] text-slate-400 pt-2 border-t border-slate-100 leading-normal">
                    AI confidence indicates how strongly the model matches the uploaded media with the predicted civic category.
                  </div>
                </div>

                {/* 2. Severity score breakdown gauge */}
                <div className="text-center space-y-4">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block tracking-wider">Civic Severity Score</span>
                  
                  <div className="relative w-24 h-24 mx-auto flex items-center justify-center">
                    {/* Ring background */}
                    <div className="absolute inset-0 rounded-full border-8 border-slate-100"></div>
                    <div className="absolute inset-0 rounded-full border-8 border-orange-500 border-t-transparent border-r-transparent animate-spin-slow"></div>
                    <div className="text-center z-10">
                      <div className="text-xl font-extrabold text-slate-900">{aiAnalysis.severityBreakdown.issueSeverity}</div>
                      <div className="text-[9px] text-orange-600 font-bold uppercase tracking-wider">HIGH</div>
                    </div>
                  </div>

                  <div className="text-left space-y-1.5 text-[10px] font-medium text-slate-600">
                    <div className="flex justify-between"><span>Visual Damage:</span> <strong>{aiAnalysis.severityBreakdown.visualDamage}%</strong></div>
                    <div className="flex justify-between"><span>Public Impact:</span> <strong>{aiAnalysis.severityBreakdown.publicImpact}%</strong></div>
                    <div className="flex justify-between"><span>Safety Risk:</span> <strong>{aiAnalysis.severityBreakdown.safetyRisk}%</strong></div>
                  </div>
                </div>

                {/* 3. Priority score breakdown gauge */}
                <div className="text-center space-y-4">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block tracking-wider">AI Priority Score</span>

                  <div className="relative w-24 h-24 mx-auto flex items-center justify-center">
                    <div className="absolute inset-0 rounded-full border-8 border-slate-100"></div>
                    <div className="absolute inset-0 rounded-full border-8 border-red-500 animate-pulse"></div>
                    <div className="text-center z-10">
                      <div className="text-xl font-extrabold text-slate-900">{aiPredictiveRisk.priorityScore}</div>
                      <div className="text-[9px] text-red-600 font-bold uppercase tracking-wider">{aiPredictiveRisk.priorityScore > 90 ? 'CRITICAL' : 'HIGH'}</div>
                    </div>
                  </div>

                  <div className="text-left space-y-1.5 text-[10px] font-medium text-slate-600">
                    <div className="flex justify-between"><span>Location Risk:</span> <strong>91%</strong></div>
                    <div className="flex justify-between"><span>Hist. Frequency:</span> <strong>{aiPredictiveRisk.predictedRecurrence}%</strong></div>
                    <div className="flex justify-between"><span>Nearby Issues:</span> <strong>{aiPredictiveRisk.nearbyCount} reports</strong></div>
                  </div>
                </div>

              </div>

              {/* AI Damage Graph Visualizer & Precautionary Directives (User Request Update) */}
              <div className="border-t border-slate-100 pt-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Visual SVG Damage Graph */}
                <div className="space-y-3 bg-slate-50 p-4 rounded-xl border border-slate-100">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">AI Predicted Damage Graph</span>
                  
                  {/* SVG Chart */}
                  <div className="relative h-32 flex items-end gap-6 pt-4 px-2 border-b border-slate-200">
                    {/* Bar 1 */}
                    <div className="flex-1 flex flex-col items-center gap-1 group">
                      <div className="text-[9px] font-mono text-slate-500">{aiAnalysis.severityBreakdown.visualDamage}%</div>
                      <div 
                        className="w-full bg-indigo-500 rounded-t transition-all duration-500 origin-bottom" 
                        style={{ height: `${aiAnalysis.severityBreakdown.visualDamage}%`, maxHeight: '80px' }}
                      ></div>
                      <span className="text-[8px] text-slate-400 font-bold truncate">Visual</span>
                    </div>

                    {/* Bar 2 */}
                    <div className="flex-1 flex flex-col items-center gap-1 group">
                      <div className="text-[9px] font-mono text-slate-500">{aiAnalysis.severityBreakdown.publicImpact}%</div>
                      <div 
                        className="w-full bg-sky-500 rounded-t transition-all duration-500 origin-bottom" 
                        style={{ height: `${aiAnalysis.severityBreakdown.publicImpact}%`, maxHeight: '80px' }}
                      ></div>
                      <span className="text-[8px] text-slate-400 font-bold truncate">Public</span>
                    </div>

                    {/* Bar 3 */}
                    <div className="flex-1 flex flex-col items-center gap-1 group">
                      <div className="text-[9px] font-mono text-slate-500">{aiAnalysis.severityBreakdown.safetyRisk}%</div>
                      <div 
                        className="w-full bg-rose-500 rounded-t transition-all duration-500 origin-bottom" 
                        style={{ height: `${aiAnalysis.severityBreakdown.safetyRisk}%`, maxHeight: '80px' }}
                      ></div>
                      <span className="text-[8px] text-slate-400 font-bold truncate">Safety</span>
                    </div>

                    {/* Bar 4 */}
                    <div className="flex-1 flex flex-col items-center gap-1 group">
                      <div className="text-[9px] font-mono text-slate-500">{aiAnalysis.severityBreakdown.issueSeverity}%</div>
                      <div 
                        className="w-full bg-amber-500 rounded-t transition-all duration-500 origin-bottom" 
                        style={{ height: `${aiAnalysis.severityBreakdown.issueSeverity}%`, maxHeight: '80px' }}
                      ></div>
                      <span className="text-[8px] text-slate-400 font-bold truncate">Total</span>
                    </div>
                  </div>
                </div>

                {/* Precautions Box */}
                <div className="space-y-3 bg-amber-50/50 p-4 rounded-xl border border-amber-200">
                  <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider block flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                    Recommended Safety Precautions
                  </span>
                  <ul className="list-disc pl-4 text-[10px] text-slate-600 space-y-2 leading-relaxed font-medium">
                    <li>Maintain a minimum safe distance of 5 meters from the active incident site.</li>
                    <li>Avoid driving vehicles directly over the damaged segment or lane area.</li>
                    <li>Do not attempt manual clearing of sewers or wire bundles without NMC personnel.</li>
                    <li>Report any secondary gas smells or electric sparks immediately to NMC Emergency Cell.</li>
                  </ul>
                </div>
              </div>

            </div>

            {/* Predictive Civic Risk & Recommendation Card */}
            <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-lg space-y-5">
              <h4 className="font-extrabold text-slate-300 text-sm tracking-wider uppercase border-b border-slate-800 pb-2">Predictive Civic Risk Analytics</h4>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                  <div className="text-base font-extrabold text-sky-400">{aiPredictiveRisk.predictedRisk.waterloggingRisk}%</div>
                  <span className="text-[9px] text-slate-500 block uppercase font-bold">Flood Risk</span>
                </div>

                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                  <div className="text-base font-extrabold text-red-400">{aiPredictiveRisk.predictedRisk.roadSafetyRisk}%</div>
                  <span className="text-[9px] text-slate-500 block uppercase font-bold">Road Hazard</span>
                </div>

                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                  <div className="text-base font-extrabold text-amber-400">{aiPredictiveRisk.predictedRisk.trafficDisruptionRisk}%</div>
                  <span className="text-[9px] text-slate-500 block uppercase font-bold">Traffic Jam</span>
                </div>

                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                  <div className="text-base font-extrabold text-emerald-400">{aiPredictiveRisk.predictedRisk.publicSafetyRisk}%</div>
                  <span className="text-[9px] text-slate-500 block uppercase font-bold">Public Risk</span>
                </div>
              </div>

              {/* Recommendation Widget */}
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                <div className="flex items-center gap-1.5 text-nagpur-yellow font-extrabold text-xs">
                  <BrainCircuit className="w-4 h-4" />
                  AI Suggested Dispatch Command
                </div>
                <p className="text-xs text-slate-300 font-medium leading-relaxed">
                  "{aiAnalysis.recommendedAction}"
                </p>
                <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-400 pt-2 border-t border-slate-900">
                  <div>Department: <strong className="text-white">{aiAnalysis.recommendedDepartment}</strong></div>
                  <div>Response SLA: <strong className="text-white">{aiPredictiveRisk.suggestedResponseWindow}</strong></div>
                </div>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => setStep('media')}
                className="w-1/2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-bold py-2.5 rounded-lg text-xs uppercase"
              >
                Retake Media
              </button>
              <button
                onClick={() => setStep('confirm')}
                className="w-1/2 bg-sky-600 hover:bg-sky-700 text-white font-bold py-2.5 rounded-lg text-xs uppercase"
              >
                Accept & Review
              </button>
            </div>
          </div>
        )}

        {/* Step 5: Final Review Confirmation */}
        {step === 'confirm' && (
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm space-y-6">
            <div className="border-b border-slate-100 pb-3">
              <h1 className="text-xl font-extrabold text-slate-900">3. Confirm Submission</h1>
              <p className="text-xs text-slate-500">Verify AI-parsed telemetry and metadata log packet details.</p>
            </div>

            <div className="border border-slate-200 rounded-xl divide-y divide-slate-100 text-xs">
              <div className="p-3.5 flex justify-between">
                <span className="text-slate-400 font-bold">Detected Category:</span>
                <span className="font-extrabold text-slate-800">{aiAnalysis?.detections[0]?.category} ({aiAnalysis?.detections[0]?.confidence}% Confidence)</span>
              </div>
              <div className="p-3.5 flex justify-between">
                <span className="text-slate-400 font-bold">Calculated Severity:</span>
                <span className="font-extrabold text-orange-600">{aiAnalysis?.severityBreakdown?.issueSeverity}/100</span>
              </div>
              <div className="p-3.5 flex justify-between">
                <span className="text-slate-400 font-bold">Calculated Priority:</span>
                <span className="font-extrabold text-red-600">{aiPredictiveRisk?.priorityScore}/100</span>
              </div>
              <div className="p-3.5 flex justify-between">
                <span className="text-slate-400 font-bold">Target GPS Location:</span>
                <span className="font-semibold text-slate-600">{latitude.toFixed(4)}, {longitude.toFixed(4)} (Accuracy: {accuracy}m)</span>
              </div>
              <div className="p-3.5 flex justify-between">
                <span className="text-slate-400 font-bold">Routing Division:</span>
                <span className="font-extrabold text-slate-800">{aiAnalysis?.recommendedDepartment}</span>
              </div>
            </div>

            {/* Buttons */}
            <div className="flex gap-3">
              <button
                onClick={() => setStep('form')}
                className="w-1/2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-bold py-2.5 rounded-lg text-xs uppercase"
              >
                Edit Report
              </button>
              <button
                onClick={handleFinalSubmit}
                className="w-1/2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-lg text-xs uppercase"
              >
                Submit Complaint
              </button>
            </div>
          </div>
        )}

        {/* Step 6: Success Redirection */}
        {step === 'success' && (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 shadow-md text-center space-y-4 max-w-md mx-auto">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="w-10 h-10" />
            </div>
            <h3 className="text-lg font-extrabold text-slate-800">Complaint Logged Successfully</h3>
            <p className="text-xs text-slate-500 leading-normal">
              Your grievance has been synced to Nagpur Municipal Corporation's action grid. Redirecting...
            </p>
          </div>
        )}

      </div>
    </div>
  );
}
