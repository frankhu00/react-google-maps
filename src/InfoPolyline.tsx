import React, { useRef } from 'react';
import useDeepCompareEffect from 'use-deep-compare-effect';

import { Polyline } from './Polyline';
import { InfoPolylineProps } from './types';
import { InfoWindow } from './InfoWindow';
import { useGoogleMap } from './MapProvider';

/**
 * Combines InfoWindow and Polyline components to create a polyline that shows an info window on click.
 * Children are the content of info window. Children can be a function that takes the context object
 * { infowindow: InfoWindowInstance, map: MapInstance } and returns a JSX.Element
 *
 * @param props InfoPolylineProps
 * @returns JSX.Element
 */
export const InfoPolyline = ({
    id,
    map,
    events,
    children,
    infowindowProps = {},
    options,
    onMount,
}: InfoPolylineProps): JSX.Element => {
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
                <Polyline
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

                            infowindow?.setPosition(e.latLng);
                            infowindow?.open({
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
