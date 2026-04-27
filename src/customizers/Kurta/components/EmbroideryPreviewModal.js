import React, { useMemo, useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Image, ActivityIndicator, Dimensions } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { CustomTheme } from '../../../../constants/theme';
import { getFirestoreDb } from '../../../firebase/config';
import { fetchEmbroideryUploadedCollectionsForStyleId } from '../../../firebase/catalogApi';

/**
 * Summary-style overlay: same **uploaded collections** as website admin (`kurta_collections`, etc. + `values[]`).
 */
const { width: windowWidth } = Dimensions.get('window');
const isTablet = windowWidth >= 600;

export default function EmbroideryPreviewModal({ visible, onClose, embroidery, panelMode, onApply, selectedCollectionId }) {
    const [designCatalog, setDesignCatalog] = useState([]);
    const [designsLoading, setDesignsLoading] = useState(false);

    useEffect(() => {
        if (!visible || !embroidery?.id) {
            setDesignCatalog([]);
            setDesignsLoading(false);
            return;
        }
        let cancelled = false;
        setDesignsLoading(true);
        setDesignCatalog([]);
        (async () => {
            try {
                const db = getFirestoreDb();
                if (!db) {
                    if (!cancelled) setDesignsLoading(false);
                    return;
                }
                const list = await fetchEmbroideryUploadedCollectionsForStyleId(db, embroidery.id, panelMode);
                if (!cancelled) setDesignCatalog(Array.isArray(list) ? list : []);
            } catch {
                if (!cancelled) setDesignCatalog([]);
            } finally {
                if (!cancelled) setDesignsLoading(false);
            }
        })();
        return () => {
            cancelled = true;
        };
    }, [visible, embroidery?.id, panelMode]);

    const heroSource = useMemo(() => {
        if (!embroidery) return null;
        if (panelMode === 'Sadri') {
            return embroidery.profileImageSadri || embroidery.profileImage || null;
        }
        if (panelMode === 'Kurta') {
            return embroidery.profileImageKurta || embroidery.profileImage || null;
        }
        return embroidery.profileImage || embroidery.profileImageSadri || null;
    }, [embroidery, panelMode]);

    if (!visible || !embroidery) return null;

    const hasDesignCards = designCatalog.length > 0;
    const applyCollection = (collection) => {
        if (typeof onApply === 'function' && embroidery?.id && collection) {
            onApply(collection, embroidery, panelMode);
        }
        onClose?.();
    };

    return (
        <View style={styles.overlay}>
            <TouchableOpacity style={StyleSheet.absoluteFillObject} onPress={onClose} activeOpacity={1} />
            <View style={styles.sheet}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={onClose} style={styles.closeBtnWrap}>
                        <MaterialIcons name="close" size={18} color="#1D1D1D" />
                    </TouchableOpacity>
                    <View style={styles.headerTextCol}>
                        <Text style={styles.headerTitle} numberOfLines={2}>
                            {embroidery.name || embroidery.id}
                        </Text>
                        <View style={styles.panelTitleUnderline} />
                        {!designsLoading && hasDesignCards ? (
                            <Text style={styles.headerBadge}>
                                {designCatalog.length} collection{designCatalog.length === 1 ? '' : 's'}
                            </Text>
                        ) : null}
                    </View>
                </View>

                <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator>
                    {designsLoading ? (
                        <View style={styles.loadingRow}>
                            <ActivityIndicator color={CustomTheme.accentGold} />
                            <Text style={styles.loadingText}>Loading collection…</Text>
                        </View>
                    ) : null}

                    {hasDesignCards ? (
                        <>
                            <View style={{ marginBottom: 16, alignItems: 'center' }}>
                                <Text style={styles.sectionTitle}>Collection</Text>
                                <Text style={styles.sectionSubtitle}>Tap any design to apply</Text>
                            </View>
                            <View style={styles.designGrid}>
                                {designCatalog.map((d) => (
                                    <TouchableOpacity
                                        key={`${d.segment}-${d.id}`}
                                        style={[styles.designCard, selectedCollectionId === d.id && styles.designCardSelected]}
                                        activeOpacity={0.86}
                                        onPress={() => applyCollection(d)}
                                    >
                                        <View style={styles.designImageWrap}>
                                            {d.imageUri ? (
                                                <Image
                                                    source={{ uri: d.imageUri }}
                                                    style={styles.designImage}
                                                    resizeMode="contain"
                                                />
                                            ) : (
                                                <View style={[styles.designImage, styles.designImagePlaceholder]}>
                                                    <Text style={styles.designImagePlaceholderText}>No image</Text>
                                                </View>
                                            )}
                                        </View>
                                        <Text style={styles.designTitle} numberOfLines={1}>
                                            {d.name}
                                        </Text>
                                        <View style={styles.designFooter}>
                                            <Text style={styles.designPrice}>
                                                {d.price > 0
                                                    ? `\u20B9${Math.round(d.price).toLocaleString('en-IN')}`
                                                    : 'Free'}
                                            </Text>
                                        </View>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </>
                    ) : (
                        <>
                            {!designsLoading ? (
                                <>
                                    <Text style={styles.sectionTitle}>Style catalog</Text>
                                    {heroSource ? (
                                        <Image source={heroSource} style={styles.hero} resizeMode="contain" />
                                    ) : (
                                        <View style={[styles.hero, styles.heroPlaceholder]}>
                                            <Text style={styles.heroPlaceholderText}>No catalog image</Text>
                                        </View>
                                    )}

                                    {typeof embroidery.price === 'number' || embroidery.price ? (
                                        <Text style={styles.price}>
                                            ₹{Math.round(Number(embroidery.price) || 0).toLocaleString('en-IN')}
                                        </Text>
                                    ) : null}
                                </>
                            ) : null}
                        </>
                    )}
                </ScrollView>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    overlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: CustomTheme.overlayLight,
        zIndex: 9999,
        elevation: 9999,
        justifyContent: 'center',
        alignItems: 'center',
    },
    sheet: {
        width: isTablet ? '96%' : '92%',
        maxHeight: isTablet ? '92%' : '82%',
        backgroundColor: '#FDFBF7', // Cream background
        borderRadius: 22,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#E8DCC8', // Gold border
    },
    header: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 18,
        paddingTop: 24,
        paddingBottom: 16,
        position: 'relative',
    },
    panelTitleUnderline: {
        width: 40,
        height: 2,
        backgroundColor: '#C8A96A',
        marginTop: 6,
    },
    headerTextCol: { alignItems: 'center' },
    headerTitle: {
        fontSize: 20,
        fontWeight: '800',
        color: '#1D1D1D',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    headerBadge: {
        marginTop: 6,
        fontSize: 10,
        fontWeight: '800',
        color: '#8B7355',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    closeBtn: {
        fontSize: 22,
        color: '#1D1D1D',
    },
    closeBtnWrap: {
        position: 'absolute',
        top: 20,
        right: 20,
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: '#F5F1E8',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 0.5,
        borderColor: '#D8CDB5',
        zIndex: 10,
    },
    scroll: {
        maxHeight: isTablet ? 800 : 480,
    },
    scrollContent: {
        padding: 16,
        paddingBottom: 24,
    },
    loadingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        paddingVertical: 16,
    },
    loadingText: { fontSize: 14, fontWeight: '600', color: '#64748b' },
    sectionTitle: {
        fontSize: 14,
        fontWeight: '900',
        color: '#1D1D1D',
        letterSpacing: 1,
        textTransform: 'uppercase',
    },
    sectionSubtitle: {
        fontSize: 10,
        color: '#8B7355',
        fontWeight: '700',
        marginTop: 4,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    designGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    designCard: {
        width: isTablet ? '32%' : '48%',
        backgroundColor: '#FFFBF5', // Cream card
        borderRadius: 8,
        borderWidth: 1,
        borderColor: '#E8DCC8', // Gold border
        marginBottom: 16,
        marginRight: isTablet ? '1%' : 0,
        overflow: 'hidden',
        paddingBottom: 12,
        // Premium shadow
        shadowColor: '#6B5A42',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 12,
        elevation: 4,
    },
    designCardSelected: {
        borderColor: CustomTheme.accentGold,
        backgroundColor: '#fffdf8',
        borderWidth: 2,
    },
    designImageWrap: {
        backgroundColor: '#f3f4f6',
        borderBottomWidth: 1,
        borderBottomColor: '#e5e7eb',
    },
    designImage: {
        width: '100%',
        height: isTablet ? 160 : 140, // Increased height for more space
        backgroundColor: '#f8fafc',
    },
    designImagePlaceholder: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    designImagePlaceholderText: {
        fontSize: 11,
        fontWeight: '600',
        color: '#94a3b8',
    },
    designTitle: {
        fontSize: 12,
        fontWeight: '700',
        color: '#334155',
        paddingHorizontal: 10,
        paddingTop: 8,
    },
    designFooter: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 10,
        paddingTop: 4,
    },
    designPrice: {
        fontSize: 13,
        fontWeight: '900',
        color: '#C8A96A', // Accent Gold
    },
    applyHint: {
        fontSize: 11,
        fontWeight: '700',
        color: CustomTheme.accentGold,
        paddingHorizontal: 10,
        paddingTop: 6,
    },
    hero: {
        width: '100%',
        aspectRatio: 1,
        backgroundColor: '#f8fafc',
        borderRadius: 14,
        borderWidth: 1,
        borderColor: '#e2e8f0',
    },
    heroPlaceholder: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    heroPlaceholderText: {
        color: '#64748b',
        fontWeight: '600',
    },
    price: {
        marginTop: 12,
        textAlign: 'center',
        fontSize: 18,
        fontWeight: '800',
        color: '#111',
    },
});
