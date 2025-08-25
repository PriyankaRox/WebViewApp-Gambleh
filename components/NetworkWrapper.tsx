import { useEffect, useState } from 'react';
import { Animated, Dimensions, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import NetInfo from '@react-native-community/netinfo';
import { FontAwesome } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

const NetworkWrapper = ({ children }: { children: React.ReactNode }) => {
    const [isConnected, setIsConnected] = useState(true);
    const pulseAnim = useState(new Animated.Value(0))[0];
    const floatAnim1 = useState(new Animated.Value(0))[0];
    const floatAnim2 = useState(new Animated.Value(0))[0];
    const floatAnim3 = useState(new Animated.Value(0))[0];
    const fadeAnim = useState(new Animated.Value(0))[0];

    useEffect(() => {
        let unsubscribe: (() => void) | undefined;

        const initNetInfo = async () => {
            try {
                unsubscribe = NetInfo?.addEventListener(state => {
                    setIsConnected(state.isConnected ?? true);
                });

                const initialState = await NetInfo?.fetch();
                setIsConnected(initialState.isConnected ?? true);
            } catch (error) {
                console.warn('NetInfo initialization error:', error);
                setIsConnected(true);
            }
        };

        initNetInfo();

        return () => {
            unsubscribe?.();
        };
    }, []);

    // Animations
    useEffect(() => {
        if (!isConnected) {
            // Fade in animation
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 800,
                useNativeDriver: true,
            }).start();

            // Pulsing animation for the main icon
            Animated.loop(
                Animated.sequence([
                    Animated.timing(pulseAnim, {
                        toValue: 1,
                        duration: 1500,
                        useNativeDriver: true,
                    }),
                    Animated.timing(pulseAnim, {
                        toValue: 0,
                        duration: 1500,
                        useNativeDriver: true,
                    }),
                ])
            ).start();

            // Floating animations for background elements
            Animated.loop(
                Animated.timing(floatAnim1, {
                    toValue: 1,
                    duration: 3000,
                    useNativeDriver: true,
                })
            ).start();

            Animated.loop(
                Animated.timing(floatAnim2, {
                    toValue: 1,
                    duration: 4000,
                    useNativeDriver: true,
                })
            ).start();

            Animated.loop(
                Animated.timing(floatAnim3, {
                    toValue: 1,
                    duration: 5000,
                    useNativeDriver: true,
                })
            ).start();
        }
    }, [isConnected, pulseAnim, floatAnim1, floatAnim2, floatAnim3, fadeAnim]);

    if (!isConnected) {
        const pulseScale = pulseAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [1, 1.2],
        });

        const pulseOpacity = pulseAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [0.7, 0.3],
        });

        const float1Y = floatAnim1.interpolate({
            inputRange: [0, 1],
            outputRange: [0, -30],
        });

        const float2Y = floatAnim2.interpolate({
            inputRange: [0, 1],
            outputRange: [0, -20],
        });

        const float3Y = floatAnim3.interpolate({
            inputRange: [0, 1],
            outputRange: [0, -25],
        });

        return (
            <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
                {/* Floating background elements */}
                <Animated.View
                    style={[
                        styles.floatingElement1,
                        {
                            transform: [{ translateY: float1Y }],
                        },
                    ]}
                />
                <Animated.View
                    style={[
                        styles.floatingElement2,
                        {
                            transform: [{ translateY: float2Y }],
                        },
                    ]}
                />
                <Animated.View
                    style={[
                        styles.floatingElement3,
                        {
                            transform: [{ translateY: float3Y }],
                        },
                    ]}
                />

                {/* Main disconnected icon */}
                <View style={styles.iconContainer}>
                    <Animated.View
                        style={[
                            styles.wifiIconContainer,
                            {
                                transform: [{ scale: pulseScale }],
                                opacity: pulseOpacity,
                            },
                        ]}
                    >
                        <View style={styles.wifiIcon}>
                            <FontAwesome
                                name="wifi"
                                size={Math.min(width * 0.12, 56)}
                                color="rgba(255, 255, 255, 0.6)"
                            />
                            <View style={styles.crossLine} />
                        </View>
                    </Animated.View>

                    <View style={styles.content}>
                        <Text style={styles.title}>Oops! No Internet</Text>
                        <Text style={styles.subtitle}>
                            It seems like you're offline.{'\n'}
                            Check your connection and try again.
                        </Text>

                        <TouchableOpacity style={styles.retryButton} activeOpacity={0.8}>
                            <Text style={styles.retryButtonText}>Try Again</Text>
                        </TouchableOpacity>
                    </View>

                </View>

            </Animated.View>
        );
    }

    return <>{children}</>;
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#020617',
        padding: '5%',
    },
    floatingElement1: {
        position: 'absolute',
        top: '15%',
        left: '8%',
        width: Math.min(width * 0.15, 70),
        height: Math.min(width * 0.15, 70),
        borderRadius: Math.min(width * 0.075, 35),
        backgroundColor: 'rgba(99, 102, 241, 0.1)',
        borderWidth: 1,
        borderColor: 'rgba(99, 102, 241, 0.3)',
    },
    floatingElement2: {
        position: 'absolute',
        top: '25%',
        right: '12%',
        width: Math.min(width * 0.12, 50),
        height: Math.min(width * 0.12, 50),
        borderRadius: Math.min(width * 0.06, 25),
        backgroundColor: 'rgba(168, 85, 247, 0.1)',
        borderWidth: 1,
        borderColor: 'rgba(168, 85, 247, 0.3)',
    },
    floatingElement3: {
        position: 'absolute',
        bottom: '20%',
        left: '18%',
        width: Math.min(width * 0.13, 60),
        height: Math.min(width * 0.13, 60),
        borderRadius: Math.min(width * 0.065, 30),
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        borderWidth: 1,
        borderColor: 'rgba(34, 197, 94, 0.3)',
    },
    iconContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    wifiIconContainer: {
        width: Math.min(width * 0.32, 150),
        height: Math.min(width * 0.32, 150),
        borderRadius: Math.min(width * 0.16, 75),
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        borderWidth: 2,
        borderColor: 'rgba(239, 68, 68, 0.3)',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative'
    },
    wifiIcon: {
        justifyContent: 'center',
        alignItems: 'center',
    },

    crossLine: {
        position: 'absolute',
        width: Math.min(width * 0.22, 90),
        height: 3,
        backgroundColor: '#EF4444',
        borderRadius: 2,
        transform: [{ rotate: '45deg' }],
    },
    content: {
        alignItems: 'center',
        paddingHorizontal: '8%',
        paddingBottom: '15%',
        paddingTop: "10%"
    },
    title: {
        fontSize: Math.min(width * 0.075, 32),
        fontWeight: '700',
        color: '#FFFFFF',
        textAlign: 'center',
        marginBottom: '4%',
        letterSpacing: -0.5,
        lineHeight: Math.min(width * 0.09, 38),
    },
    subtitle: {
        fontSize: Math.min(width * 0.045, 18),
        color: 'rgba(255, 255, 255, 0.7)',
        textAlign: 'center',
        lineHeight: Math.min(width * 0.065, 26),
        marginBottom: '8%',
        paddingHorizontal: '5%',
    },
    retryButton: {
        backgroundColor: '#EC4899',
        paddingHorizontal: Math.max(width * 0.08, 28),
        paddingVertical: Math.max(height * 0.018, 14),
        borderRadius: 12,
        shadowColor: '#F02665',
        borderWidth: 1,
        borderColor: '#1E293B',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 8,
        minWidth: Math.max(width * 0.35, 140),
        minHeight: Math.max(height * 0.055, 44),
        justifyContent: 'center',
        alignItems: 'center',
    },
    retryButtonText: {
        color: '#020617',
        fontSize: Math.min(width * 0.048, 18),
        fontWeight: '600',
        textAlign: 'center',
    },
});

export default NetworkWrapper; 7