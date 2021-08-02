import { useState, useEffect } from 'react';
import {
    GoogleApiHandlers,
    GoogleApiOptions,
    UseGoogleApiState,
    GoogleLoadEventDetail,
} from './types';

export const defaultGApiOpt: GoogleApiOptions = {
    libraries: ['places'],
    version: 'weekly',
    language: 'en',
    region: 'US',
};

const GoogleLoadEvent = 'onGoogleLoad';

const constructApiQuery = ({
    libraries,
    version,
    language,
    region,
}: GoogleApiOptions): string =>
    `&libraries=${libraries?.join(
        ','
    )}&v=${version}&region=${region}&language=${language}`;

export const useGoogleApi = (
    key: string,
    options?: GoogleApiOptions,
    handlers?: GoogleApiHandlers
): UseGoogleApiState => {
    const [status, setStatus] = useState<UseGoogleApiState>({
        success: false,
        error: false,
        loading: true,
    });

    const id = 'script-google-api';
    const src = `https://maps.googleapis.com/maps/api/js?key=${key}${constructApiQuery(
        { ...defaultGApiOpt, ...options }
    )}`;

    useEffect(() => {
        // Don't load gapi again
        if (!document.getElementById(id)) {
            const gapiScript = document.createElement('script');
            gapiScript.id = id;
            gapiScript.type = 'text/javascript';
            gapiScript.src = src;
            gapiScript.async = true;
            gapiScript.defer = true;
            gapiScript.onload = (event: Event) => {
                setStatus({ success: true, error: false, loading: false });
                const successGoogleLoad =
                    new CustomEvent<GoogleLoadEventDetail>(GoogleLoadEvent, {
                        detail: { success: true },
                    });
                document.dispatchEvent(successGoogleLoad);
                /* istanbul ignore next */
                if (handlers?.onLoad) {
                    handlers.onLoad(event);
                }
            };
            gapiScript.onerror = (...args) => {
                setStatus({ loading: false, error: true, success: false });
                const failGoogleLoad = new CustomEvent<GoogleLoadEventDetail>(
                    GoogleLoadEvent,
                    { detail: { success: false } }
                );
                document.dispatchEvent(failGoogleLoad);
                /* istanbul ignore next */
                if (handlers?.onError) {
                    handlers.onError(...args);
                }
            };
            document.head.prepend(gapiScript);
        } else {
            /**
             * This is to handle the case where you have 2+ sibling components that require google api.
             * Without this, the 1st sibling attaches the script and starts loading, but the
             * 2+ comps will see the script is attached so it sets success to true (but is in fact still loading)
             * and errors when the children hits the `google` object.
             *
             * The fix here checks for the actual `window.google` object to exist first before setting success to true,
             * otherwise if the script is attached but `window.google` is not defined, then the status remains at
             * loading state and attaches an event listener "onGoogleLoad" (which can be success or fail) to the
             * document. This "onGoogleLoad" event listener is attached with `once: true` option.
             *
             * The onload and onerror of the google api script will then fire the "onGoogleLoad" event accordingly once
             * the script loading finishes.
             */
            if (window.google) {
                setStatus({ success: true, error: false, loading: false });
            } else {
                document.addEventListener(
                    GoogleLoadEvent,
                    (e: Event) => {
                        const { success } = (
                            e as CustomEvent<GoogleLoadEventDetail>
                        ).detail;
                        setStatus({
                            success,
                            error: !success,
                            loading: false,
                        });
                    },
                    { once: true }
                );
            }
        }
    }, []);

    return status;
};
