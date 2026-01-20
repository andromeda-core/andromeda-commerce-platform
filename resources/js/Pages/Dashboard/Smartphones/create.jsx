import Card from '@/Components/Card';
import Input from '@/Components/Input';
import LinkButton from '@/Components/LinkButton';
import PrimaryButton from '@/Components/PrimaryButton';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import BreadCrumb from '@/Components/BreadCrumb';
import { Head, useForm } from '@inertiajs/react';
import React, { useEffect, useRef, useState } from 'react';
import SelectInput from '@/Components/SelectInput';
import FileUploaderInput from '@/Components/FileUploaderInput';
import BarcodeScannerComponent from 'react-qr-barcode-scanner';
import Toast from '@/Components/Toast';
import TipTapEditor from '@/Components/TipTapEditor';
import { Loader } from '@googlemaps/js-api-loader';
import Swal from 'sweetalert2';

export default function create({ colors, model_names, capacities, categories, conditions, countries, return_policies, courier_companies, addons, floors, googleMapSettings }) {
    // Create Data Form Data
    const { data, setData, post, processing, errors } = useForm({
        model_name_id: '',
        capacity_id: '',
        color_ids: [],
        category_id: '',
        country_id: '',
        delivery_days: '',
        condition_id: '',
        courier_company_id: '',
        return_policy_id: '',
        addon_ids: [],
        upc: '',
        images: [],
        tag: '',
        content: '',
        product_details: [],
        floor_id: '',
        videos: [],
        location_name: '',
        latitude: '',
        longitude: '',
    });


    const [file_error, setFileError] = useState(null);

    // Product Details Data Handling
    const [productDetails, setProductDetails] = useState([]);

    const [showProgressModal, setShowProgressModal] = useState(false);

    const [scannerOpen, setScannerOpen] = useState(false);

    const addProductDetails = () => {
        setProductDetails([...productDetails, { title: '', value: '' }]);
    };

    const removeProductDetails = (index) => {
        const updatedDetail = productDetails.filter((_, i) => i !== index);
        setProductDetails(updatedDetail);
        setData('product_details', updatedDetail);
    };
    const handleChangeProductDetails = (index, field, value) => {
        const updatedDetail = [...productDetails];
        updatedDetail[index][field] = value;
        setData('product_details', updatedDetail);
        setProductDetails(updatedDetail);
    };

    // Create Data Form Request
    const submit = (e) => {
        e.preventDefault();
        post(route('dashboard.smartphones.store'));
    };



    // Google Maps Logic
    // Location Get Success state
    const [LocationGotSuccessMessage, setLocationGotSuccessMessage] = useState(null);

    // location Detector State
    const [locationDetector, setLocationDetector] = useState('');

    useEffect(() => {
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
    }, [locationDetector]);

    //1: Automatic Locaiton Detection With JS
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

    //2: Auto Completion Location Model State
    const [autoCompletionLocationModalOpen, setAutoCompletionLocationModalOpen] = useState(false);

    // Auto Completion Location States
    const [autoCompletionLocationSearch, setAutoCompletionLocationSearch] = useState('');
    const [autoCompletionInfoMessage, setAutoCompletionInfoMessage] = useState('');
    const [autoCompletionLoading, setAutoCompletionLoading] = useState(false);
    const [autoCompletionResults, setAutoCompletionResults] = useState([]);
    const [showDropdown, setShowDropdown] = useState(false);

    const [selectedPlaceId, setSelectedPlaceId] = useState('');
    const [fetchingLatlngProcessing, setFetchingLatlngProcessing] = useState(false);

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
                            .post(route('dashboard.posts.google.location.placedetails'), {
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
    }, [selectedPlaceId]);

    // Fetch AutocompletionLocationsFrom Google
    const autoCompletions = () => {
        try {
            if (autoCompletionLocationSearch != '' && selectedPlaceId == '') {
                setAutoCompletionLoading(true);
                setShowDropdown(true);
                axios
                    .post(route('dashboard.posts.google.location.autocomplete'), {
                        search: autoCompletionLocationSearch, // send in request body
                    })
                    .then((res) => {
                        const predictions = res.data.data.predictions || [];

                        setAutoCompletionResults(predictions);
                        setAutoCompletionLoading(false);
                        setAutoCompletionInfoMessage(
                            predictions.length > 0 ? '' : 'No Results Found',
                        );
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

    const [googleMapLocatioModalOpen, setGoogleMapLocatioModalOpen] = useState(false);
    // Init Google Map
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

        const lat = data.latitude || -34.397;
        const lng = data.longitude || 150.644;

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

                markers.forEach((marker) => marker.setMap(null));
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
    }, [googleMapLocatioModalOpen]);

    // Google Maps Logic



    useEffect(() => {
        if (file_error != null) {
            setFileError(null);
        }
    }, [data?.images]);

    useEffect(() => {
        if (errors?.file_error) {
            setFileError(errors.file_error);
        }
    }, [errors]);


    useEffect(() => {
        if ((data?.images?.length > 0 || data?.videos?.length > 0) && processing) {
            setShowProgressModal(true);
        } else {
            setShowProgressModal(false);
        }
    }, [processing, data?.images, data?.videos]);

    return (
        <>
            <AuthenticatedLayout>
                <Head title="Smart Phones" />

                <BreadCrumb
                    header={'Create Smart Phone'}
                    parent={'Smart Phones'}
                    parent_link={route('dashboard.smartphones.index')}
                    child={'Create Smart Phone'}
                />

                {file_error != null && <Toast flash={{ info: file_error }} />}
                {LocationGotSuccessMessage != null && (
                    <Toast flash={{ success: LocationGotSuccessMessage }} />
                )}
                <Card
                    Content={
                        <>
                            <div className="flex flex-wrap justify-end my-3">
                                <LinkButton
                                    Text={'Back To Smart Phones'}
                                    URL={route('dashboard.smartphones.index')}
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
                                                d="M9 15 3 9m0 0 6-6M3 9h12a6 6 0 0 1 0 12h-3"
                                            />
                                        </svg>
                                    }
                                />
                            </div>

                            <form onSubmit={submit}>
                                <Card
                                    Content={
                                        <>
                                            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                                                <SelectInput
                                                    InputName={'Model Name'}
                                                    Id={'model_name_id'}
                                                    Name={'model_name_id'}
                                                    items={model_names}
                                                    itemKey={'name'}
                                                    Value={data.model_name_id}
                                                    Error={errors.model_name_id}
                                                    Required={true}
                                                    Placeholder={'Select Model Name'}
                                                    Action={(value) => {
                                                        setData('model_name_id', value);
                                                    }}
                                                />

                                                <SelectInput
                                                    InputName={'Capacity'}
                                                    Id={'capacity_id'}
                                                    Name={'capacity_id'}
                                                    items={capacities}
                                                    itemKey={'name'}
                                                    Value={data.capacity_id}
                                                    Error={errors.capacity_id}
                                                    Required={true}
                                                    Placeholder={'Select Capacity'}
                                                    Action={(value) => {
                                                        setData('capacity_id', value);
                                                    }}
                                                />

                                                <SelectInput
                                                    InputName={'Category'}
                                                    Id={'category_id'}
                                                    Name={'category_id'}
                                                    items={categories}
                                                    itemKey={'name'}
                                                    Value={data.category_id}
                                                    Error={errors.category_id}
                                                    Required={true}
                                                    Placeholder={'Select Category'}
                                                    Action={(value) => {
                                                        setData('category_id', value);
                                                    }}
                                                />

                                                <SelectInput
                                                    InputName={'Colors'}
                                                    Id={'color_ids'}
                                                    Name={'color_ids'}
                                                    Error={errors.color_ids}
                                                    Value={data.color_ids}
                                                    items={colors}
                                                    itemKey={'name'}
                                                    Placeholder={'Select Colors'}
                                                    Required={true}
                                                    Multiple={false}
                                                    Action={(value) => {
                                                        setData('color_ids', [value]);
                                                    }}
                                                />

                                                <div className="flex items-center">
                                                    <PrimaryButton
                                                        Type={'button'}
                                                        Id={'scan_upc'}
                                                        ClassName={
                                                            'dark:bg-deepcharcoal dark:text-white p-2 mt-6  rounded-lg text-center dark:hover:bg-gray-700 transition duration-200 ease-in-out hover:bg-blue-700 hover:text-white bg-slate-100'
                                                        }
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
                                                                    d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0 1 3.75 9.375v-4.5ZM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 0 1-1.125-1.125v-4.5ZM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0 1 13.5 9.375v-4.5Z"
                                                                />
                                                                <path
                                                                    strokeLinecap="round"
                                                                    strokeLinejoin="round"
                                                                    d="M6.75 6.75h.75v.75h-.75v-.75ZM6.75 16.5h.75v.75h-.75v-.75ZM16.5 6.75h.75v.75h-.75v-.75ZM13.5 13.5h.75v.75h-.75v-.75ZM13.5 19.5h.75v.75h-.75v-.75ZM19.5 13.5h.75v.75h-.75v-.75ZM19.5 19.5h.75v.75h-.75v-.75ZM16.5 16.5h.75v.75h-.75v-.75Z"
                                                                />
                                                            </svg>
                                                        }
                                                        Action={() => setScannerOpen(true)}
                                                    />
                                                    <Input
                                                        InputName={'UPC/EAN'}
                                                        Error={errors.upc}
                                                        Value={data.upc}
                                                        Action={(e) =>
                                                            setData('upc', e.target.value)
                                                        }
                                                        Placeholder={'Enter UPC/EAN'}
                                                        Id={'upc'}
                                                        Name={'upc'}
                                                        Type={'text'}
                                                        Required={true}
                                                    />
                                                </div>

                                                <Input
                                                    InputName={'Tag'}
                                                    Error={errors.tag}
                                                    Value={data.tag}
                                                    Action={(e) => setData('tag', e.target.value)}
                                                    Placeholder={'Enter Tag'}
                                                    Id={'tag'}
                                                    Name={'tag'}
                                                    Type={'text'}
                                                    Required={false}
                                                />



                                                <Input
                                                    InputName={'Approx Max Delivery Days (In No.s Like 1, 2, 3, 4, 5)'}
                                                    Error={errors.delivery_days}
                                                    Value={data.delivery_days}
                                                    Action={(e) => setData('delivery_days', e.target.value)}
                                                    Placeholder={'Enter Delivery Days'}
                                                    Id={'delivery_days'}
                                                    Name={'delivery_days'}
                                                    Type={'number'}
                                                    Required={true}
                                                />




                                                <SelectInput
                                                    InputName={'Country/Region'}
                                                    Id={'country_id'}
                                                    Name={'country_id'}
                                                    Error={errors.country_id}
                                                    Value={data.country_id}
                                                    items={countries}
                                                    itemKey={'name'}
                                                    Placeholder={'Select Country'}
                                                    customPlaceHolder={true}
                                                    Required={true}
                                                    Multiple={false}
                                                    Action={(value) => {
                                                        setData('country_id', value);
                                                    }}
                                                />



                                                <SelectInput
                                                    InputName={'Condition'}
                                                    Id={'condition_id'}
                                                    Name={'condition_id'}
                                                    Error={errors.condition_id}
                                                    Value={data.condition_id}
                                                    items={conditions}
                                                    itemKey={'name'}
                                                    Placeholder={'Select Condition'}
                                                    customPlaceHolder={true}
                                                    Required={true}
                                                    Multiple={false}
                                                    Action={(value) => {
                                                        setData('condition_id', value);
                                                    }}
                                                />





                                                <SelectInput
                                                    InputName={'Return Policy'}
                                                    Id={'return_policy_id'}
                                                    Name={'return_policy_id'}
                                                    Error={errors.return_policy_id}
                                                    Value={data.return_policy_id}
                                                    items={return_policies}
                                                    itemKey={'name'}
                                                    Placeholder={'Select Return Policy'}
                                                    customPlaceHolder={true}
                                                    Required={true}
                                                    Multiple={false}
                                                    Action={(value) => {
                                                        setData('return_policy_id', value);
                                                    }}
                                                />


                                                <SelectInput
                                                    InputName={'Courier Company'}
                                                    Id={'courier_company_id'}
                                                    Name={'courier_company_id'}
                                                    Error={errors.courier_company_id}
                                                    Value={data.courier_company_id}
                                                    items={courier_companies}
                                                    itemKey={'courier_name'}
                                                    Placeholder={'Select Courier Company'}
                                                    customPlaceHolder={true}
                                                    Required={true}
                                                    Multiple={false}
                                                    Action={(value) => {
                                                        setData('courier_company_id', value);
                                                    }}
                                                />


                                                <SelectInput
                                                    InputName={'Addons'}
                                                    Id={'addon_ids'}
                                                    Name={'addon_ids'}
                                                    Error={errors.addon_ids}
                                                    Value={data.addon_ids}
                                                    items={addons}
                                                    itemKey={'name'}
                                                    Placeholder={'Select Addons'}
                                                    customPlaceHolder={true}
                                                    Required={false}
                                                    Multiple={true}
                                                    Action={(value) => {
                                                        setData('addon_ids', value);
                                                    }}
                                                />


                                                <SelectInput
                                                    InputName={'Floor'}
                                                    Id={'floor_id'}
                                                    Name={'floor_id'}
                                                    Error={errors.floor_id}
                                                    Value={data.floor_id}
                                                    Required={false}
                                                    Action={(value) => setData('floor_id', value)}
                                                    items={floors}
                                                    itemKey={'name'}
                                                />


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


                                            </div>

                                            <div className="grid grid-cols-1 col-span-2 gap-4 mt-10 md:grid-cols-1">
                                                <FileUploaderInput
                                                    InputName={'Smart Phone Images'}
                                                    Id={'images'}
                                                    Error={errors.file_error}
                                                    Label={
                                                        'Drag & Drop your Smart Phone Images or <span class="filepond--label-action">Browse</span>'
                                                    }
                                                    Multiple={true}
                                                    acceptedFileTypes={['image/*']}
                                                    MaxFiles={5}
                                                    MaxFileSize={'5MB'}
                                                    onUpdate={(files) => {
                                                        if (files.length > 0) {
                                                            const newFiles = files
                                                                .filter((f) => f.isNew)
                                                                .map((f) => f.file);

                                                            setData('images', newFiles);
                                                        } else {
                                                            setData('images', null);
                                                        }
                                                    }}
                                                />
                                            </div>


                                            <FileUploaderInput
                                                Label={
                                                    'Drag & Drop your Smart phone Video or <span class="filepond--label-action">Browse</span>'
                                                }
                                                Error={errors.video_error}
                                                Id={'videos'}
                                                InputName={'Smart phone Video'}
                                                acceptedFileTypes={['video/*']}
                                                MaxFileSize={'1000MB'}
                                                onUpdate={(files) => {
                                                    if (files.length > 0) {
                                                        const newFiles = files
                                                            .filter((f) => f.isNew)
                                                            .map((f) => f.file);

                                                        setData('videos', newFiles);
                                                    } else {
                                                        setData('videos', null);
                                                    }
                                                }}
                                                MaxFiles={5}
                                                Multiple={true}
                                            />



                                            <div className="grid grid-cols-1 gap-4">
                                                <TipTapEditor
                                                    Label={'Content'}
                                                    Id={'content'}
                                                    Required={true}
                                                    Value={data.content}
                                                    Error={errors.content}
                                                    Action={(value) => {
                                                        if (value == '<p></p>')
                                                            setData('content', '');
                                                        else setData('content', value);
                                                    }}
                                                />
                                            </div>


                                            <div className="flex items-center justify-end w-full">
                                                <PrimaryButton
                                                    Text={'Add Product Details'}
                                                    Type={'button'}
                                                    Id={'add_product_details'}
                                                    CustomClass={'w-[250px] '}
                                                    Action={addProductDetails}
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
                                                                d="m4.5 5.25 7.5 7.5 7.5-7.5m-15 6 7.5 7.5 7.5-7.5"
                                                            />
                                                        </svg>
                                                    }
                                                />
                                            </div>

                                            <div className="grid grid-cols-1">
                                                {productDetails.length > 0 && (
                                                    <div className="grid grid-cols-1 col-span-1 gap-5 overflow-x-auto scrollbar-thin dark:scrollbar-track-slate-900 dark:scrollbar-thumb-slate-700">
                                                        <table className="w-full border-collapse">
                                                            <thead>
                                                                <tr>
                                                                    <th className="p-2 text-left text-gray-700 border dark:border-gray-700 dark:text-gray-400">
                                                                        Title
                                                                    </th>
                                                                    <th className="p-2 text-left text-gray-700 border dark:border-gray-700 dark:text-gray-400">
                                                                        Value
                                                                    </th>
                                                                    <th className="p-2 text-center text-gray-700 border dark:border-gray-700 dark:text-gray-400">
                                                                        Action
                                                                    </th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                {productDetails.map((item, idx) => (
                                                                    <tr key={idx}>
                                                                        <td className="p-2 border dark:border-gray-700">
                                                                            <Input
                                                                                InputName={'Title'}
                                                                                Id={'title'}
                                                                                Name={'title'}
                                                                                Error={
                                                                                    errors[
                                                                                    `product_details.${idx}.title`
                                                                                    ]
                                                                                }
                                                                                Value={item.title}
                                                                                Required={true}
                                                                                Type={'text'}
                                                                                Placeholder={
                                                                                    'Enter Title'
                                                                                }
                                                                                Action={(e) =>
                                                                                    handleChangeProductDetails(
                                                                                        idx,
                                                                                        'title',
                                                                                        e.target.value,
                                                                                    )
                                                                                }
                                                                            />
                                                                        </td>
                                                                        <td className="p-2 border dark:border-gray-700">
                                                                            <Input
                                                                                InputName={'Value'}
                                                                                Id={'value'}
                                                                                Name={'value'}
                                                                                Error={
                                                                                    errors[
                                                                                    `product_details.${idx}.value`
                                                                                    ]
                                                                                }
                                                                                Value={item.value}
                                                                                Required={true}
                                                                                Type={'text'}
                                                                                Placeholder={
                                                                                    'Enter Value'
                                                                                }
                                                                                Action={(e) =>
                                                                                    handleChangeProductDetails(
                                                                                        idx,
                                                                                        'value',
                                                                                        e.target.value,
                                                                                    )
                                                                                }
                                                                            />
                                                                        </td>

                                                                        <td className="p-2 border dark:border-gray-700">
                                                                            <div className="flex items-center justify-center">
                                                                                <PrimaryButton
                                                                                    Type={'button'}
                                                                                    Id={
                                                                                        'delete_product_detail'
                                                                                    }
                                                                                    Action={() =>
                                                                                        removeProductDetails(
                                                                                            idx,
                                                                                        )
                                                                                    }
                                                                                    CustomClass={
                                                                                        'w-[50px] bg-red-500 hover:bg-red-600'
                                                                                    }
                                                                                    Icon={
                                                                                        <svg
                                                                                            xmlns="http://www.w3.org/2000/svg"
                                                                                            fill="none"
                                                                                            viewBox="0 0 24 24"
                                                                                            strokeWidth={
                                                                                                1.5
                                                                                            }
                                                                                            stroke="currentColor"
                                                                                            className="size-6"
                                                                                        >
                                                                                            <path
                                                                                                strokeLinecap="round"
                                                                                                strokeLinejoin="round"
                                                                                                d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
                                                                                            />
                                                                                        </svg>
                                                                                    }
                                                                                />
                                                                            </div>
                                                                        </td>
                                                                    </tr>
                                                                ))}
                                                            </tbody>
                                                        </table>
                                                    </div>
                                                )}
                                            </div>

                                            <PrimaryButton
                                                Text={'Create Smart Phone'}
                                                Type={'submit'}
                                                CustomClass={'w-[250px] '}
                                                Disabled={
                                                    processing ||
                                                    data.model_name_id === '' ||
                                                    data.capacity_id === '' ||
                                                    data.color_ids.length === 0 ||
                                                    data.upc.trim() === '' ||
                                                    data.category_id === '' ||
                                                    data.content.trim() === '' ||
                                                    data.country_id === '' ||
                                                    data.condition_id === '' ||
                                                    data.courier_company_id === '' ||
                                                    data.return_policy_id === '' ||
                                                    data.delivery_days === '' ||
                                                    (productDetails.length > 0 &&
                                                        productDetails.some(
                                                            (detail) =>
                                                                detail.title === '' ||
                                                                detail.value === ''
                                                        ))
                                                }
                                                Spinner={processing}
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
                                                            d="M12 4.5v15m7.5-7.5h-15"
                                                        />
                                                    </svg>
                                                }
                                            />
                                        </>
                                    }
                                />
                            </form>

                            {/* Cam */}
                            {scannerOpen && (
                                <>
                                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto sm:p-6">
                                        <div className="fixed inset-0 backdrop-blur-[32px]"></div>

                                        {/* Modal content */}
                                        <div className="relative z-10 w-full max-w-lg max-h-screen p-6 overflow-y-auto bg-white shadow-xl rounded-2xl dark:bg-deepcharcoal sm:p-8">
                                            <div className="text-center">
                                                <h2 className="text-lg font-medium text-gray-800 dark:text-white">
                                                    Place The Camera On The UPC Barcode
                                                </h2>

                                                {scannerOpen && (
                                                    <div className="flex items-center justify-center">
                                                        <div
                                                            className="rounded-2xl"
                                                            style={{ marginTop: 20 }}
                                                        >
                                                            <BarcodeScannerComponent
                                                                width={400}
                                                                height={400}
                                                                onUpdate={(err, result) => {
                                                                    if (result) {
                                                                        setData('upc', result.text);
                                                                        setScannerOpen(false);
                                                                    }
                                                                }}
                                                            />

                                                            <div className="flex items-center justify-center">
                                                                <PrimaryButton
                                                                    Action={() =>
                                                                        setScannerOpen(false)
                                                                    }
                                                                    Text={'Close Scanner'}
                                                                    Type={'button'}
                                                                    CustomClass={'mt-4'}
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
                                                                                d="M6 18 18 6M6 6l12 12"
                                                                            />
                                                                        </svg>
                                                                    }
                                                                />
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </>
                            )}



                            {showProgressModal && (
                                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto sm:p-6">
                                    <div className="fixed inset-0 backdrop-blur-[32px]"></div>

                                    {/* Modal content */}
                                    <div className="relative z-10 w-full max-w-lg max-h-screen p-6 overflow-y-auto bg-white shadow-xl rounded-2xl dark:bg-deepcharcoal sm:p-8">
                                        <div className="text-center">
                                            <h2 className="text-lg font-medium text-gray-800 dark:text-white">
                                                Please Wait While We Are Uploading Your Files
                                            </h2>

                                            <div className="flex items-center justify-center mt-5">
                                                <div role="status">
                                                    <svg
                                                        aria-hidden="true"
                                                        className="w-8 h-8 text-gray-200 animate-spin fill-blue-600 dark:text-gray-600"
                                                        viewBox="0 0 100 101"
                                                        fill="none"
                                                        xmlns="http://www.w3.org/2000/svg"
                                                    >
                                                        <path
                                                            d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                                                            fill="currentColor"
                                                        />
                                                        <path
                                                            d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                                                            fill="currentFill"
                                                        />
                                                    </svg>
                                                    <span className="sr-only">Loading...</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {autoCompletionLocationModalOpen && (
                                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto sm:p-6">
                                    <div
                                        className="fixed inset-0 backdrop-blur-[32px]"
                                        onClick={() => setAutoCompletionLocationModalOpen(false)}
                                    ></div>

                                    {/* Modal content */}
                                    <div className="relative z-10 max-h-[95vh] w-full max-w-4xl overflow-visible rounded-2xl bg-white p-6 shadow-xl dark:bg-deepcharcoal sm:p-8">
                                        <div className="text-center">
                                            <h2 className="text-lg font-medium text-gray-800 dark:text-white">
                                                Please Search And Select Your Location
                                            </h2>
                                        </div>

                                        <div className="grid grid-cols-1 gap-4 mt-5 md:grid-cols-1">
                                            <div className="relative">
                                                <Input
                                                    InputName={'Location'}
                                                    Id={'location'}
                                                    Type="text"
                                                    Value={autoCompletionLocationSearch}
                                                    Action={(e) =>
                                                        setAutoCompletionLocationSearch(e.target.value)
                                                    }
                                                    Required={true}
                                                    Error={autoCompletionInfoMessage}
                                                    placeholder="Search Location"
                                                />

                                                {showDropdown && (
                                                    <ul className="relative z-50 w-full mt-1 overflow-y-auto bg-white border border-gray-300 rounded-md shadow-lg max-h-60 dark:border-gray-600 dark:bg-deepcharcoal">
                                                        {autoCompletionLoading ? (
                                                            <li className="flex items-center justify-center px-4 py-4">
                                                                <div className="w-5 h-5 border-2 border-blue-500 rounded-full animate-spin border-t-transparent"></div>
                                                            </li>
                                                        ) : (
                                                            autoCompletionResults.map((item, index) => (
                                                                <li
                                                                    key={index}
                                                                    className="px-4 py-2 text-sm text-gray-800 cursor-pointer hover:bg-gray-100 dark:text-gray-100 dark:hover:bg-zinc-900/50"
                                                                    onClick={() => {
                                                                        setSelectedPlaceId(item.place_id);
                                                                        setShowDropdown(false);
                                                                        setAutoCompletionLocationSearch(
                                                                            item.description,
                                                                        );
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
                                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto sm:p-6">
                                    <div className="fixed inset-0 backdrop-blur-[32px]"></div>

                                    {/* Modal content */}
                                    <div className="relative z-10 w-full max-w-lg max-h-screen p-6 overflow-y-auto bg-white shadow-xl rounded-2xl dark:bg-deepcharcoal sm:p-8">
                                        <div className="text-center">
                                            <h2 className="text-lg font-medium text-gray-800 dark:text-white">
                                                Please Wait While We Are Setting up Location
                                            </h2>

                                            <div className="flex items-center justify-center mt-5">
                                                <div role="status">
                                                    <svg
                                                        aria-hidden="true"
                                                        className="w-8 h-8 text-gray-200 animate-spin fill-blue-600 dark:text-gray-600"
                                                        viewBox="0 0 100 101"
                                                        fill="none"
                                                        xmlns="http://www.w3.org/2000/svg"
                                                    >
                                                        <path
                                                            d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                                                            fill="currentColor"
                                                        />
                                                        <path
                                                            d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                                                            fill="currentFill"
                                                        />
                                                    </svg>
                                                    <span className="sr-only">Loading...</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {googleMapLocatioModalOpen && (
                                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto sm:p-6">
                                    {/* Backdrop */}
                                    <div
                                        className="fixed inset-0 backdrop-blur-[32px]"
                                        onClick={() => setGoogleMapLocatioModalOpen(false)}
                                    ></div>

                                    {/* Modal content */}
                                    <div className="relative z-10 max-h-[95vh] w-full max-w-4xl overflow-auto rounded-2xl bg-white p-4 shadow-xl dark:bg-deepcharcoal sm:max-w-3xl sm:p-6 md:max-w-2xl lg:max-w-6xl">
                                        {/* Title */}
                                        <div className="text-center">
                                            <h2 className="text-lg font-medium text-gray-800 dark:text-white">
                                                Please Search And Select Your Location
                                            </h2>
                                        </div>

                                        {/* Content */}
                                        <div className="mt-5 space-y-4">
                                            {/* Search Box */}
                                            <input
                                                id="search-box"
                                                type="text"
                                                ref={mapSearchboxRef}
                                                placeholder="Search a location"
                                                className="w-full px-4 py-2 border rounded"
                                            />

                                            {/* Google Map */}
                                            <div
                                                ref={mapRef}
                                                className="h-[200px] w-full overflow-hidden rounded-md sm:h-[250px] md:h-[400px]"
                                            ></div>

                                            {/* Save Button */}
                                            <div className="flex justify-center">
                                                <PrimaryButton
                                                    Text={'Save Location'}
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
                                                                setLocationGotSuccessMessage(
                                                                    'Location Got Successfully',
                                                                );
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
                    }
                />
            </AuthenticatedLayout>
        </>
    );
}
