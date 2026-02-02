import useDarkMode from '@/Hooks/useDarkMode';
import React, { useEffect, useState } from 'react';
import Select from 'react-select';

export default function WebSelectInput({
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
    optionWindowHeight,
}) {
    const [options, setOptions] = useState([]);
    const isDarkMode = useDarkMode();
    const darkStyles = {
        control: (base, state) => ({
            ...base,
            backgroundColor: '#2a2a2a',
            color: '#ffffff',
            border: '1px solid #3a3a3a',
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
            fontSize: '14px',
            padding: '8px 12px',
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
            maxHeight: optionWindowHeight || '180px',
            overflowY: 'auto',
            padding: '4px',
        }),
    };

    const lightStyles = {
        control: (base) => ({
            ...base,
            backgroundColor: '#ffffff',
            border: '1px solid #c8c8c8',
            borderRadius: '6px',
            minHeight: '40px',
            boxShadow: 'none',
            outline: 'none',
            '&:hover': {
                borderColor: '#c8c8c8',
            },
            fontSize: '14px',
            color: '#6b6b6b',
        }),

        indicatorSeparator: () => ({ display: 'none' }),

        dropdownIndicator: (base) => ({
            ...base,
            color: '#6b6b6b',
            padding: '6px',
            '&:hover': {
                color: '#6b6b6b',
            },
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
                color: '#6b6b6b',
                display: 'block',
                fontWeight: 'normal',
            },


        }),
        valueContainer: (base) => ({
            ...base,
            padding: '2px 12px',
        }),

        singleValue: (base) => ({
            ...base,
            color: '#6b6b6b',
        }),

        placeholder: (base) => ({
            ...base,
            color: '#9ca3af',
            fontSize: '14px',
        }),

        input: (base) => ({
            ...base,
            color: '#6b6b6b',
        }),

        menu: (base) => ({
            ...base,
            backgroundColor: '#ffffff',
            border: '1px solid #c8c8c8',
            borderRadius: '6px',
            boxShadow: 'none',
            marginTop: '4px',
        }),

        menuList: (base) => ({
            ...base,
            maxHeight: optionWindowHeight || '180px',
            padding: '4px',
        }),

        option: (base, state) => ({
            ...base,
            backgroundColor: state.isSelected
                ? '#e1e1e1'
                : state.isFocused
                    ? '#f6f6f6'
                    : '#ffffff',
            color: '#6b6b6b',
            padding: '8px 12px',
            cursor: 'pointer',
            fontSize: '14px',
            '&:active': {
                backgroundColor: '#e1e1e1',
            },
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
