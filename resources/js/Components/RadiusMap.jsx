import { useEffect, useRef, useState } from 'react';
import { Loader } from '@googlemaps/js-api-loader';
import { createPortal } from 'react-dom';
import Spinner from './Spinner';

export default function RadiusMap({
    lat,
    lng,
    onRadiusChange,
    google_map_api_key,
    isModalOpen,
    setIsModalOpen,
    defaultRadius,
}) {
    const mapRef = useRef(null);
    const circleRef = useRef(null);
    const markerRef = useRef(null);
    const [radius, setRadius] = useState(defaultRadius ?? 1000);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        if (!lat || !lng || !isModalOpen || !mapRef.current) return;

        const loader = new Loader({
            apiKey: google_map_api_key,
            version: 'weekly',
        });

        let mapInstance = null;
        let centerLockTimeout = null;
        let radiusChangedListener = null;
        let centerChangedListener = null;
        let markerDragListener = null;

        loader.load().then(() => {
            setTimeout(() => {
                mapInstance = new google.maps.Map(mapRef.current, {
                    center: { lat, lng },
                    zoom: 14,
                    mapTypeControl: false,
                });

                // Marker at center (non-draggable)
                markerRef.current = new google.maps.Marker({
                    position: { lat, lng },
                    map: mapInstance,
                    draggable: false,
                });

                // Circle for radius
                circleRef.current = new google.maps.Circle({
                    map: mapInstance,
                    center: { lat, lng },
                    radius,
                    fillColor: '#4285F4',
                    fillOpacity: 0.15,
                    strokeColor: '#4285F4',
                    strokeOpacity: 0.6,
                    strokeWeight: 2,
                    draggable: false,
                    editable: true,
                });

                setIsLoaded(true);

                // Lock center but allow resizing
                centerChangedListener = circleRef.current.addListener('center_changed', () => {
                    clearTimeout(centerLockTimeout);
                    centerLockTimeout = setTimeout(() => {
                        circleRef.current?.setCenter({ lat, lng });
                    }, 200);
                });

                // Handle radius change
                radiusChangedListener = google.maps.event.addListener(
                    circleRef.current,
                    'radius_changed',
                    () => {
                        const newRadius = Math.round(circleRef.current.getRadius());
                        setRadius(newRadius);

                    },
                );
            }, 1000);
        });

        return () => {
            if (centerChangedListener) google.maps.event.removeListener(centerChangedListener);
            if (radiusChangedListener) google.maps.event.removeListener(radiusChangedListener);
            if (markerDragListener) google.maps.event.removeListener(markerDragListener);

            if (circleRef.current) {
                circleRef.current.setMap(null);
                circleRef.current = null;
            }
            if (markerRef.current) {
                markerRef.current.setMap(null);
                markerRef.current = null;
            }

            clearTimeout(centerLockTimeout);
            mapInstance = null;
        };
    }, [lat, lng, isModalOpen]);

    const radiusConfirmed = () => {
        onRadiusChange(radius);
        setIsModalOpen(false);
    };

    if (!isModalOpen) return null;

    return createPortal(
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto sm:p-6">
            <div
                className="fixed inset-0 backdrop-blur-[32px]"
                onClick={() => setIsModalOpen(false)}
            ></div>

            {/* Modal content */}
            <div className="relative z-10 w-full max-w-4xl max-h-full p-8 overflow-y-auto shadow-2xl rounded-2xl bg-white/95 dark:bg-deepcharcoal dark:text-white/80">
                {/* Header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                        Select Radius
                    </h3>
                    <button
                        onClick={() => setIsModalOpen(false)}
                        className="text-gray-500 hover:text-gray-800 dark:hover:text-gray-200"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth={1.5}
                            stroke="currentColor"
                            className="size-6"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M6 18L18 6M6 6l12 12"
                            />
                        </svg>
                    </button>
                </div>

                {/* Map */}



                <div className="relative flex flex-col items-center gap-2 p-4">

                    {/* Map container */}
                    <div
                        ref={mapRef}
                        id="radiusMap"
                        className="h-[50vh] w-full rounded-xl border border-gray-300 dark:border-gray-700"
                    />

                    {/* Loader Overlay */}
                    {!isLoaded && (
                        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm rounded-xl">
                            <Spinner customSize="size-12" />
                        </div>
                    )}

                    {/* Radius text */}
                    <div className="flex flex-col items-center w-full gap-3">
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                            Radius: {(radius / 1000).toFixed(2)} km
                        </span>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex justify-center gap-3 px-4 py-3 border-t border-gray-200 dark:border-gray-700">
                    <button
                        onClick={() => setIsModalOpen(false)}
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-100 dark:hover:bg-gray-600"
                    >
                        Close
                    </button>

                    <button
                        onClick={() => radiusConfirmed()}
                        className="px-4 py-2 text-sm font-medium bg-indigo-600 rounded-lg text-white/80 hover:bg-indigo-500"
                    >
                        Save Radius
                    </button>
                </div>
            </div>
        </div>,
        document.body,
    );
}
