import useDarkMode from '@/Hooks/useDarkMode';
import React, { useEffect, useState } from 'react';
import Select from 'react-select';

export default function WebSelectInput({
    Name,
    Id,
    CustomCss,
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
            backgroundColor: '#2a2a2a',
            color: '#ffffff',
            border: '1.5px solid #3a3a3a',
            borderRadius: '6px',
            minHeight: '40px',
            outline: 'none !important',
            boxShadow: 'none !important',
            '&:hover': {
                borderColor: 'none',
            },
            fontWeight: 400,
            fontSize: "0.875rem",
            lineHeight: "1.25rem"
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
        clearIndicator: (base) => ({
            ...base,
            padding: 0,
            margin: 0,
            width: '24px',
            height: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '100%',
            backgroundColor: '#3a3a3a',
            color: '#9ca3af',
            cursor: 'pointer',
            lineHeight: 0,
            '&::before': {
                content: '"×"',
                fontSize: '20px',
                color: '#fff',
                display: 'block',
                fontWeight: 'normal',
            },
            '&:hover': {
                backgroundColor: '#3a3a3a',
                color: '#ffffff',
            },
        }),

        dropdownIndicator: (base) => ({
            ...base,
            color: '#9ca3af',
            padding: '6px',
            '&:hover': {
                color: '#ffffff',
            },
        }),
        menu: (base) => ({
            ...base,
            backgroundColor: '#1e1e1e',
            border: '1.5px solid #3a3a3a',
            borderRadius: '6px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.3)',
            marginTop: '4px',
        }),
        option: (base, state) => ({
            ...base,
            backgroundColor: state.isFocused
                ? '#3a3a3a'
                : state.isSelected
                    ? '#1e1e1e'
                    : '#1e1e1e',
            color: '#b3b3b3',
            cursor: 'pointer',
            padding: '8px 10px',
            '&:active': {
                backgroundColor: '#3a3a3a',
            },
        }),
        singleValue: (base) => ({
            ...base,
            color: '#fff',
        }),
        multiValue: (base) => ({
            ...base,
            backgroundColor: '#374151',
            borderRadius: '4px',
        }),
        multiValueLabel: (base) => ({
            ...base,
            color: '#fff',
            padding: '2px 6px',
        }),
        multiValueRemove: (base) => ({
            ...base,
            color: '#9ca3af',
            cursor: 'pointer',
            '&:hover': {
                backgroundColor: '#4b5563',
                color: '#fff',
            },
        }),
        input: (base) => ({
            ...base,
            color: '#fff',
            caretColor: '#fff',
        }),
        placeholder: (base) => ({
            ...base,
            color: '#b3b3b3',
            fontWeight: 400,
            fontSize: "0.875rem",
            lineHeight: "1.25rem"
        }),
        menuList: (provided) => ({
            ...provided,
            maxHeight: '180px',
            overflowY: 'auto',
            padding: '4px',
        }),
    };

    const lightStyles = {
        control: (base, state) => ({
            ...base,
            backgroundColor: '#ffffff',
            color: '#111827',
            border: '1.5px solid #c8c8c8',
            borderRadius: '6px',
            minHeight: '40px',
            outline: 'none !important',
            boxShadow: 'none !important',
            '&:hover': {
                borderColor: 'none',
            },

            fontWeight: 400,
            fontSize: "0.875rem",
            lineHeight: "1.25rem"
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
        clearIndicator: (base) => ({
            ...base,
            padding: 0,
            margin: 0,
            width: '24px',
            height: '24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '100%',
            backgroundColor: '#f0f0f0',
            color: '#6b7280',
            cursor: 'pointer',
            lineHeight: 0,
            '&::before': {
                content: '"×"',
                fontSize: '20px',
                color: '#222',
                display: 'block',
                fontWeight: 'normal',
            },


        }),


        dropdownIndicator: (base) => ({
            ...base,
            color: '#6b7280',
            padding: '6px',
            '&:hover': {
                color: '#111827',
            },
        }),
        menu: (base) => ({
            ...base,
            backgroundColor: '#ffffff',
            border: '1.5px solid #9FA0A0',
            borderRadius: '6px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            marginTop: '4px',
        }),
        option: (base, state) => ({
            ...base,
            backgroundColor: state.isFocused
                ? '#d4d4d4'
                : state.isSelected
                    ? '#e5e7eb'
                    : '#ffffff',
            color: '#111827',
            cursor: 'pointer',
            padding: '10px 12px',
            '&:active': {
                backgroundColor: '#e5e7eb',
            },
        }),
        singleValue: (base) => ({
            ...base,
            color: '#111827',
        }),
        multiValue: (base) => ({
            ...base,
            backgroundColor: '#e5e7eb',
            borderRadius: '4px',
        }),
        multiValueLabel: (base) => ({
            ...base,
            color: '#111827',
            padding: '2px 6px',
        }),
        multiValueRemove: (base) => ({
            ...base,
            color: '#6b7280',
            cursor: 'pointer',
            '&:hover': {
                backgroundColor: '#d1d5db',
                color: '#111827',
            },
        }),
        input: (base) => ({
            ...base,
            color: '#111827',
            caretColor: '#fff',
        }),
        placeholder: (base) => ({
            ...base,
            color: '#6b7280',
            fontWeight: 400,
            fontSize: "0.875rem",
            lineHeight: "1.25rem"
        }),
        menuList: (provided) => ({
            ...provided,
            maxHeight: '180px',
            overflowY: 'auto',
            padding: '4px',
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
            <div className={`${CustomCss} w-full`}>
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
                        isClearable={true}
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
                        theme={(theme) => ({
                            ...theme,
                            colors: {
                                ...theme.colors,
                                primary: isDarkMode ? '#4A4B4D' : '#9FA0A0',
                                primary25: isDarkMode ? '#525252' : '#d4d4d4',
                                primary50: isDarkMode ? '#525252' : '#d4d4d4',
                                primary75: isDarkMode ? '#525252' : '#d4d4d4',
                            },
                        })}
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
