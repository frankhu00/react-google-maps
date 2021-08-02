import React from 'react';
import { render, screen } from '@testing-library/react';
import { GAPILoader } from '../src/GAPILoader';
import { useGoogleApi } from '../src/useGoogleApi';

const SampleComp = () => <h1>Sample</h1>;
const LoadingView = () => <div data-testid="loading">Loading</div>;
const ErrorView = () => <div data-testid="error">Error</div>;

jest.mock('../src/useGoogleApi', () => ({
    useGoogleApi: jest.fn(),
}));

describe('/GoogleMap/GAPILoader', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    test('shows loading state when loading google api', () => {
        (useGoogleApi as jest.Mock).mockImplementation(() => ({
            success: false,
            error: false,
            loading: true,
        }));
        render(
            <GAPILoader apiKey="" LoadingView={LoadingView} ErrorView={ErrorView}>
                <SampleComp />
            </GAPILoader>
        );

        expect(useGoogleApi).toHaveBeenCalled();
        expect(screen.getByTestId('loading')).toBeInTheDocument();
        expect(screen.queryByTestId('error')).not.toBeInTheDocument();
        expect(screen.queryByRole('heading')).not.toBeInTheDocument();
    });

    test('successfully loads google api shows children components', () => {
        (useGoogleApi as jest.Mock).mockImplementation(() => ({
            success: true,
            error: false,
            loading: false,
        }));
        render(
            <GAPILoader apiKey="" LoadingView={LoadingView} ErrorView={ErrorView}>
                <SampleComp />
            </GAPILoader>
        );

        expect(useGoogleApi).toHaveBeenCalled();
        expect(screen.getByRole('heading')).toBeInTheDocument();
        expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
        expect(screen.queryByTestId('error')).not.toBeInTheDocument();
    });

    test('failure to load google api shows ErrorView', () => {
        (useGoogleApi as jest.Mock).mockImplementation(() => ({
            success: false,
            error: true,
            loading: false,
        }));
        render(
            <GAPILoader apiKey="" LoadingView={LoadingView} ErrorView={ErrorView}>
                <SampleComp />
            </GAPILoader>
        );

        expect(useGoogleApi).toHaveBeenCalled();
        expect(screen.getByTestId('error')).toBeInTheDocument();
        expect(screen.queryByTestId('loading')).not.toBeInTheDocument();
        expect(screen.queryByRole('heading')).not.toBeInTheDocument();
    });
});
