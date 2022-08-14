import React, { Dispatch } from 'react';
import { AutoCompleteProps, InputProps } from 'antd';

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

export interface MapProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'children'> {
    options?: google.maps.MapOptions;
    centerToUserLocation?: boolean;
    userGeolocation?: boolean;
    onUserGeolocationLoading?: () => void;
    onUserGeolocationSuccess?: (position: GeolocationPosition) => void;
    onUserGeolocationFailed?: () => void;
    onUserGeolocationSettled?: () => void;
    onMount?: (map: google.maps.Map) => void;
    onUnmount?: (map?: google.maps.Map) => void;
    children?:
        | ((map?: google.maps.Map) => JSX.Element)
        | JSX.Element
        | JSX.Element[]
        | (JSX.Element[] | JSX.Element | null)[]
        | null;
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
    polylineInstances: InstanceUpdator<google.maps.Polyline>;
}

export interface UseGoogleMapContext {
    map: google.maps.Map | null;
    markers: Record<string, google.maps.Marker>;
    infowindows: Record<string, google.maps.InfoWindow>;
    polylines: Record<string, google.maps.Polyline>;
}

// MapObject Context (for Marker and InfoWindow)
export interface MapObjectContext {
    id: string;
    marker?: google.maps.Marker;
    infowindow?: google.maps.InfoWindow;
    map?: google.maps.Map;
    polyline?: google.maps.Polyline;
    directionsRenderer?: google.maps.DirectionsRenderer;
}

export type GoogleMapObjectEventBinders = {
    [key in
        | 'click'
        | 'dblclick'
        | 'dragend'
        | 'mousedown'
        | 'mouseout'
        | 'mouseover'
        | 'mouseup'
        | 'recenter']?: MapEventHandler;
};

export type GoogleMapInfoWindowEventBinders = {
    [key in
        | 'closeclick'
        | 'content_changed'
        | 'domready'
        | 'position_changed'
        | 'zindex_changed']?: MapEventHandler;
};

interface MapObjectProps {
    id?: string;
    map?: google.maps.Map;
    infowindow?: google.maps.InfoWindow;
    onMount?: (context: MapObjectContext) => void;
    onUnmount?: (context: MapObjectContext) => void;
    events?: GoogleMapObjectEventBinders;
}

/**
 * Marker types
 */

export type MapEventHandler = (event: google.maps.MapMouseEvent, context: MapObjectContext) => void;

export interface MarkerProps extends MapObjectProps {
    options?: google.maps.MarkerOptions;
    extendMapBounds?: boolean;
}
/**
 * End Marker types
 */

/**
 * InfoWindow types
 */
type IWRenderPropFn = (ctx: MapObjectContext) => JSX.Element;

export interface InfoWindowProps extends Omit<MapObjectProps, 'infowindow' | 'events'> {
    anchor?: google.maps.MVCObject;
    shouldFocus?: boolean;
    showOnMount?: boolean;
    options?: google.maps.InfoWindowOptions;
    content: IWRenderPropFn | JSX.Element;
    children?: IWRenderPropFn | JSX.Element;
    Provider?: React.FC<any>;
    events?: GoogleMapInfoWindowEventBinders;
}
/**
 * End InfoWindow types
 */

/** InfoMarker types */
export interface InfoMarkerProps extends MarkerProps {
    children: IWRenderPropFn | JSX.Element;
    infowindowProps?: Omit<InfoWindowProps, 'children' | 'content'>;
}

/** AutoComplete types */
export interface PlaceAutocompleteDictionary {
    loading?: string;
    noService?: string;
    serviceError?: string;
}

export interface PlaceAutocompleteProps {
    apiKey?: string;
    map?: google.maps.Map | HTMLDivElement;
    predictOptions?: google.maps.places.AutocompletionRequest;
    placeDetailFields?: string[];
    onSelect?: (result: google.maps.places.PlaceResult | null) => void;
    onSelectFailed?: (status: google.maps.places.PlacesServiceStatus) => void;
    onClear?: () => void;
    onBlur?: () => void;
    maskDisplayValue?: (option: AutocompleteOption) => string;
    placeholder?: string;
    dictionary?: PlaceAutocompleteDictionary;
    pinFill?: string;
    pinActiveFill?: string;
    pinErrorFill?: string;
    autocompleteProps?: AutoCompleteProps;
    inputProps?: InputProps;
}

export interface AutocompleteOption {
    id: string;
    label: string;
    value: string;
}

export interface AutocompleteInputState {
    value: string;
    loading: boolean;
    valid: boolean; // only true when user picks from the dropdown
}

export interface MapPinProps {
    active: boolean;
    valid: boolean;
    pinFill?: string;
    pinActiveFill?: string;
    pinErrorFill?: string;
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

export interface PolylineProps extends MapObjectProps {
    options?: google.maps.PolylineOptions;
}

export interface InfoPolylineProps extends PolylineProps {
    children: IWRenderPropFn | JSX.Element;
    infowindowProps?: Omit<InfoWindowProps, 'children' | 'content'>;
}
