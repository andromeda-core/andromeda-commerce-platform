import React from 'react'
import gridImage from "asset/assets/images/shape/grid-01.svg"


export default function CommonGridShape() {
    return (
        <>
            <div className="absolute right-0 top-0 -z-1 w-full max-w-[250px] xl:max-w-[450px]">
                <img src={gridImage} alt="grid" />
            </div>
            <div
                className="absolute bottom-0 left-0 -z-1 w-full max-w-[250px] rotate-180 xl:max-w-[450px]"
            >
                <img src={gridImage} alt="grid" />
            </div>

        </>
    )
}
