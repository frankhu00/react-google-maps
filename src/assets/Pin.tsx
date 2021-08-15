import React from 'react';

const PinActive = ({ fill = '#858C92' }: { fill?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none" viewBox="0 0 16 16">
        <circle cx="8" cy="5.667" r="3" fill="#fff" />
        <path
            fill={fill}
            fillRule="evenodd"
            d="M2.667 5.958c0 3.97 5.355 9.828 5.355 9.828s5.355-5.858 5.355-9.827c0-2.926-2.395-5.292-5.355-5.292-2.96 0-5.355 2.366-5.355 5.292zm5.355 2.344c-1.52 0-2.754-1.219-2.754-2.721 0-1.503 1.233-2.722 2.754-2.722 1.52 0 2.754 1.22 2.754 2.722S9.542 8.302 8.022 8.302z"
            clipRule="evenodd"
        />
        <mask id="e02dmhwr2a" width="12" height="16" x="2" y="0" maskUnits="userSpaceOnUse">
            <path
                fill="#fff"
                fillRule="evenodd"
                d="M2.667 5.958c0 3.97 5.355 9.828 5.355 9.828s5.355-5.858 5.355-9.827c0-2.926-2.395-5.292-5.355-5.292-2.96 0-5.355 2.366-5.355 5.292zm5.355 2.344c-1.52 0-2.754-1.219-2.754-2.721 0-1.503 1.233-2.722 2.754-2.722 1.52 0 2.754 1.22 2.754 2.722S9.542 8.302 8.022 8.302z"
                clipRule="evenodd"
            />
        </mask>
    </svg>
);

export default PinActive;
