import { Link, router } from '@inertiajs/react';
import PrimaryButton from '@/Components/PrimaryButton';
import debounce from 'lodash.debounce';
import React, { useEffect, useRef, useState } from 'react';
import Input from './Input';
import { createPortal } from 'react-dom';
import { Ellipsis } from 'lucide-react';

export default function Table({
    resetSingleSelectedId,
    resetBulkSelectedIds,
    setSingleSelectedId,
    SingleDeleteMethod,
    setBulkSelectedIds,
    SingleDeleteRoute,
    BulkDeleteMethod,
    SingleSelectedId,
    BulkDeleteRoute,
    Search = true,
    SearchRoute,
    EditRoute,
    DeleteAction = true,
    columns,
    items,
    props,
    customActions = [],
    customSearch,
    searchProps = {},
    ParentSearched = false,
    RouteParameterKey,
    DefaultSearchInput,
    canSelect = true,
}) {
    // State and logic remain unchanged from your original code
    const [search, setSearch] = useState(props?.search ?? '');
    const [openDropdownId, setOpenDropdownId] = useState(null);
    const [BulkActionDropdown, setBulkActionDropdown] = useState(false);
    const [openBulkActionDropdownOptions, setOpenBulkActionDropdownOptions] = useState(false);
    const [DeleteBulkSelectedProcessing, setDeleteBulkSelectedProcessing] = useState(false);
    const [DeleteSelectedBuilkConfirmationModal, setDeleteSelectedBuilkConfirmationModal] =
        useState(false);
    const [DeleteSingleConfirmationModal, setDeleteSingleConfirmationModal] = useState(false);
    const [DeleteSingleProcessing, setDeleteSingleProcessing] = useState(false);
    const [selectedIds, setSelectedIds] = useState([]);
    const dropdownRefs = useRef({});
    const dropdownElements = useRef({});

    const searchInputRef = useRef(null);

    const getNestedValue = (obj, path) => {
        const value = path.split('.').reduce((acc, part) => acc && acc[part], obj);
        return value == null ? 'N/A' : value;
    };

    const handleSelectAll = () => {
        if (selectedIds.length === items.data.length) setSelectedIds([]);
        else setSelectedIds(items.data.map((item) => item.id));
    };

    const handleSelect = (id) => {
        if (selectedIds.includes(id)) setSelectedIds(selectedIds.filter((item) => item !== id));
        else setSelectedIds([...selectedIds, id]);
    };

    const DeleteSingleRecord = () => {
        setDeleteSingleProcessing(true);
        SingleDeleteMethod(route(SingleDeleteRoute, SingleSelectedId['id']), {
            onSuccess: () => {
                setDeleteSingleProcessing(false);
                setSelectedIds([]);
                setDeleteSingleConfirmationModal(false);
                resetSingleSelectedId('id');
            },
            onError: () => setDeleteSingleProcessing(false),
        });
    };

    const deleteSelectedBulkMethod = () => {
        setDeleteBulkSelectedProcessing(true);
        BulkDeleteMethod(route(BulkDeleteRoute), {
            onSuccess: () => {
                setDeleteSelectedBuilkConfirmationModal(false);
                setDeleteBulkSelectedProcessing(false);
                setSelectedIds([]);
                resetBulkSelectedIds('ids');
            },
            onError: () => setDeleteBulkSelectedProcessing(false),
        });
    };

    const searchPropsRef = useRef(searchProps);

    useEffect(() => {
        searchPropsRef.current = searchProps;
    }, [searchProps]);

    const debouncedSearch = useRef(null);

    useEffect(() => {
        debouncedSearch.current = debounce((value) => {
            router.get(
                route(SearchRoute, {
                    ...(value != '' && value != null ? { search: value } : {}),
                    ...(searchPropsRef.current || {}),
                }),
            );
        }, 1000);
    }, [SearchRoute]);

    useEffect(() => {
        if (ParentSearched) {
            if (debouncedSearch.current) {
                debouncedSearch.current(search ?? searchPropsRef);
            }
        }
    }, [ParentSearched, searchProps]);

    const handlePagination = (url) => {
        if (url) {
            router.visit(url, { preserveScroll: true, preserveState: true });
        }
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            const isClickInsideAnyDropdown = Object.values(dropdownRefs.current).some(
                (ref) => ref && ref.contains(event.target),
            );
            if (!isClickInsideAnyDropdown) {
                setOpenDropdownId(null);
                setOpenBulkActionDropdownOptions(false);
            }
        };
        document.addEventListener('click', handleClickOutside);
        if (search !== '') searchInputRef.current.focus();
        return () => document.removeEventListener('click', handleClickOutside);
    }, [search]);

    useEffect(() => {
        if (setBulkSelectedIds !== undefined) {
            if (selectedIds.length === 0) {
                setBulkActionDropdown(false);
                setBulkSelectedIds('ids', []);
                setSingleSelectedId('id', null);
            } else {
                setBulkActionDropdown(true);
                setBulkSelectedIds('ids', selectedIds);
                setSingleSelectedId('id', selectedIds[0]);
            }
        }
    }, [selectedIds]);

    const updateDropdownPosition = () => {
        Object.keys(dropdownRefs.current).forEach((id) => {
            const el = dropdownRefs.current[id];
            const dropdownEl = dropdownElements.current[id];
            if (!el || !dropdownEl) return;

            const rect = el.getBoundingClientRect();
            const top = rect.top - 8;
            const right = window.innerWidth - rect.right - 8;

            dropdownEl.style.top = `${top}px`;
            dropdownEl.style.right = `${right}px`;
            dropdownEl.style.left = '';
        });
    };

    // DropDown Position Update Dynamically
    useEffect(() => {
        window.addEventListener('resize', updateDropdownPosition);
        window.addEventListener('scroll', updateDropdownPosition, true);

        const timeout = setTimeout(updateDropdownPosition, 10);

        return () => {
            window.removeEventListener('resize', updateDropdownPosition);
            window.removeEventListener('scroll', updateDropdownPosition, true);
            clearTimeout(timeout);
        };
    }, [openDropdownId]);

    // New function to render cell content
    const renderCell = (item, column) => {
        // If a custom render function is provided, use it
        if (column.render) {
            return column.render(item);
        }

        // If badge is specified, render as a badge
        if (column.badge) {
            const value = getNestedValue(item, column.key);

            return (
                <span
                    className={`inline-block rounded-full px-2 py-1 text-xs font-semibold ${column.badge(value)}`}
                >
                    {value}
                </span>
            );
        }

        // Handle profile image/avatar
        if (column.profile === true) {
            return column.profile && item.profile_url ? (
                <img
                    src={item.profile_url}
                    alt="Profile"
                    className="object-cover w-full rounded-full sm:h-20 sm:w-20"
                />
            ) : (
                <span className="flex items-center justify-center w-full text-2xl text-white bg-indigo-500 rounded-full sm:h-20 sm:w-20">
                    {item[column.default] ?? column.default}
                </span>
            );
        }

        // handle Normal Image
        if (column.image === true) {
            const imageUrl = getNestedValue(item, column.url ?? column.key);
            return imageUrl ? (
                <img
                    src={imageUrl}
                    alt="Image"
                    className="object-cover w-full rounded-full sm:h-20 sm:w-20"
                />
            ) : (
                <span className="flex items-center justify-center w-full text-2xl text-white bg-gray-800 rounded-full sm:h-20 sm:w-20">
                    N/A
                </span>
            );
        }

        // Default: render text
        return getNestedValue(item, column.key);

    };

    const bulkBtnRef = useRef(null);
    const bulkMenuRef = useRef(null);

    const [bulkMenuPos, setBulkMenuPos] = useState({ top: 0, left: 0 });

    const openBulkMenu = () => {
        const btn = bulkBtnRef.current;
        if (!btn) return;

        const r = btn.getBoundingClientRect();
        const menuW = 192; // w-48
        const gap = 8;

        // align dropdown to the RIGHT edge of the button
        let left = r.right - menuW;

        // clamp to viewport
        left = Math.max(8, Math.min(left, window.innerWidth - menuW - 8));

        setBulkMenuPos({ top: r.bottom + gap, left });

        setOpenBulkActionDropdownOptions(true);
        setOpenDropdownId("00000");
    };

    useEffect(() => {
        const onDocClick = (e) => {
            if (!openBulkActionDropdownOptions) return;

            if (bulkBtnRef.current?.contains(e.target)) return;
            if (bulkMenuRef.current?.contains(e.target)) return;

            setOpenBulkActionDropdownOptions(false);
            setOpenDropdownId(null);
        };

        document.addEventListener("mousedown", onDocClick);
        return () => document.removeEventListener("mousedown", onDocClick);
    }, [openBulkActionDropdownOptions]);




    return (
        <>
            <div className="pt-4 bg-white border border-gray-200 rounded-2xl dark:border-gray-900/10 dark:bg-zinc-950/50">
                {/* Search and Bulk Actions (unchanged) */}
                <div className="px-5 mb-4 sm:px-6">
                    <div className="flex flex-col gap-3 sm:items-end">
                        {/* Search (optional) */}
                        {Search && (
                            <div className="w-full sm:w-auto">
                                <div className="flex flex-wrap items-center justify-end gap-3">
                                    {DefaultSearchInput && (
                                        <Input
                                            InputRef={searchInputRef}
                                            InputName={"Search"}
                                            Id={"search"}
                                            Placeholder={"Search here..."}
                                            Type={"search"}
                                            CustomCss={"w-full sm:w-[320px] mt-3"}
                                            Name={"search"}
                                            Value={search}
                                            Action={(e) => {
                                                const value = e.target.value;
                                                setSearch(value);
                                                debouncedSearch.current?.(value);
                                            }}
                                        />
                                    )}
                                    {customSearch}
                                </div>
                            </div>
                        )}

                        {/* Ellipsis ALWAYS RIGHT; if search exists, it's automatically below it */}
                        {DeleteAction && (
                            <div className="flex justify-end w-full sm:w-auto">
                                <div className="relative inline-flex">
                                    <button
                                        ref={bulkBtnRef}
                                        type="button"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            if (openBulkActionDropdownOptions) {
                                                setOpenBulkActionDropdownOptions(false);
                                                setOpenDropdownId(null);
                                            } else {
                                                openBulkMenu();
                                            }
                                        }}
                                        className="inline-flex items-center justify-center w-10 h-10 text-gray-700 transition rounded-md hover:bg-gray-100 focus:outline-none focus:ring-4 focus:ring-indigo-200 dark:text-white/80 dark:hover:bg-white/10 dark:focus:ring-gray-800"
                                        aria-haspopup="menu"
                                        aria-expanded={openBulkActionDropdownOptions}
                                        title="More actions"
                                    >
                                        <Ellipsis />
                                    </button>

                                    {/* Dropdown (portal so it never hides) */}
                                    {openBulkActionDropdownOptions &&
                                        createPortal(
                                            <div
                                                ref={bulkMenuRef}
                                                style={{ top: bulkMenuPos.top, left: bulkMenuPos.left }}
                                                className="fixed z-[999999] w-48 overflow-hidden bg-white border border-gray-200 shadow-xl rounded-xl dark:bg-zinc-900 dark:border-gray-700"
                                                role="menu"
                                            >
                                                <button
                                                    onClick={() => {
                                                        setDeleteSelectedBuilkConfirmationModal(true);
                                                        setOpenBulkActionDropdownOptions(false);
                                                        setOpenDropdownId(null);
                                                    }}
                                                    className="flex items-center w-full gap-2 px-4 py-2.5 text-sm text-left text-red-600 transition hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                                                    role="menuitem"
                                                >
                                                    <svg
                                                        className="w-4 h-4"
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        fill="none"
                                                        viewBox="0 0 24 24"
                                                        strokeWidth="1.5"
                                                        stroke="currentColor"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
                                                        />
                                                    </svg>
                                                    Delete Selected
                                                </button>
                                            </div>,
                                            document.body
                                        )}
                                </div>
                            </div>
                        )}

                    </div>
                </div>


                {/* Table */}
                <div className="relative z-0 px-5 sm:px-6">
                    {/* (custom-scrollbar) its a class that we are not using RN */}
                    <div className="overflow-x-auto ">
                        <table className="min-h-[200px] min-w-full">
                            <thead className="py-3 border-gray-100 border-y dark:border-gray-800">
                                <tr>
                                    {BulkDeleteMethod && canSelect && (
                                        <th className="py-3 pr-5 font-normal whitespace-nowrap sm:pr-6">
                                            <div className="flex items-center me-4">
                                                <input
                                                    onChange={() => handleSelectAll()}
                                                    type="checkbox"
                                                    value=""
                                                    className="w-6 h-6 mx-2 text-indigo-600 rounded-lg cursor-pointer border-slate-300 bg-slate-50 focus:ring-2 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:ring-offset-gray-800 dark:focus:ring-white"
                                                    checked={
                                                        selectedIds.length === items.data.length &&
                                                        items.data.length !== 0
                                                    }
                                                />
                                            </div>
                                        </th>
                                    )}

                                    {(customActions.length > 0 || DeleteAction || EditRoute) && (
                                        <th className="px-5 py-3 font-normal text-left whitespace-nowrap sm:px-6">
                                            <div className="flex items-center justify-center w-full">
                                                <p className="text-gray-500 text-theme-sm dark:text-gray-400">
                                                    Action
                                                </p>
                                            </div>
                                        </th>
                                    )}

                                    {columns?.map((column, index) => (
                                        <th
                                            key={index}
                                            className="py-3 pr-5 font-normal whitespace-nowrap sm:pr-6"
                                        >
                                            <div className="flex items-center">
                                                <p className="text-gray-500 text-theme-sm dark:text-gray-400">
                                                    {column.label}
                                                </p>
                                            </div>
                                        </th>
                                    ))}


                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                {items?.data?.map((item, index) => (
                                    <tr key={index} className="relative">
                                        {BulkDeleteMethod && canSelect && (
                                            <td className="py-3 pr-5 whitespace-nowrap sm:pr-5">
                                                <div className="flex items-center col-span-3">
                                                    <div className="flex items-center me-4">
                                                        <input
                                                            type="checkbox"
                                                            value={item.id}
                                                            className="w-6 h-6 mx-2 text-indigo-600 rounded-lg cursor-pointer singleSelect border-slate-300 bg-slate-50 focus:ring-2 focus:ring-indigo-500 dark:border-gray-600 dark:bg-gray-700 dark:ring-offset-gray-800 dark:focus:ring-white"
                                                            onChange={() => handleSelect(item.id)}
                                                            checked={selectedIds.includes(item.id)}
                                                        />
                                                    </div>
                                                </div>
                                            </td>
                                        )}


                                        {(customActions.length > 0 ||
                                            DeleteAction ||
                                            EditRoute) && (
                                                <td className="px-5 py-3 whitespace-nowrap sm:px-6">
                                                    <div className="flex items-center justify-center w-full">
                                                        <div
                                                            ref={(el) =>
                                                                (dropdownRefs.current[item.id] = el)
                                                            }
                                                            className="relative"
                                                        >
                                                            <button
                                                                onClick={() =>
                                                                    setOpenDropdownId((prev) =>
                                                                        prev === item.id
                                                                            ? null
                                                                            : item.id,
                                                                    )
                                                                }
                                                                className="inline-flex items-center rounded-lg bg-indigo-700 px-5 py-2.5 text-sm font-medium text-white shadow-lg transition hover:bg-indigo-600 focus:outline-none focus:ring-4 focus:ring-indigo-300 dark:bg-white/5 dark:text-white/90 dark:hover:bg-white/10 dark:focus:ring-gray-800"
                                                            >
                                                                Action
                                                                <svg
                                                                    className="ms-3 h-2.5 w-2.5"
                                                                    xmlns="http://www.w3.org/2000/svg"
                                                                    fill="none"
                                                                    viewBox="0 0 10 6"
                                                                >
                                                                    <path
                                                                        stroke="currentColor"
                                                                        strokeLinecap="round"
                                                                        strokeLinejoin="round"
                                                                        strokeWidth="2"
                                                                        d="m1 1 4 4 4-4"
                                                                    />
                                                                </svg>
                                                            </button>

                                                            {/* Dropdown - Always appears above button with proper spacing */}
                                                            {openDropdownId === item.id &&
                                                                createPortal(
                                                                    <div
                                                                        className="fixed z-[99999] w-44 rounded-lg border border-gray-200 bg-white shadow-xl dark:border-gray-700 dark:bg-zinc-900 sm:w-48"
                                                                        ref={(el) =>
                                                                        (dropdownElements.current[
                                                                            item.id
                                                                        ] = el)
                                                                        }
                                                                    >
                                                                        <ul
                                                                            className="py-1 overflow-y-scroll text-sm text-gray-700 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-indigo-500 dark:text-gray-200 dark:scrollbar-thumb-white"
                                                                            style={{
                                                                                maxHeight: '180px',
                                                                            }}
                                                                        >
                                                                            {EditRoute && (
                                                                                <li>
                                                                                    <Link
                                                                                        href={route(
                                                                                            EditRoute,
                                                                                            RouteParameterKey
                                                                                                ? item[
                                                                                                RouteParameterKey
                                                                                                ]
                                                                                                : item.id,
                                                                                        )}
                                                                                        className="block px-3 py-2 transition-colors lg:hover:bg-gray-100 dark:lg:hover:bg-zinc-950/50 dark:hover:text-white"
                                                                                    >
                                                                                        Edit
                                                                                    </Link>
                                                                                </li>
                                                                            )}

                                                                            {/* Custom Actions */}
                                                                            {customActions.map(
                                                                                (action, idx) => (
                                                                                    <li key={idx}>
                                                                                        {action.type ===
                                                                                            'button' && (
                                                                                                <button
                                                                                                    onClick={() => {
                                                                                                        action.onClick(
                                                                                                            item,
                                                                                                        );
                                                                                                        setOpenDropdownId(
                                                                                                            null,
                                                                                                        ); // Close dropdown after action
                                                                                                    }}
                                                                                                    className={`${(typeof action.show === 'function' ? Boolean(action.show(item)) : true)
                                                                                                        ? 'block'
                                                                                                        : 'hidden'
                                                                                                        } w-full px-3 py-2 text-left transition-colors lg:hover:bg-gray-100 dark:lg:hover:bg-zinc-950/50 dark:hover:text-white`}
                                                                                                >
                                                                                                    {
                                                                                                        action.label
                                                                                                    }
                                                                                                </button>
                                                                                            )}

                                                                                        {action.type ===
                                                                                            'link' && (
                                                                                                <Link
                                                                                                    href={action.href(
                                                                                                        item,
                                                                                                    )}
                                                                                                    className={`${(typeof action.show === 'function' ? Boolean(action.show(item)) : true)
                                                                                                        ? 'block'
                                                                                                        : 'hidden'
                                                                                                        } w-full px-3 py-2 text-left transition-colors lg:hover:bg-gray-100 dark:lg:hover:bg-zinc-950/50 dark:hover:text-white`}
                                                                                                >
                                                                                                    {
                                                                                                        action.label
                                                                                                    }
                                                                                                </Link>
                                                                                            )}
                                                                                    </li>
                                                                                ),
                                                                            )}

                                                                            {DeleteAction && (
                                                                                <li>
                                                                                    <button
                                                                                        type="button"
                                                                                        className="block w-full px-3 py-2 text-left text-red-600 transition-colors lg:hover:bg-red-50 dark:text-red-400 dark:lg:hover:bg-red-900/20"
                                                                                        onClick={() => {
                                                                                            setSelectedIds(
                                                                                                [],
                                                                                            );
                                                                                            setSelectedIds(
                                                                                                [
                                                                                                    item.id,
                                                                                                ],
                                                                                            );
                                                                                            setDeleteSingleConfirmationModal(
                                                                                                true,
                                                                                            );
                                                                                            setOpenDropdownId(
                                                                                                null,
                                                                                            ); // Close dropdown
                                                                                        }}
                                                                                    >
                                                                                        Delete
                                                                                    </button>
                                                                                </li>
                                                                            )}
                                                                        </ul>
                                                                    </div>,
                                                                    document.body,
                                                                )}
                                                        </div>
                                                    </div>
                                                </td>
                                            )}

                                        {columns.map((column, index) => (
                                            <td
                                                key={index}
                                                className="py-3 pr-5 whitespace-nowrap sm:pr-5"
                                            >
                                                <div className="flex items-center col-span-3">
                                                    <div className="flex items-center gap-3 text-sm font-medium text-gray-700 text-wrap dark:text-gray-400">
                                                        {renderCell(item, column)}
                                                    </div>
                                                </div>
                                            </td>
                                        ))}


                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {items?.data?.length === 0 && (
                            <p className="flex justify-center p-5 mb-20 text-center text-gray-900 bg-indigo-200 align-center dark:bg-white/5 dark:text-white">
                                No data found
                            </p>
                        )}
                    </div>
                </div>

                {/* Pagination (unchanged) */}
                {items?.data?.length > 0 && (
                    <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-800">
                        <div className="flex items-center justify-between">
                            <PrimaryButton
                                Text={
                                    <>
                                        <svg
                                            className="fill-current"
                                            width="20"
                                            height="20"
                                            viewBox="0 0 20 20"
                                            fill="none"
                                        >
                                            <path
                                                fillRule="evenodd"
                                                clipRule="evenodd"
                                                d="M2.58301 9.99868C2.58272 10.1909 2.65588 10.3833 2.80249 10.53L7.79915 15.5301C8.09194 15.8231 8.56682 15.8233 8.85981 15.5305C9.15281 15.2377 9.15297 14.7629 8.86018 14.4699L5.14009 10.7472L16.6675 10.7472C17.0817 10.7472 17.4175 10.4114 17.4175 9.99715C17.4175 9.58294 17.0817 9.24715 16.6675 9.24715L5.14554 9.24715L8.86017 5.53016C9.15297 5.23717 9.15282 4.7623 8.85983 4.4695C8.56684 4.1767 8.09197 4.17685 7.79917 4.46984L2.84167 9.43049C2.68321 9.568 2.58301 9.77087 2.58301 9.99715Z"
                                            />
                                        </svg>
                                        <span className="hidden mx-2 sm:inline"> Previous </span>
                                    </>
                                }
                                Disabled={!items.links[0].url}
                                Action={() => handlePagination(items.links[0].url)}
                                CustomClass="w-[140px] h-[40px]"
                                Type="button"
                            />
                            <ul className="hidden items-center gap-0.5 sm:flex">
                                {items.links.slice(1, -1).map((link, idx) => (
                                    <li key={idx}>
                                        <button
                                            onClick={() => handlePagination(link.url)}
                                            disabled={!link.url || link.active}
                                            className={`text-theme-sm flex h-10 w-10 items-center justify-center rounded-lg font-medium ${link.active
                                                ? 'bg-indigo-800/[0.08] text-indigo-500'
                                                : 'text-gray-700 hover:bg-indigo-500/[0.08] hover:text-indigo-500 dark:text-gray-400 dark:hover:text-indigo-500'
                                                }`}
                                        >
                                            {link.label}
                                        </button>
                                    </li>
                                ))}
                            </ul>
                            <PrimaryButton
                                Text={
                                    <>
                                        <span className="hidden sm:inline"> Next </span>
                                        <svg
                                            className="mx-2 fill-current"
                                            width="20"
                                            height="20"
                                            viewBox="0 0 20 20"
                                            fill="none"
                                        >
                                            <path
                                                fillRule="evenodd"
                                                clipRule="evenodd"
                                                d="M17.4175 9.9986C17.4178 10.1909 17.3446 10.3832 17.198 10.53L12.2013 15.5301C11.9085 15.8231 11.4337 15.8233 11.1407 15.5305C10.8477 15.2377 10.8475 14.7629 11.1403 14.4699L14.8604 10.7472L3.33301 10.7472C2.91879 10.7472 2.58301 10.4114 2.58301 9.99715C2.58301 9.58294 2.91879 9.24715 3.33301 9.24715L14.8549 9.24715L11.1403 5.53016C10.8475 5.23717 10.8477 4.7623 11.1407 4.4695C11.4336 4.1767 11.9085 4.17685 12.2013 4.46984L17.1588 9.43049C17.3173 9.568 17.4175 9.77087 17.4175 9.99715Z"
                                            />
                                        </svg>
                                    </>
                                }
                                Disabled={!items.links[items.links.length - 1].url}
                                Action={() =>
                                    handlePagination(items.links[items.links.length - 1].url)
                                }
                                CustomClass="w-[140px] h-[40px] mx-2"
                                Type="button"
                            />
                        </div>
                    </div>
                )}

                <div className="p-6 border-t border-gray-100 dark:border-gray-800">
                    {DeleteSelectedBuilkConfirmationModal && (
                        <div className="fixed inset-0 z-[10002] flex items-center justify-center overflow-y-auto p-4 sm:p-6">
                            {/* Backdrop */}
                            <div
                                className="fixed inset-0 backdrop-blur-[32px]"
                                onClick={() =>
                                    !DeleteBulkSelectedProcessing &&
                                    setDeleteSelectedBuilkConfirmationModal(false)
                                }
                            ></div>

                            {/* Modal content */}
                            <div className="relative z-10 w-full max-w-lg max-h-screen p-6 overflow-y-auto bg-white shadow-xl rounded-2xl dark:bg-deepcharcoal sm:p-8">
                                <div className="text-center">
                                    <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
                                        Are You Sure?
                                    </h2>
                                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                                        You won't be able to revert this action.
                                    </p>
                                </div>

                                {/* Buttons */}
                                <div className="flex items-center justify-center col-span-2 gap-4 mt-4">
                                    <PrimaryButton
                                        Action={() => {
                                            setDeleteBulkSelectedProcessing(false);
                                            setDeleteSelectedBuilkConfirmationModal(false);
                                        }}
                                        Disabled={DeleteBulkSelectedProcessing}
                                        Icon={
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                className="w-5 h-5"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3"
                                                />
                                            </svg>
                                        }
                                        Type={'button'}
                                        Text={'Close'}
                                    />

                                    <PrimaryButton
                                        Type="button"
                                        Text="Delete"
                                        Spinner={DeleteBulkSelectedProcessing}
                                        Disabled={DeleteBulkSelectedProcessing}
                                        Action={deleteSelectedBulkMethod}
                                        CustomClass={'bg-red-500 hover:bg-red-600 w-full '}
                                        Icon={
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                strokeWidth="1.5"
                                                stroke="currentColor"
                                                className="size-6"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
                                                />
                                            </svg>
                                        }
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {DeleteSingleConfirmationModal && (
                        <div className="fixed inset-0 z-[10002] flex items-center justify-center overflow-y-auto p-4 sm:p-6">
                            {/* Backdrop */}
                            <div
                                className="fixed inset-0 backdrop-blur-[32px]"
                                onClick={() =>
                                    !DeleteSingleProcessing &&
                                    setDeleteSingleConfirmationModal(false)
                                }
                            ></div>

                            {/* Modal content */}
                            <div className="relative z-10 w-full max-w-lg max-h-screen p-6 overflow-y-auto bg-white shadow-xl rounded-2xl dark:bg-deepcharcoal sm:p-8">
                                <div className="text-center">
                                    <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
                                        Are You Sure?
                                    </h2>
                                    <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                                        You won't be able to revert this action.
                                    </p>
                                </div>

                                {/* Buttons */}
                                <div className="flex items-center justify-center gap-4 mt-6">
                                    <PrimaryButton
                                        Action={() => {
                                            setDeleteSingleProcessing(false);
                                            setDeleteSingleConfirmationModal(false);
                                        }}
                                        Disabled={DeleteSingleProcessing}
                                        Icon={
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                className="w-5 h-5"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3"
                                                />
                                            </svg>
                                        }
                                        Type={'button'}
                                        Text={'Close'}
                                    />

                                    <PrimaryButton
                                        Type="button"
                                        Text="Delete"
                                        Spinner={DeleteSingleProcessing}
                                        Disabled={DeleteSingleProcessing}
                                        Action={DeleteSingleRecord}
                                        Icon={
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                strokeWidth="1.5"
                                                stroke="currentColor"
                                                className="size-6"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
                                                />
                                            </svg>
                                        }
                                        CustomClass={'bg-red-500 hover:bg-red-600 w-full '}
                                    />
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}
