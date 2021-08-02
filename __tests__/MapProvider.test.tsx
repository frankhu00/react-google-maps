import React from 'react';
import { screen, render, cleanup } from '@testing-library/react';
import { MapProvider } from '../src/MapProvider';

describe('/GoogleMap/MapProvider.tsx', () => {
    afterEach(cleanup);

    const testId = 'test-child';

    test('renders', () => {
        render(
            <MapProvider>
                <div data-testid={testId}>Child</div>
            </MapProvider>
        );
        expect(screen.getByTestId(testId)).toBeInTheDocument();
    });
});
