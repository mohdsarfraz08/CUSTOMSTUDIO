import React from 'react';
import { useLocalSearchParams } from 'expo-router';
// CHAGE: Ek aur '../' add kiya hai taaki wo (tabs) aur app folder se bahar nikale
import KurtaMain from '../../src/customizers/Kurta/KurtaMain';

export default function KurtaScreen() {
    const { preset, sid } = useLocalSearchParams<{ preset?: string; sid?: string }>();
    return (
        <KurtaMain
            presetParam={typeof preset === 'string' ? preset : undefined}
            presetIdParam={typeof sid === 'string' ? sid : undefined}
        />
    );
}