import { useEffect, useRef, useState } from 'react';
import { Loader } from '@googlemaps/js-api-loader';
import { createPortal } from 'react-dom';
import Spinner from './Spinner';
import WebInput from './WebInput';
import useWindowSize from '@/Hooks/useWindowSize';
import { ChevronLeft } from 'lucide-react';


export default function RadiusMap({
    lat,
    lng,
    onRadiusChange,
    google_map_api_key,
    isModalOpen,
    setIsModalOpen,
    defaultRadius,
    __,
}) {
    const mapRef = useRef(null);
    const circleRef = useRef(null);
    const markerRef = useRef(null);
    const [radius, setRadius] = useState(defaultRadius ?? 1000);
    const [isLoaded, setIsLoaded] = useState(false);

    const windowSize = useWindowSize();



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
        <div className={`fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto ${windowSize.width <= 1024 ? 'p-0' : 'p-4 sm:p-6'}`}>
            <div
                className="fixed inset-0 "
                onClick={() => setIsModalOpen(false)}
            ></div>

            {/* Modal content */}
            <div
                className={`relative z-50 w-full overflow-y-auto border ${windowSize.width <= 1024
                    ? 'h-full max-w-full rounded-none border-none'
                    : 'max-w-4xl max-h-[90vh] rounded-xl border-surface-3-light dark:border-surface-3-dark'
                    } ${windowSize.width <= 1024
                        ? 'dark:bg-backgroundDark'
                        : 'dark:bg-surface-1-dark'
                    } bg-backgroundLight dark:text-main-text-dark`}
            >
                {/* PC */}
                {/* Header */}
                {windowSize.width > 1024 && (
                    <div className={`flex items-center justify-start px-8 py-6`}>

                        <h3 className={`font-semibold text-main-text-light dark:text-main-text-dark ${windowSize.width <= 1024 ? 'text-lg' : 'text-xl'}`}>
                            {__('Select Radius')}
                        </h3>
                    </div>
                )}
                {/* MOBILE */}
                {/* Header */}
                {windowSize.width <= 1024 && (
                    <div className="flex items-center justify-center px-4 py-3">
                        <button
                            onClick={() => setIsModalOpen(false)}
                            className="absolute p-1 text-black rounded-full left-4 dark:text-main-text-dark"
                        >
                            <ChevronLeft />
                        </button>

                        <h2 className="mx-10 text-xl font-semibold tracking-tight text-main-text-light dark:text-main-text-dark">
                            {__('Select Radius')}
                        </h2>
                    </div>

                )}
                {/* Map */}
                <div className={`relative flex flex-col items-center gap-2 ${windowSize.width <= 1024 ? 'px-4 py-2' : 'px-8 pt-4'}`}>
                    {/* Map container */}
                    <div
                        ref={mapRef}
                        id="radiusMap"
                        className={`w-full rounded-md border border-surface-3-light dark:border-surface-3-dark ${windowSize.width <= 1024
                            ? 'h-[40vh]'
                            : 'h-[50vh]'
                            }`}
                    />

                    {/* Loader Overlay */}
                    {!isLoaded && (
                        <div className="absolute inset-0 z-50 flex items-center justify-center bg-main-text-light/30 backdrop-blur-sm rounded-xl">
                            <Spinner customSize="size-12" />
                        </div>
                    )}

                    {/* Radius */}
                    <div className="flex flex-col items-center w-full gap-2 mt-4">
                        <label className="text-sm text-sub-text-light dark:text-sub-text-dark">
                            {__('Radius')}
                        </label>

                        <div className="relative w-full lg:max-w-xs">
                            <WebInput
                                Type={'number'}
                                Value={radius / 1000}
                                Action={(e) => {
                                    const value = e.target.value;

                                    if (value === '') {
                                        setRadius(0);
                                    }

                                    const km = parseFloat(value);

                                    if (isNaN(km)) return;

                                    const meters = km * 1000;
                                    setRadius(meters);

                                    if (circleRef.current) {
                                        circleRef.current.setRadius(meters);
                                    }
                                }}
                            />

                            {/* KM suffix */}
                            <span className="absolute text-sm -translate-y-1/2 pointer-events-none right-7 top-7 text-sub-text-light dark:text-sub-text-dark">
                                KM
                            </span>
                        </div>
                    </div>
                </div>

                {/* Helper Text */}
                <div className={`flex items-center justify-center gap-3 ${windowSize.width <= 1024 ? 'px-4 pb-3' : 'px-8 pb-4'}`}>
                    <span className="text-xs text-center text-sub-text-light dark:text-sub-text-dark">
                        {__('You can drag the circle on the map or enter radius manually')}
                    </span>
                </div>

                {/* Footer */}
                <div className={`flex gap-3 ${windowSize.width <= 1024 ? 'flex-col px-4 pb-6 pt-2' : 'justify-end px-8 pb-6'}`}>
                    <button
                        onClick={() => setIsModalOpen(false)}
                        className={`px-4 py-2 text-md font-medium rounded-md bg-surface-2-light text-main-text-light transition-all hover:bg-surface-3-light dark:hover:bg-surface-3-dark/80 dark:text-sub-text-dark dark:bg-surface-3-dark ${windowSize.width <= 1024
                            ? 'w-full h-12 order-2'
                            : 'w-[160px] h-[46px]'
                            }`}
                    >
                        {__('Close')}
                    </button>

                    <button
                        onClick={() => radiusConfirmed()}
                        className={`px-4 py-2 text-md font-semibold justify-center gap-2 rounded-md bg-main-text-light text-main-text-dark transition-all hover:bg-main-text-light/80 dark:bg-main-text-dark dark:text-main-text-light dark:hover:bg-main-text-dark/80 ${windowSize.width <= 1024
                            ? 'w-full h-12 order-1'
                            : 'w-[160px] h-[46px]'
                            }`}
                    >
                        {__('Save Radius')}
                    </button>
                </div>
            </div>
        </div>,
        document.getElementById('modal-root') || document.body,
    );
}
