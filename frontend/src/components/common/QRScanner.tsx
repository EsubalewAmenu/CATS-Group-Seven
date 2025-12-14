import React, { useEffect, useRef, useState } from 'react';
import { Html5Qrcode } from 'html5-qrcode';
import { Button } from '../ui/Button';

interface QRScannerProps {
    onScanSuccess: (decodedText: string) => void;
    onScanError?: (error: string) => void;
}

export default function QRScanner({ onScanSuccess, onScanError }: QRScannerProps) {
    const [isScanning, setIsScanning] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isMobile, setIsMobile] = useState(false);
    const scannerRef = useRef<Html5Qrcode | null>(null);
    const containerId = 'qr-reader';

    // Check device type on mount
    useEffect(() => {
        const checkMobile = () => {
            const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;
            const mobileRegex = /android|avantgo|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i;
            setIsMobile(mobileRegex.test(userAgent) || window.innerWidth < 768);
        };
        checkMobile();
    }, []);

    const [isStarting, setIsStarting] = useState(false);

    const startScanning = async () => {
        setError(null);
        if (isScanning || isStarting) return;
        setIsStarting(true);

        try {
            // Always create a new instance to ensure fresh state
            if (!scannerRef.current) {
                scannerRef.current = new Html5Qrcode(containerId);
            }

            // 1. Get available cameras
            const devices = await Html5Qrcode.getCameras();
            if (!devices || devices.length === 0) {
                throw new Error("No cameras found");
            }

            // 2. Find back camera (heuristic: label contains 'back' or 'environment')
            // If not found, default to the last camera (often back on mobile)
            let cameraId = devices[0].id;
            const backCamera = devices.find(d =>
                d.label.toLowerCase().includes('back') ||
                d.label.toLowerCase().includes('environment')
            );

            if (backCamera) {
                cameraId = backCamera.id;
            } else if (devices.length > 1) {
                cameraId = devices[devices.length - 1].id;
            }

            // 3. Start scanning with specific device ID
            await scannerRef.current.start(
                cameraId,
                {
                    fps: 10,
                    qrbox: { width: 250, height: 250 },
                    aspectRatio: 1.0
                },
                (decodedText) => {
                    handleScanSuccess(decodedText);
                },
                (errorMessage) => {
                    // Ignore continuous scan errors
                }
            );

            setIsScanning(true);
        } catch (err: any) {
            console.error(err);
            const errorMessage = err?.message || 'Failed to access camera';
            setError(errorMessage);
            setIsScanning(false);

            // Clean up if start failed
            try {
                if (scannerRef.current) {
                    // If we are strictly not scanning, we might not need to stop, 
                    // but clearing lock is good.
                    // clearing innerHTML handled by React unmount or next start
                }
            } catch (cleanupErr) {
                console.warn("Cleanup after fail error", cleanupErr);
            }

            if (onScanError) {
                onScanError(errorMessage);
            }
        } finally {
            setIsStarting(false);
        }
    };

    const handleScanSuccess = async (decodedText: string) => {
        await stopScanning();
        onScanSuccess(decodedText);
    };

    const stopScanning = async () => {
        if (!scannerRef.current) return;

        try {
            // We use the library's internal state check if available, or just try-catch stop
            // Note: Html5Qrcode.isScanning property might not be publicly typed but exists
            if (isScanning) {
                await scannerRef.current.stop();
            }
        } catch (err) {
            console.warn('Error stopping scanner (may slightly race with unmount):', err);
        } finally {
            // We DO NOT call clear() here as it removes DOM nodes that React manages
            // scannerRef.current.clear(); 
            scannerRef.current = null;
            setIsScanning(false);
        }
    };

    useEffect(() => {
        return () => {
            // Cleanup on unmount - sync cleanup
            if (scannerRef.current) {
                try {
                    scannerRef.current.stop().catch(e => console.warn("Cleanup stop warning:", e));
                    scannerRef.current = null;
                } catch (e) {
                    // ignore
                }
            }
        };
    }, []);

    if (!isMobile) {
        return (
            <div className="bg-gray-100 rounded-lg p-8 text-center border-2 border-dashed border-gray-300">
                <div className="text-4xl mb-4">📱</div>
                <h3 className="text-lg font-semibold text-gray-800 mb-2">Mobile Device Required</h3>
                <p className="text-gray-600 mb-4">
                    For the best experience, please use a mobile device with a camera to scan batch QR codes.
                </p>
                <div className="text-xs text-gray-500 bg-white p-2 rounded inline-block border">
                    Switch to phone to scan
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Scanner Container Area */}
            <div className="bg-gray-900 rounded-lg p-4 max-w-sm mx-auto relative min-h-[300px]">

                {/* 1. The Scanner DOM element - React MUST NOT touch its children */}
                {/* We use a key to force re-creation if we strictly need to, but here we just leave it empty */}
                <div
                    id={containerId}
                    className="rounded-lg overflow-hidden bg-black w-full h-full absolute inset-0 z-10"
                />

                {/* 2. The Placeholder Overlay - React manages this safely */}
                {!isScanning && (
                    <div className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none">
                        <div className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg m-4 p-8 text-center text-white shadow-lg w-full h-[80%] flex flex-col justify-center items-center">
                            <div className="text-4xl mb-4">📷</div>
                            <p className="text-sm opacity-90 font-medium">Camera will appear here</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Error Display */}
            {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm text-center">
                    {error}
                </div>
            )}

            {/* Controls */}
            <div className="flex justify-center relative z-30">
                {!isScanning ? (
                    <Button onClick={startScanning} size="lg">
                        📷 Start Camera Scan
                    </Button>
                ) : (
                    <Button onClick={stopScanning} variant="outline" size="lg">
                        ⏹️ Stop Scanning
                    </Button>
                )}
            </div>
        </div>
    );
}
