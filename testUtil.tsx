/* eslint @typescript-eslint/no-explicit-any: off */
const markerSetMapMock = jest.fn();
const markerAddListenerMock = jest.fn();
class mockMarkerClass {
    setMap = markerSetMapMock;
    addListener = markerAddListenerMock;
}

const iwSetContentMock = jest.fn();
const iwOpenMock = jest.fn();
const iwCloseMock = jest.fn();
const iwInstanceID = 'iw-instance-testing';
class mockInfoWindowClass {
    testId = iwInstanceID;
    setContent = iwSetContentMock;
    open = iwOpenMock;
    close = iwCloseMock;
}

const mapSetCenterMock = jest.fn();
class mockMapClass {
    setCenter = mapSetCenterMock;
}

const getPlacePredictionsMock = jest.fn();
class mockAutoCompleteService {
    getPlacePredictions = getPlacePredictionsMock;
}

const getDetailsMock = jest.fn();
class mockPlacesService {
    getDetails = getDetailsMock;
}

const polylineSetMapMock = jest.fn();
const polylineAddListenerMock = jest.fn();
class mockPolylineClass {
    setMap = polylineSetMapMock;
    addListener = polylineAddListenerMock;
}

const mockGoogleAPI = {
    maps: {
        Marker: mockMarkerClass,
        event: {
            removeListener: jest.fn(),
        },
        Map: mockMapClass,
        InfoWindow: mockInfoWindowClass,
        places: {
            PlacesService: mockPlacesService,
            AutocompleteService: mockAutoCompleteService,
            AutocompleteSessionToken: class {},
        },
        Polyline: mockPolylineClass,
    },
};
/** End mocking window.google */

export {
    mockGoogleAPI,
    markerSetMapMock,
    markerAddListenerMock,
    iwSetContentMock,
    iwOpenMock,
    iwCloseMock,
    iwInstanceID,
    mapSetCenterMock,
    getPlacePredictionsMock,
    getDetailsMock,
    polylineSetMapMock,
    polylineAddListenerMock,
};
