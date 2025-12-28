import React from 'react';

export default function WebInput({
    Name,
    Value,
    Action = () => { },
    Placeholder,
    Type,
    Error,
    Required = false,
    Id,
    InputName,
    CustomCss = null,
    ShowPasswordToggle,
    setShowPasswordToggle,
    InputRef,
    readOnly = false,
    Disabled = false,
    ClassName = null
}) {
    return (
        <div className={CustomCss || 'w-full'}>
            <label
                htmlFor={Id}
                className="mb-1.5 block text-sm font-medium text-main-text-light dark:text-main-text-dark"
            >
                {InputName}
                {Required && <span className="font-bold text-main-text-light dark:text-main-text-dark"> *</span>}
            </label>
            <div className="relative">
                <input
                    readOnly={readOnly}
                    type={ShowPasswordToggle ? 'text' : Type}
                    id={Id}
                    disabled={Disabled}
                    ref={InputRef}
                    className={`focus:outline-hidden focus:ring-0 mb-2 h-[42px] w-full min-w-0 max-w-full  ${!ClassName?.includes('dark:bg-') && 'dark:bg-surface-2-dark'}
    ${ClassName} rounded-md border border-surface-3-light bg-white py-2.5 text-sm text-black placeholder:text-gray-400 focus:border-surface-3-light dark:focus:border-surface-3-dark dark:border-surface-3-dark  dark:text-white dark:placeholder:text-sub-text-dark placeholder:font-normal ${Disabled && 'cursor-not-allowed opacity-75 dark:opacity-75'}`}
                    placeholder={Placeholder}
                    step="any"
                    name={Name}
                    value={Value ?? ''}
                    {...(!readOnly && { onChange: Action })}
                    required={Required}
                    {...(Type === 'password' ? { autoComplete: 'off' } : {})}
                    {...(Type === 'number' ? { min: 0 } : {})}
                />
                {Error && Type !== 'password' && (
                    <span className="absolute right-3.5 top-5 -translate-y-1/2">
                        <svg
                            width="16"
                            height="16"
                            viewBox="0 0 16 16"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                fillRule="evenodd"
                                clipRule="evenodd"
                                d="M2.58325 7.99967C2.58325 5.00813 5.00838 2.58301 7.99992 2.58301C10.9915 2.58301 13.4166 5.00813 13.4166 7.99967C13.4166 10.9912 10.9915 13.4163 7.99992 13.4163C5.00838 13.4163 2.58325 10.9912 2.58325 7.99967ZM7.99992 1.08301C4.17995 1.08301 1.08325 4.17971 1.08325 7.99967C1.08325 11.8196 4.17995 14.9163 7.99992 14.9163C11.8199 14.9163 14.9166 11.8196 14.9166 7.99967C14.9166 4.17971 11.8199 1.08301 7.99992 1.08301ZM7.09932 5.01639C7.09932 5.51345 7.50227 5.91639 7.99932 5.91639H7.99999C8.49705 5.91639 8.89999 5.51345 8.89999 5.01639C8.89999 4.51933 8.49705 4.11639 7.99999 4.11639H7.99932C7.50227 4.11639 7.09932 4.51933 7.09932 5.01639ZM7.99998 11.8306C7.58576 11.8306 7.24998 11.4948 7.24998 11.0806V7.29627C7.24998 6.88206 7.58576 6.54627 7.99998 6.54627C8.41419 6.54627 8.74998 6.88206 8.74998 7.29627V11.0806C8.74998 11.4948 8.41419 11.8306 7.99998 11.8306Z"
                                className="fill-red-500 dark:fill-white"
                            ></path>
                        </svg>
                    </span>
                )}

                {Type === 'password' && (
                    <span
                        className="absolute z-30 pb-2 text-black -translate-y-1/2 cursor-pointer right-4 top-1/2 dark:text-white"
                        onClick={() => setShowPasswordToggle(!ShowPasswordToggle)}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={ShowPasswordToggle ? 'visible size-4' : 'hidden'}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                        </svg>

                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className={!ShowPasswordToggle ? 'visible size-4' : 'hidden'}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 1.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.451 10.451 0 0 1 12 4.5c4.756 0 8.773 3.162 10.065 7.498a10.522 10.522 0 0 1-4.293 5.774M6.228 6.228 3 3m3.228 3.228 3.65 3.65m7.894 7.894L21 21m-3.228-3.228-3.65-3.65m0 0a3 3 0 1 0-4.243-4.243m4.242 4.242L9.88 9.88" />
                        </svg>

                    </span>
                )}
            </div>

            <div className="mb-4">{Error && <p className="text-sm text-red-500">{Error}</p>}</div>
        </div>
    );
}
