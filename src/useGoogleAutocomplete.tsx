import { useRef, useEffect } from 'react';

import { useGoogleApi } from './useGoogleApi';
import {
    PlaceDetailsResponse,
    UseGoogleAutocompleteResponse,
    GetPlaceDetailsFn,
    AutoCompletePredictFn,
} from './types';

const emptyPredict: AutoCompletePredictFn = () => Promise.resolve(null);
const emptyGetDetails: GetPlaceDetailsFn = () => /* istanbul ignore next */ {
    const empty: PlaceDetailsResponse = {
        result: null,
        status: 'UNKNOWN_ERROR' as google.maps.places.PlacesServiceStatus,
    };
    return Promise.resolve(empty);
};

/**
 * This wraps around google api services required for autocomplete and binds the two api calls
 * `autoCompleteService.getPlacePredictions` and `placeService.getDetails` with a single session token.
 * The session token will be refreshed once the "predict" -> "getDetails" cycle is complete
 * More on [session tokens](https://developers.google.com/maps/documentation/places/web-service/session-tokens).
 *
 * `predict` and `getDetails` will be dummy fns if google api failed to load.
 *
 * The returned object is:
 * ```
 * const {
 *   status: { success, loading, error }, // status of google api
 *   predict: AutoCompletePredictFn, // function to make predictions (autoCompleteService.getPlacePredictions)
 *   getDetails: GetPlaceDetailsFn, // function to get place details (placeService.getDetails),
 * } = useGoogleAutocomplete('key')
 * ```
 *
 * @param key - google map api key
 * @param mapInstance - google map instance (optional)
 * @returns UseGoogleAutocompleteResponse
 */
export const useGoogleAutocomplete = (
    key: string,
    mapInstance?: google.maps.Map | HTMLDivElement
): UseGoogleAutocompleteResponse => {
    // since PlacesService requires it...
    // though sometimes we don't really need map instance here
    const map: google.maps.Map | HTMLDivElement =
        mapInstance ?? document.createElement('div');

    const status = useGoogleApi(key);
    const token = useRef<
        google.maps.places.AutocompleteSessionToken | undefined
    >(undefined);

    useEffect(() => {
        if (status.success) {
            token.current = new google.maps.places.AutocompleteSessionToken();
        }
    }, [status.success]);

    if (!status.success) {
        return {
            status,
            predict: emptyPredict,
            getDetails: emptyGetDetails,
        };
    }

    const autoCompleteService = new google.maps.places.AutocompleteService();
    const placeService = new google.maps.places.PlacesService(map);

    const predict: AutoCompletePredictFn = (input, options?) =>
        autoCompleteService.getPlacePredictions({
            input,
            ...options,
            sessionToken: token.current,
        });

    const getDetails: GetPlaceDetailsFn = (placeId, fields = ['geometry']) =>
        new Promise((resolve) => {
            placeService.getDetails(
                {
                    placeId,
                    fields,
                    sessionToken: token.current,
                },
                /* istanbul ignore next */
                (result, status) => {
                    const response: PlaceDetailsResponse = {
                        result,
                        status,
                    };
                    // creates a new sessionToken
                    token.current =
                        new google.maps.places.AutocompleteSessionToken();

                    resolve(response);
                }
            );
        });

    return {
        status,
        predict,
        getDetails,
    };
};
