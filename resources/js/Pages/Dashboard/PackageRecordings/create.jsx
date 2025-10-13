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
import Swal from 'sweetalert2';

export default function create({ orders }) {
    // Create Data Form Data
    const { data, setData, post, processing, errors, reset } = useForm({
        order_id: '',
        package_video: '',
    });

    // Create Data Form Request
    const submit = (e) => {
        e.preventDefault();
        post(route('dashboard.package-recordings.store'), {
            forceFormData: true,
        });
    };

    const [openRecorder, setOpenRecorder] = useState(false);
    const [recordingSaving, setRecordingSaving] = useState(false);
    const [stream, setStream] = useState(null);
    const [mediaRecorder, setMediaRecorder] = useState(null);
    const [isRecording, setIsRecording] = useState(false);
    const [recordedVideoUrl, setRecordedVideoUrl] = useState(null);
    const [error, setError] = useState(null);
    const [availableDevices, setAvailableDevices] = useState([]);
    const [useFrontCamera, setUseFrontCamera] = useState(false);

    const videoRef = useRef(null);

    const getAvailableDevices = async () => {
        try {
            const devices = await navigator.mediaDevices.enumerateDevices();
            const videoDevices = devices.filter((device) => device.kind === 'videoinput');
            const audioDevices = devices.filter((device) => device.kind === 'audioinput');

            setAvailableDevices({
                video: videoDevices,
                audio: audioDevices,
            });

            return { video: videoDevices, audio: audioDevices };
        } catch (error) {
            Swal.fire({
                icon: 'error',
                title: 'Oops...',
                text: error.message || 'Something went wrong',
            });
            return { video: [], audio: [] };
        }
    };

    // Try multiple camera access strategies
    const startCameraWithFallback = async () => {
        setError(null);

        // Stop existing stream first
        if (stream) {
            stream.getTracks().forEach((track) => track.stop());
            setStream(null);
        }

        const strategies = [
            // Strategy 1: Basic constraints (most compatible)
            {
                video: {
                    facingMode: useFrontCamera ? 'user' : 'environment',
                },
                audio: true,
            },

            // Strategy 2: Just video, no audio
            {
                video: {
                    facingMode: useFrontCamera ? 'user' : 'environment',
                },
                audio: false,
            },

            // Strategy 3: Specific device constraints
            {
                video: {
                    facingMode: useFrontCamera ? 'user' : 'environment',
                    width: { min: 320, ideal: 640, max: 1920 },
                    height: { min: 240, ideal: 480, max: 1080 },
                },
                audio: true,
            },

            // Strategy 4: Mobile-friendly constraints
            {
                video: {
                    facingMode: useFrontCamera ? 'user' : 'environment',
                    width: { ideal: 640 },
                    height: { ideal: 480 },
                },
                audio: true,
            },

            // Strategy 5: Environment camera (back camera)
            {
                video: {
                    facingMode: useFrontCamera ? 'user' : 'environment',
                },
                audio: true,
            },
        ];

        for (let i = 0; i < strategies.length; i++) {
            const constraints = strategies[i];

            try {
                const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);

                // Success! Setup the stream
                setStream(mediaStream);

                if (videoRef.current) {
                    videoRef.current.srcObject = mediaStream;
                    try {
                        await videoRef.current.play();
                    } catch (playError) {
                        console.warn('Video play error (usually harmless):', playError);
                    }
                }

                // Setup MediaRecorder
                try {
                    let mimeType = 'video/webm';

                    // Try different mime types
                    const supportedTypes = [
                        'video/webm;codecs=vp9',
                        'video/webm;codecs=vp8',
                        'video/webm',
                        'video/mp4',
                    ];

                    for (const type of supportedTypes) {
                        if (MediaRecorder.isTypeSupported(type)) {
                            mimeType = type;
                            break;
                        }
                    }

                    const recorder = new MediaRecorder(mediaStream, { mimeType });
                    const chunks = [];

                    recorder.ondataavailable = (event) => {
                        if (event.data.size > 0) {
                            chunks.push(event.data);
                        }
                    };

                    recorder.onstop = () => {
                        const blob = new Blob(chunks, { type: mimeType });
                        const url = URL.createObjectURL(blob);
                        setRecordedVideoUrl(url);
                        setIsRecording(false);
                        chunks.length = 0; // Clear chunks
                    };

                    recorder.onerror = (event) => {
                        setError('Recording error: ' + event.error.message);
                    };

                    setMediaRecorder(recorder);
                } catch (recorderError) {
                    setError('MediaRecorder not supported: ' + recorderError.message);
                }

                return; // Success, exit the loop
            } catch (err) {
                if (i === strategies.length - 1) {
                    // Last strategy failed
                    let errorMessage = 'All camera access strategies failed. ';

                    switch (err.name) {
                        case 'NotFoundError':
                        case 'DevicesNotFoundError':
                            errorMessage += 'No camera device found. Please connect a camera.';
                            break;
                        case 'NotAllowedError':
                        case 'PermissionDeniedError':
                            errorMessage +=
                                'Camera permission denied. Please allow camera access in browser settings.';
                            break;
                        case 'NotReadableError':
                        case 'TrackStartError':
                            errorMessage +=
                                'Camera is being used by another application. Please close other camera apps.';
                            break;
                        case 'OverconstrainedError':
                        case 'ConstraintNotSatisfiedError':
                            errorMessage += 'Camera constraints not supported by your device.';
                            break;
                        default:
                            errorMessage += `Error: ${err.message}`;
                    }

                    setError(errorMessage);
                }
            }
        }
    };

    const handleStartRecording = () => {
        if (mediaRecorder && mediaRecorder.state === 'inactive') {
            try {
                mediaRecorder.start(1000);
                setIsRecording(true);
            } catch (error) {
                Swal.fire({
                    icon: 'error',
                    title: 'Oops...',
                    text: error.message || 'Something went wrong',
                });
            } finally {
                setRecordedVideoUrl(null);
            }
        }
    };

    const handleStopRecording = () => {
        if (mediaRecorder && mediaRecorder.state === 'recording') {
            mediaRecorder.stop();
        }
    };

    const handleSave = async () => {
        if (!recordedVideoUrl) return;

        setRecordingSaving(true);

        try {
            const response = await fetch(recordedVideoUrl);
            const blob = await response.blob();
            const file = new File([blob], `recording-${Date.now()}.webm`, {
                type: blob.type,
            });

            // alert('File: ' + file);
            setData('package_video', file);
            handleClose();
        } catch (err) {
            console.error('Save error:', err);
            setError(`Save error: ${err.message}`);
        } finally {
            setRecordingSaving(false);
        }
    };

    const handleRetake = () => {
        if (recordedVideoUrl) {
            URL.revokeObjectURL(recordedVideoUrl);
        }
        setRecordedVideoUrl(null);
        // Restart camera
        startCameraWithFallback();
    };

    const handleClose = () => {
        if (stream) {
            stream.getTracks().forEach((track) => track.stop());
            setStream(null);
        }

        if (mediaRecorder && mediaRecorder.state !== 'inactive') {
            mediaRecorder.stop();
        }

        if (recordedVideoUrl) {
            URL.revokeObjectURL(recordedVideoUrl);
        }

        setMediaRecorder(null);
        setRecordedVideoUrl(null);
        setIsRecording(false);
        setError(null);
        setOpenRecorder(false);
    };

    // Auto-start camera when modal opens
    useEffect(() => {
        if (openRecorder) {
            getAvailableDevices().then(() => {
                if (!recordedVideoUrl) {
                    startCameraWithFallback();
                }
            });
        }
    }, [openRecorder, useFrontCamera]);

    return (
        <>
            <AuthenticatedLayout>
                <Head title="Package Recordings" />

                <BreadCrumb
                    header={'Create Package Recording'}
                    parent={'Package Recordings'}
                    parent_link={route('dashboard.package-recordings.index')}
                    child={'Create Package Recording'}
                />

                <Card
                    Content={
                        <>
                            <div className="my-3 flex flex-wrap justify-end">
                                <LinkButton
                                    Text={'Back To Package Recordings'}
                                    URL={route('dashboard.package-recordings.index')}
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
                                                    InputName={'Order'}
                                                    Error={errors.order_id}
                                                    Value={data.order_id}
                                                    Placeholder={'Select Order'}
                                                    Id={'order_id'}
                                                    Name={'name'}
                                                    Required={true}
                                                    items={orders}
                                                    itemKey={'name'}
                                                    Multiple={false}
                                                    Action={(value) => setData('order_id', value)}
                                                />

                                                {/* <FileUploaderInput
                                                    key={data.package_video}
                                                    Label={
                                                        'Drag & Drop your Package Video or <span class="filepond--label-action">Browse</span>'
                                                    }
                                                    Error={errors.package_video}
                                                    Id={'package_video'}
                                                    InputName={'Packaging Video'}
                                                    acceptedFileTypes={['video/*']}
                                                    MaxFileSize={'10000MB'}
                                                    onUpdate={(file) => {
                                                        if (file.length > 0) {
                                                            setData('package_video', file[0].file);
                                                        } else {
                                                            setData('package_video', null);
                                                        }
                                                    }}
                                                    MaxFiles={1}
                                                    Multiple={false}
                                                    Required={true}
                                                    DefaultFile={
                                                        data.package_video && [data.package_video]
                                                    }
                                                /> */}

                                                {data.package_video != '' && (
                                                    <div className="grid grid-cols-1 gap-4">
                                                        <div
                                                            key={data.package_video}
                                                            className="flex max-w-lg items-center justify-between rounded-lg border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-700 dark:bg-deepcharcoal"
                                                        >
                                                            {/* Left side - Video icon */}
                                                            <div className="flex items-center gap-3">
                                                                <svg
                                                                    xmlns="http://www.w3.org/2000/svg"
                                                                    fill="none"
                                                                    viewBox="0 0 24 24"
                                                                    strokeWidth={1.5}
                                                                    stroke="currentColor"
                                                                    className="size-6 dark:text-white/80"
                                                                >
                                                                    <path
                                                                        strokeLinecap="round"
                                                                        strokeLinejoin="round"
                                                                        d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z"
                                                                    />
                                                                </svg>

                                                                <h2 className="dark:text-white/80">
                                                                    Package Video
                                                                </h2>
                                                            </div>

                                                            {/* Right side - X icon */}
                                                            <div
                                                                className="flex cursor-pointer items-center"
                                                                onClick={() =>
                                                                    setData('package_video', '')
                                                                }
                                                            >
                                                                <svg
                                                                    xmlns="http://www.w3.org/2000/svg"
                                                                    fill="none"
                                                                    viewBox="0 0 24 24"
                                                                    strokeWidth={1.5}
                                                                    stroke="currentColor"
                                                                    className="size-6 dark:text-white/80"
                                                                >
                                                                    <path
                                                                        strokeLinecap="round"
                                                                        strokeLinejoin="round"
                                                                        d="M6 18 18 6M6 6l12 12"
                                                                    />
                                                                </svg>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>

                                            <div className="flex flex-wrap items-center gap-4">
                                                <PrimaryButton
                                                    Text={'Create Package Recording'}
                                                    Type={'submit'}
                                                    CustomClass={'w-[250px] '}
                                                    Disabled={
                                                        processing ||
                                                        data.order_id === '' ||
                                                        data.package_video === ''
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

                                                <PrimaryButton
                                                    Text={'Record Video'}
                                                    Type={'button'}
                                                    CustomClass={'w-[250px] '}
                                                    Disabled={recordingSaving}
                                                    Action={() => setOpenRecorder(true)}
                                                    Spinner={recordingSaving}
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
                                                                d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z"
                                                            />
                                                        </svg>
                                                    }
                                                />
                                            </div>
                                        </>
                                    }
                                />
                            </form>
                        </>
                    }
                />

                {/* Recording Save Loading Modal */}
                {openRecorder && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto p-4 sm:p-6">
                        <div className="fixed inset-0 bg-black/50" onClick={handleClose} />

                        <div className="relative z-10 max-h-screen w-full max-w-3xl overflow-y-auto rounded-2xl bg-white p-6 text-gray-900 shadow-xl dark:bg-deepcharcoal dark:text-white/80 sm:p-8">
                            {/* Header */}
                            <div className="mb-4 flex items-center justify-between border-b pb-4">
                                <h3 className="text-lg font-semibold">Video Recorder</h3>
                            </div>

                            {/* Error display */}
                            {error && (
                                <div className="mb-4 rounded-md border border-red-200 bg-red-50 p-3">
                                    <div className="mb-2 text-sm text-red-800">{error}</div>
                                    <button
                                        onClick={startCameraWithFallback}
                                        className="rounded bg-red-100 px-3 py-1 text-sm text-red-800 hover:bg-red-200"
                                    >
                                        Retry Camera
                                    </button>
                                </div>
                            )}

                            {/* Device info */}
                            {availableDevices.video && availableDevices.video.length > 0 && (
                                <div className="mb-4 text-sm text-gray-600 dark:text-white/80">
                                    Found {availableDevices.video.length} camera(s) and{' '}
                                    {availableDevices.audio?.length || 0} microphone(s)
                                </div>
                            )}

                            {/* Video display */}
                            <div
                                className="relative mb-4 overflow-hidden rounded-lg bg-black"
                                style={{ aspectRatio: '16/9' }}
                            >
                                {!recordedVideoUrl ? (
                                    <video
                                        ref={videoRef}
                                        autoPlay
                                        muted
                                        playsInline
                                        className="h-full w-full object-cover"
                                    />
                                ) : (
                                    <video
                                        key={recordedVideoUrl}
                                        src={recordedVideoUrl}
                                        controls
                                        className="h-full w-full object-cover"
                                        onLoadedMetadata={(e) => {
                                            // ensure it actually starts
                                            try {
                                                e.currentTarget.play();
                                            } catch {}
                                        }}
                                    />
                                )}

                                {/* Recording indicator */}
                                {isRecording && (
                                    <div className="absolute left-4 top-4 flex items-center space-x-2 rounded-full bg-red-600 px-3 py-1 text-white">
                                        <div className="h-3 w-3 animate-pulse rounded-full bg-white"></div>
                                        <span className="text-sm font-medium">Recording</span>
                                    </div>
                                )}

                                {!isRecording && !recordedVideoUrl && (
                                    <div
                                        onClick={() => setUseFrontCamera(!useFrontCamera)}
                                        className="absolute right-4 top-4 flex cursor-pointer items-center space-x-2 rounded-full bg-blue-600 px-3 py-1 text-white"
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
                                                d="M19.5 12c0-1.232-.046-2.453-.138-3.662a4.006 4.006 0 0 0-3.7-3.7 48.678 48.678 0 0 0-7.324 0 4.006 4.006 0 0 0-3.7 3.7c-.017.22-.032.441-.046.662M19.5 12l3-3m-3 3-3-3m-12 3c0 1.232.046 2.453.138 3.662a4.006 4.006 0 0 0 3.7 3.7 48.656 48.656 0 0 0 7.324 0 4.006 4.006 0 0 0 3.7-3.7c.017-.22.032-.441.046-.662M4.5 12l3 3m-3-3-3 3"
                                            />
                                        </svg>
                                    </div>
                                )}

                                {/* Status overlay when no stream */}
                                {!stream && !recordedVideoUrl && (
                                    <div className="absolute inset-0 flex items-center justify-center text-center text-white">
                                        <div>
                                            <div className="mb-2 text-lg font-medium">
                                                Connecting to camera...
                                            </div>
                                            <div className="text-sm opacity-75">
                                                Please allow camera access if prompted
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Controls */}
                            <div className="flex justify-center space-x-3">
                                {!recordedVideoUrl ? (
                                    <>
                                        <button
                                            onClick={handleStartRecording}
                                            disabled={!stream || isRecording}
                                            className="rounded-lg bg-green-600 px-6 py-2 text-white hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
                                        >
                                            {isRecording ? 'Recording...' : 'Start Recording'}
                                        </button>

                                        <button
                                            onClick={handleStopRecording}
                                            disabled={!isRecording}
                                            className="rounded-lg bg-red-600 px-6 py-2 text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                                        >
                                            Stop Recording
                                        </button>
                                    </>
                                ) : (
                                    <>
                                        <button
                                            onClick={handleSave}
                                            disabled={recordingSaving}
                                            className="rounded-lg bg-blue-600 px-6 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
                                        >
                                            {recordingSaving ? 'Saving...' : 'Save Video'}
                                        </button>

                                        <button
                                            onClick={handleRetake}
                                            className="rounded-lg bg-amber-500 px-6 py-2 text-white hover:bg-amber-600"
                                        >
                                            Retake
                                        </button>
                                    </>
                                )}

                                <button
                                    onClick={handleClose}
                                    className="rounded-lg bg-gray-500 px-6 py-2 text-white hover:bg-gray-600"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </AuthenticatedLayout>
        </>
    );
}
