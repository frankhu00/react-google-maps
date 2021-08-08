import React, { useEffect, useContext } from 'react';
import { v4 as uuid } from 'uuid';
import { MapEventHandler, MapObjectContext, PolylineProps } from './types';
import { MapInstanceSetter, dummyMapInstanceSetter } from './MapProvider';

export const Polyline = ({
    id = uuid(),
    map,
    options,
    events,
    onMount,
    infowindow,
}: PolylineProps): null => {
    const polyline = google ? new google.maps.Polyline(options) : null;
    let boundedEventListeners: google.maps.MapsEventListener[] = [];

    /* istanbul ignore next */
    const { polylineInstances } = useContext(MapInstanceSetter) || {
        polylineInstances: dummyMapInstanceSetter.polylineInstances,
    };

    useEffect(() => {
        if (polyline && map) {
            polyline.setMap(map);
            polylineInstances.add(id, polyline);
            const context: MapObjectContext = {
                map,
                polyline,
                id,
                infowindow,
            };
            onMount?.(context);
            if (events) {
                boundedEventListeners = Object.entries(events).map(
                    (event: [string, MapEventHandler]) =>
                        polyline.addListener(
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
            polylineInstances.remove(id);
            polyline?.setMap(null);
        };
    }, []);

    if (!polyline) {
        console.error(
            `window.google is not defined. Google api must loaded beforehand!
            Make sure to wrap parent root in 'GAPILoader' component.
            `
        );
    }

    return null;
};
