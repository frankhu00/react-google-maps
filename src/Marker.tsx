import React, { useEffect, useContext } from 'react';
import { v4 as uuid } from 'uuid';
import { MarkerProps, MapEventHandler, MapObjectContext } from './types';
import { MapInstanceSetter, dummyMapInstanceSetter } from './MapProvider';

const extendMapBoundary = (
    initialBounds: google.maps.LatLngBounds,
    point: google.maps.LatLng
): google.maps.LatLngBounds => {
    initialBounds;
    if (!initialBounds.contains(point)) {
        initialBounds.extend(point);
    }
    return initialBounds;
};

export const Marker = ({
    id = uuid(),
    map,
    options,
    events,
    onMount,
    onUnmount,
    infowindow,
    extendMapBounds = false,
}: MarkerProps): null => {
    const marker = google ? new google.maps.Marker(options) : undefined;
    let boundedEventListeners: google.maps.MapsEventListener[] = [];

    /* istanbul ignore next */
    const { markerInstances } = useContext(MapInstanceSetter) || {
        markerInstances: dummyMapInstanceSetter.markerInstances,
    };

    const context: MapObjectContext = {
        map,
        marker,
        id,
        infowindow,
    };

    useEffect(() => {
        if (marker && map) {
            marker.setMap(map);
            markerInstances.add(id, marker);

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

            if (extendMapBounds) {
                const mapBoundary = map?.getBounds();
                const point = marker.getPosition();
                if (mapBoundary && point) {
                    map.fitBounds(extendMapBoundary(mapBoundary, point));
                } else {
                    // When map first loads
                    const mapBoundListener = google.maps.event.addListener(
                        map,
                        'bounds_changed',
                        () => {
                            const bc_mapBoundary = map.getBounds();
                            const bc_point = marker.getPosition();
                            if (bc_mapBoundary && bc_point) {
                                map.fitBounds(extendMapBoundary(bc_mapBoundary, bc_point));
                                google.maps.event.removeListener(mapBoundListener);
                            }
                        }
                    );
                }
            }
        }

        return () => {
            onUnmount?.(context);
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
