import { useEffect, useState } from 'react';
import { useAppStore } from '../store/useAppStore';
import { apiClient } from '../services/apiClient';

export interface LiveLocationState {
  latitude: number | null;
  longitude: number | null;
  accuracy: number | null;
  heading: number | null;
  speed: number | null;
  address: string;
  isGpsActive: boolean;
  permissionState: 'granted' | 'denied' | 'prompt' | 'unsupported';
  errorMsg: string | null;
}

export function useLiveLocation() {
  const { partner, updatePartner } = useAppStore();
  const [locationState, setLocationState] = useState<LiveLocationState>({
    latitude: partner?.currentLocation?.lat || 17.3457,
    longitude: partner?.currentLocation?.lng || 78.5522,
    accuracy: null,
    heading: null,
    speed: null,
    address: partner?.currentLocation?.address || 'LB Nagar, Hyderabad, 500074',
    isGpsActive: false,
    permissionState: 'prompt',
    errorMsg: null
  });

  useEffect(() => {
    if (typeof window === 'undefined' || !('geolocation' in navigator)) {
      setLocationState((prev) => ({
        ...prev,
        permissionState: 'unsupported',
        errorMsg: 'Geolocation API is not supported by your browser'
      }));
      return;
    }

    let watchId: number | null = null;
    let lastBackendSync = 0;

    const handlePositionSuccess = (position: GeolocationPosition) => {
      const { latitude, longitude, accuracy, heading, speed } = position.coords;
      const formattedAddress = `GPS (${latitude.toFixed(4)}° N, ${longitude.toFixed(4)}° E) • LB Nagar Zone`;

      setLocationState({
        latitude,
        longitude,
        accuracy,
        heading,
        speed,
        address: formattedAddress,
        isGpsActive: true,
        permissionState: 'granted',
        errorMsg: null
      });

      // Update Local App Store state using currentLocation (not location)
      updatePartner({
        currentLocation: {
          lat: latitude,
          lng: longitude,
          address: formattedAddress
        }
      });

      // Throttled Backend API Sync every 12 seconds
      const now = Date.now();
      if (now - lastBackendSync > 12000) {
        lastBackendSync = now;
        apiClient
          .post('/location', {
            latitude,
            longitude,
            address: formattedAddress,
            accuracy,
            heading,
            speed
          })
          .catch((err) => {
            console.warn('[LiveLocation] Sync to backend failed:', err);
          });
      }
    };

    const handlePositionError = (error: GeolocationPositionError) => {
      let msg = 'Unable to retrieve GPS location';
      let perm: LiveLocationState['permissionState'] = 'denied';

      switch (error.code) {
        case error.PERMISSION_DENIED:
          msg = 'Location access permission denied by user';
          perm = 'denied';
          break;
        case error.POSITION_UNAVAILABLE:
          msg = 'GPS location position unavailable';
          break;
        case error.TIMEOUT:
          msg = 'Location request timed out';
          break;
      }

      setLocationState((prev) => ({
        ...prev,
        isGpsActive: false,
        permissionState: perm,
        errorMsg: msg
      }));
    };

    // Request High-Accuracy Watch Position
    watchId = navigator.geolocation.watchPosition(
      handlePositionSuccess,
      handlePositionError,
      {
        enableHighAccuracy: true,
        maximumAge: 5000,
        timeout: 15000
      }
    );

    return () => {
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [updatePartner]);

  return locationState;
}
