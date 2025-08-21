import { Platform } from "react-native";

export const Config = {
    // API_BASE_URL: "https://chanced.com/",
    API_BASE_URL: "https://gambleh.com/",
    USER_AGENT: Platform.OS === "ios" ? "Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1" : "Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36"
}
