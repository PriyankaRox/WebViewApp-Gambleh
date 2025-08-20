import { Config } from "@/constants/Config";
import { useCallback, useEffect, useRef } from "react";
import { BackHandler, SafeAreaView, StyleSheet } from "react-native";
import { WebView } from "react-native-webview";

export const getGeoLocationJS = () => {
  const getCurrentPosition = `
      navigator.geolocation.getCurrentPosition = (success, error, options) => {
        window.ReactNativeWebView.postMessage(JSON.stringify({ event: 'getCurrentPosition', options: options }));
  
        window.addEventListener('message', (e) => {
          let eventData = {}
          try {
            eventData = JSON.parse(e.data);
          } catch (e) {}
  
          if (eventData.event === 'currentPosition') {
            success(eventData.data);
          } else if (eventData.event === 'currentPositionError') {
            error(eventData.data);
          }
        });
      };
      true;
    `;

  return `
      (function() {
        ${getCurrentPosition}
    
      })();
    `;
};

export default function Index() {
  const webViewRef = useRef<WebView>(null);

  // User agent that mimics a desktop browser to bypass Google's WebView restrictions
  const customUserAgent = Config.USER_AGENT;

    const handleBackPress = useCallback(() => {
      if (webViewRef.current) {
        webViewRef.current.goBack();
        return true; 
      }
      return false;
    }, []);
  
    useEffect(() => {
      const backHandler = BackHandler.addEventListener(
        "hardwareBackPress",
        handleBackPress
      );
      return () => {
        backHandler.remove();
      };
    }, [handleBackPress]);
  return (
    <SafeAreaView style={styles.container}>
      <WebView
        allowsLinkPreview={true}
        originWhitelist={["*"]}
        mixedContentMode="always"
        allowsFullscreenVideo={true}
        ref={webViewRef}
        source={{ uri: Config.API_BASE_URL }}
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
