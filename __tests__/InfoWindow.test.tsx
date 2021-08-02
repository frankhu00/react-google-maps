/* eslint @typescript-eslint/no-explicit-any: off */
import React from 'react';
import ReactDOM from 'react-dom';
import { screen, render, cleanup } from '@testing-library/react';
import { InfoWindow } from '../src/InfoWindow';

import {
    mockGoogleAPI,
    iwCloseMock,
    iwOpenMock,
    iwInstanceID,
    iwSetContentMock,
} from '../testUtil';

declare global {
    interface Window {
        google: any;
    }
}

const IWContent = () => <h1>info window content</h1>;

describe('/GoogleMap/InfoWindow.tsx', () => {
    describe('Google API not available', () => {
        afterEach(cleanup);

        beforeAll(() => {
            window.google = undefined;
        });

        test('Consoles error if window.google is not available', () => {
            console.error = jest.fn(() => {});
            render(<InfoWindow content={IWContent} />);
            expect(console.error).toHaveBeenCalled();
        });
    });

    describe('Google API loaded', () => {
        afterEach(cleanup);
        beforeAll(() => {
            window.google = mockGoogleAPI;
        });

        test('renders and closes on unmount', () => {
            const spy = jest.spyOn(ReactDOM, 'render');
            const { unmount } = render(<InfoWindow content={IWContent} />);
            expect(spy).toHaveBeenCalled();
            expect(iwSetContentMock).toHaveBeenCalled();
            expect(iwOpenMock).not.toHaveBeenCalled();
            unmount();
            expect(iwCloseMock).toHaveBeenCalled();
            spy.mockRestore();
        });

        test('renders infowindow content using JSX.Element directly', () => {
            render(
                <InfoWindow content={<div data-testid={iwInstanceID}>testing</div>}></InfoWindow>
            );
            expect(iwSetContentMock).toHaveBeenCalled();
        });

        test('renders children using renderProp pattern', () => {
            render(
                <InfoWindow content={IWContent}>
                    {({ infowindow }) => (
                        <div data-testid={(infowindow as any).testId}>testing</div>
                    )}
                </InfoWindow>
            );
            expect(screen.getByTestId(iwInstanceID)).toBeInTheDocument();
        });

        test('showOnMount calls infowindow.open when anchor is set', () => {
            const anchor = {} as google.maps.MVCObject;
            render(<InfoWindow content={IWContent} showOnMount anchor={anchor} />);
            expect(iwOpenMock).toHaveBeenCalled();
        });

        test('showOnMount calls infowindow.open when options.position is set', () => {
            const options = { position: { lat: 1, lng: 2 } };
            render(<InfoWindow content={IWContent} showOnMount options={options} />);
            expect(iwOpenMock).toHaveBeenCalled();
        });

        test('showOnMount do not call infowindow.open if options.position and anchor are NOT set', () => {
            console.error = jest.fn(() => {});
            render(<InfoWindow content={IWContent} showOnMount />);
            expect(console.error).toHaveBeenCalled();
            expect(iwOpenMock).not.toHaveBeenCalled();
        });
    });
});
