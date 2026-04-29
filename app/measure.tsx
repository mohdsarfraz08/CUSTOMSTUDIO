import React, { useState, useRef, useEffect } from 'react';
import {
    View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Image,
    ScrollView, Animated, Platform, UIManager, LayoutAnimation
} from 'react-native';
import { router, Stack } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { useResponsive } from '../hooks/useResponsive';
import { CustomTheme } from '../constants/theme';

// Enable LayoutAnimation for Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
}

const MEASUREMENT_OPTIONS = [
    {
        id: 'custom',
        title: 'BY CUSTOM MEASUREMENT',
        description: 'Provide your exact body measurements for a perfect bespoke fit tailored specifically to your physique. Includes a step-by-step video guide.',
        image: require('../assets/images/get_measure/custom.jpg'),
    },
    {
        id: 'size_chart',
        title: 'BY SIZE CHART',
        description: 'Select from our standardized size charts. Perfect for those who know their size in regular brands.',
        image: require('../assets/images/get_measure/size.jpg'),
    },
    {
        id: 'saved',
        title: 'BY SAVED MEASUREMENT',
        description: 'Quickly access your previously saved measurement profiles for a seamless and fast checkout experience.',
        image: require('../assets/images/get_measure/saved.jpg'),
    },
    {
        id: 'clone',
        title: 'BY CLONE A CLOTH',
        description: 'Send us your best-fitting garment, and we will replicate its exact dimensions for your new piece.',
        image: require('../assets/images/get_measure/clone.jpg'),
    },
];

export default function MeasureScreen() {
    const { isLandscape, isTV, isTablet, isDesktop, normalize } = useResponsive();
    const [selectedId, setSelectedId] = useState('custom');

    // Animations
    const fadeAnim = useRef(new Animated.Value(0)).current;
    const translateY = useRef(new Animated.Value(20)).current;

    const selectedOption = MEASUREMENT_OPTIONS.find(o => o.id === selectedId) || MEASUREMENT_OPTIONS[0];

    useEffect(() => {
        animateContent();
    }, [selectedId]);

    const animateContent = () => {
        fadeAnim.setValue(0);
        translateY.setValue(20);
        Animated.parallel([
            Animated.timing(fadeAnim, { toValue: 1, duration: 500, useNativeDriver: true }),
            Animated.spring(translateY, { toValue: 0, friction: 8, tension: 40, useNativeDriver: true }),
        ]).start();
    };

    const handleSelect = (id) => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setSelectedId(id);
    };

    const renderOptionCard = (option) => {
        const isActive = selectedId === option.id;

        return (
            <TouchableOpacity
                key={option.id}
                style={[
                    styles.card,
                    isActive && styles.cardActive,
                    isLandscape ? styles.cardLandscape : styles.cardMobile
                ]}
                onPress={() => handleSelect(option.id)}
                activeOpacity={0.9}
            >
                {/* Image Section */}
                <View style={styles.imageContainer}>
                    <Image source={option.image} style={styles.cardImage} resizeMode="cover" />
                </View>

                {/* Black Label Section */}
                <View style={styles.labelContainer}>
                    <Text style={[styles.cardTitle, { fontSize: isLandscape ? 18 : ((isTablet || isDesktop) ? 16 : 10) }]}>
                        {option.title}
                    </Text>
                </View>

                {isActive && (
                    <View style={styles.activeBadge}>
                        <Feather name="check" size={18} color="#fff" />
                    </View>
                )}
            </TouchableOpacity>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            <Stack.Screen options={{ headerShown: false }} />
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Feather name="arrow-left" size={24} color="#1a1a1a" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>GET MEASURE</Text>
                <View style={{ width: 44 }} />
            </View>

            <View style={isLandscape ? { flex: 1 } : null}>
                <ScrollView
                    scrollEnabled={!isLandscape}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={[styles.scrollContent, isLandscape && { flex: 1, paddingBottom: 20 }]}
                >
                    <View style={[styles.titleSection, isLandscape && { marginTop: 10, marginBottom: 15 }]}>
                        <Text style={styles.mainTitle}>Craft Your Perfect Fit</Text>
                        <Text style={styles.subTitle}>Select how you'd like us to tailor your garment.</Text>
                    </View>

                    <View style={[styles.layoutContainer, isLandscape && styles.layoutContainerLandscape]}>
                        {/* Grid Container */}
                        <View style={[styles.gridContainer, { width: isLandscape ? '58%' : '100%' }]}>
                            {MEASUREMENT_OPTIONS.map(renderOptionCard)}
                        </View>

                        {/* Desktop Description Panel */}
                        {isLandscape && (
                            <Animated.View style={[
                                styles.desktopPanel,
                                { width: '38%', opacity: fadeAnim, transform: [{ translateY }] }
                            ]}>
                                <Text style={styles.descTitle}>{selectedOption.title}</Text>
                                <Text style={styles.descText}>{selectedOption.description}</Text>

                                <TouchableOpacity
                                    style={styles.primaryBtn}
                                    onPress={() => {
                                        if (selectedOption.id === 'custom') {
                                            router.push('/custom-measure');
                                        } else if (selectedOption.id === 'size_chart') {
                                            router.push('/size-chart');
                                        } else {
                                            alert(`Proceeding with ${selectedOption.title}`);
                                        }
                                    }}
                                >
                                    <Text style={styles.primaryBtnText}>PROCEED WITH THIS</Text>
                                    <Feather name="chevron-right" size={18} color="#C5A880" />
                                </TouchableOpacity>
                            </Animated.View>
                        )}
                    </View>
                </ScrollView>
            </View>

            {/* Bottom Mobile Action Panel - Sticky */}
            {!isLandscape && (
                <View style={styles.bottomSheet}>
                    <Animated.View style={{ opacity: fadeAnim, transform: [{ translateY }] }}>
                        <Text style={styles.bottomSheetTitle}>{selectedOption.title}</Text>
                        <Text style={styles.bottomSheetDesc}>{selectedOption.description}</Text>
                    </Animated.View>

                    <TouchableOpacity
                        style={styles.primaryBtn}
                        onPress={() => {
                            if (selectedOption.id === 'custom') {
                                router.push('/custom-measure');
                            } else if (selectedOption.id === 'size_chart') {
                                router.push('/size-chart');
                            } else {
                                alert(`Proceeding with ${selectedOption.title}`);
                            }
                        }}
                    >
                        <Text style={styles.primaryBtnText}>PROCEED WITH THIS</Text>
                        <Feather name="chevron-right" size={18} color="#C5A880" />
                    </TouchableOpacity>
                </View>
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F1E8', // MAVI Cream background
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        height: 100,
        backgroundColor: '#F5F1E8', // Match cream background
        paddingTop: 30,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '900',
        color: CustomTheme.accentGold || '#C5A880', // Back to Gold
        letterSpacing: 2,
    },
    backButton: {
        width: 44,
        height: 44,
        backgroundColor: '#F5F1E8',
        borderWidth: 0.5,
        borderColor: '#000000',
        borderRadius: 6,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 5,
        overflow: 'hidden'
    },
    scrollContent: {
        paddingBottom: 150,
    },
    titleSection: {
        alignItems: 'center',
        marginTop: 20,
        marginBottom: 30,
        paddingHorizontal: 20,
    },
    mainTitle: {
        fontSize: 26,
        fontWeight: '700',
        color: '#1a1a1a',
        letterSpacing: 0.5,
    },
    subTitle: {
        fontSize: 14,
        color: '#777',
        marginTop: 8,
        textAlign: 'center',
    },
    layoutContainer: {
        paddingHorizontal: 20,
    },
    layoutContainerLandscape: {
        flexDirection: 'row',
        gap: 30,
    },
    gridContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    card: {
        borderRadius: 8, // Match MAVI UI corner radius
        backgroundColor: '#FFFFFF',
        overflow: 'hidden',
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#E8DCC8',
        // Shadow for premium feel
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 15,
        elevation: 8,
    },
    cardMobile: {
        width: '47%',
        aspectRatio: 0.95, // More compact
    },
    cardLandscape: {
        width: '48%',
        aspectRatio: 1.2, // Taller cards as requested
    },
    cardActive: {
        transform: [{ scale: 1.02 }],
    },
    imageContainer: {
        flex: 4, // Takes up 80% of the card height
        backgroundColor: '#f0f0f0',
    },
    cardImage: {
        width: '100%',
        height: '100%',
    },
    labelContainer: {
        flex: 1.2,
        backgroundColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 10,
        borderTopWidth: 1,
        borderTopColor: '#F5F1E8',
    },
    cardTitle: {
        color: '#1a1a1a',
        fontSize: 13,
        fontWeight: '800',
        textAlign: 'center',
        letterSpacing: 1,
        textTransform: 'uppercase',
    },
    activeBadge: {
        position: 'absolute',
        top: 12,
        right: 12,
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#000000ff',
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#C5A880',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.6,
        shadowRadius: 6,
        elevation: 8,
    },
    bottomSheet: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#F5F1E8', // Match cream background
        paddingHorizontal: 24,
        paddingTop: 24,
        paddingBottom: Platform.OS === 'ios' ? 34 : 24,
        borderTopLeftRadius: 40,
        borderTopRightRadius: 40,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -10 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
        elevation: 15,
    },
    bottomSheetTitle: {
        fontSize: 20,
        fontWeight: '800',
        color: '#1a1a1a',
        marginBottom: 10,
        letterSpacing: 0.5,
    },
    bottomSheetDesc: {
        fontSize: 14,
        color: '#666',
        lineHeight: 22,
        marginBottom: 20,
    },
    desktopPanel: {
        backgroundColor: '#F5F1E8',
        borderRadius: 40,
        padding: 40,
        justifyContent: 'center',
    },
    descTitle: {
        fontSize: 32,
        fontWeight: '800',
        color: '#1a1a1a',
        marginBottom: 16,
    },
    descText: {
        fontSize: 16,
        color: '#666',
        lineHeight: 28,
        marginBottom: 40,
    },
    primaryBtn: {
        backgroundColor: '#000000',
        height: 60,
        borderRadius: 4, // Match MAVI button radius
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 12,
        borderWidth: 1,
        borderColor: CustomTheme.accentGold || '#C5A880',
    },
    primaryBtnText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '900',
        letterSpacing: 2,
        textTransform: 'uppercase',
    },
});