import { renderHook, cleanup } from '@testing-library/react-hooks';
import { useGoogleAutocomplete } from '../src/useGoogleAutocomplete';
import { useGoogleApi } from '../src/useGoogleApi';

import { mockGoogleAPI, getPlacePredictionsMock, getDetailsMock } from '../testUtil';

declare global {
    interface Window {
        google: any;
    }
}

// mocks
jest.mock('../src/useGoogleApi', () => ({
    useGoogleApi: jest.fn(() => {}),
}));

describe('/GoogleMap/useGoogleAutocomplete', () => {
    beforeAll(() => {
        window.google = mockGoogleAPI;
    });
    afterEach(cleanup);

    test('calls "autocomplete" and "places" services in "predict" and "getDetails" calls', async () => {
        (useGoogleApi as jest.Mock).mockImplementation(() => ({
            success: true,
            loading: false,
            error: false,
        }));

        const hook = renderHook(() => useGoogleAutocomplete(''));
        hook.result.current.predict('');
        expect(getPlacePredictionsMock).toHaveBeenCalled();
        hook.result.current.getDetails('');
        expect(getDetailsMock).toHaveBeenCalled();
    });

    test('if google api not loaded, "predict" and "getDetails" are dummy functions', async () => {
        (useGoogleApi as jest.Mock).mockImplementation(() => ({
            success: false,
            loading: false,
            error: true,
        }));

        const hook = renderHook(() => useGoogleAutocomplete(''));
        hook.result.current.predict('');
        expect(getPlacePredictionsMock).not.toHaveBeenCalled();
        hook.result.current.getDetails('');
        expect(getDetailsMock).not.toHaveBeenCalled();
    });
});
