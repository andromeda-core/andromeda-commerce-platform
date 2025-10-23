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
}) => {
    return (
        <>
            <div>
                <label
                    htmlFor="reason"
                    className="mb-2 block text-sm font-semibold text-gray-700 dark:text-white/80"
                >
                    {InputName}
                    {Required && <span className="text-red-500 dark:text-white"> *</span>}
                </label>

                <textarea
                    id={Id}
                    name={Name}
                    value={Value}
                    onChange={Action}
                    {...(Required && { required: true })}
                    rows={Rows}
                    {...(Cols && { cols: Cols })}
                    className={`shadow-theme-xs focus:ring-3 focus:outline-hidden mb-2 w-full min-w-0 max-w-full rounded-lg border border-gray-300 bg-transparent py-2.5 text-sm text-gray-800 placeholder:text-gray-400 focus:border-blue-300 focus:ring-blue-500/10 dark:border-gray-700 dark:bg-deepcharcoal dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-blue-800`}
                    placeholder={Placeholder}
                    {...Props}
                />

                {Error && <p className="mt-1.5 text-red-500 dark:text-white">{Error}</p>}
            </div>
        </>
    );
};

export default Textarea;
