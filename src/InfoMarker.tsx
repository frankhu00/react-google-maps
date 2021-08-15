import React, { useRef } from 'react';
import useDeepCompareEffect from 'use-deep-compare-effect';

import { Marker } from './Marker';
import { InfoMarkerProps } from './types';
import { InfoWindow } from './InfoWindow';
import { useGoogleMap } from './MapProvider';

/**
 * Combines InfoWindow and Marker components to create a marker that shows an info window on click.
 * Children are the content of info window. Children can be a function that takes the context object
 * { infowindow: InfoWindowInstance, map: MapInstance } and returns a JSX.Element
 *
 * @param props InfoMarkerProps
 * @returns JSX.Element
 */
export const InfoMarker = ({
    id,
    map,
    events,
    children,
    options,
    onMount,
    infowindowProps = {},
}: InfoMarkerProps): JSX.Element => {
    const instancesStore = useGoogleMap();

    // need a ref to this since the event handler will be binded with an empty instancesStore
    // so the event handler need to hit a ref, not a state
    const instancesRef = useRef(instancesStore);

    useDeepCompareEffect(() => {
        instancesRef.current = instancesStore;
    }, [instancesStore]);

    return (
        <InfoWindow id={id} content={children} map={map} {...infowindowProps}>
            {({ infowindow }) => (
                <Marker
                    id={id}
                    map={map}
                    options={options}
                    infowindow={infowindow}
                    events={{
                        ...events,
                        click: /* istanbul ignore next */ (e, ctx) => {
                            if (events?.click) {
                                events.click(e, ctx);
                            }

                            // close all infowindows first
                            Object.values(instancesRef.current.infowindows).forEach((info) => {
                                info.close();
                            });

                            infowindow?.open({
                                anchor: ctx.marker,
                                map: ctx.map,
                                shouldFocus: infowindowProps.shouldFocus,
                            });
                        },
                    }}
                    onMount={onMount}
                />
            )}
        </InfoWindow>
    );
};
