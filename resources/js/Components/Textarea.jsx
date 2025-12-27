import React from 'react';

const Textarea = ({
    InputName,
    Id,
    Name,
    Value,
    Action,
    Error,
    Required,
    Rows = 4,
    Cols,
    Placeholder = '',
    Props,
    Disabled = false,
    ClassName = null
}) => {
    return (
        <>
            <div>
                <label
                    htmlFor={Name}
                    className="block mb-2 text-sm font-medium text-main-text-light dark:text-main-text-dark"
                >
                    {InputName}
                    {Required && <span className="font-bold text-main-text-light dark:text-main-text-dark"> *</span>}
                </label>

                <textarea
                    id={Id}
                    name={Name}
                    value={Value}
                    onChange={Action}
                    disabled={Disabled}
                    {...(Required && { required: true })}
                    rows={Rows}
                    {...(Cols && { cols: Cols })}
                    className={`focus:outline-hidden focus:ring-0 mb-2 min-h-[42px] w-full min-w-0 max-w-full  ${!ClassName?.includes('dark:bg-') && 'dark:bg-surface-2-dark'}
    ${ClassName} rounded-md border border-surface-3-light bg-white py-2.5 text-sm text-black placeholder:text-gray-400 focus:border-surface-3-light dark:focus:border-surface-3-dark dark:border-surface-3-dark  dark:text-white dark:placeholder:text-sub-text-dark placeholder:font-normal ${Disabled && 'cursor-not-allowed opacity-75 dark:opacity-75'}`}
                    placeholder={Placeholder}
                    {...Props}
                />

                {Error && <p className="h-5 text-sm text-red-500">{Error}</p>}
            </div>
        </>
    );
};

export default Textarea;
