/* eslint @typescript-eslint/no-explicit-any: off */
import React from 'react';
import { render, cleanup } from '@testing-library/react';
import { Marker } from '../src/Marker';

import { mockGoogleAPI, markerSetMapMock, markerAddListenerMock } from '../testUtil';

declare global {
    interface Window {
        google: any;
    }
}

describe('/GoogleMap/Marker.tsx', () => {
    describe('Google API not available', () => {
        afterEach(cleanup);

        beforeAll(() => {
            window.google = undefined;
        });

        test('Consoles error if window.google is not available', () => {
            console.error = jest.fn(() => {});
            render(<Marker />);
            expect(console.error).toHaveBeenCalled();
        });
    });

    describe('Google API loaded', () => {
        afterEach(cleanup);
        beforeAll(() => {
            window.google = mockGoogleAPI;
        });

        test('sets marker onto map and clears on unmount', () => {
            const map = new window.google.maps.Map();
            const { unmount } = render(<Marker map={map} />);
            expect(markerSetMapMock).toHaveBeenCalledTimes(1);
            unmount();
            expect(markerSetMapMock).toHaveBeenCalledTimes(2);
            expect(markerSetMapMock.mock.calls[1][0]).toBeNull();
        });

        test('attaches marker events', () => {
            const clickHandler = jest.fn(() => {});
            const map = new window.google.maps.Map();
            const { unmount } = render(
                <Marker
                    map={map}
                    events={{
                        click: clickHandler,
                    }}
                />
            );
            expect(markerAddListenerMock).toHaveBeenCalled();
            expect(markerAddListenerMock.mock.calls[0][0]).toBe('click');
            unmount();
            expect(window.google.maps.event.removeListener).toHaveBeenCalled();
        });
    });
});
