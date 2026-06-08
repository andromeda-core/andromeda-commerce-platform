import { useEffect, useRef, useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2';
import { Loader } from '@googlemaps/js-api-loader';
import Input from '@/Components/Input';
import PrimaryButton from '@/Components/PrimaryButton';
import SelectInput from '@/Components/SelectInput';
import Toast from '@/Components/Toast';

// Fully automatic location handling, mirrored from the Posts/Smartphones implementation.
// Resolves latitude / longitude / location_name through the backend Google geocoding service
// and writes them into the shared form state (data) — the raw values are never editable.
export default function LocationDetector({ data, setData, errors, googleMapSettings }) {
    // Location resolution method picker: '' (none) | 0 auto | 1 autocomplete | 2 map search.
    const [locationDetector, setLocationDetector] = useState('');

    const [LocationGotSuccessMessage, setLocationGotSuccessMessage] = useState(null);

    // Auto-completion modal state.
    const [autoCompletionLocationModalOpen, setAutoCompletionLocationModalOpen] = useState(false);
    const [autoCompletionLocationSearch, setAutoCompletionLocationSearch] = useState('');
    const [autoCompletionInfoMessage, setAutoCompletionInfoMessage] = useState('');
    const [autoCompletionLoading, setAutoCompletionLoading] = useState(false);
    const [autoCompletionResults, setAutoCompletionResults] = useState([]);
    const [showDropdown, setShowDropdown] = useState(false);

    const [selectedPlaceId, setSelectedPlaceId] = useState('');
    const [fetchingLatlngProcessing, setFetchingLatlngProcessing] = useState(false);

    const [googleMapLocatioModalOpen, setGoogleMapLocatioModalOpen] = useState(false);

    // Edit-safe: do NOT wipe the prefilled location on initial mount. Only react once the
    // user actively picks a detection method. (On create the values are empty anyway.)
    useEffect(() => {
        if (locationDetector === '') return;

        setLocationGotSuccessMessage(null);
        setData('location_name', '');
        setData('latitude', '');
        setData('longitude', '');

        if (locationDetector !== '' && locationDetector == 0) {
            autoLocationDetector();
        }

        if (locationDetector !== '' && locationDetector == 1) {
            setAutoCompletionLocationModalOpen(true);
        }

        if (locationDetector != '' && locationDetector == 2) {
            setGoogleMapLocatioModalOpen(true);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [locationDetector]);

    // 1: Automatic detection via the browser.
    const autoLocationDetector = () => {
        navigator.geolocation.getCurrentPosition(function (position) {
            setData('latitude', position.coords.latitude);
            setData('longitude', position.coords.longitude);
        });

        setLocationGotSuccessMessage('Location Got Successfully');
        setTimeout(() => {
            setLocationGotSuccessMessage(null);
        }, 1000);
    };

    // 2: Google auto-completion search (debounced).
    useEffect(() => {
        const delayDebounce = setTimeout(() => {
            setShowDropdown(false);
            setAutoCompletionLoading(false);
            setAutoCompletionInfoMessage('');
            setAutoCompletionResults([]);
            setAutoCompletionInfoMessage('');

            if (autoCompletionLocationSearch != '' && autoCompletionLocationSearch?.length < 3) {
                setAutoCompletionInfoMessage('Please Enter More Details To Search');
            }
            if (autoCompletionLocationSearch?.length > 2) {
                setAutoCompletionLoading(false);
                setShowDropdown(false);
                setAutoCompletionResults([]);
                autoCompletions();
            }
        }, 500);

        return () => clearTimeout(delayDebounce);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [autoCompletionLocationSearch]);

    useEffect(() => {
        if (selectedPlaceId != '' && selectedPlaceId != '') {
            Swal.fire({
                icon: 'success',
                title: 'Location Got Successfully',
                text: 'Do You Want To Proceed With This Location?',
                showCancelButton: true,
                showConfirmButton: true,
                cancelButtonText: 'No',
                confirmButtonText: 'Yes',
            }).then((result) => {
                if (!result.isConfirmed) {
                    setSelectedPlaceId('');
                }

                if (result.isConfirmed) {
                    setAutoCompletionLocationModalOpen(false);
                    setFetchingLatlngProcessing(true);

                    try {
                        axios
                            .post(route('dashboard.lodging-products.google.location.placedetails'), {
                                place_id: selectedPlaceId,
                            })
                            .then((res) => {
                                setData('latitude', res.data.data.lat);
                                setData('longitude', res.data.data.lng);
                                setData('location_name', res.data.data.place_name);
                                setSelectedPlaceId('');
                                setFetchingLatlngProcessing(false);
                                setAutoCompletionLocationSearch('');
                                setLocationGotSuccessMessage('Location Got Successfully');
                                setTimeout(() => {
                                    setLocationGotSuccessMessage(null);
                                }, 1000);
                            });
                    } catch (e) {
                        setFetchingLatlngProcessing(false);
                        Swal.fire({
                            icon: 'error',
                            title: 'Oops...',
                            text: e.message || 'Something went wrong',
                        });
                    }
                }
            });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedPlaceId]);

    const autoCompletions = () => {
        try {
            if (autoCompletionLocationSearch != '' && selectedPlaceId == '') {
                setAutoCompletionLoading(true);
                setShowDropdown(true);
                axios
                    .post(route('dashboard.lodging-products.google.location.autocomplete'), {
                        search: autoCompletionLocationSearch,
                    })
                    .then((res) => {
                        const predictions = res.data.data.predictions || [];

                        setAutoCompletionResults(predictions);
                        setAutoCompletionLoading(false);
                        setAutoCompletionInfoMessage(predictions.length > 0 ? '' : 'No Results Found');
                    });
            }
        } catch (e) {
            setAutoCompletionLoading(false);
            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: e.message || 'Something went wrong',
            });
        }
    };

    // 3: Google Map search modal.
    const mapRef = useRef(null);
    const mapSearchboxRef = useRef(null);
    useEffect(() => {
        if (!googleMapLocatioModalOpen || !mapRef.current) {
            return;
        }

        const loader = new Loader({
            apiKey: googleMapSettings?.google_map_api_key,
            version: 'weekly',
            libraries: ['places', 'marker'],
        });

        const getCurrentPosition = () =>
            new Promise((resolve, reject) => {
                navigator.geolocation.getCurrentPosition(resolve, reject);
            });

        loader.load().then(async () => {
            let lat = -34.397;
            let lng = 150.644;

            try {
                const position = await getCurrentPosition();
                lat = position.coords.latitude;
                lng = position.coords.longitude;

                setData('latitude', lat);
                setData('longitude', lng);
            } catch (err) {
                console.warn('Geolocation failed, using fallback coords');
            }
            const { AdvancedMarkerElement } = await google.maps.importLibrary('marker');
            const map = new google.maps.Map(mapRef.current, {
                center: { lat, lng },
                zoom: 12,
                mapId: googleMapSettings?.google_map_id,
            });

            let marker = new AdvancedMarkerElement({
                position: { lat, lng },
                map,
                title: 'Your Location',
            });

            map.addListener('click', (e) => {
                const clickedLocation = {
                    lat: e.latLng.lat(),
                    lng: e.latLng.lng(),
                };

                if (marker) {
                    marker.position = clickedLocation;
                } else {
                    marker = new google.maps.Marker({
                        position: clickedLocation,
                        map: map,
                    });
                }

                setData('latitude', clickedLocation.lat);
                setData('longitude', clickedLocation.lng);
            });

            const input = mapSearchboxRef.current;
            const searchBox = new google.maps.places.SearchBox(input);

            map.addListener('bounds_changed', () => {
                searchBox.setBounds(map.getBounds());
            });

            let markers = [];

            searchBox.addListener('places_changed', () => {
                const places = searchBox.getPlaces();

                if (!places || places.length === 0) return;

                setData('latitude', places[0].geometry.location.lat());
                setData('longitude', places[0].geometry.location.lng());
                setData('location_name', places[0].name);

                markers.forEach((m) => m.setMap(null));
                markers = [];

                const bounds = new google.maps.LatLngBounds();

                places.forEach((place) => {
                    if (!place.geometry?.location) return;

                    markers.push(
                        new google.maps.Marker({
                            map,
                            title: place.name,
                            position: place.geometry.location,
                        }),
                    );

                    if (place.geometry.viewport) {
                        bounds.union(place.geometry.viewport);
                    } else {
                        bounds.extend(place.geometry.location);
                    }
                });

                map.fitBounds(bounds);
            });
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [googleMapLocatioModalOpen]);

    return (
        <>
            {LocationGotSuccessMessage != null && (
                <Toast flash={{ success: LocationGotSuccessMessage }} />
            )}

            <SelectInput
                InputName={'Location Detection Method'}
                Id={'location_detection_method'}
                Name={'location_detection_method'}
                Value={locationDetector}
                Required={false}
                Action={(value) => setLocationDetector(value)}
                items={[
                    { id: 0, name: 'Automatic Detection' },
                    { id: 1, name: 'Google Auto Completion' },
                    { id: 2, name: 'Google Map Search' },
                ]}
                itemKey={'name'}
            />

            {(data.latitude || data.location_name) && (
                <div className="flex items-start gap-3 rounded-lg border border-green-300 bg-green-50 p-3 dark:border-green-700 dark:bg-green-900/20">
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="mt-0.5 size-5 shrink-0 text-green-600 dark:text-green-400"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                        />
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z"
                        />
                    </svg>
                    <div className="text-sm">
                        <p className="font-medium text-green-700 dark:text-green-400">
                            {data.location_name || 'Location Selected'}
                        </p>
                        {data.latitude && data.longitude && (
                            <p className="mt-0.5 text-green-600 dark:text-green-500">
                                {Number(data.latitude).toFixed(6)}, {Number(data.longitude).toFixed(6)}
                            </p>
                        )}
                        <p className="mt-1 text-xs text-green-500 dark:text-green-600">
                            Select the Location Detector Method from above to make changes.
                        </p>
                    </div>
                </div>
            )}

            {autoCompletionLocationModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto p-4 sm:p-6">
                    <div
                        className="fixed inset-0 backdrop-blur-[32px]"
                        onClick={() => setAutoCompletionLocationModalOpen(false)}
                    ></div>

                    <div className="relative z-10 max-h-[95vh] w-full max-w-4xl overflow-visible rounded-2xl bg-white p-6 shadow-xl dark:bg-deepcharcoal sm:p-8">
                        <div className="text-center">
                            <h2 className="text-lg font-medium text-gray-800 dark:text-white">
                                Please Search And Select Your Location
                            </h2>
                        </div>

                        <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-1">
                            <div className="relative">
                                <Input
                                    InputName={'Location'}
                                    Id={'location'}
                                    Type="text"
                                    Value={autoCompletionLocationSearch}
                                    Action={(e) => setAutoCompletionLocationSearch(e.target.value)}
                                    Required={false}
                                    Error={autoCompletionInfoMessage}
                                    placeholder="Search Location"
                                />

                                {showDropdown && (
                                    <ul className="relative z-50 mt-1 max-h-60 w-full overflow-y-auto rounded-md border border-gray-300 bg-white shadow-lg dark:border-gray-600 dark:bg-deepcharcoal">
                                        {autoCompletionLoading ? (
                                            <li className="flex items-center justify-center px-4 py-4">
                                                <div className="h-5 w-5 animate-spin rounded-full border-2 border-blue-500 border-t-transparent"></div>
                                            </li>
                                        ) : (
                                            autoCompletionResults.map((item, index) => (
                                                <li
                                                    key={index}
                                                    className="cursor-pointer px-4 py-2 text-sm text-gray-800 hover:bg-gray-100 dark:text-gray-100 dark:hover:bg-zinc-900/50"
                                                    onClick={() => {
                                                        setSelectedPlaceId(item.place_id);
                                                        setShowDropdown(false);
                                                        setAutoCompletionLocationSearch(item.description);
                                                    }}
                                                >
                                                    {item.description}
                                                </li>
                                            ))
                                        )}
                                    </ul>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {fetchingLatlngProcessing && (
                <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto p-4 sm:p-6">
                    <div className="fixed inset-0 backdrop-blur-[32px]"></div>

                    <div className="relative z-10 max-h-screen w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-6 shadow-xl dark:bg-deepcharcoal sm:p-8">
                        <div className="text-center">
                            <h2 className="text-lg font-medium text-gray-800 dark:text-white">
                                Please Wait While We Are Setting up Location
                            </h2>

                            <div className="mt-5 flex items-center justify-center">
                                <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {googleMapLocatioModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto p-4 sm:p-6">
                    <div
                        className="fixed inset-0 backdrop-blur-[32px]"
                        onClick={() => setGoogleMapLocatioModalOpen(false)}
                    ></div>

                    <div className="relative z-10 max-h-[95vh] w-full max-w-4xl overflow-auto rounded-2xl bg-white p-4 shadow-xl dark:bg-deepcharcoal sm:max-w-3xl sm:p-6 md:max-w-2xl lg:max-w-6xl">
                        <div className="text-center">
                            <h2 className="text-lg font-medium text-gray-800 dark:text-white">
                                Please Search And Select Your Location
                            </h2>
                        </div>

                        <div className="mt-5 space-y-4">
                            <input
                                id="search-box"
                                type="text"
                                ref={mapSearchboxRef}
                                placeholder="Search a location"
                                className="w-full rounded border px-4 py-2"
                            />

                            <div
                                ref={mapRef}
                                className="h-[200px] w-full overflow-hidden rounded-md sm:h-[250px] md:h-[400px]"
                            ></div>

                            <div className="flex justify-center">
                                <PrimaryButton
                                    Text={'Save Location'}
                                    Type={'button'}
                                    Id={'save-location'}
                                    CustomClass={'w-40'}
                                    Action={() => {
                                        Swal.fire({
                                            icon: 'success',
                                            title: 'Location Got Successfully',
                                            text: 'Do You Want To Proceed With This Location?',
                                            showConfirmButton: true,
                                            showCancelButton: true,
                                            confirmButtonText: 'Yes',
                                            cancelButtonText: 'No',
                                        }).then((result) => {
                                            if (result.isConfirmed) {
                                                setGoogleMapLocatioModalOpen(false);
                                                setLocationGotSuccessMessage('Location Got Successfully');
                                                setTimeout(() => {
                                                    setLocationGotSuccessMessage('');
                                                }, 1000);
                                            }
                                        });
                                    }}
                                    Icon={
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
                                                d="M9 8.25H7.5a2.25 2.25 0 0 0-2.25 2.25v9a2.25 2.25 0 0 0 2.25 2.25h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25H15M9 12l3 3m0 0 3-3m-3 3V2.25"
                                            />
                                        </svg>
                                    }
                                />
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
