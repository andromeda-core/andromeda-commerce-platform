import React, { useEffect, useRef, useState } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import BreadCrumb from '@/Components/BreadCrumb';
import Card from '@/Components/Card';
import DummyLogo from '../../../../../public/assets/images/Logo/512512.png';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/pagination';
import 'swiper/css/navigation';
import { Navigation, Pagination } from 'swiper/modules';
import { createPortal } from 'react-dom';
import QRCode from 'react-qr-code';
import BookmarkStatusChangedModal from '@/Components/BookmarkStatusChangedModal';
import VideoWithThumbnail from '@/Components/VideoWithThumbnail';
import LinkCopiedModal from '@/Components/LinkCopiedModal';
import Spinner from '@/Components/Spinner';
import useDarkMode from '@/Hooks/useDarkMode';
export default function view({ post }) {
    const { generalSetting } = usePage().props;
    const isDarkMode = useDarkMode();

    const [showDropdown, setShowDropdown] = useState(false);
    const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0 });
    const iconRef = useRef(null);
    const dropDownRef = useRef(null);

    const [bookmarkStatusChanged, setBookmarkStatusChanged] = useState(false);
    const [linkCopied, setLinkCopied] = useState(false);

    const [showQrCode, setShowQrCode] = useState(false);


    // QR CODE DOWNLOAD STATE AND DOWNLOAD METHOD
    const [isQrDownloading, setIsQrDownloading] = useState(false);
    const handleDownloadQRCode = () => {
        setIsQrDownloading(true);
        setTimeout(() => {
            const svg = document.querySelector('#qr-code-canvas');

            if (!svg) {
                console.error('SVG element not found');
                setIsQrDownloading(false);
                return;
            }

            try {

                const svgClone = svg.cloneNode(true);
                svgClone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');


                const svgData = new XMLSerializer().serializeToString(svgClone);


                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');


                const padding = 40;
                const qrSize = 800;
                const totalSize = qrSize + (padding * 2);

                canvas.width = totalSize;
                canvas.height = totalSize;

                const img = new Image();
                const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
                const url = URL.createObjectURL(svgBlob);

                img.onload = () => {

                    ctx.fillStyle = '#ffffff';
                    ctx.fillRect(0, 0, totalSize, totalSize);


                    ctx.drawImage(img, padding, padding, qrSize, qrSize);


                    ctx.strokeStyle = '#000000';
                    ctx.lineWidth = 2;
                    ctx.strokeRect(padding - 1, padding - 1, qrSize + 2, qrSize + 2);


                    canvas.toBlob((blob) => {
                        if (!blob) {
                            console.error('Failed to create blob');
                            URL.revokeObjectURL(url);
                            setIsQrDownloading(false);
                            return;
                        }

                        const downloadUrl = URL.createObjectURL(blob);
                        const link = document.createElement('a');


                        const filename = 'qr-code-post-download.png';

                        link.href = downloadUrl;
                        link.download = filename;


                        document.body.appendChild(link);
                        link.click();

                        // Cleanup
                        setTimeout(() => {
                            document.body.removeChild(link);
                            URL.revokeObjectURL(downloadUrl);
                            URL.revokeObjectURL(url);
                            setIsQrDownloading(false);
                        }, 100);
                    }, 'image/png', 1.0);
                };

                img.onerror = () => {
                    console.error('Failed to load SVG image');
                    URL.revokeObjectURL(url);
                    setIsQrDownloading(false);
                };

                img.src = url;

            } catch (error) {
                console.error('Error downloading QR code:', error);
                setIsQrDownloading(false);
            }
        }, 100);
    };


    const generateURL = (post) => {
        return (
            `?slug=${encodeURIComponent(post?.slug)}&planet=earth${post?.latitude != null ? '&lat=' + encodeURIComponent(post?.latitude) : ''}` +
            `${post?.longitude != null ? '&lng=' + encodeURIComponent(post?.longitude) : ''}` +
            `${post?.location_name != null ? '&location_name=' + encodeURIComponent(post?.location_name) : ''}` +
            `&timestamp=${encodeURIComponent(post?.created_at)}` +
            `${post?.floor_id != null ? '&floor=' + encodeURIComponent(post?.floor?.name) : ''}`
        );
    };

    const [url, setUrl] = useState(route('dashboard.posts.show', post?.slug) + generateURL(post));

    const handleToggle = () => {
        if (iconRef.current) {
            const rect = iconRef.current.getBoundingClientRect();
            setDropdownPos({
                top: rect.bottom + 6,
                left: rect.right - 180,
            });
            setShowDropdown((prev) => !prev);
        }
    };

    useEffect(() => {
        const handleResize = () => setShowDropdown(false);
        const handleClickOutside = (e) => {
            if (
                iconRef.current &&
                dropDownRef.current &&
                !iconRef.current.contains(e.target) &&
                !dropDownRef.current.contains(e.target)
            ) {
                setShowDropdown(false);
            }
        };

        window.addEventListener('resize', handleResize);
        document.addEventListener('mousedown', handleClickOutside);

        return () => {
            window.removeEventListener('resize', handleResize);
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <>
            <AuthenticatedLayout>
                <Head title="Posts" />
                <BreadCrumb
                    header="View Post"
                    parent="Posts"
                    parent_link={route('dashboard.posts.index')}
                    child="View Posts"
                />


                <Card
                    Content={
                        <>
                            <div className="flex flex-col w-full max-w-5xl mx-auto overflow-hidden rounded-lg shadow-lg md:flex-row">
                                {/* Media Section - Shows on top for mobile, left for desktop */}
                                {((Array.isArray(post?.post_video_urls) &&
                                    post.post_video_urls.length > 0) ||
                                    (Array.isArray(post?.post_image_urls) &&
                                        post.post_image_urls.length > 0)) && (
                                        <div className="w-full bg-gray-200 dark:bg-deepcharcoal md:w-1/2">
                                            <div className="flex h-[300px] items-center justify-center md:h-[500px]">
                                                <Swiper
                                                    style={{
                                                        '--swiper-navigation-color': '#fff',
                                                        '--swiper-pagination-color': '#fff',
                                                    }}
                                                    pagination={{
                                                        clickable: true,
                                                    }}
                                                    loop
                                                    navigation={true}
                                                    modules={[Pagination, Navigation]}
                                                    className="w-full h-full mySwiper"
                                                >
                                                    {Array.isArray(post?.post_image_urls) &&
                                                        post.post_image_urls.map(
                                                            (img, index) =>
                                                                img && (
                                                                    <SwiperSlide key={`img-${index}`}>
                                                                        <div className="relative flex items-center justify-center w-full h-full">
                                                                            {/* Blurred background filler */}
                                                                            <img
                                                                                src={img}
                                                                                alt=""
                                                                                aria-hidden="true"
                                                                                className="absolute inset-0 object-cover w-full h-full scale-110 blur-lg"
                                                                            />

                                                                            {/* Actual image */}
                                                                            <img
                                                                                src={img}
                                                                                alt={`Image ${index + 1}`}
                                                                                loading="lazy"
                                                                                className="relative z-10 object-contain w-auto h-full"
                                                                            />
                                                                        </div>

                                                                        <div className="swiper-lazy-preloader dark:swiper-lazy-preloader-white"></div>
                                                                    </SwiperSlide>
                                                                ),
                                                        )}
                                                    {Array.isArray(post?.post_video_urls) &&
                                                        post.post_video_urls.map(
                                                            (vid, index) =>
                                                                vid && (
                                                                    <SwiperSlide key={`vid-${index}`}>
                                                                        <div className="relative flex items-center justify-center w-full h-full">
                                                                            <VideoWithThumbnail
                                                                                thumbnail={vid?.thumbnail_url}
                                                                                videoUrl={vid?.url}
                                                                                Preload='metadata'
                                                                                type='customized'
                                                                                className={'object-cover object-center'}

                                                                            />
                                                                        </div>
                                                                    </SwiperSlide>
                                                                ),
                                                        )}
                                                </Swiper>
                                            </div>
                                        </div>
                                    )}

                                {/* Content Section - Shows below media on mobile, right side on desktop */}
                                <div
                                    className={`w-full bg-white dark:bg-deepcharcoal ${(Array.isArray(post?.post_video_urls) &&
                                        post.post_video_urls.length > 0) ||
                                        (Array.isArray(post?.post_image_urls) &&
                                            post.post_image_urls.length > 0)
                                        ? 'md:w-1/2'
                                        : 'md:w-full'
                                        }`}
                                >
                                    <div className="w-full p-6 mx-auto space-y-4 md:p-10">
                                        {/* Author Header */}
                                        <div className="flex flex-wrap items-center justify-between space-x-3">
                                            <div className="flex items-center space-x-3">
                                                <img
                                                    src={generalSetting?.app_favicon ?? DummyLogo}
                                                    className="w-10 h-10 rounded-full"
                                                    alt="Profile"
                                                />
                                                <span className="text-lg font-semibold dark:text-white/80">
                                                    {generalSetting?.app_name.length > 20
                                                        ? generalSetting?.app_name
                                                            .split(' ')
                                                            .map((word) => word[0])
                                                            .join('')
                                                        : generalSetting?.app_name}
                                                </span>
                                            </div>

                                            <div
                                                className="cursor-pointer"
                                                onClick={() => handleToggle()}
                                                ref={iconRef}
                                            >
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    strokeWidth={1.5}
                                                    stroke="currentColor"
                                                    className="size-6 dark:text-white"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        d="M6.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM12.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0ZM18.75 12a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z"
                                                    />
                                                </svg>
                                            </div>

                                            {/* Dropdown Menu */}
                                            {showDropdown && (
                                                <>
                                                    {createPortal(
                                                        <div
                                                            onClick={(e) => e.stopPropagation()}
                                                            ref={dropDownRef}
                                                            className="fixed z-[100] w-44 rounded-lg border border-gray-200 bg-white shadow-xl dark:border-gray-700 dark:bg-deepcharcoal sm:w-48"
                                                            style={{
                                                                top: `${dropdownPos.top}px`,
                                                                left: `${dropdownPos.left}px`,
                                                            }}
                                                        >
                                                            <ul
                                                                className="py-1 overflow-y-scroll text-sm text-gray-700 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-blue-500 dark:text-gray-200 dark:scrollbar-thumb-white"
                                                                style={{ maxHeight: '180px' }}
                                                            >
                                                                <li>
                                                                    <button
                                                                        onClick={() => {
                                                                            setShowQrCode(true);
                                                                            setShowDropdown(false);
                                                                        }}
                                                                        className="flex items-center w-full gap-3 px-3 py-2 text-left transition-colors hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
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
                                                                                d="M3.75 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0 1 3.75 9.375v-4.5ZM3.75 14.625c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5a1.125 1.125 0 0 1-1.125-1.125v-4.5ZM13.5 4.875c0-.621.504-1.125 1.125-1.125h4.5c.621 0 1.125.504 1.125 1.125v4.5c0 .621-.504 1.125-1.125 1.125h-4.5A1.125 1.125 0 0 1 13.5 9.375v-4.5Z"
                                                                            />
                                                                            <path
                                                                                strokeLinecap="round"
                                                                                strokeLinejoin="round"
                                                                                d="M6.75 6.75h.75v.75h-.75v-.75ZM6.75 16.5h.75v.75h-.75v-.75ZM16.5 6.75h.75v.75h-.75v-.75ZM13.5 13.5h.75v.75h-.75v-.75ZM13.5 19.5h.75v.75h-.75v-.75ZM19.5 13.5h.75v.75h-.75v-.75ZM19.5 19.5h.75v.75h-.75v-.75ZM16.5 16.5h.75v.75h-.75v-.75Z"
                                                                            />
                                                                        </svg>
                                                                        QR Code
                                                                    </button>
                                                                </li>

                                                                <li>
                                                                    <button
                                                                        className="flex items-center w-full gap-3 px-3 py-2 text-left transition-colors hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            router.put(
                                                                                route(
                                                                                    'dashboard.posts.bookmarks.toggle',
                                                                                    post?.id,
                                                                                ),
                                                                                {
                                                                                    post_id:
                                                                                        post?.id,
                                                                                },

                                                                                {
                                                                                    onSuccess:
                                                                                        () => {
                                                                                            setBookmarkStatusChanged(
                                                                                                true,
                                                                                            );
                                                                                        },


                                                                                },
                                                                            );
                                                                        }}
                                                                    >
                                                                        <svg
                                                                            xmlns="http://www.w3.org/2000/svg"
                                                                            fill={
                                                                                post?.is_bookmarked
                                                                                    ? isDarkMode ? '#ffff' : '#222'
                                                                                    : 'none'
                                                                            }
                                                                            viewBox="0 0 24 24"
                                                                            strokeWidth={1.5}
                                                                            stroke="currentColor"
                                                                            className="size-6"
                                                                        >
                                                                            <path
                                                                                strokeLinecap="round"
                                                                                strokeLinejoin="round"
                                                                                d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0Z"
                                                                            />
                                                                        </svg>
                                                                        Bookmark
                                                                    </button>
                                                                </li>

                                                                <li>
                                                                    <button
                                                                        className="flex items-center w-full gap-1 px-3 py-2 text-left transition-colors hover:bg-gray-100 dark:hover:bg-gray-600 dark:hover:text-white"
                                                                        onClick={(e) => {
                                                                            navigator.clipboard.writeText(
                                                                                url.trim(),
                                                                            );
                                                                            setLinkCopied(true);

                                                                            setShowDropdown(false);
                                                                        }}
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
                                                                                d="M11.35 3.836c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m8.9-4.414c.376.023.75.05 1.124.08 1.131.094 1.976 1.057 1.976 2.192V16.5A2.25 2.25 0 0 1 18 18.75h-2.25m-7.5-10.5H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V18.75m-7.5-10.5h6.375c.621 0 1.125.504 1.125 1.125v9.375m-8.25-3 1.5 1.5 3-3.75"
                                                                            />
                                                                        </svg>
                                                                        Copy Link
                                                                    </button>
                                                                </li>
                                                            </ul>
                                                        </div>,
                                                        document.body,
                                                    )}
                                                </>
                                            )}
                                        </div>

                                        {/* Post Content */}

                                        <p className="mt-8 font-semibold text-gray-800 break-words whitespace-normal text-md dark:text-white/80">
                                            {post?.title}
                                        </p>

                                        <div
                                            className="prose text-gray-800 break-words max-w-none dark:prose-invert dark:text-white/80"
                                            dangerouslySetInnerHTML={{
                                                __html: post?.content,
                                            }}
                                        />

                                        {/* Tag */}
                                        <div>
                                            <span className="text-xs font-semibold text-blue-600 dark:text-white/80">
                                                {post?.tag}
                                            </span>
                                        </div>

                                        <hr className="border-gray-200 dark:border-gray-700" />

                                        {/* Post Meta Info */}
                                        <div className="flex flex-wrap gap-2 text-xs text-gray-700 dark:text-white/80">
                                            <span className="px-2 py-1 bg-gray-100 rounded-full dark:bg-zinc-800/50">
                                                {post?.added_at + ' ' + post?.created_at_time}
                                            </span>

                                            {post?.location_name && (
                                                <span className="px-2 py-1 bg-gray-100 rounded-full dark:bg-zinc-800/50">
                                                    {post?.location_name}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </>
                    }
                />

                {/* QR Code */}
                {showQrCode &&
                    createPortal(
                        <div className="fixed inset-0 z-[100] flex items-center justify-center">
                            {/* Overlay */}
                            <div
                                className="fixed inset-0 bg-black/40 backdrop-blur-sm"
                                onClick={() => setShowQrCode(false)}
                            ></div>

                            {/* Modal */}
                            <div
                                role="dialog"
                                aria-modal="true"
                                aria-labelledby="qrCodeTitle"
                                className={`relative z-[101] w-full max-w-[200px] rounded-2xl bg-transparent  pt-3 text-gray-900   lg:max-w-[300px] lg:p-6`}
                            >
                                <div className="text-center">
                                    <div className="flex justify-center">
                                        <QRCode
                                            id="qr-code-canvas"
                                            className={'size-52 border-2'}
                                            value={url}

                                            viewBox="0 0 256 256"
                                            level="H"
                                            includemargin="true"
                                            bgColor="#ffffff"
                                            fgColor="#000000"
                                        />
                                    </div>

                                    <h2
                                        id="qrCodeTitle"
                                        className="my-3 text-base font-semibold text-white dark:text-white/80"
                                    >
                                        Scan QR Code
                                    </h2>

                                    {/* Download Button */}
                                    <button
                                        onClick={handleDownloadQRCode}
                                        className={` ${isQrDownloading && 'pointer-events-none opacity-50'} inline-flex items-center gap-2 px-4 py-2 text-xs font-medium text-gray-900 transition-colors bg-white rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-white  focus:ring-offset-2 focus:ring-offset-gray-900`}
                                        aria-label="Download QR Code"
                                        disabled={isQrDownloading}

                                    >

                                        Download QR Code


                                        {isQrDownloading ? (

                                            <Spinner />
                                        ) : (
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                className="w-4 h-4"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={2}
                                                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                                                />
                                            </svg>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>,
                        document.body,
                    )}
            </AuthenticatedLayout>

            {bookmarkStatusChanged && (
                <BookmarkStatusChangedModal
                    BookmarkStatusChanged={bookmarkStatusChanged}
                    setBookmarkStatusChanged={setBookmarkStatusChanged}
                />
            )}


            {linkCopied && (
                <LinkCopiedModal
                    linkCopied={linkCopied}
                    setLinkCopied={setLinkCopied}
                />
            )}
        </>
    );
}
