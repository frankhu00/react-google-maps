import React, { useEffect, useContext } from 'react';
import { v4 as uuid } from 'uuid';

import { useGoogleDirections } from './useGoogleDirections';

import { MapObjectContext } from './types';

interface DirectionProps {
    request: google.maps.DirectionsRequest;
    id?: string;
    options?: google.maps.DirectionsRendererOptions;
    map?: google.maps.Map;
    infowindow?: google.maps.InfoWindow;
    onMount?: (context: MapObjectContext) => void;
}

export const Direction = ({
    request,
    id = uuid(),
    options,
    map,
    onMount,
    infowindow,
}: DirectionProps): null => {
    const { status, route } = useGoogleDirections('');
    const renderer = google ? new google.maps.DirectionsRenderer(options) : null;

    useEffect(() => {
        if (renderer && map) {
            route(request).then(({ response, status }) => {
                if (status == google.maps.DirectionsStatus.OK) {
                    renderer.setDirections(response);
                }
            });

            renderer.setMap(map);
        }
    }, [status.success, options, request]);

    useEffect(() => {
        if (renderer) {
            const context: MapObjectContext = {
                map,
                id,
                infowindow,
                directionsRenderer: renderer,
            };
            onMount?.(context);
        }
    }, []);

    if (!renderer) {
        console.error(
            `window.google is not defined. Google api must loaded beforehand!
            Make sure to wrap parent root in 'GAPILoader' component.
            `
        );
    }

    return null;
};
