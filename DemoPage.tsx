import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Space, Spin, Alert, Button, Typography, message } from 'antd';
import 'antd/dist/antd.css';

import { GAPILoader, Map, InfoMarker, InfoPolyline, Direction, PlaceAutocomplete } from './src';

const flexColumn: React.CSSProperties = { display: 'flex', flexDirection: 'column' };

const Demo = () => {
    const [userLocation, setUserLocation] = useState<GeolocationPosition | null>(null);
    const [input, setInput] = useState('');
    const [googleKey, setGoogleKey] = useState('');
    const userLocationMessageKey = 'userLoc';
    return (
        <main
            style={{
                ...flexColumn,
                justifyContent: 'center',
                alignItems: 'center',
                width: '60vw',
                height: '100vh',
                margin: 'auto',
            }}
        >
            <h1>Google Map</h1>
            <div
                style={{
                    display: 'flex',
                    gap: 8,
                    alignItems: 'center',
                    marginBottom: 16,
                }}
            >
                <input
                    type="text"
                    placeholder="Enter Google Key here"
                    onChange={(e) => {
                        setInput(e.target.value);
                    }}
                />
                <button
                    type="button"
                    onClick={() => {
                        setGoogleKey(input);
                    }}
                >
                    Load Google Map
                </button>
            </div>

            {googleKey ? (
                <>
                    <PlaceAutocomplete apiKey={googleKey} />
                    <GAPILoader
                        apiKey={googleKey}
                        LoadingView={() => (
                            <Spin spinning={true}>
                                <Alert
                                    message="Google API Loading..."
                                    description="Loading..."
                                    type="info"
                                />
                            </Spin>
                        )}
                        ErrorView={() => (
                            <Alert
                                message="Failed to load Google API"
                                description="Error"
                                type="error"
                            />
                        )}
                    >
                        <Map
                            style={{ width: '100%', height: '750px' }}
                            onUserGeolocationLoading={() => {
                                message.loading({
                                    content: 'Loading User Location...',
                                    duration: 0,
                                    key: userLocationMessageKey,
                                });
                            }}
                            onUserGeolocationSuccess={(position) => {
                                message.success({
                                    content: 'User Location Successfully Loaded',
                                    duration: 2,
                                    key: userLocationMessageKey,
                                });
                                setUserLocation(position);
                            }}
                            onUserGeolocationFailed={() => {
                                message.error({
                                    content: 'Failed to Load User Location',
                                    duration: 2,
                                    key: userLocationMessageKey,
                                });
                            }}
                            onMount={(map) => {
                                console.log(map);
                            }}
                        >
                            {userLocation ? (
                                <InfoMarker
                                    options={{
                                        position: {
                                            lat: userLocation.coords.latitude,
                                            lng: userLocation.coords.longitude,
                                        },
                                    }}
                                >
                                    {({ infowindow }) => (
                                        <div>
                                            <Typography.Title level={2}>
                                                Current Location
                                            </Typography.Title>
                                            <Space size="middle" direction="vertical">
                                                <Typography.Text>
                                                    Event handlers still work here; however,
                                                    ContextAPI Providers will need to be defined
                                                    here if the contents of Info Window requires
                                                    any.
                                                </Typography.Text>
                                                <Typography.Text>
                                                    You also have access to the infowindow instance
                                                    here.
                                                </Typography.Text>
                                                <Space size="middle">
                                                    <Button
                                                        onClick={() => {
                                                            infowindow?.close();
                                                        }}
                                                    >
                                                        Close
                                                    </Button>
                                                    <Button
                                                        type="primary"
                                                        onClick={() => {
                                                            message.info(
                                                                `Lat: ${userLocation.coords.latitude}, Lng: ${userLocation.coords.longitude}`
                                                            );
                                                        }}
                                                    >
                                                        Display LatLng
                                                    </Button>
                                                </Space>
                                            </Space>
                                        </div>
                                    )}
                                </InfoMarker>
                            ) : null}
                            {userLocation ? (
                                <InfoPolyline
                                    options={{
                                        path: [
                                            {
                                                lat: userLocation.coords.latitude,
                                                lng: userLocation.coords.longitude,
                                            },
                                            {
                                                lat: userLocation.coords.latitude + 2,
                                                lng: userLocation.coords.longitude + 2,
                                            },
                                        ],
                                    }}
                                >
                                    <div>haha</div>
                                </InfoPolyline>
                            ) : null}

                            <Direction
                                request={{
                                    origin: { lat: 34.0522342, lng: -118.2436849 },
                                    destination: { lat: 37.7749295, lng: -122.4194155 },
                                    travelMode: 'DRIVING' as google.maps.TravelMode.DRIVING,
                                }}
                            />
                        </Map>
                    </GAPILoader>
                </>
            ) : (
                <div>Enter your google api key and click load button to start</div>
            )}
        </main>
    );
};

const root = createRoot(document.getElementById('root')!);
root.render(<Demo />);
