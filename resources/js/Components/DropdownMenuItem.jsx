import { Link } from '@inertiajs/react';
import { Fragment } from 'react';
import Spinner from './Spinner';

const DropdownMenuItem = ({
    label,
    icon,
    items,
    selected,
    setSelected,
}) => {
    const isOpen = selected === label;

    return (
        <li>
            {/* Dropdown Trigger */}
            <button
                onClick={() => {
                    if (selected === label) {
                        setSelected(null);
                    } else {
                        setSelected(label);
                    }
                }}
                className={`flex w-full cursor-pointer items-center gap-3 px-4 rounded-md py-2.5 text-md menu-item-inactive transition-colors relative`}
            >
                {/* Icon */}
                <span className="flex-shrink-0 size-6">
                    {icon}
                </span>

                {/* Label */}
                <span className="mx-1 font-medium text-main-text-light dark:text-main-text-dark">{label}</span>
            </button>

            {/* Dropdown Items */}
            {isOpen && (
                <div className="overflow-hidden transform">
                    <ul className="flex flex-col mt-1 pl-9">
                        {items.map((item, index) => {
                            if (!item) return null;
                            return (
                                <Fragment key={index}>

                                    {item.type === 'link' && (
                                        <li key={index}>
                                            <Link
                                                href={item.href}
                                                className={`flex items-center gap-3 text-sm rounded-md px-4 py-2 mb-1   transition-colors ${route().current() === item.routeName
                                                    ? 'menu-sub-item-active'
                                                    : 'menu-sub-item-inactive'
                                                    }`}
                                            >

                                                <span className='font-normal '>{item.label}</span>
                                                {item?.processing && (

                                                    <Spinner Color={"fill-black dark:fill-white"} />
                                                )}
                                            </Link>
                                        </li>
                                    )}


                                    {item.type === 'button' && (
                                        <li key={index}>
                                            <button
                                                onClick={item.onClick}
                                                className={`flex items-center gap-3 w-full  text-sm rounded-md px-4 py-2 transition-colors ${item?.isLogout ? 'logout-menu-item-button' : 'menu-sub-item-inactive'}`}
                                            >

                                                <span className='font-normal'>{item.label}</span>
                                                {item?.processing && (

                                                    <Spinner Color={"fill-black dark:fill-white"} />
                                                )}
                                            </button>
                                        </li>
                                    )}
                                </Fragment>
                            )
                        })}
                    </ul>
                </div>
            )}
        </li>
    );
};

export default DropdownMenuItem;
