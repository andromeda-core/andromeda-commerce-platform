import { Link } from '@inertiajs/react';
import React from 'react';

export default function LinkButton({ Disabled, Text, CustomClass = null, Icon, URL }) {
    return (
        <>
            <Link
                href={URL}
                className={`shadow-theme-xs my-3 flex w-full max-w-[300px] items-center justify-center rounded-md bg-main-text-light dark:bg-main-text-dark dark:text-main-text-light px-4 py-3 text-sm font-medium text-main-text-dark transition hover:bg-main-text-light/80 dark:hover:bg-main-text-dark/80 ${CustomClass} ${Disabled && 'pointer-events-none cursor-not-allowed opacity-25 dark:opacity-40'} `}
            >
                {Text}

                <div className="mx-2">{Icon ? Icon : ''}</div>
            </Link>
        </>
    );
}
