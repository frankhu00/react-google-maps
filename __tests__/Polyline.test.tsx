/* eslint @typescript-eslint/no-explicit-any: off */
import React from 'react';
import { render, cleanup } from '@testing-library/react';
import { Polyline } from '../src/Polyline';

import { mockGoogleAPI, polylineAddListenerMock, polylineSetMapMock } from '../testUtil';

declare global {
    interface Window {
        google: any;
    }
}

describe('/GoogleMap/Polyline.tsx', () => {
    describe('Google API not available', () => {
        afterEach(cleanup);

        beforeAll(() => {
            window.google = undefined;
        });

        test('Consoles error if window.google is not available', () => {
            console.error = jest.fn(() => {});
            render(<Polyline />);
            expect(console.error).toHaveBeenCalled();
        });
    });

    describe('Google API loaded', () => {
        afterEach(cleanup);
        beforeAll(() => {
            window.google = mockGoogleAPI;
        });

        test('sets polyline onto map and clears on unmount', () => {
            const map = new window.google.maps.Map();
            const { unmount } = render(<Polyline map={map} />);
            expect(polylineSetMapMock).toHaveBeenCalledTimes(1);
            unmount();
            expect(polylineSetMapMock).toHaveBeenCalledTimes(2);
            expect(polylineSetMapMock.mock.calls[1][0]).toBeNull();
        });

        test('attaches polyline events', () => {
            const clickHandler = jest.fn(() => {});
            const map = new window.google.maps.Map();
            const { unmount } = render(
                <Polyline
                    map={map}
                    events={{
                        click: clickHandler,
                    }}
                />
            );
            expect(polylineAddListenerMock).toHaveBeenCalled();
            expect(polylineAddListenerMock.mock.calls[0][0]).toBe('click');
            unmount();
            expect(window.google.maps.event.removeListener).toHaveBeenCalled();
        });
    });
});
