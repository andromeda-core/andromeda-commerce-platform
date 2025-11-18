import Header from '@/partials/Header';
import Overlay from '@/Components/Overlay';
import Preloader from '@/Components/Preloader';
import Sidebar from '@/partials/Sidebar';
import { router, usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import Toast from '@/Components/Toast';
import AppStatusManager from '@/Components/AppStatusManager';
export default function AuthenticatedLayout({ children }) {
    // Global General Setting Prop
    const { auth, generalSetting, asset, flash } = usePage().props;

    useEffect(() => {
        if (!auth.user) {
            router.visit(route('login'));
        }
    }, [auth]);

    // Application Logo Sate With Default Images
    const [ApplicationLogoLight, setApplicationLogoLight] = useState(
        asset + 'assets/images/Logo/256b.png',
    );
    const [ApplicationLogoDark, setApplicationLogoDark] = useState(
        asset + 'assets/images/Logo/256w.png',
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
    const user = usePage().props.auth.user;

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

    return (
        <>
            <div className="flex h-screen overflow-hidden bg-slate-50 dark:bg-deepcharcoal">
                <Preloader loaded={loaded} setLoaded={setLoaded} />
                <AppStatusManager />
                <Sidebar
                    sidebarToggle={sidebarToggle}
                    setSidebarToggle={setSidebarToggle}
                    ApplicationLogoLight={ApplicationLogoLight}
                    ApplicationLogoDark={ApplicationLogoDark}
                />

                <div className="relative flex flex-col flex-1 overflow-x-hidden overflow-y-auto">
                    <Overlay sidebarToggle={sidebarToggle} setSidebarToggle={setSidebarToggle} />

                    <Header
                        sidebarToggle={sidebarToggle}
                        setSidebarToggle={setSidebarToggle}
                        darkMode={darkMode}
                        setDarkMode={setDarkMode}
                        ApplicationLogoLight={ApplicationLogoLight}
                        ApplicationLogoDark={ApplicationLogoDark}
                        user={user}
                    />

                    <Toast flash={flash} />

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
