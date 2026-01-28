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
    ClassName = null,
    ReadOnly = false,
}) => {
    return (
        <>
            <div>
                <label
                    htmlFor={Name}
                    className="mb-1.5 block text-sm font-medium text-main-text-light dark:text-main-text-dark"
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
                    {...ReadOnly && { readOnly: true }}
                    {...(Cols && { cols: Cols })}
                    className={`shadow-theme-xs focus:ring-3 focus:outline-hidden mb-2 w-full min-w-0 max-w-full rounded-md border border-gray-300 bg-transparent py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:border-blue-300 focus:ring-blue-500/10 dark:border-gray-700 dark:bg-deepcharcoal dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-blue-800 ${ClassName || ''}`}

                    placeholder={Placeholder}
                    {...Props}
                />

                {Error && <p className="h-5 text-sm text-red-500">{Error}</p>}
            </div>
        </>
    );
};

export default Textarea;
