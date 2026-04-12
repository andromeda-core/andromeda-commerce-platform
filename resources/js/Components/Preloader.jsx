import React, { useEffect } from 'react';
import Spinner from './Spinner';

export default function Preloader({ loaded, setLoaded }) {
    useEffect(() => {
        if (loaded) {
            const timeout = setTimeout(() => {
                setLoaded(false);
            }, 500);
            return () => clearTimeout(timeout);
        }
    }, []);

    return (
        <>
            {loaded && (
                <div className="dark:bg-backgroundDark fixed left-0 top-0 z-[999999] flex h-screen w-screen items-center justify-center bg-backgroundLight">
                    <Spinner customSize={"size-10"} />
                </div>
            )}
        </>
    );
}
