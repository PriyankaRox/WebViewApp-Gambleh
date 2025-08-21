import * as Location from 'expo-location';
import { useRef } from "react";
import { PermissionsAndroid, Platform, SafeAreaView, StyleSheet } from "react-native";
import { WebView } from "react-native-webview";


export const getGeoLocationJS = () => {
  return `
    (function() {
      const originalGetCurrentPosition = navigator.geolocation.getCurrentPosition.bind(navigator.geolocation);
      navigator.geolocation.getCurrentPosition = (success, error, options) => {
        const message = JSON.stringify({ event: 'getCurrentPosition', options: options });
        window.ReactNativeWebView.postMessage(message);
        
        const listener = (event) => {
          let eventData;
          try {
            eventData = JSON.parse(event.data);
          } catch (e) {
            return;
          }

          if (eventData.event === 'currentPosition') {
            success(eventData.data);
            window.removeEventListener('message', listener);
          } else if (eventData.event === 'currentPositionError') {
            error(eventData.data);
            window.removeEventListener('message', listener);
          }
        };

        window.addEventListener('message', listener);
      };
    })();
    true;
  `;
};

async function requestLocationPermission() {
  if (Platform.OS === 'android') {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } catch (err) {
      console.warn(err);
      return false;
    }
  }
  const { status } = await Location.requestForegroundPermissionsAsync();
  return status === 'granted';
}


export default function Index() {
  const webViewRef = useRef<WebView>(null);

  // User agent that mimics a desktop browser to bypass Google's WebView restrictions
  const customUserAgent =
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

    const handleWebViewMessage = async (event: any) => {
      let eventData;
      try {
        eventData = JSON.parse(event.nativeEvent.data);
      } catch (e) {
        return;
      }
  
      if (eventData.event === 'getCurrentPosition') {
        const hasPermission = await requestLocationPermission();
        if (hasPermission) {
          try {
            const location = await Location.getCurrentPositionAsync({});
            const position = {
              coords: {
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
                accuracy: location.coords.accuracy,
                altitude: location.coords.altitude,
                heading: location.coords.heading,
                speed: location.coords.speed
              },
              timestamp: location.timestamp
            };
            webViewRef.current?.injectJavaScript(`
              window.postMessage(JSON.stringify({
                event: 'currentPosition',
                data: ${JSON.stringify(position)}
              }), '*');
            `);
          } catch (error) {
            webViewRef.current?.injectJavaScript(`
              window.postMessage(JSON.stringify({
                event: 'currentPositionError',
                data: {
                  code: 2,
                  message: 'Position acquisition failed.'
                }
              }), '*');
            `);
          }
        } else {
          webViewRef.current?.injectJavaScript(`
            window.postMessage(JSON.stringify({
              event: 'currentPositionError',
              data: {
                code: 1,
                message: 'Permission denied.'
              }
            }), '*');
          `);
        }
      }
    };
  return (
    <SafeAreaView style={styles.container}>
      <WebView
        allowsLinkPreview={true}
        originWhitelist={["*"]}
        mixedContentMode="always"
        allowsFullscreenVideo={true}
        ref={webViewRef}
        source={{ uri: "https://gambleh.com/" }}
        geolocationEnabled={true}
        allowsBackForwardNavigationGestures={true}
        injectedJavaScript={getGeoLocationJS()}
        javaScriptEnabled={true}
        userAgent={customUserAgent}
        domStorageEnabled={true}
        startInLoadingState={true}
        scalesPageToFit={true}
        allowsInlineMediaPlayback={true}
        mediaPlaybackRequiresUserAction={false}
        onMessage={handleWebViewMessage}
        onShouldStartLoadWithRequest={(request) => {
          // Allow all navigation including Google sign-in within WebView
          return true;
        }}
        onError={(syntheticEvent) => {
          const { nativeEvent } = syntheticEvent;
          console.warn("WebView error: ", nativeEvent);
        }}
        onHttpError={(syntheticEvent) => {
          const { nativeEvent } = syntheticEvent;
          console.warn("WebView HTTP error: ", nativeEvent);
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,

    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 9999,
    backgroundColor: "black"
  },
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    padding: 2,
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0"
  },
  button: {
    backgroundColor: "#007AFF",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 3,
    minWidth: 30,
    alignItems: "center"
  },
  buttonText: {
    color: "white",
    fontSize: 10,
    fontWeight: "500"
  }
});
