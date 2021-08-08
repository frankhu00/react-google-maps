import { useGoogleApi } from './useGoogleApi';
import { UseGoogleApiState } from './types';

type DirectionsRouteService = (
    request: google.maps.DirectionsRequest
) => Promise<GoogleDirectionResponse>;

interface GoogleDirectionResponse {
    response: google.maps.DirectionsResult | null;
    status: google.maps.DirectionsStatus;
}

interface UseGoogleDirections {
    status: UseGoogleApiState;
    service: google.maps.DirectionsService | null;
    route: DirectionsRouteService;
}

const emptyRouteService: DirectionsRouteService = () =>
    Promise.resolve({
        response: null,
        status: 'REQUEST_DENIED' as google.maps.DirectionsStatus.REQUEST_DENIED,
    });

export const useGoogleDirections = (key: string): UseGoogleDirections => {
    const status = useGoogleApi(key);

    if (!status.success) {
        return {
            status,
            service: null,
            route: emptyRouteService,
        };
    }

    const service = new google.maps.DirectionsService();
    const route = (request: google.maps.DirectionsRequest): Promise<GoogleDirectionResponse> =>
        new Promise((resolve) => {
            service.route(request, function (response, status) {
                resolve({ response, status });
            });
        });

    return {
        status,
        service,
        route,
    };
};
