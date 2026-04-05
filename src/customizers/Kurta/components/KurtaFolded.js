// src/customizers/Kurta/components/KurtaFolded.js

import React, { useState, useEffect } from 'react';
import { View, Image, StyleSheet } from 'react-native';

// ENGINE & DATA IMPORTS
import { KURTA_RENDERS } from '../../../Data/dummyData';

// --- FLICKER-FREE LAYER COMPONENT ---
const SmartLayer = ({ src, zIndex }) => {
    const [displaySrc, setDisplaySrc] = useState(src);

    useEffect(() => {
        let isMounted = true;
        if (src && src !== displaySrc) {
            Image.prefetch(Image.resolveAssetSource(src).uri)
                .then(() => { if (isMounted) setDisplaySrc(src); })
                .catch(() => { if (isMounted) setDisplaySrc(src); }); // Fallback
        } else if (!src) {
            setDisplaySrc(null);
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

export default function KurtaFolded({ selections, selectedFabric, selectedButton }) {

    // --- ENGINE: Folded View (Style Images) Logic ---
    const getFoldedLayerCodes = () => {
        const shirtCollars = ["CR", "CB", "CT", "CS", "CE"];
        const mandarinCollars = ["CM", "CC"];

        const getFoldedBase = (collar) => {
            if (shirtCollars.includes(collar)) return "BASE";
            if (collar === "CC") return "BASE_C";
            if (mandarinCollars.includes(collar)) return "BASE_M";
            return "BASE_R";
        };

        const getFoldedPlacket = (foldedBase, placketStyle) => {
            if (foldedBase === "BASE_R") return `${placketStyle}R`;
            if (foldedBase === "BASE_C") return `${placketStyle}C`;
            return `${placketStyle}0`;
        };

        let layersToRender = [];
        const isRing = selectedButton?.material === "Ring";
        const bSuffix = "-S";

        // 1. FOLDED BASE
        const foldedBase = getFoldedBase(selections.collar);
        layersToRender.push({ code: foldedBase, zIndex: 10, type: 'fabric' });

        // 2. FOLDED PLACKET
        const foldedPlacket = getFoldedPlacket(foldedBase, selections.placketStyle);
        layersToRender.push({ code: foldedPlacket, zIndex: 20, type: 'fabric' });

        // Override button logic for folded view setup based on collar
        const isShirtCollar = shirtCollars.includes(selections.collar);
        if (isShirtCollar) {
            if (!isRing) layersToRender.push({ code: "BHN", zIndex: 21, type: 'fabric' });
            layersToRender.push({ code: `BKN${bSuffix}`, zIndex: 90, type: 'button' });
        } else {
            if (!isRing) layersToRender.push({ code: "BHC", zIndex: 21, type: 'fabric' });
            layersToRender.push({ code: `BKC${bSuffix}`, zIndex: 90, type: 'button' });
        }

        // 3. FOLDED COLLAR
        layersToRender.push({ code: selections.collar, zIndex: 50, type: 'fabric' });
        if (selections.collar === "CB") {
            if (!isRing) layersToRender.push({ code: "CBH", zIndex: 51, type: 'fabric' });
            layersToRender.push({ code: `CBB${bSuffix}`, zIndex: 94, type: 'button' });
        }

        // 4. FOLDED SLEEVES & CUFFS
        if (selections.sleeve === "SN") {
            layersToRender.push({ code: "SN", zIndex: 40, type: 'fabric' });
        } else if (selections.sleeve === "SC") {
            layersToRender.push({ code: "SC", zIndex: 40, type: 'fabric' });
            if (selections.cuffStyle) {
                layersToRender.push({ code: selections.cuffStyle, zIndex: 41, type: 'fabric' });
                if (selections.cuffStyle.endsWith("1")) {
                    if (!isRing) layersToRender.push({ code: "BH2", zIndex: 42, type: 'fabric' });
                    layersToRender.push({ code: `BC2${bSuffix}`, zIndex: 93, type: 'button' });
                } else if (selections.cuffStyle.endsWith("2")) {
                    if (!isRing) layersToRender.push({ code: "BH4", zIndex: 42, type: 'fabric' });
                    layersToRender.push({ code: `BC4${bSuffix}`, zIndex: 93, type: 'button' });
                }
            }
        }

        // 5. FOLDED POCKET & FLAP LAYERS (same mapping as full body)
        if (selections.pocketQty !== "00") {
            layersToRender.push({ code: `R${selections.pocketShape}`, zIndex: 30, type: 'fabric' });
            if (selections.flapYes === "1") {
                layersToRender.push({ code: `FR${selections.flapShape}`, zIndex: 31, type: 'fabric' });
                if (!isRing) layersToRender.push({ code: "BHR", zIndex: 32, type: 'fabric' });
                layersToRender.push({ code: `BPR${bSuffix}`, zIndex: 91, type: 'button' });
            }

            if (selections.pocketQty === "11") {
                layersToRender.push({ code: `L${selections.pocketShape}`, zIndex: 32, type: 'fabric' });
                if (selections.flapYes === "1") {
                    layersToRender.push({ code: `FL${selections.flapShape}`, zIndex: 33, type: 'fabric' });
                    if (!isRing) layersToRender.push({ code: "BHL", zIndex: 34, type: 'fabric' });
                    layersToRender.push({ code: `BPL${bSuffix}`, zIndex: 91, type: 'button' });
                }
            }
        }

        // 6. FOLDED EPAULETTE
        if (selections.epaulette === "SE") {
            layersToRender.push({ code: "SE", zIndex: 35, type: 'fabric' });
            if (!isRing) layersToRender.push({ code: "HE", zIndex: 36, type: 'fabric' });
            layersToRender.push({ code: `BE${bSuffix}`, zIndex: 92, type: 'button' });
        }

        return layersToRender;
    };

    // 3. Selected Fabric ke 'style' (Folded) folder dhoondho
    const fabricStyleRenders = KURTA_RENDERS[selectedFabric.fabricID]?.style || {};

    return (
        <View style={styles.container}>
            {/* Dynamic Folded Garment Layers (Z-Index 10 se 90 tak) */}
            {getFoldedLayerCodes().map((layerObj, index) => {
                let imageSource = null;
                if (layerObj.type === 'button') {
                    imageSource = selectedButton?.renders?.[layerObj.code];
                } else {
                    imageSource = fabricStyleRenders[layerObj.code];
                }

                if (!imageSource) return null; // Agar image folder mein nahi hai, toh chhod do

                return (
                    <SmartLayer
                        key={`folded-${layerObj.code}-${index}`}
                        src={imageSource}
                        zIndex={layerObj.zIndex}
                    />
                );
            })}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#EAEAEA', // Same as background so it blends
    },
    modelLayer: {
        position: 'absolute',
        width: '100%',
        height: '105%',
        marginTop: -30
    }
});