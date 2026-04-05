// src/customizers/Kurta/components/KurtaFolded.js

import React, { useState, useEffect } from 'react';
import { View, Image, StyleSheet } from 'react-native';

// ENGINE & DATA IMPORTS
import { KURTA_RENDERS, EMBROIDERY_RENDERS, PAJAMA_RENDERS } from '../../../Data/dummyData';

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

export default function KurtaFolded({ selections, selectedFabric, selectedButton, selectedPajamaFabric }) {

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

        // Helper function to enforce the Z-Index Sandwich
        const addGarmentPart = (partName, fabricCode, baseZIndex, type = 'fabric') => {
            // 1. BOTTOM LAYER: The Fabric itself
            layersToRender.push({ code: fabricCode, zIndex: baseZIndex, type: type });

            // 2. MIDDLE LAYER: The Embroidery
            if (selections.embroideryID && ['Chest', 'Collar', 'Sleeve'].includes(partName)) {
                layersToRender.push({ 
                    code: `E-${fabricCode}${bSuffix}`, 
                    zIndex: baseZIndex + 1, 
                    type: 'embroidery',
                    collectionID: selections.embroideryID,
                    part: partName 
                });
            }
        };

        // 1. FOLDED BASE
        const foldedBase = getFoldedBase(selections.collar);
        addGarmentPart('Chest', foldedBase, 10);

        // 2. FOLDED PLACKET
        const foldedPlacket = getFoldedPlacket(foldedBase, selections.placketStyle);
        addGarmentPart('Placket', foldedPlacket, 20);

        // Override button logic for folded view setup based on collar
        const isShirtCollar = shirtCollars.includes(selections.collar);
        if (isShirtCollar) {
            if (!isRing) layersToRender.push({ code: "BHN", zIndex: 20 + 5 - 1, type: 'fabric' });
            layersToRender.push({ code: `BKN${bSuffix}`, zIndex: 20 + 5, type: 'button' });
        } else {
            if (!isRing) layersToRender.push({ code: "BHC", zIndex: 20 + 5 - 1, type: 'fabric' });
            layersToRender.push({ code: `BKC${bSuffix}`, zIndex: 20 + 5, type: 'button' });
        }

        // 3. FOLDED POCKET & FLAP LAYERS
        if (selections.pocketQty !== "00") {
            addGarmentPart('Pocket', `R${selections.pocketShape}`, 30);
            if (selections.flapYes === "1") {
                addGarmentPart('Flap', `FR${selections.flapShape}`, 32);
                if (!isRing) layersToRender.push({ code: "BHR", zIndex: 32 + 5 - 1, type: 'fabric' });
                layersToRender.push({ code: `BPR${bSuffix}`, zIndex: 32 + 5, type: 'button' });
            }

            if (selections.pocketQty === "11") {
                addGarmentPart('Pocket', `L${selections.pocketShape}`, 34);
                if (selections.flapYes === "1") {
                    addGarmentPart('Flap', `FL${selections.flapShape}`, 36);
                    if (!isRing) layersToRender.push({ code: "BHL", zIndex: 36 + 5 - 1, type: 'fabric' });
                    layersToRender.push({ code: `BPL${bSuffix}`, zIndex: 36 + 5, type: 'button' });
                }
            }
        }

        // 4. FOLDED SLEEVES & CUFFS
        if (selections.sleeve === "SN") {
            addGarmentPart('Sleeve', "SN", 55);
        } else if (selections.sleeve === "SC") {
            addGarmentPart('Sleeve', "SC", 55);
            if (selections.cuffStyle) {
                addGarmentPart('Cuff', selections.cuffStyle, 57);
                if (selections.cuffStyle.endsWith("1")) {
                    if (!isRing) layersToRender.push({ code: "BH2", zIndex: 57 + 5 - 1, type: 'fabric' });
                    layersToRender.push({ code: `BC2${bSuffix}`, zIndex: 57 + 5, type: 'button' });
                } else if (selections.cuffStyle.endsWith("2")) {
                    if (!isRing) layersToRender.push({ code: "BH4", zIndex: 57 + 5 - 1, type: 'fabric' });
                    layersToRender.push({ code: `BC4${bSuffix}`, zIndex: 57 + 5, type: 'button' });
                }
            }
        }

        // 5. FOLDED COLLAR
        addGarmentPart('Collar', selections.collar, 65);

        if (selections.collar === "CB") {
            if (!isRing) layersToRender.push({ code: "CBH", zIndex: 65 + 5 - 1, type: 'fabric' });
            layersToRender.push({ code: `CBB${bSuffix}`, zIndex: 65 + 5, type: 'button' });
        }

        // 6. FOLDED EPAULETTE
        if (selections.epaulette === "SE") {
            addGarmentPart('Epaulette', "SE", 45);
            if (!isRing) layersToRender.push({ code: "HE", zIndex: 45 + 5 - 1, type: 'fabric' });
            layersToRender.push({ code: `BE${bSuffix}`, zIndex: 45 + 5, type: 'button' });
        }

        return layersToRender;
    };

    // 3. Selected Fabric ke 'style' (Folded) folder dhoondho
    const fabricStyleRenders = KURTA_RENDERS[selectedFabric.fabricID]?.style || {};
    // Pajama style renders by fabricID
    const pajamaStyleRenders = PAJAMA_RENDERS[selectedPajamaFabric?.fabricID]?.style || {};

    return (
        <View style={styles.container}>
            {/* Dynamic Folded Garment Layers (Z-Index 10 se 90 tak) */}
            {getFoldedLayerCodes().map((layerObj, index) => {
                let imageSource = null;
                if (layerObj.type === 'button') {
                    imageSource = selectedButton?.renders?.[layerObj.code];
                } else if (layerObj.type === 'embroidery') {
                    imageSource = EMBROIDERY_RENDERS[layerObj.collectionID]?.folded?.[layerObj.code];
                } else if (layerObj.type === 'pajama') {
                    imageSource = pajamaStyleRenders[layerObj.code];
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