import { useRef } from "react";
import { SafeAreaView, StyleSheet, Platform, StatusBar } from "react-native";
import { Config } from "../constants/Config";
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

  const fullscreenFix = `
      // Enable fullscreen and fit iframe to screen
      const style = document.createElement('style');
              style.textContent = \`
          iframe {
            max-height: 100% !important;
            width: 100% !important;
            object-fit: cover !important;
            scroll-behavior: smooth !important;
            pointer-events: auto !important;
          }
        \`;
        
      document.head.appendChild(style);
      
      function applyIframeStyles(iframe) {
        iframe.setAttribute('allowfullscreen', '');
        iframe.setAttribute('webkitallowfullscreen', '');
        iframe.setAttribute('mozallowfullscreen', '');
        
        // Fit iframe to screen and center it
        iframe.style.setProperty('max-height', '100%', 'important');
        iframe.style.setProperty('width', '100%', 'important');
        iframe.style.setProperty('object-fit', 'cover', 'important');
      }
      
      // Apply to existing iframes
      document.querySelectorAll('iframe').forEach(applyIframeStyles);
      
      // Apply when DOM loads
      document.addEventListener('DOMContentLoaded', function() {
        document.querySelectorAll('iframe').forEach(applyIframeStyles);
      });
      
      // Monitor for new iframes
      const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
          mutation.addedNodes.forEach(function(node) {
            if (node.tagName === 'IFRAME') {
              applyIframeStyles(node);
            }
            if (node.querySelectorAll) {
              node.querySelectorAll('iframe').forEach(applyIframeStyles);
            }
          });
        });
      });
      observer.observe(document.body, { childList: true, subtree: true });
      
      // Fix fullscreen API
      if (!document.fullscreenEnabled && !document.webkitFullscreenEnabled) {
        Object.defineProperty(document, 'fullscreenEnabled', { value: true });
        Object.defineProperty(document, 'webkitFullscreenEnabled', { value: true });
      }
    `;

  return `
      (function() {
        ${getCurrentPosition}
        ${fullscreenFix}
      })();
    `;
};

export default function Index() {
  const webViewRef = useRef<WebView>(null);


  // User agent that mimics a desktop browser to bypass Google's WebView restrictions
  const customUserAgent = Config.USER_AGENT;

  return (
    <SafeAreaView style={styles.container}>
      <WebView
        style={styles.webview}
        allowsLinkPreview={true}
        originWhitelist={["*"]}
        mixedContentMode="always"
        allowsFullscreenVideo={true}
        allowsInlineMediaPlayback={true}
        mediaPlaybackRequiresUserAction={false}
        // Enable fullscreen support for iframes
        allowsProtectedMedia={true}
        // Android specific fullscreen props
        {...(Platform.OS === 'android' && {
          allowFileAccess: true,
          allowFileAccessFromFileURLs: true,
          allowUniversalAccessFromFileURLs: true,
          setSupportMultipleWindows: false,
          androidLayerType: 'hardware',
        })}
        ref={webViewRef}
        source={{ uri: Config.API_BASE_URL }}
        geolocationEnabled={true}
        allowsBackForwardNavigationGestures={true}
        injectedJavaScript={getGeoLocationJS()}
        javaScriptEnabled={true}
        userAgent={customUserAgent}
        domStorageEnabled={true}
        startInLoadingState={true}
        scalesPageToFit={false}
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
    backgroundColor: "black"
  },
  webview: {
    position: "absolute",
    top: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    left: 0,
    right: 0,
    bottom: Platform.OS === 'android' ? (StatusBar.currentHeight || 0) + 20 : 0,
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

