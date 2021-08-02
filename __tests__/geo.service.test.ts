import geoService from '../src/geo.service';
const geoposition: GeolocationPosition = {
    coords: {
        accuracy: 1,
        altitude: 1,
        altitudeAccuracy: 1,
        heading: 1,
        latitude: 1,
        longitude: 1,
        speed: 1,
    },
    timestamp: 1,
};
const stringifiedData = JSON.stringify(geoposition);

//Make "geoposition" not stringifiable (well, returns {} if you do)
Object.defineProperty(geoposition, 'coords', {
    enumerable: false,
});
Object.defineProperty(geoposition, 'timestamp', {
    enumerable: false,
});

/** geolocation mocking fns */
/**
 * Only for testing
 * Mocks navigator.geolocation api
 * @returns
 */
const mockNavigatorGeolocation = (): void => {
    const clearWatchMock = jest.fn();
    const getCurrentPositionMock = jest.fn();
    const watchPositionMock = jest.fn();

    const geolocation = {
        clearWatch: clearWatchMock,
        getCurrentPosition: getCurrentPositionMock,
        watchPosition: watchPositionMock,
    };

    Object.defineProperty(global.navigator, 'geolocation', {
        value: geolocation,
        writable: true,
    });
};

/**
 * Only for testing
 * Mocks navigator.geolocation to undefined to mimic browsers with no geolocation api support
 * @returns
 */
const mockNavigatorGeolocationNotAvailable = (): void => {
    Object.defineProperty(global.navigator, 'geolocation', {
        value: undefined,
        writable: true,
    });
};
/** end geolocation mocking fns */

describe('/lib/geo.service.ts', () => {
    describe('Geolocation API not available', () => {
        beforeAll(() => {
            mockNavigatorGeolocationNotAvailable();
        });

        afterEach(() => {
            jest.clearAllMocks();
            jest.restoreAllMocks();
        });

        test('geoService.getPosition - Geolocation API not available', async () => {
            console.warn = jest.fn(() => {});
            const position = await geoService.getPosition();
            expect(console.warn).toHaveBeenCalled();
            expect(position).toBeNull();
        });
    });

    describe('Geolocation API is available', () => {
        beforeAll(() => {
            mockNavigatorGeolocation();
            global.navigator.geolocation.getCurrentPosition = jest.fn();
        });

        afterEach(() => {
            jest.clearAllMocks();
            jest.restoreAllMocks();
        });

        test('geoService.getPosition - user rejects access', async () => {
            console.error = jest.fn(() => {});
            sessionStorage.getItem = jest.fn(() => null);

            global.navigator.geolocation.getCurrentPosition = jest.fn((_, cb) => {
                const error: GeolocationPositionError = {
                    code: 1,
                    PERMISSION_DENIED: 1,
                    POSITION_UNAVAILABLE: 1,
                    TIMEOUT: 1,
                    message: 'user reject',
                };
                /* eslint @typescript-eslint/no-non-null-assertion: off  */
                cb!(error);
            });
            const position = await geoService.getPosition();
            expect(console.error).toHaveBeenCalled();
            expect(position).toBeNull();
        });

        test('geoService.getPosition - no saved geolocation data available', async () => {
            global.navigator.geolocation.getCurrentPosition = jest.fn().mockImplementation((cb) => {
                cb(geoposition);
            });
            const savePositionSpy = jest.spyOn(geoService, 'savePosition');
            const stringifySpy = jest.spyOn(geoService, 'createStringifyablePosition');

            const position = await geoService.getPosition();
            expect(stringifySpy).toHaveBeenCalled();
            expect(savePositionSpy).toHaveBeenCalled();
            expect(position).not.toBeNull();
        });

        test('geoService.getPosition - have saved data available', async () => {
            const loadPositionSpy = jest.spyOn(geoService.__INTERNAL__, 'loadPosition');
            sessionStorage.getItem = jest.fn(() => stringifiedData);
            const position = await geoService.getPosition();

            expect(global.navigator.geolocation.getCurrentPosition).not.toHaveBeenCalled();
            expect(loadPositionSpy).toHaveBeenCalled();
            expect(position).not.toBeNull();
        });
    });

    describe('geoService utility fns', () => {
        afterEach(() => {
            jest.clearAllMocks();
            jest.restoreAllMocks();
        });

        test('geoService.savePosition', () => {
            const spy = jest.spyOn(window.sessionStorage.__proto__, 'setItem');
            geoService.savePosition(geoposition);
            expect(spy).toHaveBeenCalled();
        });

        test('geoService.clearPosition', () => {
            const spy = jest.spyOn(window.sessionStorage.__proto__, 'removeItem');
            geoService.clearPosition();
            expect(spy).toHaveBeenCalled();
        });

        test('geoService.createStringifyablePosition', () => {
            const jsonablePosition = geoService.createStringifyablePosition(geoposition);
            const json = JSON.stringify(jsonablePosition);
            expect(json).not.toBe('{}');
            expect(json).toStrictEqual(stringifiedData);
        });

        test('geoService.__INTERNAL__.loadPosition', () => {
            const spy = jest.spyOn(window.sessionStorage.__proto__, 'getItem');
            geoService.__INTERNAL__.loadPosition();
            expect(spy).toHaveBeenCalled();
        });
    });
});
