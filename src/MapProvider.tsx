import React, { useState, createContext, useContext } from 'react';
import { IMapInstanceSetter, InstanceUpdator, UseGoogleMapContext } from './types';

const MapInstanceContext = createContext<UseGoogleMapContext>({
    map: null,
    markers: {},
    infowindows: {},
    polylines: {},
});

export const dummyMapInstanceSetter: IMapInstanceSetter = {
    setMapInstance: () => {},
    markerInstances: {
        add: () => {},
        remove: () => {},
    },
    infowindowInstances: {
        add: () => {},
        remove: () => {},
    },
    polylineInstances: {
        add: () => {},
        remove: () => {},
    },
};
export const MapInstanceSetter = createContext<IMapInstanceSetter>(dummyMapInstanceSetter);

/* istanbul ignore next */
const useGoogleMap = (): UseGoogleMapContext => useContext<UseGoogleMapContext>(MapInstanceContext);

const MapProvider = ({ children }: { children: JSX.Element | JSX.Element[] }): JSX.Element => {
    const [mapInstance, setMapInstance] = useState<google.maps.Map | null>(null);
    const [markerHashMap, setMarkerHashMap] = useState<Record<string, google.maps.Marker>>({});
    const [infowindowHashMap, setInfowindowHashMap] = useState<
        Record<string, google.maps.InfoWindow>
    >({});
    const [polylineHashMap, setPolylineHashMap] = useState<Record<string, google.maps.Polyline>>(
        {}
    );

    const markerInstances: InstanceUpdator<google.maps.Marker> = {
        add: /* istanbul ignore next */ (id, marker) => {
            setMarkerHashMap((prev) => ({
                ...prev,
                [id]: marker,
            }));
        },
        remove: /* istanbul ignore next */ (id) => {
            setMarkerHashMap((prev) => {
                const clone = { ...prev };
                delete clone[id];
                return clone;
            });
        },
    };

    const infowindowInstances: InstanceUpdator<google.maps.InfoWindow> = {
        add: /* istanbul ignore next */ (id, infowindow) => {
            setInfowindowHashMap((prev) => ({
                ...prev,
                [id]: infowindow,
            }));
        },
        remove: /* istanbul ignore next */ (id) => {
            setInfowindowHashMap((prev) => {
                const clone = { ...prev };
                delete clone[id];
                return clone;
            });
        },
    };

    const polylineInstances: InstanceUpdator<google.maps.Polyline> = {
        add: /* istanbul ignore next */ (id, polyline) => {
            setPolylineHashMap((prev) => ({
                ...prev,
                [id]: polyline,
            }));
        },
        remove: /* istanbul ignore next */ (id) => {
            setPolylineHashMap((prev) => {
                const clone = { ...prev };
                delete clone[id];
                return clone;
            });
        },
    };

    return (
        <MapInstanceSetter.Provider
            value={{ setMapInstance, markerInstances, infowindowInstances, polylineInstances }}
        >
            <MapInstanceContext.Provider
                value={{
                    map: mapInstance,
                    markers: markerHashMap,
                    infowindows: infowindowHashMap,
                    polylines: polylineHashMap,
                }}
            >
                {children}
            </MapInstanceContext.Provider>
        </MapInstanceSetter.Provider>
    );
};

export { MapProvider, useGoogleMap };
