import React, { useState, useEffect } from 'react';
import { View, Image, StyleSheet } from 'react-native';

// ENGINE & DATA IMPORTS
import { KURTA_RENDERS, EMBROIDERY_RENDERS, PAJAMA_RENDERS, SADRI_RENDERS } from '../../../Data/dummyData';
import { getKurtaLayerCodes, getSadriLayerCodes } from '../../../Functions/layerEngine';

// ASSETS IMPORTS
import kurta_body from '../../../../assets/images/body/kurta_body.webp';
import kurta_hand_n from '../../../../assets/images/body/kurta_hand_n.webp';
import kurta_hand_c from '../../../../assets/images/body/kurta_hand_c.webp';


const SmartLayer = ({ src, zIndex }) => {
    const [displaySrc, setDisplaySrc] = useState(src);

    useEffect(() => {
        let isMounted = true;
        if (src && src !== displaySrc) {
            // FIX: typeof string matab network url hai, number matlab local require hai
            if (typeof src === 'number') {
                setDisplaySrc(src);
            } else {
                Image.prefetch(Image.resolveAssetSource(src).uri)
                    .then(() => { if (isMounted) setDisplaySrc(src); })
                    .catch(() => { if (isMounted) setDisplaySrc(src); });
            }
        } else if (!src) {
            if (isMounted) setDisplaySrc(null);
        }
        return () => { isMounted = false; };
    }, [src, displaySrc]);

    if (!displaySrc) return null;

    return (
        <Image
            source={displaySrc}
            style={[styles.modelLayer, { zIndex: zIndex }]}
            resizeMode="contain"
        />
    );
};

export default function KurtaModel({ selections, selectedFabric, selectedButton, selectedPajamaFabric, hasSadri, sadriCode, slideIndex = 0 }) {

    // SAFETY CHECK: Jab tak data ready na ho, model render mat karo
    if (!selections || !selectedFabric) return null;

    const handsImage = selections.sleeve === "SC" ? kurta_hand_c : kurta_hand_n;

    // ENGINE KO BULAO: Kurta Arrays
    const kurtaLayers = getKurtaLayerCodes(selections, selectedButton, 0, slideIndex, false, hasSadri, sadriCode) || [];

    // ENGINE KO BULAO: Sadri Arrays
    let sadriLayers = [];
    if (hasSadri && (slideIndex === 0 || slideIndex === 4)) {
        sadriLayers = getSadriLayerCodes(sadriCode, selections, selectedButton, 0, slideIndex) || [];
    }

    const layersToRender = [...kurtaLayers, ...sadriLayers].sort((a, b) => a.zIndex - b.zIndex);

    // DATABASE: Us kapde ki saari images yahan se nikalo
    const fabricRenders = KURTA_RENDERS[selectedFabric.fabricID]?.display || {};
    // Pajama renders by fabricID (same fabric can have a matching pajama render)
    const pajamaRenders = PAJAMA_RENDERS[selectedPajamaFabric?.fabricID]?.display || {};

    return (
        <View style={styles.container}>
            {/* 1. Nanga Ladka (Z-Index: 1) */}
            <Image source={kurta_body} style={[styles.modelLayer, { zIndex: 1 }]} resizeMode="contain" />

            {/* 2. Kapde ki Layers (Z-Index: 10 se 90) */}
            {layersToRender.map((layerObj, index) => {
                if (!layerObj || !layerObj.code) return null;

                // Resolve image based on type
                let imageSource = null;
                if (layerObj.type === 'button') {
                    imageSource = selectedButton?.renders?.[layerObj.code];
                } else if (layerObj.type === 'embroidery') {
                    imageSource = EMBROIDERY_RENDERS[layerObj.collectionID]?.display?.[layerObj.code];
                } else if (layerObj.type === 'pajama') {
                    imageSource = pajamaRenders[layerObj.code];
                } else if (layerObj.type === 'sadri_fabric') {
                    imageSource = SADRI_RENDERS[layerObj.code];
                } else {
                    imageSource = fabricRenders[layerObj.code];
                }

                if (!imageSource) return null;

                return (
                    <SmartLayer
                        key={`layer-${layerObj.code}-${index}`}
                        src={imageSource}
                        zIndex={layerObj.zIndex}
                    />
                );
            })}

            {/* 3. Hands Overlay (Z-Index: 100) */}
            <Image source={handsImage} style={[styles.modelLayer, { zIndex: 100 }]} resizeMode="contain" />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
    },
    modelLayer: {
        position: 'absolute',
        width: '105%',
        height: '130%',
        marginBottom: 10
    }
});