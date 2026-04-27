import React, { useEffect, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, type ViewStyle, ScrollView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useOutfit, AVAILABLE_ITEMS, OutfitItemId } from '../../src/context/OutfitContext';
import { useRemoteControl } from '../../src/context/RemoteControlContext';
import { useResponsive } from '../../hooks/useResponsive';
import { CustomTheme } from '../../constants/theme';
import KurtaOutfitIcon from '../../assets/images/outfit_icon/kurta/kurta.svg';
import PajamaOutfitIcon from '../../assets/images/outfit_icon/kurta/pajama.svg';
import CoatOutfitIcon from '../../assets/images/outfit_icon/kurta/coat.svg';
import SadriOutfitIcon from '../../assets/images/outfit_icon/kurta/sadri.svg';

const ITEM_SVGS: Record<OutfitItemId, React.ComponentType<{ width?: number; height?: number }>> = {
    kurta: KurtaOutfitIcon,
    pajama: PajamaOutfitIcon,
    coat: CoatOutfitIcon,
    sadri: SadriOutfitIcon,
};

interface OutfitScreenProps {
    onNavigate?: (screen: 'outfit' | 'kurta') => void;
    isTVView?: boolean;
}

export default function OutfitScreen({ onNavigate, isTVView = false }: OutfitScreenProps) {
    const { selectedItems, toggleItem } = useOutfit();
    const { tvSessionId, sendCommand, subscribeToCommands } = useRemoteControl();
    const { normalize, isMobile, isTablet, isDesktop, isTV, isLandscape } = useResponsive();
    const isLargeScreen = isTablet || isDesktop || isTV || isTVView || isLandscape;

    // Listen for commands from the other device
    useEffect(() => {
        if (!tvSessionId) return;
        const unsub = subscribeToCommands((cmd) => {
            if (cmd.type === 'TOGGLE_ITEM') {
                toggleItem(cmd.payload.itemId);
            }
        });
        return unsub;
    }, [tvSessionId, subscribeToCommands, toggleItem]);

    const handleToggleItem = useCallback((id: OutfitItemId) => {
        toggleItem(id);
        if (tvSessionId) sendCommand('TOGGLE_ITEM', { itemId: id });
    }, [toggleItem, tvSessionId, sendCommand]);

    const getDynamicCardStyle = (): ViewStyle => {
        // # LANDSCAPE OR LARGE SCREEN (TV/Desktop)
        if (isLandscape || isTV || isTVView || isDesktop) {
            return {
                width: '23.5%' as const,
                minHeight: normalize(180),
                padding: normalize(15),
                borderRadius: normalize(10),
                marginBottom: normalize(15),
            };
        }
        // # MOBILE SCREEN
        if (isMobile) {
            return {
                width: '48%' as const,
                minHeight: 180,
                padding: 18,
                borderRadius: 14,
            };
        }
        // # TABLET PORTRAIT
        if (isTablet) {
            return {
                width: '48%' as const,
                minHeight: normalize(200),
                padding: normalize(20),
                borderRadius: 16,
            };
        }
        return {};
    };

    const dynamicCardStyle = getDynamicCardStyle();

    const handleProceed = () => {
        if (onNavigate) {
            onNavigate('kurta');
        } else {
            router.push('/kurta');
        }
        if (tvSessionId) sendCommand('NAVIGATE', { screen: 'kurta' });
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ flexGrow: 1 }}>
                <View style={[styles.header, isLargeScreen && { paddingTop: normalize(25), paddingBottom: normalize(15) }]}>
                    <Text style={[styles.title, { fontSize: normalize(24) }]}>Build Your Outfit</Text>
                    <Text style={[styles.subText, { fontSize: normalize(13) }]}>Choose which pieces you want to customize</Text>
                </View>

                <View style={[styles.itemsContainer, isLandscape && { justifyContent: 'center', gap: normalize(8) }]}>
                    {(Object.keys(AVAILABLE_ITEMS) as OutfitItemId[]).map((id) => {
                        const item = AVAILABLE_ITEMS[id];
                        const isSelected = selectedItems.includes(id);
                        const OutfitIcon = ITEM_SVGS[id];

                        return (
                            <TouchableOpacity
                                key={id}
                                style={[
                                    styles.itemCard,
                                    isSelected && styles.itemCardSelected,
                                    dynamicCardStyle
                                ]}
                                onPress={() => handleToggleItem(id)}
                                activeOpacity={0.85}
                            >
                                <View style={styles.itemTopRow}>
                                    <Text style={[styles.itemName, isSelected && styles.itemTextSelected, { fontSize: normalize(13) }]}>{item.name}</Text>
                                    <View style={[
                                        styles.badge,
                                        isSelected ? styles.badgeSelected : styles.badgeUnselected,
                                        { width: normalize(24), height: normalize(24), borderRadius: normalize(12) }
                                    ]}>
                                        <MaterialIcons
                                            name={isSelected ? 'check-circle' : 'add-circle-outline'}
                                            size={normalize(16)}
                                            color={isSelected ? '#000000' : '#A1A1AA'}
                                        />
                                    </View>
                                </View>

                                <View style={styles.previewArea}>
                                    <OutfitIcon 
                                        width={isLandscape ? normalize(120) : normalize(100)} 
                                        height={isLandscape ? normalize(120) : normalize(100)} 
                                    />
                                </View>

                            </TouchableOpacity>
                        );
                    })}
                </View>

                <View style={[styles.footer, isLargeScreen && { paddingVertical: normalize(20) }, (isTV || isTVView) && { display: 'none' }]}>
                    <TouchableOpacity style={[
                        styles.proceedButton,
                        isLargeScreen && { paddingVertical: normalize(16), borderRadius: normalize(12) },
                        isLandscape && { width: '40%', alignSelf: 'center' }
                    ]} onPress={handleProceed} activeOpacity={0.85}>
                        <Text style={[styles.proceedButtonText, { fontSize: normalize(15) }]}>Proceed to Customize</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: CustomTheme.backgroundPrimary },
    header: { paddingHorizontal: 20, paddingTop: 24, paddingBottom: 16 },
    title: { fontSize: 28, fontWeight: '800', color: CustomTheme.textPrimary },
    subText: { fontSize: 15, color: CustomTheme.textSecondary, marginTop: 6, lineHeight: 22 },

    itemsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingBottom: 16,
    },
    // Default itemCard style, isko upar dynamicCardStyle se overwrite kiya jayega
    itemCard: {
        width: '48%',
        minHeight: 180,
        backgroundColor: '#FFFFFF',
        borderRadius: 20,
        marginBottom: 16,
        padding: 18,
        position: 'relative',
        borderWidth: 1,
        borderColor: '#E5E7EB',
        overflow: 'hidden',
        shadowColor: '#000000',
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.06,
        shadowRadius: 10,
        elevation: 3,
    },
    itemCardSelected: {
        borderColor: CustomTheme.accentGold,
        backgroundColor: '#FFF7DB',
        shadowColor: CustomTheme.accentGold,
        shadowOpacity: 0.18,
    },
    itemTopRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    itemName: { fontSize: 16, fontWeight: '700', color: CustomTheme.textPrimary, zIndex: 2 },
    itemTextSelected: { color: CustomTheme.accentGold },

    badge: {
        width: 32,
        height: 32,
        borderRadius: 16,
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 2
    },
    badgeSelected: {
        backgroundColor: CustomTheme.accentGold,
    },
    badgeUnselected: {
        backgroundColor: '#F1F1F3',
    },

    previewArea: {
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 20,
        flex: 1,
    },
    footer: {
        paddingHorizontal: 20,
        paddingVertical: 18,
        borderTopWidth: 1,
        borderColor: 'rgba(0, 0, 0, 0.05)',
        backgroundColor: '#ffffff',
    },
    totalContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 18,
    },
    totalText: { fontSize: 17, fontWeight: '700', color: CustomTheme.textPrimary },
    totalPrice: { fontSize: 20, fontWeight: '800', color: CustomTheme.accentGold },
    proceedButton: {
        backgroundColor: CustomTheme.accentGold,
        paddingVertical: 15,
        borderRadius: 14,
        alignItems: 'center',
    },
    proceedButtonText: {
        color: '#000000',
        fontSize: 16,
        fontWeight: '700',
    },
});