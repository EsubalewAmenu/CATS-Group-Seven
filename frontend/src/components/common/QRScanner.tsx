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

    const startScanning = async () => {
        setError(null);

        try {
            if (!scannerRef.current) {
                scannerRef.current = new Html5Qrcode(containerId);
            }

            await scannerRef.current.start(
                { facingMode: 'environment' },
                {
                    fps: 5, // Reduced from 10 to 5 for better performance
                    qrbox: { width: 250, height: 250 },
                    aspectRatio: 1.0,
                    // Limit resolution processing to avoid freezing on high-res cameras
                    videoConstraints: {
                        width: { min: 640, ideal: 720, max: 1280 },
                        height: { min: 480, ideal: 720, max: 720 },
                    }
                },
                (decodedText) => {
                    // Stop scanning on success
                    stopScanning();
                    onScanSuccess(decodedText);
                },
                (errorMessage) => {
                    // Ignore continuous scan errors (normal behavior)
                }
            );

            setIsScanning(true);
        } catch (err: any) {
            const errorMessage = err?.message || 'Failed to access camera';
            setError(errorMessage);
            if (onScanError) {
                onScanError(errorMessage);
            }
        }
    };

    const stopScanning = async () => {
        if (scannerRef.current && isScanning) {
            try {
                await scannerRef.current.stop();
            } catch (err) {
                console.error('Error stopping scanner:', err);
            }
        }
        setIsScanning(false);
    };

    useEffect(() => {
        return () => {
            // Cleanup on unmount
            if (scannerRef.current) {
                if (scannerRef.current.isScanning) {
                    scannerRef.current.stop().catch(() => { });
                }
                scannerRef.current.clear();
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
            {/* Scanner Container */}
            <div className="bg-gray-900 rounded-lg p-4 max-w-sm mx-auto">
                <div
                    id={containerId}
                    className="rounded-lg overflow-hidden bg-black"
                    style={{ width: '100%', minHeight: '300px' }} // Fixed height to prevent layout shift
                >
                    {!isScanning && (
                        <div className="h-[300px] bg-gradient-to-br from-purple-500 to-pink-600 rounded flex items-center justify-center">
                            <div className="text-center text-white p-4">
                                <div className="text-4xl mb-2">📷</div>
                                <p className="text-sm opacity-75">Camera will appear here</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Error Display */}
            {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm text-center">
                    {error}
                </div>
            )}

            {/* Controls */}
            <div className="flex justify-center">
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
