import { useState } from 'react';
import { AutoComplete, Input, message } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';

import MapPinIcon from './assets/Pin';
import MapPinActiveIcon from './assets/PinActive';
import MapPinErrorIcon from './assets/PinError';
import { useGoogleAutocomplete } from './useGoogleAutocomplete';
import {
    AutocompleteInputState,
    AutocompleteOptions,
    PlaceAutocompleteProps,
    PlaceAutocompleteDictionary,
    MapPinProps,
} from './types';

const MapPin = ({
    active,
    valid,
    pinFill,
    pinActiveFill,
    pinErrorFill,
}: MapPinProps): JSX.Element =>
    active ? (
        valid ? (
            <MapPinActiveIcon fill={pinActiveFill} />
        ) : (
            <MapPinErrorIcon fill={pinErrorFill} />
        )
    ) : (
        <MapPinIcon fill={pinFill} />
    );

const initialInputState: AutocompleteInputState = {
    value: '',
    loading: false,
    valid: true,
};

const defaultDictionary: Required<PlaceAutocompleteDictionary> = {
    loading: 'Loading Location Service',
    noService: 'No Location Service Available',
    serviceError: 'Location Service Errored',
    placeholder: 'Enter Address',
};

/**
 * Place autocomplete input component. The user MUST select from the predicted places (via Google) in order for this input
 * to output a valid value. If the user does not select from the dropdown, the input will be cleared.
 * Make sure to import antd css.
 *
 * Important props:
 * - `apiKey`: only required if component is not wrapped with `GAPILoader`. This is the key to load google api.
 * - `map`: Google map instance to attach to. Not required
 * - `onSelect`: event listener called whenever user makes a selection AND/OR clears the selected value
 * - `predictOptions`: options that conforms to google's [AutocompletionRequest interface](https://developers.google.com/maps/documentation/javascript/reference/places-autocomplete-service#AutocompletionRequest).
 *   Please note that the `sessionToken` is automatically taken care of
 * - `placeDetailFields`: determines what details for the selected place to get. This defaults to only get the "geometry" field. See ["fields" property of PlaceDetailsRequest](https://developers.google.com/maps/documentation/javascript/reference/places-service#PlaceDetailsRequest)
 *
 * @param props : PlaceAutocompleteProps
 * @returns JSX.Element
 */
export const PlaceAutocomplete = ({
    apiKey,
    map,
    predictOptions,
    placeDetailFields,
    onSelect, // this is called no matter if picked location's getDetails api failed or not, also called in onClear
    onSelectFailed,
    onClear,
    onBlur,
    pinFill,
    pinActiveFill,
    pinErrorFill,
    dictionary,
    ...props
}: PlaceAutocompleteProps): JSX.Element => {
    const {
        status: { loading, error, success },
        getDetails,
        predict,
    } = useGoogleAutocomplete(apiKey ?? '', map);

    const diction: Required<PlaceAutocompleteDictionary> = { ...dictionary, ...defaultDictionary };

    const [inputState, setInputState] = useState<AutocompleteInputState>(initialInputState);

    const [options, setOptions] = useState<AutocompleteOptions[]>([]);
    const onChangeHandler = async (input: string) => {
        setInputState(() =>
            input
                ? {
                      value: input,
                      valid: false,
                      loading: true,
                  }
                : initialInputState
        );
        if (input) {
            // looks like google api have a slight throttle / debounce for the place prediction call already
            // session token is built into the useGoogleAutocomplete so it should only bill as one api call for a predict + getDetail
            try {
                const response = await predict(input, predictOptions);
                if (response && response.predictions.length > 0) {
                    const opts = response.predictions.map(
                        (p: google.maps.places.AutocompletePrediction): AutocompleteOptions => ({
                            id: p.place_id,
                            label: p.description,
                            value: p.description,
                        })
                    );
                    setOptions(opts);
                } else {
                    // Case for api success but no predictions
                    setInputState((prev) => ({
                        ...prev,
                        valid: false,
                        loading: false,
                    }));
                    setOptions([]);
                }
            } catch (e) {
                // Case when api failed
                message.error(diction.noService);
                setInputState((prev) => ({
                    ...prev,
                    valid: false,
                    loading: false,
                }));
                setOptions([]);
            }
        } else {
            setOptions([]);
        }
    };

    const onSelectHandler = async (_: string, opt: unknown) =>
        /* couldn't test since I can't get RTL to trigger onSelect by mouse click or keyboard event  */
        {
            const option = opt as AutocompleteOptions;
            setInputState(() => ({
                value: option.label,
                loading: true,
                valid: true,
            }));

            const response = await getDetails(
                (option as AutocompleteOptions).id,
                placeDetailFields
            );

            if (response.status === 'OK' && response.result) {
                onSelect?.(response.result);
                setInputState((prev) => ({
                    ...prev,
                    loading: false,
                    valid: true,
                }));
            } else {
                onSelect?.(null);
                onSelectFailed?.(response.status);
                message.error(diction.serviceError);
                setOptions([]);
                setInputState((prev) => ({
                    ...prev,
                    valid: false,
                    loading: false,
                }));
            }
        };

    const onClearHandler = () => /* couldn't test since I can't get RTL to trigger onSelect by mouse click or keyboard event  */ {
        setInputState(() => initialInputState);
        setOptions([]);
        onSelect?.(null);
        onClear?.();
    };

    const onBlurHandler = () => /* couldn't test since I can't get RTL to trigger onSelect by mouse click or keyboard event  */ {
        if (!inputState.valid) {
            onClearHandler();
        }
        onBlur?.();
    };

    const determinePlaceholder = (): string =>
        loading ? diction.loading : error ? diction.noService : diction.placeholder;

    return (
        <AutoComplete
            allowClear={true}
            {...props}
            options={options}
            disabled={!success}
            onSelect={onSelectHandler}
            onChange={onChangeHandler}
            value={inputState.value}
            onClear={onClearHandler}
            onBlur={onBlurHandler}
        >
            <Input
                size="large"
                placeholder={determinePlaceholder()}
                prefix={
                    loading || inputState.loading ? (
                        <LoadingOutlined />
                    ) : (
                        <MapPin
                            valid={inputState.valid}
                            active={!!inputState.value}
                            pinFill={pinFill}
                            pinActiveFill={pinActiveFill}
                            pinErrorFill={pinErrorFill}
                        />
                    )
                }
            />
        </AutoComplete>
    );
};
