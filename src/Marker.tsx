import React, { useEffect, useContext } from 'react';
import { v4 as uuid } from 'uuid';
import { MarkerProps, MapEventHandler, MapObjectContext } from './types';
import { MapInstanceSetter, dummyMapInstanceSetter } from './MapProvider';

export const Marker = ({
    id = uuid(),
    map,
    options,
    events,
    onMount,
    infowindow,
}: MarkerProps): null => {
    const marker = google ? new google.maps.Marker(options) : null;
    let boundedEventListeners: google.maps.MapsEventListener[] = [];

    /* istanbul ignore next */
    const { markerInstances } = useContext(MapInstanceSetter) || {
        markerInstances: dummyMapInstanceSetter.markerInstances,
    };

    useEffect(() => {
        if (marker && map) {
            marker.setMap(map);
            markerInstances.add(id, marker);
            const context: MapObjectContext = {
                map,
                marker,
                id,
                infowindow,
            };
            onMount?.(context);
            if (events) {
                boundedEventListeners = Object.entries(events).map(
                    (event: [string, MapEventHandler]) =>
                        marker.addListener(
                            event[0],
                            /* istanbul ignore next */
                            (e: google.maps.MapMouseEvent) => {
                                event[1](e, context);
                            }
                        )
                );
            }
        }

        return () => {
            if (boundedEventListeners.length > 0) {
                boundedEventListeners.forEach((listener: google.maps.MapsEventListener) => {
                    google.maps.event.removeListener(listener);
                });
            }
            markerInstances.remove(id);
            marker?.setMap(null);
        };
    }, []);

    if (!marker) {
        console.error(
            `window.google is not defined. Google api must loaded beforehand!
            Make sure to wrap parent root in 'GAPILoader' component.
            `
        );
    }

    return null;
};
