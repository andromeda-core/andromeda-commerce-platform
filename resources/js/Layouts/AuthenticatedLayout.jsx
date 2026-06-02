import Header from '@/partials/Header';
import Overlay from '@/Components/Overlay';
import Preloader from '@/Components/Preloader';
import Sidebar from '@/partials/Sidebar';
import { router, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import Toast from '@/Components/Toast';
import AppStatusManager from '@/Components/AppStatusManager';
import SuccessToastModal from '@/Components/SuccessToastModal';
import { useLanguageStore } from '@/Hooks/useLanguageStore';
import { all } from 'axios';
export default function AuthenticatedLayout({ children, allHidden = false }) {
    // Global General Setting Prop
    const { auth, generalSetting, asset, flash } = usePage().props;

    useEffect(() => {
        if (!auth.user) {
            router.visit(route('login'));
        }
    }, [auth]);

    // Application Logo Sate With Default Images
    const [ApplicationLogoLight, setApplicationLogoLight] = useState(
        asset + 'assets/images/Logo/LightLogo.png',
    );
    const [ApplicationLogoDark, setApplicationLogoDark] = useState(
        asset + 'assets/images/Logo/DarkLogo.png',
    );

    // For Updating Application Logo
    useEffect(() => {
        // Assigning Application logos
        if (generalSetting?.app_main_logo_light) {
            setApplicationLogoLight(generalSetting.app_main_logo_light);
        }

        if (generalSetting?.app_main_logo_dark) {
            setApplicationLogoDark(generalSetting.app_main_logo_dark);
        }
    }, []);

    // Global Auth user Prop
    const user = auth?.user;

    // Managing Loader State
    const [loaded, setLoaded] = useState(true);

    // Managing SidebarToggle State
    const [sidebarToggle, setSidebarToggle] = useState(() => {
        const saved = localStorage.getItem('sidebarToggle');
        if (saved === null) {
            return false;
        }
        try {
            const parsed = JSON.parse(saved);
            if (typeof parsed === 'boolean') {
                return parsed;
            }
            localStorage.removeItem('sidebarToggle');
            return false;
        } catch (error) {
            localStorage.removeItem('sidebarToggle');
            return false;
        }
    });

    // Managing Dark Mode State
    const [darkMode, setDarkMode] = useState(false);

    // State for verification message
    const [realtimeToast, setRealtimeToast] = useState(null);

    useEffect(() => {
        if (!auth?.user?.id) return;

        const channel = window.Echo.private(`user.${auth?.user?.id}`);

        channel.listen('.order-verification-success', (e) => {
            const mySocketId = window.Echo?.socketId();
            if (mySocketId && e.socket_id && e.socket_id === mySocketId) return;
            setRealtimeToast(e.message);
        });

        return () => {
            window.Echo.leaveChannel(`user.${auth?.user?.id}`);
        };
    }, [auth?.user?.id]);

    return (
        <>
            <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-deepcharcoal">
                <Preloader loaded={loaded} setLoaded={setLoaded} />
                <AppStatusManager />
                {!allHidden && (
                    <Sidebar
                        sidebarToggle={sidebarToggle}
                        setSidebarToggle={setSidebarToggle}
                        ApplicationLogoLight={ApplicationLogoLight}
                        ApplicationLogoDark={ApplicationLogoDark}
                        app_name={generalSetting?.app_name}
                        user={auth?.user}
                    />
                )}

                <div className="relative flex flex-1 flex-col overflow-y-auto overflow-x-hidden">
                    {!allHidden && (
                        <>
                            <Overlay
                                sidebarToggle={sidebarToggle}
                                setSidebarToggle={setSidebarToggle}
                            />

                            <Header
                                sidebarToggle={sidebarToggle}
                                setSidebarToggle={setSidebarToggle}
                                darkMode={darkMode}
                                setDarkMode={setDarkMode}
                                ApplicationLogoLight={ApplicationLogoLight}
                                ApplicationLogoDark={ApplicationLogoDark}
                                user={user}
                            />
                        </>
                    )}
                    <Toast flash={flash} />

                    {!allHidden && realtimeToast && (
                        <div className="fixed bottom-6 left-1/2 z-[999999] -translate-x-1/2 transform space-y-3">
                            <SuccessToastModal
                                showSuccess={true}
                                setShowSuccess={() => setRealtimeToast(null)}
                                message={realtimeToast}
                                dismissable={false}
                            />
                        </div>
                    )}

                    <main>
                        <div className="max-w-(--breakpoint-2xl) mx-auto p-4 md:p-6">
                            {children}
                        </div>
                    </main>
                </div>
            </div>

            <div id="modal-root"></div>
        </>
    );
}
