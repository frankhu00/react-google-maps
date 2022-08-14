import React, { Fragment } from 'react';
import { useEffect, useContext } from 'react';
import { createRoot } from 'react-dom/client';
import { v4 as uuid } from 'uuid';

import { MapInstanceSetter, dummyMapInstanceSetter } from './MapProvider';
import { InfoWindowProps, MapEventHandler, MapObjectContext } from './types';

export const InfoWindow = ({
    id = uuid(),
    map,
    anchor,
    events,
    shouldFocus,
    showOnMount,
    options,
    content,
    onMount,
    onUnmount,
    children,
    Provider = Fragment,
}: InfoWindowProps): JSX.Element | null => {
    const infowindow = google ? new google.maps.InfoWindow(options) : undefined;
    let boundedEventListeners: google.maps.MapsEventListener[] = [];

    /* istanbul ignore next */
    const { infowindowInstances } = useContext(MapInstanceSetter) || {
        infowindowInstances: dummyMapInstanceSetter.infowindowInstances,
    };

    const context: MapObjectContext = {
        id,
        map,
        infowindow,
    };

    useEffect(() => {
        if (infowindow) {
            const container = document.createElement('div');

            const root = createRoot(container);
            root.render(
                <Provider>{typeof content === 'function' ? content(context) : content}</Provider>
            );
            onMount?.(context);
            if (events) {
                boundedEventListeners = Object.entries(events).map(
                    (event: [string, MapEventHandler]) =>
                        infowindow?.addListener?.(
                            event[0],
                            /* istanbul ignore next */
                            (e: google.maps.MapMouseEvent) => {
                                event[1](e, context);
                            }
                        )
                );
            }

            infowindowInstances.add(id, infowindow);
            infowindow.setContent(container);
            if (showOnMount) {
                if (!anchor && !options?.position) {
                    console.error('showOnMount requires anchor or options.position defined');
                } else {
                    infowindow.open({ anchor, map, shouldFocus });
                }
            }

            infowindow?.addListener?.('click', () => {});
        }

        return () => {
            onUnmount?.(context);
            if (boundedEventListeners.length > 0) {
                boundedEventListeners.forEach((listener: google.maps.MapsEventListener) => {
                    google.maps.event.removeListener(listener);
                });
            }
            infowindow?.close();
            infowindowInstances.remove(id);
        };
    }, []);

    if (!infowindow) {
        console.error(
            `window.google is not defined. Google api must loaded beforehand!
            Make sure to wrap parent root in 'GAPILoader' component.
            `
        );
        return null;
    }

    return typeof children === 'function'
        ? children({
              id,
              map,
              infowindow,
          })
        : children ?? null;
};
