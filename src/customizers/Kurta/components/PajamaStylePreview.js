import React, { useEffect, useRef, useState } from 'react';
import { View, Image, StyleSheet } from 'react-native';
import { useFirebaseCatalog } from '../../../context/FirebaseCatalogContext';
import { pickFabricRenderEntry } from '../../../firebase/catalogApi';
import { useResponsive } from '../../../../hooks/useResponsive';
import pajama_body from '../../../../assets/images/pajama_body/pajama_body.webp';

export default function PajamaStylePreview({ selections, selectedPajamaFabric }) {
    const { pajamaRenders: PAJAMA_RENDERS } = useFirebaseCatalog();
    const { isMobile, isTablet, isDesktop, width } = useResponsive();

    const pajamaType = selections?.pajamaType || "PJ";
    const beltType = selections?.beltType || "R";

    // Yahan aap apne screens ke hisab se width/height 
    // manually edit kar sakte hain taaki testing aasan ho.
    const getDynamicPajamaStyle = () => {
        // # MOBILE SCREEN
        if (isMobile) {
            return {
                width: width * 1.9,
                height: width * 1.9,
            };
        }
        // # TABLET SCREEN
        if (isTablet) {
            return {
                width: width * 1.5,
                height: width * 1.5,
            };
        }
        // # TV SCREEN (Commercial Display)
        if (isDesktop) {
            return {
                width: width * 1.2, // Portrait screen ke liye ise change karein
                height: width * 1.2,
            };
        }
        return {};
    };

    const dynamicStyle = getDynamicPajamaStyle();

    // Same logic as KurtaFolded to get the unified style image code
    const pajamaStyleCode = (pajamaType === 'PP' || pajamaType === 'PB')
        ? pajamaType                         // e.g. "PB"
        : `${pajamaType}-${beltType}`;       // e.g. "PA-E"

    const pajamaEntry = pickFabricRenderEntry(PAJAMA_RENDERS, selectedPajamaFabric);
    const selectedPajamaRenderMap = pajamaEntry?.style && Object.keys(pajamaEntry.style).length > 0 ? pajamaEntry.style : null;
    const defaultPajamaRenderMap = PAJAMA_RENDERS['FAB_001']?.style || {};
    const pajamaStyleRenders =
        selectedPajamaRenderMap && Object.keys(selectedPajamaRenderMap).length > 0
            ? selectedPajamaRenderMap
            : defaultPajamaRenderMap;
    const imageSource = selectedPajamaFabric
        ? pajamaStyleRenders[pajamaStyleCode] || defaultPajamaRenderMap[pajamaStyleCode] || null
        : null;
    const sourceKey = typeof imageSource === 'number'
        ? `r:${imageSource}`
        : (imageSource?.uri ? `u:${imageSource.uri}` : '');
    const [displaySource, setDisplaySource] = useState(imageSource || null);
    const [pendingSource, setPendingSource] = useState(null);
    const [pendingToken, setPendingToken] = useState(0);
    const tokenRef = useRef(0);
    const pendingSourceRef = useRef(null);

    useEffect(() => {
        if (!imageSource || !sourceKey) return;
        const displayKey = typeof displaySource === 'number'
            ? `r:${displaySource}`
            : (displaySource?.uri ? `u:${displaySource.uri}` : '');
        const pendingKey = typeof pendingSource === 'number'
            ? `r:${pendingSource}`
            : (pendingSource?.uri ? `u:${pendingSource.uri}` : '');

        // Warm up network image so switch feels instant.
        if (imageSource?.uri) {
            Image.prefetch(imageSource.uri).catch(() => { });
        }

        if (!displaySource) {
            setDisplaySource(imageSource);
            return;
        }

        if (sourceKey !== displayKey && sourceKey !== pendingKey) {
            tokenRef.current += 1;
            setPendingSource(imageSource);
            pendingSourceRef.current = imageSource;
            setPendingToken(tokenRef.current);
        }
    }, [imageSource, sourceKey, displaySource, pendingSource]);

    if (!selectedPajamaFabric) return null;

    return (
        <View style={styles.container}>
            <Image
                source={pajama_body}
                style={[styles.image, styles.bodyImage, dynamicStyle]}
                resizeMode="contain"
            />
            {displaySource ? (
                <Image
                    source={displaySource}
                    style={[styles.image, dynamicStyle]}
                    resizeMode="contain"
                    fadeDuration={0}
                />
            ) : (
                <View style={[styles.image, dynamicStyle, { backgroundColor: 'transparent' }]} />
            )}
            {pendingSource ? (
                <Image
                    key={`pending-${pendingToken}`}
                    source={pendingSource}
                    style={[styles.image, dynamicStyle, styles.imageOverlay]}
                    resizeMode="contain"
                    fadeDuration={0}
                    onLoad={() => {
                        if (pendingToken === tokenRef.current) {
                            setDisplaySource(pendingSourceRef.current || pendingSource);
                            setPendingSource(null);
                            pendingSourceRef.current = null;
                        }
                    }}
                    onError={() => {
                        if (pendingToken === tokenRef.current) {
                            // Keep previous render visible on errors; never blank out current.
                            setPendingSource(null);
                            pendingSourceRef.current = null;
                        }
                    }}
                />
            ) : null}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        height: '100%',
        transform: [{ translateY: -18 }],
    },
    // Default image style. dynamicStyle ise overwrite karega.
    image: {
        width: 300,
        height: 300,
        zIndex: 2,
    },
    bodyImage: {
        position: 'absolute',
        zIndex: 1,
    },
    imageOverlay: {
        position: 'absolute',
        opacity: 0,
        zIndex: 3,
    },
});
