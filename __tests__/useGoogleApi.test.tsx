import { fireEvent } from '@testing-library/react';
import { renderHook, cleanup } from '@testing-library/react-hooks';
import { useGoogleApi } from '../src/useGoogleApi';

describe('/GoogleMap/useGoogleApi', () => {
    afterEach(cleanup);

    // Tests kind of bundled into one since separating them causes "Target container is not a DOM element" issue
    // Referring to `renderHook` call is trying to attach the hook into an invalid DOM?
    // Probably due to document.createElement attaching a script tag from useGoogleApi hook
    // Fix this later, not that important (probably needs jest.restoreAllMocks)
    test('returns done state and calls onLoad if available', async () => {
        const onErrorHandler = jest.fn(() => {});
        const onLoadHandler = jest.fn(() => {});
        const createElementSpy = jest.spyOn(document, 'createElement');

        //initial call creates script tag and loads
        const initialCall = renderHook(() =>
            useGoogleApi('', {}, { onLoad: onLoadHandler, onError: onErrorHandler })
        );
        expect(initialCall.result.current).toStrictEqual({
            success: false,
            loading: true,
            error: false,
        });
        expect(createElementSpy).toHaveBeenCalledWith('script');
        const script = document.querySelector('script#script-google-api');
        expect(script).not.toBeNull();
        /* eslint @typescript-eslint/no-non-null-assertion: "off" */
        fireEvent.load(script!);
        expect(onLoadHandler).toHaveBeenCalledTimes(1);
        expect(onErrorHandler).not.toHaveBeenCalled();
        expect(initialCall.result.current).toStrictEqual({
            success: true,
            loading: false,
            error: false,
        });
        createElementSpy.mockClear();
        onLoadHandler.mockClear();
        onErrorHandler.mockClear();

        //n+ calls will not recreate the script tag
        //when script is attached but not done loading
        //i.e `window.google` isn't defined yet
        const nCallNotYetLoaded = renderHook(() => useGoogleApi(''));
        //make sure script isn't created again
        expect(createElementSpy).toHaveBeenCalledTimes(1); //1 time is from testing framework that creates the div element to render the hook
        expect(onErrorHandler).not.toHaveBeenCalled();
        expect(nCallNotYetLoaded.result.current).toStrictEqual({
            success: false,
            loading: true,
            error: false,
        });
        //When script fires the onload, then state changes to true
        fireEvent.load(script!);
        nCallNotYetLoaded.rerender();
        expect(nCallNotYetLoaded.result.current).toStrictEqual({
            success: true,
            loading: false,
            error: false,
        });
        createElementSpy.mockClear();
        onLoadHandler.mockClear();
        onErrorHandler.mockClear();

        //nCall after script is loaded
        window.google = {}; //mock the google object
        const nCallIsLoaded = renderHook(() => useGoogleApi(''));
        expect(nCallIsLoaded.result.current).toStrictEqual({
            success: true,
            loading: false,
            error: false,
        });
        expect(createElementSpy).toHaveBeenCalledTimes(1); //1 time is from testing framework that creates the div element to render the hook
        expect(onErrorHandler).not.toHaveBeenCalled();
        expect(onLoadHandler).not.toHaveBeenCalled();
        createElementSpy.mockClear();
        onLoadHandler.mockClear();
        onErrorHandler.mockClear();

        //when google api failed to load
        script!.remove();
        const errorCall = renderHook(() => useGoogleApi('', {}, { onError: onErrorHandler }));
        const errorScript = document.querySelector('script#script-google-api');
        /* eslint @typescript-eslint/no-non-null-assertion: "off" */
        fireEvent.error(errorScript!);
        expect(errorCall.result.current).toStrictEqual({
            success: false,
            loading: false,
            error: true,
        });
        expect(onErrorHandler).toHaveBeenCalled();
        createElementSpy.mockClear();
        onLoadHandler.mockClear();
        onErrorHandler.mockClear();
    });
});
