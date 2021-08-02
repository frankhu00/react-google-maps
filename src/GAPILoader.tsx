import React from 'react';
import { GAPILoaderProps } from './types';
import * as Hook from './useGoogleApi';

export const GAPILoader = ({
    apiKey,
    options,
    handlers,
    LoadingView,
    ErrorView,
    children,
}: GAPILoaderProps): JSX.Element => {
    const { loading, error } = Hook.useGoogleApi(
        apiKey,
        { ...Hook.defaultGApiOpt, ...options },
        handlers
    );

    if (loading) {
        return <LoadingView />;
    } else if (error) {
        return <ErrorView />;
    } else {
        return <>{children}</>;
    }
};
