import useDarkMode from '@/Hooks/useDarkMode';
import React, { useEffect, useState } from 'react';
import Select from 'react-select';

export default function ProductSelectInput({
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
            backgroundColor: '#2a2a2a',
            color: '#ffffff',
            border: '1px solid #3a3a3a',
            borderRadius: '4px',
            minHeight: '30px',
            outline: 'none !important',
            boxShadow: 'none !important',
            '&:hover': {
                borderColor: '#3a3a3a',
            },
            fontWeight: 400,
            fontSize: '15px',
            lineHeight: '1.5'
        }),
        indicatorSeparator: () => ({
            display: 'none',
        }),
        valueContainer: (base) => ({
            ...base,
        }),
        indicatorsContainer: (base) => ({
            ...base,
            paddingRight: '8px',
        }),
        clearIndicator: (base) => ({
            ...base,
            padding: '0',
            margin: '0 4px',
            width: '20px',
            height: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '50%',
            backgroundColor: 'transparent',
            color: '#9ca3af',
            cursor: 'pointer',
            '&:hover': {
                backgroundColor: '#3a3a3a',
                color: '#ffffff',
            },
            '& svg': {
                width: '16px',
                height: '16px',
            }
        }),
        dropdownIndicator: (base) => ({
            ...base,
            color: '#9ca3af',
            padding: '8px',
            '&:hover': {
                color: '#ffffff',
            },
            '& svg': {
                width: '20px',
                height: '20px',
            }
        }),
        menu: (base) => ({
            ...base,
            backgroundColor: '#1e1e1e',
            border: '1px solid #3a3a3a',
            borderRadius: '8px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.3)',
            marginTop: '4px',
        }),
        option: (base, state) => ({
            ...base,
            backgroundColor: state.isFocused
                ? '#3a3a3a'
                : state.isSelected
                    ? '#2a2a2a'
                    : '#1e1e1e',
            color: state.isSelected ? '#ffffff' : '#b3b3b3',
            cursor: 'pointer',
            padding: '10px 16px',
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
            color: '#9ca3af',
            fontWeight: 400,
            fontSize: '15px',
            lineHeight: '1.5'
        }),
        menuList: (provided) => ({
            ...provided,
            maxHeight: '200px',
            overflowY: 'auto',
            padding: '4px',
        }),
    };

    const lightStyles = {
        control: (base, state) => ({
            ...base,
            backgroundColor: '#f0f0f0',
            color: '#6c6c6c',
            border: '1px solid #c8c8c8',
            borderRadius: '4px',
            maxHeight: '30px !important',
            outline: 'none !important',
            boxShadow: 'none !important',
            '&:hover': {
                borderColor: '#c8c8c8',
            },
            fontWeight: 400,
            fontSize: '15px',
            lineHeight: '1.5'
        }),
        indicatorSeparator: () => ({
            display: 'none',
        }),
        valueContainer: (base) => ({
            ...base,
        }),
        indicatorsContainer: (base) => ({
            ...base,
            paddingRight: '8px',
        }),
        clearIndicator: (base) => ({
            ...base,
            padding: '0',
            margin: '0 4px',
            width: '20px',
            height: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '50%',
            backgroundColor: 'transparent',
            color: '#9ca3af',
            cursor: 'pointer',
            '&:hover': {
                backgroundColor: '#e5e5e5',
                color: '#111827',
            },
            '& svg': {
                width: '16px',
                height: '16px',
            }
        }),
        dropdownIndicator: (base) => ({
            ...base,
            color: '#9ca3af',
            padding: '8px',
            '&:hover': {
                color: '#6b7280',
            },
            '& svg': {
                width: '20px',
                height: '20px',
            }
        }),
        menu: (base) => ({
            ...base,
            backgroundColor: '#f0f0f0',
            border: '1px solid #e5e5e5',
            borderRadius: '8px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            marginTop: '4px',
        }),
        option: (base, state) => ({
            ...base,
            backgroundColor: state.isFocused
                ? '#e1e1e1'
                : state.isSelected
                    ? '#e5e7eb'
                    : '#f0f0f0',
            color: '#111111',
            cursor: 'pointer',
            padding: '10px 16px',
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
            caretColor: '#111827',
        }),
        placeholder: (base) => ({
            ...base,
            color: '#6c6c6c',
            fontWeight: 400,
            fontSize: '15px',
            lineHeight: '1.5'
        }),
        menuList: (provided) => ({
            ...provided,
            maxHeight: '200px',
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
    }, [items, itemKey]);

    return (
        <>
            <div className={`${CustomCss ? CustomCss : ''} w-full`}>
                {InputName && (
                    <label
                        htmlFor={Id}
                        className="mb-1.5 block text-sm font-medium text-main-text-light dark:text-main-text-dark"
                    >
                        {InputName}
                        {Required && <span className="font-bold text-main-text-light dark:text-main-text-dark"> *</span>}
                    </label>
                )}

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
                                Action(selectedOption?.map((opt) => opt.value) || []);
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
                                placeholder: `${InputName || 'Select option'}`,
                            }
                            : {
                                placeholder: Placeholder,
                            })}
                        styles={isDarkMode ? darkStyles : lightStyles}
                        theme={(theme) => ({
                            ...theme,
                            colors: {
                                ...theme.colors,
                                primary: isDarkMode ? '#3a3a3a' : '#e5e5e5',
                                primary25: isDarkMode ? '#3a3a3a' : '#f5f5f5',
                                primary50: isDarkMode ? '#3a3a3a' : '#f5f5f5',
                                primary75: isDarkMode ? '#3a3a3a' : '#f5f5f5',
                            },
                        })}
                        className={`react-select-container ${isDisabled && 'opacity-30'}`}
                        classNamePrefix="react-select"
                    />
                </div>

                {Error && (
                    <div className="mt-1.5">
                        <p className="text-sm text-red-500">{Error}</p>
                    </div>
                )}
            </div>
        </>
    );
}
