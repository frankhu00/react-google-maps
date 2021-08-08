import { Dispatch } from 'react';

export interface GoogleApiOptions {
    libraries?: string[];
    version?: string;
    language?: string;
    region?: string;
}

export interface GoogleApiHandlers {
    onLoad?: (event: Event) => void;
    onError?: OnErrorEventHandler;
}

export interface UseGoogleApiState {
    loading: boolean;
    error: boolean;
    success: boolean;
}

export interface GoogleLoadEventDetail {
    success: boolean;
}

export interface GAPILoaderProps {
    apiKey: string;
    LoadingView: (...args: unknown[]) => JSX.Element;
    ErrorView: (...args: unknown[]) => JSX.Element;
    options?: GoogleApiOptions;
    handlers?: GoogleApiHandlers;
    children?: JSX.Element | JSX.Element[];
}

export interface MapProps {
    options?: google.maps.MapOptions;
    userGeolocation?: boolean;
    onUserGeolocationLoading?: () => void;
    onUserGeolocationSuccess?: (position: GeolocationPosition) => void;
    onUserGeolocationFailed?: () => void;
    onUserGeolocationSettled?: () => void;
    children?: JSX.Element | JSX.Element[] | (JSX.Element[] | JSX.Element | null)[] | null;
    [key: string]: any;
}

type AddInstance<T> = (id: string, instance: T) => void;
type RemoveInstance = (id: string) => void;
export interface InstanceUpdator<T> {
    add: AddInstance<T>;
    remove: RemoveInstance;
}

export interface IMapInstanceSetter {
    setMapInstance: Dispatch<google.maps.Map>;
    markerInstances: InstanceUpdator<google.maps.Marker>;
    infowindowInstances: InstanceUpdator<google.maps.InfoWindow>;
}

export interface UseGoogleMapContext {
    map: google.maps.Map | null;
    markers: Record<string, google.maps.Marker>;
    infowindows: Record<string, google.maps.InfoWindow>;
}

// MapObject Context (for Marker and InfoWindow)
export interface MapObjectContext {
    id: string;
    marker?: google.maps.Marker;
    infowindow?: google.maps.InfoWindow;
    map?: google.maps.Map;
}

/**
 * Marker types
 */

export type MarkerEventHandler = (
    event: google.maps.MapMouseEvent,
    context: MapObjectContext
) => void;

type GoogleMapObjectEventBinders = {
    [key in
        | 'click'
        | 'dblclick'
        | 'dragend'
        | 'mousedown'
        | 'mouseout'
        | 'mouseover'
        | 'mouseup'
        | 'recenter']?: MarkerEventHandler;
};
export interface MarkerProps {
    id?: string;
    map?: google.maps.Map;
    options?: google.maps.MarkerOptions;
    events?: GoogleMapObjectEventBinders;
    infowindow?: google.maps.InfoWindow;
    onMount?: (context: MapObjectContext) => void;
}
/**
 * End Marker types
 */

/**
 * InfoWindow types
 */
type IWRenderPropFn = (ctx: MapObjectContext) => JSX.Element;

export interface InfoWindowProps {
    id?: string;
    map?: google.maps.Map;
    anchor?: google.maps.MVCObject;
    shouldFocus?: boolean;
    showOnMount?: boolean;
    options?: google.maps.InfoWindowOptions;
    content: IWRenderPropFn | JSX.Element;
    children?: IWRenderPropFn | JSX.Element;
    onMount?: (context: MapObjectContext) => void;
}
/**
 * End InfoWindow types
 */

/** InfoMarker types */
export interface InfoMarkerProps extends MarkerProps {
    infowindowOpts?: google.maps.InfoWindowOptions;
    children: IWRenderPropFn | JSX.Element;
    shouldFocus?: boolean;
    showOnMount?: boolean;
    anchor?: google.maps.MVCObject;
    onInfowindowMount?: (context: MapObjectContext) => void;
}

/** AutoComplete types */
export interface PlaceAutocompleteProps {
    apiKey?: string;
    map?: google.maps.Map | HTMLDivElement;
    predictOptions?: google.maps.places.AutocompletionRequest;
    placeDetailFields?: string[];
    onSelect?: (result: google.maps.places.PlaceResult | null) => void;
    onSelectFailed?: (status: google.maps.places.PlacesServiceStatus) => void;
    onClear?: () => void;
    onBlur?: () => void;
    [key: string]: any;
}

export interface AutocompleteOptions {
    id: string;
    label: string;
    value: string;
}

export interface AutocompleteInputState {
    value: string;
    loading: boolean;
    valid: boolean; // only true when user picks from the dropdown
}

// for useGoogleAutocomplete
export type AutoCompletePredictFn = (
    input: string,
    options?: google.maps.places.AutocompletionRequest
) => Promise<google.maps.places.AutocompleteResponse | null>;

export type GetPlaceDetailsFn = (
    placeId: string,
    fields?: string[]
) => Promise<PlaceDetailsResponse>;

export interface UseGoogleAutocompleteResponse {
    status: UseGoogleApiState;
    predict: AutoCompletePredictFn;
    getDetails: GetPlaceDetailsFn;
}

export interface PlaceDetailsResponse {
    result: google.maps.places.PlaceResult | null;
    status: google.maps.places.PlacesServiceStatus;
}

/** End Autocomplete types */
