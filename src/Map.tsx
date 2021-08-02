import React, { useState, useCallback, useContext } from 'react';

import geoService from './geo.service';
import { MapProps } from './types';
import { useGoogleMap, MapInstanceSetter, dummyMapInstanceSetter } from './MapProvider';

const defaultMapOptions: google.maps.MapOptions = {
    zoom: 12,
    zoomControl: true,
    streetViewControl: false,
    rotateControl: false,
    fullscreenControl: false,
    mapTypeControl: false,
    zoomControlOptions: {
        position: 3, //refers to `google.maps.ControlPosition.TOP_RIGHT`, but will error due to `google` not defined at time of execution
    },
    center: {
        //this is pointing to LA
        lat: 34.052235,
        lng: -118.243683,
    },
};

const Map = ({
    options,
    children,
    userGeolocation = true,
    onUserGeolocationLoading,
    onUserGeolocationSuccess,
    onUserGeolocationFailed,
    onUserGeolocationSettled,
    ...props
}: MapProps): JSX.Element | null => {
    /* istanbul ignore next */
    const { setMapInstance } = useContext(MapInstanceSetter) || {
        setMapInstance: dummyMapInstanceSetter.setMapInstance,
    };
    const [mapObj, setMapObj] = useState<google.maps.Map | undefined>(undefined);
    const mapNode = useCallback(async (node: HTMLDivElement) => {
        if (node) {
            if (window.google?.maps) {
                const map = new google.maps.Map(node, {
                    ...defaultMapOptions,
                    ...options,
                });
                setMapObj(map);
                setMapInstance(map);

                if (userGeolocation) {
                    onUserGeolocationLoading?.();
                    const geo = await geoService.getPosition();
                    if (geo) {
                        onUserGeolocationSuccess?.(geo);
                        map.setCenter({
                            lat: geo.coords.latitude,
                            lng: geo.coords.longitude,
                        });
                    } else {
                        onUserGeolocationFailed?.();
                    }
                    onUserGeolocationSettled?.();
                }
            } else {
                console.error(
                    'Google api is not defined. Please wrap the component in "GAPILoader" first or use "useGoogleApi" hook.'
                );
            }
        }
    }, []);

    const renderChildren = () => {
        if (!children) {
            return null;
        }

        /* istanbul ignore next */
        const elements = Array.isArray(children) ? children.flat() : children;
        return React.Children.map(elements, (child) => {
            /* istanbul ignore next */
            if (child) {
                return React.cloneElement(child, {
                    map: mapObj,
                });
            }
        });
    };

    return (
        <>
            <div {...props} ref={mapNode}>
                {window.google ? null : (
                    <p>
                        Could not render Map: Google api is not defined. Please wrap the component
                        in "GAPILoader" first or use "useGoogleApi" hook.
                    </p>
                )}
            </div>
            {mapObj ? renderChildren() : null}
        </>
    );
};

export { Map, useGoogleMap };
