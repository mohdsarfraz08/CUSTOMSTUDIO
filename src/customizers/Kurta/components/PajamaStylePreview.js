import React from 'react';
import { View, Image, StyleSheet, Dimensions } from 'react-native';
import { PAJAMA_RENDERS } from '../../../Data/dummyData';

const { width } = Dimensions.get('window');

export default function PajamaStylePreview({ selections, selectedPajamaFabric }) {
    if (!selectedPajamaFabric) return null;

    const pajamaType = selections.pajamaType || "PJ";
    const beltType = selections.beltType || "R";

    // Same logic as KurtaFolded to get the unified style image code
    const pajamaStyleCode = (pajamaType === 'PP' || pajamaType === 'PB')
        ? pajamaType                         // e.g. "PB"
        : `${pajamaType}-${beltType}`;       // e.g. "PA-E"

    const pajamaStyleRenders = PAJAMA_RENDERS[selectedPajamaFabric.fabricID]?.style || {};
    const imageSource = pajamaStyleRenders[pajamaStyleCode];

    return (
        <View style={styles.container}>
            {imageSource ? (
                <Image
                    source={imageSource}
                    style={styles.image}
                    resizeMode="contain"
                />
            ) : (
                <View style={[styles.image, { backgroundColor: 'transparent' }]} />
            )}
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
    },
    image: {
        width: width * 1.9,
        height: width * 1.9,
    }
});
