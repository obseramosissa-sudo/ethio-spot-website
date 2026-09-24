import React, { useEffect, useRef, useState } from 'react';

interface CameraCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (dataUrl: string) => void;
  title?: string;
}

export const CameraCaptureModal: React.FC<CameraCaptureModalProps> = ({
  isOpen,
  onClose,
  onCapture,
  title = 'Capture Photo from Camera',
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    if (!isOpen) {
      // Stop camera stream when modal closes
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
        setStream(null);
      }
      setCapturedImage(null);
      setErrorMsg(null);
      setIsInitializing(true);
      return;
    }

    let activeStream: MediaStream | null = null;
    async function startCamera() {
      setIsInitializing(true);
      setErrorMsg(null);
      try {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          throw new Error('Camera MediaDevices API is not supported in this browser or iframe context.');
        }
        activeStream = await navigator.mediaDevices.getUserMedia({
          video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: 'user' },
          audio: false,
        });
        setStream(activeStream);
        if (videoRef.current) {
          videoRef.current.srcObject = activeStream;
        }
      } catch (err: any) {
        console.error('Camera access error:', err);
        setErrorMsg(
          err?.message ||
            'Unable to access camera. Please verify camera permissions in your browser or sandbox settings.'
        );
      } finally {
        setIsInitializing(false);
      }
    }

    startCamera();

    return () => {
      if (activeStream) {
        activeStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [isOpen]);

  const handleCapturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
      setCapturedImage(dataUrl);
    }
  };

  const handleRetake = () => {
    setCapturedImage(null);
  };

  const handleConfirm = () => {
    if (capturedImage) {
      onCapture(capturedImage);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-xl w-full overflow-hidden shadow-2xl border border-[#eceef0] flex flex-col">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-[#eceef0] flex items-center justify-between bg-[#f8f9fc]">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[#005f2a] text-[22px]">photo_camera</span>
            <h3 className="font-['Plus_Jakarta_Sans'] text-[18px] font-bold text-[#191c1e]">
              {title}
            </h3>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="w-8 h-8 rounded-full bg-[#eceef0] hover:bg-[#e2e4e8] text-[#3f493f] flex items-center justify-center transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">close</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 flex flex-col items-center justify-center bg-[#111] min-h-[320px] relative">
          {errorMsg ? (
            <div className="text-center p-6 space-y-3">
              <span className="material-symbols-outlined text-amber-400 text-[48px]">videocam_off</span>
              <p className="text-[14px] text-white/90 max-w-md leading-relaxed">{errorMsg}</p>
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl bg-[#005f2a] text-white font-semibold text-[13px] hover:bg-[#0f7a3a] transition-all"
              >
                Close Camera Window
              </button>
            </div>
          ) : isInitializing ? (
            <div className="text-center p-6 space-y-3">
              <div className="w-10 h-10 border-4 border-[#005f2a] border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-[13px] text-white/80">Initializing MediaDevices camera stream...</p>
            </div>
          ) : capturedImage ? (
            <div className="relative w-full flex flex-col items-center">
              <img
                src={capturedImage}
                alt="Captured Preview"
                className="max-h-[360px] rounded-2xl object-contain border border-white/20 shadow-lg"
              />
              <span className="absolute top-3 left-3 px-3 py-1 rounded-full bg-[#005f2a] text-white text-[11px] font-bold shadow">
                Captured Preview
              </span>
            </div>
          ) : (
            <div className="relative w-full overflow-hidden rounded-2xl bg-black flex items-center justify-center shadow-inner">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full max-h-[380px] object-cover rounded-2xl transform -scale-x-100"
              />
              <div className="absolute bottom-3 px-3 py-1 rounded-full bg-black/50 backdrop-blur-md text-white text-[11px] font-medium flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                <span>Live Camera Feed</span>
              </div>
            </div>
          )}

          <canvas ref={canvasRef} className="hidden" />
        </div>

        {/* Modal Footer Controls */}
        <div className="px-6 py-4 bg-white border-t border-[#eceef0] flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-[#eceef0] hover:bg-[#e2e4e8] text-[#191c1e] text-[13px] font-semibold transition-colors cursor-pointer"
          >
            Cancel
          </button>

          {!errorMsg && !isInitializing && (
            <div className="flex items-center gap-3">
              {capturedImage ? (
                <>
                  <button
                    type="button"
                    onClick={handleRetake}
                    className="px-5 py-2.5 rounded-xl bg-[#eceef0] hover:bg-[#e2e4e8] text-[#191c1e] text-[13px] font-semibold transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[16px]">replay</span>
                    <span>Retake Photo</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleConfirm}
                    className="px-6 py-2.5 rounded-xl bg-[#005f2a] hover:bg-[#0f7a3a] text-white text-[13px] font-bold transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[16px]">check</span>
                    <span>Use Photo</span>
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  onClick={handleCapturePhoto}
                  className="px-8 py-3 rounded-2xl bg-[#005f2a] hover:bg-[#0f7a3a] text-white text-[14px] font-bold transition-all shadow-lg flex items-center gap-2 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[20px]">aperture</span>
                  <span>Take Photo</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
