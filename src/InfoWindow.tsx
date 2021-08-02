import React from 'react';
import { useEffect, useContext } from 'react';
import ReactDOM from 'react-dom';
import { v4 as uuid } from 'uuid';

import { MapInstanceSetter, dummyMapInstanceSetter } from './MapProvider';
import { InfoWindowProps, MapObjectContext } from './types';

export const InfoWindow = ({
    id = uuid(),
    map,
    anchor,
    shouldFocus,
    showOnMount,
    options,
    content,
    onMount,
    children,
}: InfoWindowProps): JSX.Element | null => {
    const infowindow = google ? new google.maps.InfoWindow(options) : null;

    /* istanbul ignore next */
    const { infowindowInstances } = useContext(MapInstanceSetter) || {
        infowindowInstances: dummyMapInstanceSetter.infowindowInstances,
    };

    useEffect(() => {
        if (infowindow) {
            const context: MapObjectContext = {
                id,
                map,
                infowindow,
            };
            const container = document.createElement('div');

            /* Will need to add more providers if the application uses more than just react-query */
            ReactDOM.render(
                <>{typeof content === 'function' ? content(context) : content}</>,
                container
            );
            onMount?.(context);
            infowindowInstances.add(id, infowindow);
            infowindow.setContent(container);
            if (showOnMount) {
                if (!anchor && !options?.position) {
                    console.error('showOnMount requires anchor or options.position defined');
                } else {
                    infowindow.open({ anchor, map, shouldFocus });
                }
            }
        }

        return () => {
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
