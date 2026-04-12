import React from 'react';
export default function Overlay({ sidebarToggle, setSidebarToggle }) {
    return (
        <div
            onClick={() => setSidebarToggle(!sidebarToggle)}
            className={` ${sidebarToggle ? 'block lg:hidden' : 'hidden'} z-9 fixed h-screen w-full bg-backgroundDark opacity-50`}
        ></div>
    );
}
