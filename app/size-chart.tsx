import React, { useState } from 'react';
import {
    StyleSheet,
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    SafeAreaView,
    Platform,
    Dimensions
} from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Feather, MaterialCommunityIcons } from '@expo/vector-icons';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Indian Standard Data
const UPPER_BODY_DATA = [
    { size: 36, shoulder: 17, length: 28, chest: 39 },
    { size: 38, shoulder: 17.5, length: 29, chest: 41 },
    { size: 40, shoulder: 18, length: 29.5, chest: 43 },
    { size: 42, shoulder: 18.5, length: 30, chest: 45 },
    { size: 44, shoulder: 19, length: 30.5, chest: 47 },
    { size: 46, shoulder: 19.5, length: 31, chest: 49 },
    { size: 48, shoulder: 20, length: 32, chest: 51 },
    { size: 50, shoulder: 21, length: 32, chest: 53 },
    { size: 52, shoulder: 22, length: 33, chest: 55 },
];

const LOWER_BODY_DATA = [
    { size: 30, waist: 30, inseam: 33 },
    { size: 32, waist: 32, inseam: 33.3 },
    { size: 34, waist: 34, inseam: 33.5 },
    { size: 36, waist: 36, inseam: 34 },
    { size: 38, waist: 38, inseam: 34.5 },
    { size: 40, waist: 40, inseam: 34.8 },
    { size: 42, waist: 42, inseam: 35.1 },
    { size: 44, waist: 44, inseam: 35.7 },
    { size: 46, waist: 46, inseam: 36 },
];

export default function StandardSizeChartScreen() {
    const router = useRouter();
    const [unit, setUnit] = useState('INCHES'); // 'INCHES' or 'CM'
    const [selectedUpper, setSelectedUpper] = useState(40);
    const [selectedLower, setSelectedLower] = useState(32);

    const formatValue = (val) => {
        if (unit === 'INCHES') return val;
        return (val * 2.54).toFixed(1);
    };

    return (
        <SafeAreaView style={styles.container}>
            <Stack.Screen options={{ headerShown: false }} />

            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Feather name="arrow-left" size={24} color="#1a1a1a" />
                </TouchableOpacity>
                <View style={styles.headerTitleContainer}>
                    <Text style={styles.headerTitle}>MAVIINCI SIZE CHART</Text>
                    <Text style={styles.headerSub}>Indian Tailoring Standards</Text>
                </View>
                <View style={{ width: 44 }} />
            </View>

            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                
                {/* --- UNIT TOGGLE --- */}
                <View style={styles.toggleContainer}>
                    <TouchableOpacity 
                        style={[styles.unitBtn, unit === 'CM' && styles.unitBtnActive]} 
                        onPress={() => setUnit('CM')}
                    >
                        <Text style={[styles.unitText, unit === 'CM' && styles.unitTextActive]}>CM</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                        style={[styles.unitBtn, unit === 'INCHES' && styles.unitBtnActive]} 
                        onPress={() => setUnit('INCHES')}
                    >
                        <Text style={[styles.unitText, unit === 'INCHES' && styles.unitTextActive]}>INCHES</Text>
                    </TouchableOpacity>
                </View>

                {/* --- QUICK SELECTORS --- */}
                <View style={styles.selectorsSection}>
                    <View style={styles.selectorGroup}>
                        <View style={styles.selectorHeader}>
                            <MaterialCommunityIcons name="tshirt-crew" size={18} color="#C5A059" />
                            <Text style={styles.selectorLabel}>TOP SIZE</Text>
                        </View>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.pillScroll}>
                            {UPPER_BODY_DATA.map((item) => (
                                <TouchableOpacity
                                    key={`up-${item.size}`}
                                    style={[styles.pill, selectedUpper === item.size && styles.pillActive]}
                                    onPress={() => setSelectedUpper(item.size)}
                                >
                                    <Text style={[styles.pillText, selectedUpper === item.size && styles.pillTextActive]}>
                                        {item.size}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>

                    <View style={styles.selectorGroup}>
                        <View style={styles.selectorHeader}>
                            <MaterialCommunityIcons name="human-male-height" size={18} color="#C5A059" />
                            <Text style={styles.selectorLabel}>BOTTOM SIZE (WAIST)</Text>
                        </View>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.pillScroll}>
                            {LOWER_BODY_DATA.map((item) => (
                                <TouchableOpacity
                                    key={`low-${item.size}`}
                                    style={[styles.pill, selectedLower === item.size && styles.pillActive]}
                                    onPress={() => setSelectedLower(item.size)}
                                >
                                    <Text style={[styles.pillText, selectedLower === item.size && styles.pillTextActive]}>
                                        {item.size}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>
                    </View>
                </View>

                {/* --- TABLES --- */}
                <View style={styles.tablesContainer}>
                    {/* Upper Table */}
                    <View style={styles.tableCard}>
                        <View style={styles.tableHeader}>
                            <Text style={styles.tableHeaderText}>Upper Body Measurements ({unit})</Text>
                        </View>
                        <View style={styles.tableRowHeader}>
                            <Text style={[styles.colHeader, { flex: 1 }]}>SIZE</Text>
                            <Text style={[styles.colHeader, { flex: 1.2 }]}>SHOULDER</Text>
                            <Text style={[styles.colHeader, { flex: 1.2 }]}>LENGTH</Text>
                            <Text style={[styles.colHeader, { flex: 1.2 }]}>CHEST</Text>
                        </View>
                        {UPPER_BODY_DATA.map((row, index) => (
                            <View 
                                key={`ut-${row.size}`} 
                                style={[
                                    styles.tableRow, 
                                    index % 2 === 0 ? styles.rowEven : styles.rowOdd,
                                    row.size === selectedUpper && styles.rowSelected
                                ]}
                            >
                                <Text style={[styles.cellText, row.size === selectedUpper && styles.cellSelected, { flex: 1 }]}>{row.size}</Text>
                                <Text style={[styles.cellText, row.size === selectedUpper && styles.cellSelected, { flex: 1.2 }]}>{formatValue(row.shoulder)}</Text>
                                <Text style={[styles.cellText, row.size === selectedUpper && styles.cellSelected, { flex: 1.2 }]}>{formatValue(row.length)}</Text>
                                <Text style={[styles.cellText, row.size === selectedUpper && styles.cellSelected, { flex: 1.2 }]}>{formatValue(row.chest)}</Text>
                            </View>
                        ))}
                    </View>

                    {/* Lower Table */}
                    <View style={styles.tableCard}>
                        <View style={styles.tableHeader}>
                            <Text style={styles.tableHeaderText}>Lower Body Measurements ({unit})</Text>
                        </View>
                        <View style={styles.tableRowHeader}>
                            <Text style={[styles.colHeader, { flex: 1 }]}>SIZE</Text>
                            <Text style={[styles.colHeader, { flex: 1.5 }]}>WAIST</Text>
                            <Text style={[styles.colHeader, { flex: 1.5 }]}>INSEAM</Text>
                        </View>
                        {LOWER_BODY_DATA.map((row, index) => (
                            <View 
                                key={`lt-${row.size}`} 
                                style={[
                                    styles.tableRow, 
                                    index % 2 === 0 ? styles.rowEven : styles.rowOdd,
                                    row.size === selectedLower && styles.rowSelected
                                ]}
                            >
                                <Text style={[styles.cellText, row.size === selectedLower && styles.cellSelected, { flex: 1 }]}>{row.size}</Text>
                                <Text style={[styles.cellText, row.size === selectedLower && styles.cellSelected, { flex: 1.5 }]}>{formatValue(row.waist)}</Text>
                                <Text style={[styles.cellText, row.size === selectedLower && styles.cellSelected, { flex: 1.5 }]}>{formatValue(row.inseam)}</Text>
                            </View>
                        ))}
                    </View>
                </View>
            </ScrollView>

            {/* Sticky Footer */}
            <View style={styles.footer}>
                <View style={styles.footerContent}>
                    <View>
                        <Text style={styles.footerLabel}>SELECTED SIZES</Text>
                        <Text style={styles.footerValue}>T: {selectedUpper}  |  B: {selectedLower}</Text>
                    </View>
                    <TouchableOpacity 
                        style={styles.proceedBtn}
                        onPress={() => router.push('/checkout')}
                    >
                        <Text style={styles.proceedBtnText}>SELECT & PROCEED</Text>
                        <Feather name="arrow-right" size={18} color="#fff" />
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FDFCF9',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 15,
        backgroundColor: '#fff',
    },
    backButton: {
        width: 44,
        height: 44,
        backgroundColor: '#F5F1E8',
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E8DCC8',
    },
    headerTitleContainer: {
        alignItems: 'center',
    },
    headerTitle: {
        fontSize: 16,
        fontWeight: '900',
        color: '#1a1a1a',
        letterSpacing: 2,
    },
    headerSub: {
        fontSize: 10,
        color: '#C5A059',
        fontWeight: '700',
        textTransform: 'uppercase',
        marginTop: 2,
    },
    scrollContent: {
        paddingBottom: 120,
    },
    toggleContainer: {
        flexDirection: 'row',
        backgroundColor: '#F5F1E8',
        marginHorizontal: 25,
        marginTop: 20,
        borderRadius: 12,
        padding: 4,
        borderWidth: 1,
        borderColor: '#E8DCC8',
    },
    unitBtn: {
        flex: 1,
        height: 36,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 8,
    },
    unitBtnActive: {
        backgroundColor: '#1a1a1a',
    },
    unitText: {
        fontSize: 12,
        fontWeight: '900',
        color: '#888',
    },
    unitTextActive: {
        color: '#C5A059',
    },
    selectorsSection: {
        paddingVertical: 20,
        gap: 20,
    },
    selectorGroup: {
        paddingHorizontal: 20,
    },
    selectorHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
        gap: 8,
    },
    selectorLabel: {
        fontSize: 12,
        fontWeight: '900',
        color: '#1a1a1a',
        letterSpacing: 1,
    },
    pillScroll: {
        gap: 10,
        paddingRight: 40,
    },
    pill: {
        width: 54,
        height: 54,
        borderRadius: 27,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1.5,
        borderColor: '#F0EBE0',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
    },
    pillActive: {
        borderColor: '#C5A059',
        backgroundColor: '#1a1a1a',
    },
    pillText: {
        fontSize: 16,
        fontWeight: '800',
        color: '#1a1a1a',
    },
    pillTextActive: {
        color: '#C5A059',
    },
    tablesContainer: {
        paddingHorizontal: 20,
        gap: 30,
    },
    tableCard: {
        backgroundColor: '#fff',
        borderRadius: 20,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#F0EBE0',
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
    },
    tableHeader: {
        backgroundColor: '#1a1a1a',
        paddingVertical: 12,
        alignItems: 'center',
    },
    tableHeaderText: {
        color: '#C5A059',
        fontSize: 13,
        fontWeight: '900',
        letterSpacing: 1,
        textTransform: 'uppercase',
    },
    tableRowHeader: {
        flexDirection: 'row',
        backgroundColor: '#F5F1E8',
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#E8DCC8',
    },
    colHeader: {
        fontSize: 10,
        fontWeight: '900',
        color: '#888',
        textAlign: 'center',
    },
    tableRow: {
        flexDirection: 'row',
        paddingVertical: 12,
        borderBottomWidth: 0.5,
        borderBottomColor: '#F0EBE0',
    },
    rowEven: {
        backgroundColor: '#fff',
    },
    rowOdd: {
        backgroundColor: '#FBF9F6',
    },
    rowSelected: {
        backgroundColor: '#FDFCF9',
        borderWidth: 1.5,
        borderColor: '#C5A059',
    },
    cellText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#1a1a1a',
        textAlign: 'center',
    },
    cellSelected: {
        color: '#C5A059',
        fontWeight: '900',
    },
    footer: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#fff',
        paddingHorizontal: 20,
        paddingBottom: Platform.OS === 'ios' ? 34 : 20,
        paddingTop: 15,
        borderTopWidth: 1,
        borderTopColor: '#F0EBE0',
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -5 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
    },
    footerContent: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    footerLabel: {
        fontSize: 10,
        fontWeight: '900',
        color: '#888',
        letterSpacing: 1,
    },
    footerValue: {
        fontSize: 18,
        fontWeight: '900',
        color: '#1a1a1a',
        marginTop: 2,
    },
    proceedBtn: {
        backgroundColor: '#1a1a1a',
        height: 54,
        paddingHorizontal: 24,
        borderRadius: 12,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 10,
        borderWidth: 1,
        borderColor: '#C5A059',
    },
    proceedBtnText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '900',
        letterSpacing: 1,
    }
});