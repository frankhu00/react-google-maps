import React from 'react';
import { screen, render, cleanup, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { PlaceAutocomplete } from '../src/PlaceAutocomplete';
import { useGoogleAutocomplete } from '../src/useGoogleAutocomplete';

// mocks
jest.mock('../src/useGoogleAutocomplete', () => ({
    useGoogleAutocomplete: jest.fn(() => {}),
}));

/**
 * Couldn't get antd Autocomplete to select an option by trigger user click event
 * or via keyboard events... looks like this is true for Select too
 * -.-
 */

describe('/GoogleMap/Placeautocomplete', () => {
    afterEach(cleanup);

    test('renders', () => {
        const mockGAPIHook = {
            instance: { autocomplete: {}, places: {} },
            predict: jest.fn(() => ({
                predictions: [
                    {
                        place_id: 'place id',
                        description: 'place addr',
                    },
                ],
            })),
            getDetails: jest.fn(() => Promise.resolve({})),
            status: { loading: false, success: true, error: false },
        };
        (useGoogleAutocomplete as jest.Mock).mockImplementation(() => mockGAPIHook);
        render(<PlaceAutocomplete data-testid="testing" />);
        expect(screen.getByTestId('testing')).toBeInTheDocument();
    });

    test('flow: user types -> calls predict (with results) -> shows list', async () => {
        const mockGAPIHook = {
            instance: { autocomplete: {}, places: {} },
            predict: jest.fn(() => ({
                predictions: [
                    {
                        place_id: 'place id',
                        description: 'place addr',
                    },
                ],
            })),
            getDetails: jest.fn(() => ({ status: 'OK', result: {} })),
            status: { loading: false, success: true, error: false },
        };
        (useGoogleAutocomplete as jest.Mock).mockImplementation(() => mockGAPIHook);
        render(<PlaceAutocomplete />);
        const input = screen.getByRole('combobox');
        await act(async () => {
            await userEvent.type(input, 'SureCo');
        });
        expect(mockGAPIHook.predict).toHaveBeenCalled();
        const option = screen.getByRole('option');
        expect(option).toHaveTextContent('place addr');
    });

    test('flow: user types -> calls predict (no results) -> no list shown', async () => {
        const mockGAPIHook = {
            instance: { autocomplete: {}, places: {} },
            predict: jest.fn(() => ({
                predictions: [],
            })),
            getDetails: jest.fn(() => ({ status: 'OK', result: {} })),
            status: { loading: false, success: true, error: false },
        };
        (useGoogleAutocomplete as jest.Mock).mockImplementation(() => mockGAPIHook);
        render(<PlaceAutocomplete />);
        const input = screen.getByRole('combobox');
        await act(async () => {
            await userEvent.type(input, 'SureCo');
        });
        expect(mockGAPIHook.predict).toHaveBeenCalled();
        const dropdown = document.querySelector('.ant-select-dropdown');
        expect(dropdown).toBeNull();
    });

    test('when google api is not loaded, input is disabled', async () => {
        const mockGAPIHook = {
            instance: { autocomplete: {}, places: {} },
            predict: jest.fn(() => ({
                predictions: [],
            })),
            getDetails: jest.fn(() => ({ status: 'OK', result: {} })),
            status: { loading: true, success: false, error: false },
        };
        (useGoogleAutocomplete as jest.Mock).mockImplementation(() => mockGAPIHook);
        render(<PlaceAutocomplete />);
        const input = screen.getByRole('combobox');
        expect(input).toBeDisabled();
    });

    test('when google api loading fails, input is disabled', async () => {
        const mockGAPIHook = {
            instance: { autocomplete: {}, places: {} },
            predict: jest.fn(() => ({
                predictions: [],
            })),
            getDetails: jest.fn(() => ({ status: 'OK', result: {} })),
            status: { loading: false, success: false, error: true },
        };
        (useGoogleAutocomplete as jest.Mock).mockImplementation(() => mockGAPIHook);
        render(<PlaceAutocomplete />);
        const input = screen.getByRole('combobox');
        expect(input).toBeDisabled();
    });
});
