import React, { useState, useRef } from 'react';
import { BusinessSpot } from '../types';
import { logUserActivity } from '../lib/userActivity';

interface VerifyBusinessModalProps {
  isOpen: boolean;
  onClose: () => void;
  businesses: BusinessSpot[];
  userName?: string;
  userEmail?: string;
}

export const VerifyBusinessModal: React.FC<VerifyBusinessModalProps> = ({
  isOpen,
  onClose,
  businesses,
  userName,
  userEmail,
}) => {
  const [selectedBusinessId, setSelectedBusinessId] = useState(businesses[0]?.id || '');
  const [tinNumber, setTinNumber] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedSuccess, setSubmittedSuccess] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  if (!isOpen) return null;

  const startCamera = async () => {
    setIsCameraActive(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.warn('Camera access error:', err);
      // Fallback or alert user
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
    }
    setIsCameraActive(false);
  };

  const captureSnapshot = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        setCapturedImage(dataUrl);
        stopCamera();
      }
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setCapturedImage(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const spot = businesses.find((b) => b.id === selectedBusinessId);
    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      setSubmittedSuccess(true);
      if (spot) {
        spot.licenseType = 'MoT Verified';
      }
      logUserActivity({
        type: 'inquiry',
        title: 'Submitted Trade License for Verification',
        subtitle: `Verification request for ${spot?.name || 'Business'} (TIN: ${tinNumber || '00928172'})`,
        badgeText: 'Under Admin Review',
        businessId: spot?.id,
      });
    }, 1200);
  };

  const handleReset = () => {
    setSubmittedSuccess(false);
    setCapturedImage(null);
    setTinNumber('');
    setLicenseNumber('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-xl w-full overflow-hidden shadow-2xl border border-[#eceef0] flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-5 border-b border-[#eceef0] flex items-center justify-between bg-[#f8f9fc]">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-[#005f2a] text-white flex items-center justify-center font-bold shadow-sm">
              <span className="material-symbols-outlined text-[22px]">verified</span>
            </div>
            <div>
              <h3 className="font-['Plus_Jakarta_Sans'] text-[18px] font-bold text-[#191c1e]">
                Verify My Business
              </h3>
              <p className="text-[12px] text-[#6f7a6e]">
                Submit trade license documents for Ministry of Trade verification & platform badge
              </p>
            </div>
          </div>
          <button
            onClick={handleReset}
            className="w-8 h-8 rounded-full bg-[#eceef0] hover:bg-[#e2e4e8] text-[#3f493f] flex items-center justify-center transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {submittedSuccess ? (
            <div className="text-center py-12 space-y-4 animate-in zoom-in-95">
              <div className="w-20 h-20 bg-[#005f2a]/10 text-[#005f2a] rounded-full flex items-center justify-center mx-auto shadow-inner">
                <span className="material-symbols-outlined text-[42px]">task_alt</span>
              </div>
              <h4 className="font-['Plus_Jakarta_Sans'] text-[20px] font-bold text-[#191c1e]">
                Verification Request Submitted!
              </h4>
              <p className="text-[13px] text-[#3f493f] max-w-md mx-auto leading-relaxed">
                Your trade license document and credentials have been securely transmitted to the Addis Ababa Ministry of Trade registry review team. Your verification badge will be activated upon approval within 24 hours.
              </p>
              <button
                type="button"
                onClick={handleReset}
                className="px-6 py-2.5 rounded-xl bg-[#005f2a] hover:bg-[#0f7a3a] text-white text-[13px] font-bold transition-all cursor-pointer shadow-sm"
              >
                Return to Dashboard
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-[12px] font-semibold text-[#3f493f] mb-1">
                  Select Business Entity *
                </label>
                <select
                  value={selectedBusinessId}
                  onChange={(e) => setSelectedBusinessId(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#f8f9fc] border border-[#eceef0] text-[13px] text-[#191c1e] font-medium focus:outline-none focus:border-[#005f2a]"
                  required
                >
                  {businesses.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name} ({b.district})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[12px] font-semibold text-[#3f493f] mb-1">
                    Taxpayer Identification (TIN) *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., 0092817263"
                    value={tinNumber}
                    onChange={(e) => setTinNumber(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#f8f9fc] border border-[#eceef0] text-[13px] text-[#191c1e] focus:outline-none focus:border-[#005f2a]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[12px] font-semibold text-[#3f493f] mb-1">
                    Trade License Number *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g., MoT-8839201"
                    value={licenseNumber}
                    onChange={(e) => setLicenseNumber(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-[#f8f9fc] border border-[#eceef0] text-[13px] text-[#191c1e] focus:outline-none focus:border-[#005f2a]"
                    required
                  />
                </div>
              </div>

              {/* Camera Capture Section */}
              <div className="space-y-2 pt-1">
                <label className="block text-[12px] font-semibold text-[#3f493f]">
                  Trade License / MoT Certificate Document (Camera Capture or Upload) *
                </label>

                {capturedImage ? (
                  <div className="relative rounded-2xl overflow-hidden border border-[#eceef0] bg-black/5 p-2 text-center">
                    <img
                      src={capturedImage}
                      alt="Captured License"
                      className="max-h-48 mx-auto rounded-xl object-contain shadow-sm"
                    />
                    <button
                      type="button"
                      onClick={() => setCapturedImage(null)}
                      className="mt-2 px-3 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 text-[12px] font-bold transition-colors cursor-pointer"
                    >
                      Retake Photo / Choose Another File
                    </button>
                  </div>
                ) : isCameraActive ? (
                  <div className="relative rounded-2xl overflow-hidden bg-black aspect-video flex flex-col items-center justify-center">
                    <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />
                    <canvas ref={canvasRef} className="hidden" />
                    <div className="absolute bottom-3 flex items-center gap-2">
                      <button
                        type="button"
                        onClick={captureSnapshot}
                        className="px-4 py-2 rounded-xl bg-[#005f2a] text-white text-[13px] font-bold shadow-md cursor-pointer flex items-center gap-1.5"
                      >
                        <span className="material-symbols-outlined text-[16px]">photo_camera</span>
                        <span>Capture Document</span>
                      </button>
                      <button
                        type="button"
                        onClick={stopCamera}
                        className="px-4 py-2 rounded-xl bg-white/90 text-gray-800 text-[13px] font-bold cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={startCamera}
                      className="p-4 rounded-2xl border-2 border-dashed border-[#005f2a]/40 bg-[#005f2a]/5 hover:bg-[#005f2a]/10 flex flex-col items-center justify-center gap-2 text-[#005f2a] transition-all cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[28px]">photo_camera</span>
                      <span className="text-[13px] font-bold">Use Device Camera</span>
                    </button>
                    <label className="p-4 rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50 hover:bg-gray-100 flex flex-col items-center justify-center gap-2 text-gray-700 transition-all cursor-pointer">
                      <span className="material-symbols-outlined text-[28px]">upload_file</span>
                      <span className="text-[13px] font-bold">Upload Image / PDF</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                )}
              </div>

              <div className="p-3.5 rounded-xl bg-[#f8f9fc] border border-[#eceef0] flex items-start gap-2.5">
                <span className="material-symbols-outlined text-[#005f2a] text-[18px] mt-0.5">info</span>
                <p className="text-[11px] text-[#6f7a6e] leading-relaxed">
                  By submitting this request, you attest under penalty of commercial perjury that you are the authorized legal representative of the listed business entity.
                </p>
              </div>

              {/* Footer Buttons */}
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl bg-[#f8f9fc] hover:bg-[#eceef0] text-[#3f493f] text-[13px] font-bold transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || !capturedImage}
                  className={`px-5 py-2.5 rounded-xl text-[13px] font-bold text-white transition-all flex items-center gap-1.5 ${
                    isSubmitting || !capturedImage
                      ? 'bg-gray-300 cursor-not-allowed'
                      : 'bg-[#005f2a] hover:bg-[#0f7a3a] cursor-pointer shadow-sm'
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                      <span>Submitting...</span>
                    </>
                  ) : (
                    <>
                      <span className="material-symbols-outlined text-[16px]">verified</span>
                      <span>Submit for Verification</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
