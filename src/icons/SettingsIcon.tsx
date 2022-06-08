import React, { SVGAttributes } from 'react'

export default function SettingsIcon(props: SVGAttributes<SVGElement>) {
    return (
        <svg
            {...props}
            width="16"
            height="14"
            viewBox="0 0 16 14"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
        >
            <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M12.5 1.75a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3zm-3 1.5a3 3 0 1 1 6 0 3 3 0 0 1-6 0zm-3 6a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3zm-3 1.5a3 3 0 1 1 6 0 3 3 0 0 1-6 0z"
                fill="currentColor"
            />
            <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M.5 3.25a.75.75 0 0 1 .75-.75h8.5a.75.75 0 0 1 0 1.5h-8.5a.75.75 0 0 1-.75-.75zm0 7.5a.75.75 0 0 1 .75-.75h2.5a.75.75 0 0 1 0 1.5h-2.5a.75.75 0 0 1-.75-.75zm8 0a.75.75 0 0 1 .75-.75h5.5a.75.75 0 0 1 0 1.5h-5.5a.75.75 0 0 1-.75-.75z"
                fill="currentColor"
            />
        </svg>
    )
}
