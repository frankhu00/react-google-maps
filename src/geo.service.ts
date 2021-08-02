class GeoService {
    /**
     * Gets user geo location. If user geo location data is found in session storage, it will not make the `geolocation.getCurrentPosition` call
     * and directly returns the data in session. Returns `null` if user location can't be determined or access request rejected.
     *
     * This method is promisified so `async / await` can be used.
     * @returns Promise<GeolocationPosition | null>
     */
    getPosition = (): Promise<GeolocationPosition | null> => {
        return new Promise<GeolocationPosition | null>((resolve) => {
            try {
                const savedPosition = this.__INTERNAL__.loadPosition();
                if (savedPosition) {
                    const position = JSON.parse(
                        savedPosition
                    ) as GeolocationPosition;
                    resolve(position);
                    return;
                }

                if (navigator.geolocation) {
                    navigator.geolocation.getCurrentPosition(
                        (position: GeolocationPosition) => {
                            const stringifyablePosition =
                                this.createStringifyablePosition(position);
                            this.savePosition(stringifyablePosition);
                            resolve(stringifyablePosition);
                        },
                        (e: unknown) => {
                            console.error(e);
                            resolve(null);
                        }
                    );
                } else {
                    /* istanbul ignore else */
                    console.warn('Geolocation API not available');
                    resolve(null);
                }
            } catch (e: unknown) /* istanbul ignore next */ {
                console.error(e);
                resolve(null);
            }
        });
    };

    /**
     * Saves geolocation data into session storage. Make sure to call `createStringifyablePosition` on the `GeolocationPosition`
     * object first, otherwise an empty object, `"{}"`, will be saved and not the actual data.
     * @param position GeolocationPosition
     */
    savePosition = (position: GeolocationPosition): void => {
        sessionStorage.setItem('user_geoposition', JSON.stringify(position));
    };

    /**
     * Clears geo location data from session storage
     */
    clearPosition = (): void => {
        sessionStorage.removeItem('user_geoposition');
    };

    /**
     * Reformats `GeolocationPosition` object into an normal object with all the same properties.
     * This is to make it `JSON.stringify`-able so geo data can be saved into session
     * @param position GeolocationPosition
     * @returns GeolocationPosition
     */
    createStringifyablePosition = (
        position: GeolocationPosition
    ): GeolocationPosition => {
        const stringifyable: GeolocationPosition = {
            coords: {
                accuracy: position.coords.accuracy,
                altitude: position.coords.altitude,
                altitudeAccuracy: position.coords.altitudeAccuracy,
                heading: position.coords.heading,
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
                speed: position.coords.speed,
            },
            timestamp: position.timestamp,
        };
        return stringifyable;
    };

    /**
     * GeoService internal use only.
     * Added this so no one mistakes `getPosition` for `loadPosition`
     */
    __INTERNAL__ = {
        /**
         * Do not use this one. Use `getPosition` instead.
         */
        loadPosition: (): string | null =>
            sessionStorage.getItem('user_geoposition'),
    };
}

const geoService = new GeoService();
export { GeoService };
export default geoService;
