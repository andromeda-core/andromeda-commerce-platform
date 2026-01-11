import useDarkMode from '@/Hooks/useDarkMode';
import React, { useEffect, useState } from 'react';
import Select from 'react-select';

export default function SelectInput({
    Name,
    Id,
    CustomCss = null,
    Required = false,
    InputName,
    Error,
    items,
    Action,
    Value,
    itemKey,
    Multiple = false,
    Placeholder = true,
    isDisabled = false,
    customPlaceHolder = false,
}) {
    const [options, setOptions] = useState([]);
    const isDarkMode = useDarkMode();
    const darkStyles = {
        control: (base, state) => ({
            ...base,
            backgroundColor: '#0D0E12',
            color: '#ffffff',
            minHeight: '40px',
            border: state.isFocused ? '1px solid #3b82f6' : '1px solid #4b5563',
            boxShadow: 'none',
            '&:hover': {
                borderColor: 'none',
            },
        }),

        menu: (base) => ({
            ...base,
            backgroundColor: '#0D0E12',
            color: '#fff',
        }),
        option: (base, state) => ({
            ...base,
            backgroundColor: '#0D0E12',
            border: '1px solid #374151',
            color: '#fff',
            '&:active': {
                backgroundColor: '#4b5563',
            },
        }),
        indicatorSeparator: () => ({
            display: 'none',
        }),
        valueContainer: (base) => ({
            ...base,
            padding: '2px 12px',
        }),
        indicatorsContainer: (base) => ({
            ...base,
            '& > div': {
                padding: '10px',
            },
        }),
        singleValue: (base) => ({
            ...base,
            color: '#fff',
        }),
        input: (base) => ({
            ...base,
            color: '#fff',
        }),
        placeholder: (base) => ({
            ...base,
            color: '#9ca3af',
        }),
        menuList: (provided) => ({
            ...provided,
            maxHeight: '180px',
            overflowY: 'auto',
        }),
    };
    const lightStyles = {
        control: (base, state) => ({
            ...base,
            backgroundColor: '#ffffff', // white
            color: '#111827', // gray-900
            minHeight: '40px',
            borderColor: state.isFocused ? '#2563eb' : '#d1d5db',
            boxShadow: 'none',
            '&:hover': {
                borderColor: 'none',
            },
        }),
        menu: (base) => ({
            ...base,
            backgroundColor: '#ffffff', // white
            color: '#111827', // gray-900
        }),
        option: (base, state) => ({
            ...base,
            backgroundColor: state.isFocused ? '#f3f4f6' : '#ffffff',
            color: '#111827',
            '&:active': {
                backgroundColor: '#e5e7eb',
            },
        }),
        indicatorSeparator: () => ({
            display: 'none',
        }),
        valueContainer: (base) => ({
            ...base,
            padding: '2px 12px',
        }),
        indicatorsContainer: (base) => ({
            ...base,
            '& > div': {
                padding: '10px',
            },
        }),
        singleValue: (base) => ({
            ...base,
            color: '#111827', // gray-900
        }),
        input: (base) => ({
            ...base,
            color: '#111827', // gray-900
        }),
        placeholder: (base) => ({
            ...base,
            color: '#6b7280', // gray-500
        }),
        menuList: (provided) => ({
            ...provided,
            maxHeight: '180px',
            overflowY: 'auto',
        }),
    };

    useEffect(() => {
        const modified_options = items.map((item) => ({
            value: item.id ?? item[itemKey],
            label: item[itemKey].length > 50 ? item[itemKey].slice(0, 50) + '...' : item[itemKey],
        }));

        setOptions(modified_options);
    }, []);

    return (
        <>
            <div className={`${CustomCss ? CustomCss : ''} w-full`}>
                <label
                    htmlFor={Id}
                    className="mb-1.5 block text-sm font-medium text-main-text-light dark:text-main-text-dark"
                >
                    {InputName}
                    {Required && <span className="font-bold text-main-text-light dark:text-main-text-dark"> *</span>}
                </label>

                <div className="relative">
                    <Select
                        name={Name}
                        inputId={Id}
                        options={options}
                        isDisabled={isDisabled}
                        value={
                            Multiple
                                ? options.filter((opt) =>
                                    (Array.isArray(Value) ? Value : [])
                                        .map(String)
                                        .includes(String(opt.value)),
                                )
                                : options.find((opt) => String(opt.value) === String(Value)) || null
                        }
                        onChange={(selectedOption) => {
                            if (Multiple) {
                                Action(selectedOption?.map((opt) => opt.value));
                            } else {
                                Action(selectedOption?.value ?? '');
                            }
                        }}
                        isMulti={Multiple}
                        isClearable={!Multiple}
                        isSearchable
                        required={Required}
                        {...(!customPlaceHolder
                            ? {
                                placeholder: `Select ${InputName}`,
                            }
                            : {
                                placeholder: Placeholder,
                            })}
                        styles={isDarkMode ? darkStyles : lightStyles}
                        className={`react-select-container ${isDisabled && 'opacity-30'}`}
                        classNamePrefix="react-select"
                    />
                </div>

                {Error && (
                    <div className="h-5 mt-2">
                        {Error && <p className="h-5 text-sm text-red-500">{Error}</p>}
                    </div>
                )}
            </div>
        </>
    );
}
