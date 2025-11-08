import { Link } from '@inertiajs/react';
import React from 'react';

export default function LinkButton({ Disabled, Text, CustomClass = null, Icon, URL }) {
    return (
        <>
            <Link
                href={URL}
                className={`shadow-theme-xs my-3 flex w-full max-w-[300px] items-center justify-center rounded-xl bg-indigo-700 px-4 py-3 text-sm font-medium text-white transition hover:bg-indigo-600 ${CustomClass} ${Disabled && 'pointer-events-none cursor-not-allowed opacity-25 dark:opacity-40'} `}
            >
                {Text}

                <div className="mx-2">{Icon ? Icon : ''}</div>
            </Link>
        </>
    );
}
