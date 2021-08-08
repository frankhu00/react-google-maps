/* eslint @typescript-eslint/no-explicit-any: off */
import React from 'react';
import { render, cleanup } from '@testing-library/react';
import { InfoPolyline } from '../src/InfoPolyline';
import {
    mockGoogleAPI,
    polylineAddListenerMock,
    polylineSetMapMock,
    iwOpenMock,
    iwSetContentMock,
} from '../testUtil';

declare global {
    interface Window {
        google: any;
    }
}

describe('/GoogleMap/InfoPolyline.tsx', () => {
    const testId = 'test-child';
    describe('Google API not available', () => {
        afterEach(cleanup);

        beforeAll(() => {
            window.google = undefined;
        });

        test('Consoles error if window.google is not available', () => {
            console.error = jest.fn(() => {});
            render(
                <InfoPolyline>
                    <div data-testid={testId}>Info window content</div>
                </InfoPolyline>
            );
            expect(console.error).toHaveBeenCalled();
            expect(polylineSetMapMock).not.toHaveBeenCalled();
            expect(iwSetContentMock).not.toHaveBeenCalled();
        });
    });

    describe('Google API is loaded', () => {
        afterEach(cleanup);

        beforeAll(() => {
            window.google = mockGoogleAPI;
        });

        test('renders', () => {
            const map = new window.google.maps.Map();
            render(
                <InfoPolyline map={map}>
                    <div data-testid={testId}>Info window content</div>
                </InfoPolyline>
            );
            //markers should be set and events binded
            expect(polylineSetMapMock).toHaveBeenCalled();
            expect(polylineAddListenerMock).toHaveBeenCalled();

            //infowindow should be set
            expect(iwSetContentMock).toHaveBeenCalled();
            expect(iwOpenMock).not.toHaveBeenCalled();
        });

        test('renders with infoWindow shown on mount', () => {
            const map = new window.google.maps.Map();
            render(
                <InfoPolyline map={map} showOnMount anchor={{} as google.maps.MVCObject}>
                    <div data-testid={testId}>Info window content</div>
                </InfoPolyline>
            );
            //markers should be set and events binded
            expect(polylineSetMapMock).toHaveBeenCalled();
            expect(polylineAddListenerMock).toHaveBeenCalled();

            //infowindow should be set and opened
            expect(iwSetContentMock).toHaveBeenCalled();
            expect(iwOpenMock).toHaveBeenCalled();
        });
    });
});
