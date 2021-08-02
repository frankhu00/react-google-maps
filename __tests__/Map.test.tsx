/* eslint @typescript-eslint/no-explicit-any: off */
import React from 'react';
import { screen, render, cleanup } from '@testing-library/react';
import { Map } from '../src/Map';
import geoService from '../src/geo.service';
import { mockGoogleAPI, mapSetCenterMock } from '../testUtil';

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

declare global {
    interface Window {
        google: any;
    }
}

describe('/GoogleMap/Map.tsx', () => {
    describe('Google API not available', () => {
        afterEach(cleanup);

        beforeAll(() => {
            window.google = undefined;
        });

        test('Consoles error if window.google is not available', () => {
            console.error = jest.fn(() => {});
            render(<Map />);
            expect(console.error).toHaveBeenCalled();
        });
    });

    describe('Google API loaded', () => {
        afterEach(cleanup);
        beforeAll(() => {
            window.google = mockGoogleAPI;
        });

        const testId = 'test-map';

        test('renders', async () => {
            geoService.getPosition = jest.fn(() => Promise.resolve(geoposition));
            render(
                <Map data-testid={testId}>
                    <div data-testid="map-child">Child</div>
                </Map>
            );
            //wait for a bit since geoService.getPosition call is async
            await new Promise((r) => setTimeout(r, 100)); //doesn't seem like the best but will do for now
            expect(screen.getByTestId(testId)).toBeInTheDocument();
            expect(screen.getByTestId('map-child')).toBeInTheDocument();
            expect(mapSetCenterMock).toHaveBeenCalled();
        });

        test('renders with no child and dont use user geolocation', async () => {
            geoService.getPosition = jest.fn(() => Promise.resolve(geoposition));
            render(<Map data-testid={testId} userGeolocation={false} />);
            //wait for a bit since geoService.getPosition call is async
            await new Promise((r) => setTimeout(r, 100)); //doesn't seem like the best but will do for now
            expect(screen.getByTestId(testId)).toBeInTheDocument();
            expect(mapSetCenterMock).not.toHaveBeenCalled();
        });

        test('renders with user geolocation but geoService failed', async () => {
            geoService.getPosition = jest.fn(() => Promise.resolve(null));
            render(<Map data-testid={testId} />);
            //wait for a bit since geoService.getPosition call is async
            await new Promise((r) => setTimeout(r, 100)); //doesn't seem like the best but will do for now
            expect(screen.getByTestId(testId)).toBeInTheDocument();
            expect(mapSetCenterMock).not.toHaveBeenCalled();
        });
    });
});
