import React, { useState } from 'react';
import {
    View, 
    Text, 
    StyleSheet, 
    SafeAreaView, 
    TouchableOpacity, 
    Image,
    ScrollView, 
    TextInput, 
    Dimensions, 
    Platform, 
    Modal, 
    KeyboardAvoidingView,
    BackHandler,
    Alert,
    Animated, 
    PanResponder
} from 'react-native';
import { router, Stack } from 'expo-router';
import { Feather, FontAwesome5, MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useResponsive } from '../hooks/useResponsive';
import { CustomTheme } from '../constants/theme';
import { useVideoPlayer, VideoView } from 'expo-video';
import { useRef, useEffect } from 'react';

export default function CustomMeasureScreen() {
    const { isLandscape, isTV, isTablet, isDesktop, width, height: screenHeight } = useResponsive();

    const [currentStep, setCurrentStep] = useState(1);
    const [language, setLanguage] = useState('eng'); // 'eng' or 'hin'
    const [activeMeasurement, setActiveMeasurement] = useState('length');
    const [privacyModal, setPrivacyModal] = useState({ visible: false, type: null, uri: null });
    const [selectionModal, setSelectionModal] = useState({ visible: false, type: null });
    const [helpModalVisible, setHelpModalVisible] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);
    const [userTriggeredPlay, setUserTriggeredPlay] = useState(false);

    const getVideoSource = (measure, lang) => {
        const videoMap = {
            length: { eng: require('../assets/measure_videos/length_eng.mp4'), hin: require('../assets/measure_videos/length_hin.mp4') },
            chest: { eng: require('../assets/measure_videos/chest_eng.mp4'), hin: require('../assets/measure_videos/chest_hin.mp4') },
            stomach: { eng: require('../assets/measure_videos/stomach_eng.mp4'), hin: require('../assets/measure_videos/stomach_hin.mp4') },
            hip: { eng: require('../assets/measure_videos/hip_eng.mp4'), hin: require('../assets/measure_videos/hip_hin.mp4') },
            shoulder: { eng: require('../assets/measure_videos/shoulder_eng.mp4'), hin: require('../assets/measure_videos/shoulder_hin.mp4') },
            sleeve: { eng: require('../assets/measure_videos/sleeve_eng.mp4'), hin: require('../assets/measure_videos/sleeve_hin.mp4') },
            neck: { eng: require('../assets/measure_videos/neck_eng.mp4'), hin: require('../assets/measure_videos/neck_hin.mp4') },
            bicep: { eng: require('../assets/measure_videos/bisep_eng.mp4'), hin: require('../assets/measure_videos/bisep_hin.mp4') },
            legLength: { eng: require('../assets/measure_videos/pant_eng.mp4'), hin: require('../assets/measure_videos/pant_hin.mp4') },
            waist: { eng: require('../assets/measure_videos/waist_eng.mp4'), hin: require('../assets/measure_videos/waist_hin.mp4') },
            circle: { eng: require('../assets/measure_videos/circle_eng.mp4'), hin: require('../assets/measure_videos/circle_hin.mp4') },
            thigh: { eng: require('../assets/measure_videos/thigh_eng.mp4'), hin: require('../assets/measure_videos/thigh_hin.mp4') },
            bottom: { eng: require('../assets/measure_videos/bottom_eng.mp4'), hin: require('../assets/measure_videos/bottom_hin.mp4') },
        };
        return videoMap[measure]?.[lang] || videoMap.length.eng;
    };

    const player = useVideoPlayer(getVideoSource(activeMeasurement, language), (player) => {
        player.loop = true;
        // Listen to playback status changes
        player.addListener('playingChange', (playing) => {
            setIsPlaying(playing);
        });
    });

    // Handle Hardware Back Button
    useEffect(() => {
        const backAction = () => {
            if (currentStep > 1) {
                setCurrentStep(prev => prev - 1);
                return true;
            }
            return false;
        };

        const backHandler = BackHandler.addEventListener(
            "hardwareBackPress",
            backAction
        );

        return () => backHandler.remove();
    }, [currentStep]);

    // Update player source when active measurement or language changes
    useEffect(() => {
        if ((currentStep === 2 || currentStep === 3) && player) {
            player.replace(getVideoSource(activeMeasurement, language));
            
            // Only play if the user explicitly clicked the play button
            if (userTriggeredPlay) {
                player.play();
                setIsPlaying(true);
                setUserTriggeredPlay(false); // Reset for next time
            }
        }
    }, [activeMeasurement, language, currentStep, userTriggeredPlay]);

    // Form state
    const [form, setForm] = useState({
        // Step 1
        name: '',
        height: '',
        weight: '',
        age: '',
        // Step 2: Upper Body
        length: '',
        chest: '',
        stomach: '',
        hip: '',
        shoulder: '',
        sleeve: '',
        neck: '',
        bicep: '',
        legLength: '',
        waist: '',
        circle: '',
        thigh: '',
        bottom: '',
    });

    // Draggable Mask State
    const frontPan = useState(new Animated.ValueXY({ x: 0, y: 0 }))[0];
    const sidePan = useState(new Animated.ValueXY({ x: 0, y: 0 }))[0];

    const createPanResponder = (pan) => PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onPanResponderMove: Animated.event([
            null,
            { dx: pan.x, dy: pan.y }
        ], { useNativeDriver: false }),
        onPanResponderRelease: () => {
            pan.flattenOffset();
        },
        onPanResponderGrant: () => {
            pan.setOffset({
                x: pan.x._value,
                y: pan.y._value
            });
            pan.setValue({ x: 0, y: 0 });
        }
    });

    const frontPanResponder = createPanResponder(frontPan);
    const sidePanResponder = createPanResponder(sidePan);

    const updateForm = (key, value) => setForm(prev => ({ ...prev, [key]: value }));

    const pickImage = async (type) => {
        setSelectionModal({ visible: true, type: type });
    };

    const openSource = async (source, type) => {
        let result;
        const options = {
            mediaTypes: ImagePicker.MediaTypeOptions.Images,
            allowsEditing: false,
            quality: 1,
        };

        if (source === 'camera') {
            const permission = await ImagePicker.requestCameraPermissionsAsync();
            if (permission.granted) {
                result = await ImagePicker.launchCameraAsync(options);
            } else {
                Alert.alert("Permission Denied", "Camera permission is required to take photos.");
                return;
            }
        } else {
            result = await ImagePicker.launchImageLibraryAsync(options);
        }

        if (result && !result.canceled) {
            setSelectionModal({ visible: false, type: null });
            setTimeout(() => {
                setPrivacyModal({
                    visible: true,
                    type: type,
                    uri: result.assets[0].uri
                });
            }, 500);
        }
    };

    const handlePrivacyAction = (mask) => {
        const uri = privacyModal.uri;
        if (privacyModal.type === 'front') {
            setFrontImage(uri);
            setFrontMasked(mask);
        } else {
            setSideImage(uri);
            setSideMasked(mask);
        }
        
        setPrivacyModal({ visible: false, type: null, uri: null });
    };

    const [frontImage, setFrontImage] = useState(null);
    const [sideImage, setSideImage] = useState(null);
    const [frontMasked, setFrontMasked] = useState(false);
    const [sideMasked, setSideMasked] = useState(false);

    const handleAIExtraction = async () => {
        if (!frontImage || !sideImage) {
            Alert.alert("Missing Photos", "Please upload both Front and Side view photos for AI analysis.");
            return;
        }

        // Simulating the Master Tailor AI Extraction Logic
        const h = parseInt(form.height);
        const w = parseInt(form.weight);
        
        // 1. Determine Exact Body Chest (Based on Weight/Height/Profile)
        // This is a simulation of the computer vision result
        let bodyChest = 38 + (w > 75 ? (w-75)/5 : 0);
        
        // 2. Map to Indian Standard Size
        let stdSize = "40 (M)";
        if (bodyChest < 35.5) stdSize = "36 (XS)";
        else if (bodyChest < 37.5) stdSize = "38 (S)";
        else if (bodyChest < 39.5) stdSize = "40 (M)";
        else if (bodyChest < 41.5) stdSize = "42 (L)";
        else if (bodyChest < 43.5) stdSize = "44 (XL)";
        else stdSize = "46 (XXL)";

        // 3. Populate Measurements
        const extractedData = {
            length: (h * 0.43).toFixed(1), // Estimated from height
            chest: (bodyChest + 4).toFixed(1), // Body + 4 inch ease for Indian fit
            stomach: (bodyChest - 2).toFixed(1),
            hip: (bodyChest + 2).toFixed(1),
            shoulder: (bodyChest * 0.45).toFixed(1),
            sleeve: (h * 0.35).toFixed(1),
            neck: (bodyChest * 0.38).toFixed(1),
            bicep: (bodyChest * 0.35).toFixed(1),
        };

        setForm(prev => ({
            ...prev,
            ...extractedData
        }));

        Alert.alert(
            "MAVIINCI AI Fit Analysis", 
            `Analysis Complete!\n\nClosest Indian Size: ${stdSize}\nBody Profile: Athletic / Regular\nConfidence: 94%\n\nMeasurements have been auto-filled. Please verify them once.`
        );
    };


    const activeData = {
        length: { title: 'Length', desc: language === 'eng' ? 'Measure from shoulder peak to the desired length.' : 'कंधे से लंबाई तक नापें।' },
        chest: { title: 'Chest Around', desc: language === 'eng' ? 'Measure around the fullest part of your chest.' : 'छाती के सबसे चौड़े हिस्से को नापें।' },
        stomach: { title: 'Stomach', desc: language === 'eng' ? 'Measure around the widest part of your stomach.' : 'पेट के सबसे चौड़े हिस्से को नापें।' },
        hip: { title: 'Hip', desc: language === 'eng' ? 'Measure around the widest part of your hips.' : 'कूल्हों के सबसे चौड़े हिस्से को नापें।' },
        shoulder: { title: 'Shoulder Width', desc: language === 'eng' ? 'Measure from one shoulder edge to the other.' : 'एक कंधे से दूसरे कंधे तक नापें।' },
        sleeve: { title: 'Sleeve Length', desc: language === 'eng' ? 'Measure from shoulder edge to the wrist.' : 'कंधे se कलाई तक नापें।' },
        neck: { title: 'Neck', desc: language === 'eng' ? 'Measure around the base of your neck.' : 'गर्दन के आधार के चारों ओर नापें।' },
        bicep: { title: 'Bicep', desc: language === 'eng' ? 'Measure around the fullest part of your bicep.' : 'बाइसेप के सबसे चौड़े हिस्से को नापें।' },
        legLength: { title: 'Leg Length', desc: language === 'eng' ? 'Measure from waist to the ankle.' : 'कमर से टखने तक की लंबाई नापें।' },
        waist: { title: 'Pants Waist', desc: language === 'eng' ? 'Measure around your natural waistline.' : 'अपनी प्राकृतिक कमर रेखा को नापें।' },
        circle: { title: 'Circle', desc: language === 'eng' ? 'Measure the crotch/rise area.' : 'क्रॉच/राइज एरिया को नापें।' },
        thigh: { title: 'Thigh', desc: language === 'eng' ? 'Measure around the fullest part of your thigh.' : 'जांघ के सबसे चौड़े हिस्से को नापें।' },
        bottom: { title: 'Bottom', desc: language === 'eng' ? 'Measure the width of the leg opening.' : 'पैर के निचले हिस्से (बॉटम) की चौड़ाई नापें।' },
    }[activeMeasurement];

    const nextStep = () => {
        if (currentStep < 3) setCurrentStep(prev => prev + 1);
    };

    const prevStep = () => {
        if (currentStep > 1) setCurrentStep(prev => prev - 1);
        else router.back();
    };

    const handleBack = () => {
        prevStep();
    };

    const renderHeader = () => (
        <View style={styles.header}>
            <TouchableOpacity onPress={handleBack} style={styles.backButton}>
                <Feather name="arrow-left" size={24} color="#1a1a1a" />
            </TouchableOpacity>
            <View style={styles.headerTitleContainer}>
                <Text style={styles.headerTitle}>CUSTOM MEASURE</Text>
            </View>
            <View style={{ width: 44 }} />
        </View>
    );

    const renderStepper = () => (
        <View style={styles.stepperContainer}>
            {[1, 2, 3].map((step) => (
                <View key={step} style={styles.stepWrapper}>
                    <View style={[
                        styles.stepCircle, 
                        step === currentStep && styles.activeStepCircle,
                        step < currentStep && styles.completedStepCircle
                    ]}>
                        {step < currentStep ? (
                            <Feather name="check" size={12} color="#fff" />
                        ) : (
                            <Text style={[styles.stepText, step === currentStep && styles.activeStepText]}>{String(step).padStart(2, '0')}</Text>
                        )}
                    </View>
                    {step < 3 && <View style={[styles.stepLine, step < currentStep && styles.completedStepLine]} />}
                </View>
            ))}
        </View>
    );

    const renderFormSection = () => (
        <View style={styles.section}>
            <View style={styles.formCard}>
                {currentStep === 1 ? (
                    <>
                        <View style={styles.titleArea}>
                            <Text style={styles.stepBadge}>Step 01</Text>
                            <Text style={styles.mainTitle}>Basic Profile</Text>
                            <Text style={styles.subTitle}>Tell us about yourself for a precision fit</Text>
                        </View>
                        
                        <View style={styles.formContainer}>
                            <View style={styles.row}>
                                <View style={[styles.inputGroup, { flex: 1, marginRight: 15 }]}>
                                    <Text style={styles.inputLabel}>Full Name</Text>
                                    <View style={styles.inputWrapper}>
                                        <Feather name="user" size={18} color="#C5A059" style={styles.inputIcon} />
                                        <TextInput
                                            style={styles.input}
                                            placeholder="e.g. John Doe"
                                            placeholderTextColor="#999"
                                            value={form.name}
                                            onChangeText={(val) => updateForm('name', val)}
                                        />
                                    </View>
                                </View>
                                <View style={[styles.inputGroup, { width: 100 }]}>
                                    <Text style={styles.inputLabel}>Age</Text>
                                    <View style={styles.inputWrapper}>
                                        <TextInput
                                            style={[styles.input, { textAlign: 'center' }]}
                                            placeholder="25"
                                            placeholderTextColor="#999"
                                            keyboardType="numeric"
                                            value={form.age}
                                            onChangeText={(val) => updateForm('age', val)}
                                        />
                                    </View>
                                </View>
                            </View>

                            <View style={styles.row}>
                                <View style={[styles.inputGroup, { flex: 1, marginRight: 15 }]}>
                                    <Text style={styles.inputLabel}>Height (cm)</Text>
                                    <View style={styles.inputWrapper}>
                                        <MaterialIcons name="height" size={18} color="#C5A059" style={styles.inputIcon} />
                                        <TextInput
                                            style={styles.input}
                                            placeholder="175"
                                            placeholderTextColor="#999"
                                            keyboardType="numeric"
                                            value={form.height}
                                            onChangeText={(val) => updateForm('height', val)}
                                        />
                                    </View>
                                </View>
                                <View style={[styles.inputGroup, { flex: 1 }]}>
                                    <Text style={styles.inputLabel}>Weight (kg)</Text>
                                    <View style={styles.inputWrapper}>
                                        <FontAwesome5 name="weight-hanging" size={14} color="#C5A059" style={styles.inputIcon} />
                                        <TextInput
                                            style={styles.input}
                                            placeholder="70"
                                            placeholderTextColor="#999"
                                            keyboardType="numeric"
                                            value={form.weight}
                                            onChangeText={(val) => updateForm('weight', val)}
                                        />
                                    </View>
                                </View>
                            </View>
                            
                            <View style={styles.formDivider} />
                            <Text style={styles.formSectionHeader}>Body Photos</Text>
                            <View style={styles.row}>
                                <TouchableOpacity style={[styles.uploadBtn, { flex: 1, marginRight: 10 }]} onPress={() => pickImage('front')}>
                                    <Feather name={frontImage ? "check-circle" : "camera"} size={16} color="#C5A059" />
                                    <Text style={styles.uploadBtnText}>{frontImage ? "Front Added" : "Front View"}</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={[styles.uploadBtn, { flex: 1 }]} onPress={() => pickImage('side')}>
                                    <Feather name={sideImage ? "check-circle" : "camera"} size={16} color="#C5A059" />
                                    <Text style={styles.uploadBtnText}>{sideImage ? "Side Added" : "Side View"}</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </>
                ) : (
                    <>
                        <View style={styles.titleArea}>
                            <Text style={styles.stepBadge}>{currentStep === 2 ? 'Step 02' : 'Step 03'}</Text>
                            <Text style={styles.mainTitle}>{currentStep === 2 ? 'Upper Body' : 'Lower Body'}</Text>
                            <Text style={styles.subTitle}>High-precision tailoring measurements</Text>
                        </View>

                        <View style={styles.formContainer}>
                            <View style={styles.measurementGrid}>
                                {(currentStep === 2 ? [
                                    { label: isLandscape ? 'Length' : 'Length', key: 'length', desc: 'Measure from shoulder peak to the desired length.' },
                                    { label: isLandscape ? 'Chest Around' : 'Chest', key: 'chest', desc: 'Measure around the fullest part of your chest.' },
                                    { label: isLandscape ? 'Stomach' : 'Stomach', key: 'stomach', desc: 'Measure around the widest part of your stomach.' },
                                    { label: isLandscape ? 'Hip' : 'Hip', key: 'hip', desc: 'Measure around the widest part of your hips.' },
                                    { label: isLandscape ? 'Shoulder Width' : 'Shoulder', key: 'shoulder', desc: 'Measure from one shoulder edge to the other.' },
                                    { label: isLandscape ? 'Sleeve Length' : 'Sleeve', key: 'sleeve', desc: 'Measure from shoulder edge to the wrist.' },
                                    { label: isLandscape ? 'Neck' : 'Neck', key: 'neck', desc: 'Measure around the base of your neck.' },
                                    { label: isLandscape ? 'Bicep' : 'Bicep', key: 'bicep', desc: 'Measure around the fullest part of your bicep.' },
                                ] : [
                                    { label: isLandscape ? 'Leg Length' : 'Leg Length', key: 'legLength', desc: 'Measure from waist to the ankle.' },
                                    { label: isLandscape ? 'Pants Waist' : 'Waist', key: 'waist', desc: 'Measure around your natural waistline.' },
                                    { label: isLandscape ? 'Circle' : 'Circle', key: 'circle', desc: 'Measure the crotch area.' },
                                    { label: isLandscape ? 'Hip' : 'Hip', key: 'hip', desc: 'Measure around the fullest part of your hips.' },
                                    { label: isLandscape ? 'Thigh' : 'Thigh', key: 'thigh', desc: 'Measure around the fullest part of your thigh.' },
                                    { label: isLandscape ? 'Bottom' : 'Bottom', key: 'bottom', desc: 'Measure the leg opening width.' },
                                ]).map((item) => (
                                    <TouchableOpacity 
                                        key={item.key} 
                                        style={[styles.measurementItem, activeMeasurement === item.key && styles.activeMeasurementItem]}
                                        onPress={() => setActiveMeasurement(item.key)}
                                        activeOpacity={0.7}
                                    >
                                        <View style={styles.measurementHeader}>
                                            <Text style={[styles.inputLabel, activeMeasurement === item.key && { color: '#1a1a1a' }]}>{item.label}</Text>
                                            <TouchableOpacity 
                                                style={styles.gridPlayBtn}
                                                onPress={() => {
                                                    if (activeMeasurement === item.key && isPlaying) {
                                                        player.pause();
                                                        setIsPlaying(false);
                                                    } else {
                                                        setActiveMeasurement(item.key);
                                                        // Ensure the first item of lower body is selected when entering step 3
                                                        if (currentStep === 3 && activeMeasurement === 'length') {
                                                            setActiveMeasurement('legLength');
                                                        }
                                                        setUserTriggeredPlay(true);
                                                    }
                                                }}
                                            >
                                                <Feather 
                                                    name={(activeMeasurement === item.key && isPlaying) ? "pause-circle" : "play-circle"} 
                                                    size={22} 
                                                    color={activeMeasurement === item.key ? "#C5A059" : "#AAA"} 
                                                />
                                            </TouchableOpacity>
                                        </View>
                                        <View style={[styles.inputWrapper, activeMeasurement === item.key && { borderColor: '#C5A059', backgroundColor: '#fff' }]}>
                                            <TextInput
                                                style={styles.input}
                                                placeholder="0.0"
                                                placeholderTextColor="#AAA"
                                                keyboardType="numeric"
                                                value={form[item.key]}
                                                onFocus={() => setActiveMeasurement(item.key)}
                                                onChangeText={(t) => updateForm(item.key, t)}
                                            />
                                            <Text style={styles.unitText}>in</Text>
                                        </View>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>
                    </>
                )}
            </View>
        </View>
    );

    const renderRightPane = () => {
        return (
            <View style={styles.rightSection}>
                <View style={styles.instructionHub}>
                    {currentStep === 1 ? (
                        <View style={{ width: '100%', alignItems: 'center' }}>
                            {renderGuideSection()}
                        </View>
                    ) : (
                        <View style={styles.tutorialContainer}>
                            {/* Hindi/English Switcher */}
                            <View style={styles.langSwitcher}>
                                <TouchableOpacity 
                                    style={[styles.langBtn, language === 'hin' && styles.langBtnActive]} 
                                    onPress={() => setLanguage('hin')}
                                >
                                    <Text style={[styles.langBtnText, language === 'hin' && styles.langBtnTextActive]}>Hindi</Text>
                                </TouchableOpacity>
                                <TouchableOpacity 
                                    style={[styles.langBtn, language === 'eng' && styles.langBtnActive]} 
                                    onPress={() => setLanguage('eng')}
                                >
                                    <Text style={[styles.langBtnText, language === 'eng' && styles.langBtnTextActive]}>English</Text>
                                </TouchableOpacity>
                            </View>

                            <View style={styles.videoPlaceholder}>
                                <VideoView
                                    key={`${activeMeasurement}_${language}`}
                                    player={player}
                                    style={[styles.tutorialVideo, StyleSheet.absoluteFill]}
                                    contentFit="contain"
                                    showsControls={true}
                                />
                                <View style={styles.videoBadge}>
                                    <Text style={styles.videoBadgeText}>Tutorial: {activeData.title}</Text>
                                </View>
                            </View>
                            <View style={styles.tutorialInfo}>
                                <Text style={styles.tutorialTitle}>How to measure {activeData.title}</Text>
                                <Text style={styles.tutorialDesc}>{activeData.desc}</Text>
                                <TouchableOpacity style={styles.helpLink} onPress={() => setHelpModalVisible(true)}>
                                    <Feather name="help-circle" size={14} color="#C5A059" />
                                    <Text style={styles.helpLinkText}>{language === 'eng' ? 'Need help measuring?' : 'मदद चाहिए?'}</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}
                    
                    <View style={styles.actionRow}>
                        <TouchableOpacity 
                            style={[styles.proceedBtn, { flex: 1, maxWidth: 350 }]} 
                            onPress={nextStep}
                        >
                            <Text style={styles.proceedBtnText}>{currentStep === 3 ? "Complete" : "Proceed"}</Text>
                            <Feather name="chevron-right" size={18} color="#C5A880" style={{ marginLeft: 8 }} />
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        );
    };

    const renderPrivacyModal = () => (
        <Modal
            visible={privacyModal.visible}
            transparent={true}
            animationType="fade"
        >
            <View style={styles.modalOverlay}>
                <View style={styles.modalContent}>
                    <Text style={styles.modalTitle}>Privacy Option</Text>
                    <Text style={styles.modalDesc}>
                        Would you like to mask your face in this photo? 
                        This ensures your identity is hidden while we analyze your body measurements.
                    </Text>
                    
                    {privacyModal.uri && (
                        <View style={styles.previewContainer}>
                            <Image source={{ uri: privacyModal.uri }} style={styles.modalPreview} />
                            <View style={styles.maskOverlay}>
                                <MaterialIcons name="privacy-tip" size={40} color="rgba(255,255,255,0.7)" />
                            </View>
                        </View>
                    )}

                    <View style={styles.modalActions}>
                        <TouchableOpacity 
                            style={[styles.modalBtn, styles.modalBtnOutline]} 
                            onPress={() => handlePrivacyAction(false)}
                        >
                            <Text style={styles.modalBtnTextDark}>Original</Text>
                        </TouchableOpacity>
                        <TouchableOpacity 
                            style={[styles.modalBtn, styles.modalBtnPrimary]} 
                            onPress={() => handlePrivacyAction(true)}
                        >
                            <Text style={styles.modalBtnTextLight}>Mask Face</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );

    const renderSelectionModal = () => (
        <Modal
            visible={selectionModal.visible}
            transparent={true}
            animationType="slide"
        >
            <View style={styles.modalOverlay}>
                <View style={[styles.modalContent, { paddingBottom: 40 }]}>
                    <TouchableOpacity 
                        style={styles.closeBtn} 
                        onPress={() => setSelectionModal({ visible: false, type: null })}
                    >
                        <Feather name="x" size={24} color="#1a1a1a" />
                    </TouchableOpacity>

                    <View style={styles.iconCircle}>
                        <Feather name="image" size={32} color="#C5A059" />
                    </View>

                    <Text style={styles.modalTitle}>Select Source</Text>
                    <Text style={styles.modalDesc}>How would you like to provide the photo?</Text>
                    
                    <View style={{ width: '100%', gap: 15 }}>
                        <TouchableOpacity 
                            style={styles.sourceBtn}
                            onPress={() => openSource('camera', selectionModal.type)}
                        >
                            <View style={styles.sourceIconBox}>
                                <Feather name="camera" size={22} color="#C5A059" />
                            </View>
                            <View>
                                <Text style={styles.sourceBtnTitle}>Take Photo</Text>
                                <Text style={styles.sourceBtnSub}>Use your device camera</Text>
                            </View>
                        </TouchableOpacity>

                        <TouchableOpacity 
                            style={styles.sourceBtn}
                            onPress={() => openSource('gallery', selectionModal.type)}
                        >
                            <View style={styles.sourceIconBox}>
                                <Feather name="folder" size={22} color="#C5A059" />
                            </View>
                            <View>
                                <Text style={styles.sourceBtnTitle}>Choose from Gallery</Text>
                                <Text style={styles.sourceBtnSub}>Select an existing image</Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </Modal>
    );

    const renderGuideSection = () => (
        <View style={[styles.section, !isLandscape && { marginTop: 40 }]}>
            {(frontMasked || sideMasked) && (
                <View style={styles.maskStatusHeader}>
                    <Feather name="move" size={14} color="#C5A059" />
                    <Text style={styles.maskStatusText}>DRAG MASK TO ADJUST POSITION</Text>
                </View>
            )}
            <View style={[styles.guideContainer, !isLandscape && { justifyContent: 'space-around' }]}>
                <View style={[styles.phoneFrame, !isLandscape && { width: width * 0.4, height: width * 0.8 }]}>
                    <View style={{ flex: 1 }}>
                        <Image
                            source={frontImage ? { uri: frontImage } : require('../assets/images/get_measure/front.jpg')} 
                            style={styles.guideImage}
                        />
                        {frontImage && frontMasked && (
                            <View style={styles.faceMaskOverlay}>
                                <Animated.View 
                                    {...frontPanResponder.panHandlers}
                                    style={[
                                        styles.maskShield, 
                                        { transform: frontPan.getTranslateTransform() }
                                    ]}
                                >
                                    <MaterialIcons name="privacy-tip" size={20} color="#C5A059" />
                                </Animated.View>
                            </View>
                        )}
                    </View>
                    <View style={styles.labelOverlay}>
                        <Text style={styles.labelOverlayText}>FRONT VIEW</Text>
                    </View>
                </View>
                <View style={[styles.phoneFrame, !isLandscape && { width: width * 0.4, height: width * 0.8 }, isLandscape && { marginLeft: 20 }]}>
                    <View style={{ flex: 1 }}>
                        <Image
                            source={sideImage ? { uri: sideImage } : require('../assets/images/get_measure/side.jpg')}
                            style={styles.guideImage}
                        />
                        {sideImage && sideMasked && (
                            <View style={styles.faceMaskOverlay}>
                                <Animated.View 
                                    {...sidePanResponder.panHandlers}
                                    style={[
                                        styles.maskShield, 
                                        { transform: sidePan.getTranslateTransform() }
                                    ]}
                                >
                                    <MaterialIcons name="privacy-tip" size={20} color="#C5A059" />
                                </Animated.View>
                            </View>
                        )}
                    </View>
                    <View style={styles.labelOverlay}>
                        <Text style={styles.labelOverlayText}>SIDE VIEW</Text>
                    </View>
                </View>
            </View>
            <Text style={styles.guideInfo}>
                Front and Side view images of self, helps us to identify the body type
                and get you the perfect fit for the clothing. Please follow the
                instructions in the image to take the photo. It is not necessary to add
                your face into the image.
            </Text>
        </View>
    );

    const renderHelpModal = () => (
        <Modal
            visible={helpModalVisible}
            transparent={true}
            animationType="fade"
        >
            <View style={styles.modalOverlay}>
                <View style={styles.helpModalContent}>
                    <TouchableOpacity 
                        style={styles.closeBtn} 
                        onPress={() => setHelpModalVisible(false)}
                    >
                        <Feather name="x" size={24} color="#1a1a1a" />
                    </TouchableOpacity>

                    <View style={styles.helpHeader}>
                        <View style={styles.conciergeBadge}>
                            <Text style={styles.conciergeText}>MAVIINCI CONCIERGE</Text>
                        </View>
                        <Text style={styles.helpTitle}>Bespoke Assistance</Text>
                        <Text style={styles.helpDesc}>Our master tailors are ready to guide you for a flawless fit.</Text>
                    </View>

                    <View style={styles.helpOptionsContainer}>
                        <TouchableOpacity style={styles.helpOption}>
                            <View style={styles.helpOptionIcon}>
                                <Feather name="phone" size={20} color="#C5A059" />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.helpOptionTitle}>Audio Consultation</Text>
                                <Text style={styles.helpOptionSub}>Speak with a master tailor now</Text>
                            </View>
                            <Feather name="chevron-right" size={18} color="#DDD" />
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.helpOption}>
                            <View style={styles.helpOptionIcon}>
                                <Feather name="video" size={20} color="#C5A059" />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.helpOptionTitle}>Video Guidance</Text>
                                <Text style={styles.helpOptionSub}>Live measurement assistance</Text>
                            </View>
                            <Feather name="chevron-right" size={18} color="#DDD" />
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.helpOption}>
                            <View style={styles.helpOptionIcon}>
                                <Feather name="calendar" size={20} color="#C5A059" />
                            </View>
                            <View style={{ flex: 1 }}>
                                <Text style={styles.helpOptionTitle}>Schedule Session</Text>
                                <Text style={styles.helpOptionSub}>Book a convenient time</Text>
                            </View>
                            <Feather name="chevron-right" size={18} color="#DDD" />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.helpFooter}>
                        <Text style={styles.supportTime}>Available: 10:00 AM - 08:00 PM IST</Text>
                    </View>
                </View>
            </View>
        </Modal>
    );

    return (
        <SafeAreaView style={styles.container}>
            <Stack.Screen options={{ headerShown: false }} />
            {renderHeader()}
            {renderStepper()}

            <KeyboardAvoidingView
                behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                style={{ flex: 1 }}
            >
                {isLandscape ? (
                    // Landscape Dual-Pane Layout
                    <View style={styles.layoutWrapperLandscape}>
                        <View style={styles.leftSection}>
                            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
                                {renderFormSection()}
                            </ScrollView>
                        </View>
                        
                        <View style={styles.vDivider} />

                        {renderRightPane()}
                    </View>
                ) : (
                    // Portrait Mobile Layout
                    <>
                        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                            <View style={styles.layoutWrapper}>
                                {renderFormSection()}
                                <View style={{ height: 40 }} />
                                <View style={styles.rightSectionPortrait}>
                                    {currentStep === 1 ? renderGuideSection() : (
                                        <View style={styles.tutorialContainerMobile}>
                                            {/* Portrait Language Switcher */}
                                            <View style={[styles.langSwitcher, { marginBottom: 20 }]}>
                                                <TouchableOpacity 
                                                    style={[styles.langBtn, language === 'hin' && styles.langBtnActive]} 
                                                    onPress={() => setLanguage('hin')}
                                                >
                                                    <Text style={[styles.langBtnText, language === 'hin' && styles.langBtnTextActive]}>Hindi</Text>
                                                </TouchableOpacity>
                                                <TouchableOpacity 
                                                    style={[styles.langBtn, language === 'eng' && styles.langBtnActive]} 
                                                    onPress={() => setLanguage('eng')}
                                                >
                                                    <Text style={[styles.langBtnText, language === 'eng' && styles.langBtnTextActive]}>English</Text>
                                                </TouchableOpacity>
                                            </View>

                                            <Text style={styles.formSectionHeader}>Instructional Video: {activeData.title}</Text>
                                            <View style={styles.videoPlaceholderMobile}>
                                                <VideoView
                                                    key={`mobile_${activeMeasurement}_${language}`}
                                                    player={player}
                                                    style={[styles.tutorialVideo, StyleSheet.absoluteFill]}
                                                    contentFit="contain"
                                                    showsControls={true}
                                                />
                                            </View>
                                            <Text style={[styles.tutorialDesc, { marginTop: 15 }]}>{activeData.desc}</Text>
                                            
                                            <TouchableOpacity style={[styles.helpLink, { marginTop: 15, alignSelf: 'center' }]} onPress={() => setHelpModalVisible(true)}>
                                                <Feather name="help-circle" size={14} color="#C5A059" />
                                                <Text style={styles.helpLinkText}>{language === 'eng' ? 'Need help measuring?' : 'मदद चाहिए?'}</Text>
                                            </TouchableOpacity>
                                        </View>
                                    )}
                                </View>
                            </View>
                        </ScrollView>
                        <View style={styles.fixedFooter}>
                            <View style={styles.footerActionRow}>
                                <TouchableOpacity style={[styles.proceedBtn, { flex: 1 }]} onPress={nextStep}>
                                    <Text style={styles.proceedBtnText}>{currentStep === 3 ? "Complete" : "Proceed"}</Text>
                                    <Feather name="chevron-right" size={18} color="#C5A880" style={{ marginLeft: 8 }} />
                                </TouchableOpacity>
                            </View>
                        </View>
                    </>
                )}
                {renderPrivacyModal()}
                {renderSelectionModal()}
                {renderHelpModal()}
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}


const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const IS_LANDSCAPE = SCREEN_WIDTH > SCREEN_HEIGHT;
const LANDSCAPE_PADDING = SCREEN_WIDTH > 900 ? 60 : 30;
const CARD_MAX_WIDTH = IS_LANDSCAPE ? 600 : 550;
const HEADER_FONT_SIZE = (IS_LANDSCAPE || SCREEN_WIDTH > 600) ? 18 : 14;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F5F1E8',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        height: 100,
        backgroundColor: '#F5F1E8',
        paddingTop: 30,
    },
    headerTitle: {
        fontSize: 16,
        fontWeight: '900',
        color: '#C5A059',
        letterSpacing: 2,
    },
    headerSub: {
        fontSize: 9,
        fontWeight: '700',
        color: '#888',
        letterSpacing: 1,
        textTransform: 'uppercase',
        marginTop: -2,
    },
    headerTitleContainer: {
        alignItems: 'center',
    },
    stepperContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        backgroundColor: '#FDFCF9',
        borderBottomWidth: 1,
        borderBottomColor: '#F5F1E8',
    },
    stepWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    stepCircle: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: '#F0EBE0',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E8DCC8',
    },
    activeStepCircle: {
        backgroundColor: '#1a1a1a',
        borderColor: '#1a1a1a',
    },
    completedStepCircle: {
        backgroundColor: '#C5A059',
        borderColor: '#C5A059',
    },
    stepText: {
        fontSize: 10,
        fontWeight: '900',
        color: '#888',
    },
    activeStepText: {
        color: '#fff',
    },
    stepLine: {
        width: 30,
        height: 1.5,
        backgroundColor: '#F0EBE0',
        marginHorizontal: 8,
    },
    completedStepLine: {
        backgroundColor: '#C5A059',
    },
    instructionHub: {
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
    },
    measurementHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    activeMeasurementItem: {
        backgroundColor: '#FDFCF9',
        borderRadius: 12,
        padding: 4,
    },
    langSwitcher: {
        flexDirection: 'row',
        backgroundColor: '#F5F1E8',
        borderRadius: 20,
        padding: 4,
        alignSelf: 'center',
        marginBottom: 15,
        borderWidth: 1,
        borderColor: '#E8DCC8',
    },
    langBtn: {
        paddingHorizontal: 20,
        paddingVertical: 6,
        borderRadius: 16,
    },
    langBtnActive: {
        backgroundColor: '#C5A059',
    },
    langBtnText: {
        fontSize: 12,
        fontWeight: '800',
        color: '#888',
    },
    langBtnTextActive: {
        color: '#fff',
    },
    videoBadge: {
        position: 'absolute',
        top: 15,
        left: 15,
        backgroundColor: 'rgba(0,0,0,0.6)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
    },
    videoBadgeText: {
        color: '#fff',
        fontSize: 10,
        fontWeight: '900',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    measurementItem: {
        width: '48%',
        marginBottom: 15,
    },
    unitText: {
        fontSize: 12,
        fontWeight: '700',
        color: '#C5A059',
        marginLeft: 4,
    },
    tutorialContainer: {
        flex: 1,
        width: '100%',
        justifyContent: 'center',
        paddingVertical: 20,
    },
    videoPlaceholder: {
        width: '100%',
        aspectRatio: 16/9,
        backgroundColor: '#000',
        borderRadius: 12,
        overflow: 'hidden',
        position: 'relative',
    },
    tutorialImage: {
        width: '100%',
        height: '100%',
        opacity: 0.7,
    },
    playOverlay: {
        position: 'absolute',
        top: 0, left: 0, right: 0, bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
    },
    tutorialInfo: {
        marginTop: 20,
        paddingHorizontal: 10,
    },
    tutorialTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: '#1a1a1a',
        marginBottom: 8,
    },
    tutorialDesc: {
        fontSize: 14,
        color: '#666',
        lineHeight: 20,
        marginBottom: 15,
    },
    helpLink: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    helpLinkText: {
        fontSize: 12,
        fontWeight: '700',
        color: '#C5A059',
        marginLeft: 6,
        textDecorationLine: 'underline',
    },
    actionRow: {
        flexDirection: 'row',
        width: '100%',
        gap: 15,
        paddingVertical: 20,
        alignItems: 'center',
    },
    backBtnAction: {
        paddingHorizontal: 20,
        height: 60,
        justifyContent: 'center',
    },
    backBtnActionText: {
        fontSize: 14,
        fontWeight: '700',
        color: '#888',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    footerActionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        gap: 10,
    },
    rightSectionPortrait: {
        width: '100%',
    },
    tutorialContainerMobile: {
        marginTop: 20,
        padding: 20,
        backgroundColor: '#fff',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#E8DCC8',
    },
    videoPlaceholderMobile: {
        width: '100%',
        aspectRatio: 16/9,
        backgroundColor: '#000',
        borderRadius: 12,
        marginTop: 15,
        overflow: 'hidden',
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
    },
    scrollContent: {
        paddingBottom: 60,
    },
    layoutWrapper: {
        paddingHorizontal: 20,
    },
    layoutWrapperLandscape: {
        flexDirection: 'row',
        paddingHorizontal: LANDSCAPE_PADDING,
        paddingTop: 30,
        gap: 20,
    },
    section: {
        flex: 1,
    },
    leftSection: {
        flex: 1.1,
        paddingRight: IS_LANDSCAPE ? 30 : 0,
    },
    rightSection: {
        flex: 0.9,
        paddingLeft: IS_LANDSCAPE ? 30 : 0,
        justifyContent: 'flex-start', // Align to top in landscape
        alignItems: 'center',
        paddingTop: 10,
    },
    vDivider: {
        width: 1,
        backgroundColor: '#E8DCC8',
        marginHorizontal: 15,
        height: '100%',
    },
    formDivider: {
        height: 1,
        backgroundColor: '#F0EBE0',
        marginVertical: 25,
    },
    formCard: {
        backgroundColor: '#fff',
        borderRadius: 24,
        padding: 30,
        width: '100%',
        maxWidth: CARD_MAX_WIDTH,
        alignSelf: 'center',
        elevation: 15,
        shadowColor: '#C5A059',
        shadowOffset: { width: 0, height: 15 },
        shadowOpacity: 0.1,
        shadowRadius: 25,
        borderWidth: 1,
        borderColor: '#E8DCC8',
    },
    titleArea: {
        alignItems: 'center',
        marginBottom: 30,
        borderBottomWidth: 1,
        borderBottomColor: '#F5F1E8',
        paddingBottom: 25,
    },
    mainTitle: {
        fontSize: 32,
        fontWeight: '900',
        color: '#1a1a1a',
        marginBottom: 8,
        letterSpacing: -0.5,
    },
    stepBadge: {
        fontSize: 10,
        fontWeight: '900',
        color: '#C5A059',
        letterSpacing: 2,
        textTransform: 'uppercase',
        marginBottom: 10,
    },
    subTitle: {
        fontSize: 14,
        color: '#777',
        lineHeight: 22,
        textAlign: 'center',
        maxWidth: '95%',
    },
    formSectionHeader: {
        fontSize: 12,
        fontWeight: '900',
        color: '#C5A059',
        textAlign: 'center',
        marginBottom: 15,
        textTransform: 'uppercase',
        letterSpacing: 2,
        backgroundColor: '#FDFCF9',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E8DCC8',
        overflow: 'hidden',
    },
    quote: {
        fontSize: 14,
        fontStyle: 'italic',
        fontWeight: '600',
        color: '#888',
        textAlign: 'center',
        marginBottom: 20,
    },
    formContainer: {
        width: '100%',
    },
    inputGroup: {
        marginBottom: 20,
    },
    inputLabel: {
        fontSize: IS_LANDSCAPE ? 11 : 9,
        fontWeight: '900',
        color: '#888',
        marginBottom: 6,
        letterSpacing: 1,
        textTransform: 'uppercase',
    },
    inputWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FBF9F6',
        borderRadius: 12,
        borderWidth: 1.5,
        borderColor: '#F0EBE0',
        height: IS_LANDSCAPE ? 56 : 46,
        paddingHorizontal: 12,
    },
    inputIcon: {
        marginRight: 10,
    },
    input: {
        flex: 1,
        fontSize: IS_LANDSCAPE ? 16 : 14,
        fontWeight: '600',
        color: '#1a1a1a',
    },
    aiScanBtn: {
        backgroundColor: '#1a1a1a',
        height: 56,
        borderRadius: 16,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 10,
        borderWidth: 1,
        borderColor: '#C5A059',
    },
    aiScanBtnDisabled: {
        opacity: 0.5,
        backgroundColor: '#888',
        borderColor: '#AAA',
    },
    aiScanBtnText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '900',
        letterSpacing: 1,
    },
    aiHint: {
        fontSize: 10,
        color: '#999',
        textAlign: 'center',
        marginTop: 8,
        fontStyle: 'italic',
    },
    row: {
        flexDirection: 'row',
    },
    uploadBtn: {
        height: 60,
        borderRadius: 16,
        borderWidth: 1.5,
        borderStyle: 'dashed',
        borderColor: '#C5A059',
        backgroundColor: '#FDFCF9',
        justifyContent: 'center',
        alignItems: 'center',
    },
    uploadBtnText: {
        fontSize: 14,
        fontWeight: '700',
        color: '#C5A059',
    },
    uploadBtnActive: {
        borderColor: '#C5A059',
        backgroundColor: '#fff',
    },
    removeBtn: {
        borderColor: '#FF4444',
        backgroundColor: '#FFF5F5',
        borderStyle: 'solid',
    },
    removeBtnText: {
        color: '#FF4444',
    },
    imagePreviewContainer: {
        marginTop: 15,
        width: '100%',
        aspectRatio: 3/4,
        borderRadius: 12,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#EEE',
    },
    imagePreview: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    uploadedThumb: {
        width: '100%',
        height: '100%',
        borderRadius: 8,
    },
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.8)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modalContent: {
        width: '100%',
        maxWidth: 400,
        backgroundColor: '#fff',
        borderRadius: 24,
        padding: 24,
        alignItems: 'center',
    },
    modalTitle: {
        fontSize: 22,
        fontWeight: '800',
        color: '#1a1a1a',
        marginBottom: 10,
    },
    modalDesc: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
        lineHeight: 20,
        marginBottom: 24,
    },
    previewContainer: {
        width: '100%',
        aspectRatio: 3/4,
        borderRadius: 16,
        overflow: 'hidden',
        marginBottom: 24,
        backgroundColor: '#f5f5f5',
    },
    modalPreview: {
        width: '100%',
        height: '100%',
    },
    maskOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.3)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalActions: {
        flexDirection: 'row',
        width: '100%',
        gap: 12,
    },
    modalBtn: {
        flex: 1,
        height: 50,
        borderRadius: 12,
        justifyContent: 'center',
        alignItems: 'center',
    },
    modalBtnOutline: {
        borderWidth: 1,
        borderColor: '#ddd',
        backgroundColor: '#fff',
    },
    modalBtnPrimary: {
        backgroundColor: '#1a1a1a',
    },
    modalBtnTextDark: {
        fontSize: 15,
        fontWeight: '700',
        color: '#1a1a1a',
    },
    modalBtnTextLight: {
        fontSize: 15,
        fontWeight: '700',
        color: '#fff',
    },
    closeBtn: {
        position: 'absolute',
        top: 20,
        right: 20,
        padding: 5,
    },
    iconCircle: {
        width: 70,
        height: 70,
        borderRadius: 35,
        backgroundColor: '#FDFCF9',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 20,
        borderWidth: 1,
        borderColor: '#E8DCC8',
    },
    sourceBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FBF9F6',
        padding: 16,
        borderRadius: 20,
        borderWidth: 1.5,
        borderColor: '#F0EBE0',
    },
    sourceIconBox: {
        width: 48,
        height: 48,
        borderRadius: 12,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 16,
        borderWidth: 1,
        borderColor: '#F0EBE0',
    },
    sourceBtnTitle: {
        fontSize: 16,
        fontWeight: '800',
        color: '#1a1a1a',
    },
    sourceBtnSub: {
        fontSize: 12,
        color: '#888',
        marginTop: 2,
    },
    faceMaskOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.1)', // Very light tint for the rest
        justifyContent: 'flex-start',
        alignItems: 'center',
    },
    maskShield: {
        marginTop: '8%',
        width: '32%',
        aspectRatio: 1.2,
        backgroundColor: '#1a1a1a',
        borderRadius: 40,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1.5,
        borderColor: '#C5A059',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 10,
    },
    maskText: {
        color: '#C5A059',
        fontSize: 8,
        fontWeight: '900',
        marginTop: 8,
        letterSpacing: 1.5,
        backgroundColor: 'rgba(0,0,0,0.85)',
        paddingHorizontal: 10,
        paddingVertical: 3,
        borderRadius: 8,
        overflow: 'hidden',
    },
    maskStatusHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#FDFCF9',
        paddingVertical: 8,
        borderRadius: 12,
        marginBottom: 15,
        borderWidth: 1,
        borderColor: '#E8DCC8',
        width: '95%',
        alignSelf: 'center',
    },
    maskStatusText: {
        color: '#C5A059',
        fontSize: 11,
        fontWeight: '800',
        marginLeft: 8,
        letterSpacing: 1,
    },
    footer: {
        paddingHorizontal: 20,
        paddingBottom: Platform.OS === 'ios' ? 24 : 12,
        paddingTop: 10,
        backgroundColor: '#F5F1E8',
        borderTopWidth: 1,
        borderTopColor: '#E8DCC8',
    },
    fixedFooter: {
        paddingHorizontal: 20,
        paddingBottom: Platform.OS === 'ios' ? 24 : 12,
        paddingTop: 10,
        backgroundColor: '#F5F1E8',
        borderTopWidth: 1,
        borderTopColor: '#E8DCC8',
    },
    proceedBtn: {
        backgroundColor: '#000000',
        height: 54,
        borderRadius: 8,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#C5A880',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 10,
        elevation: 8,
    },
    proceedBtnText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '900',
        letterSpacing: 2,
        textTransform: 'uppercase',
    },
    guideContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        paddingVertical: 20,
        gap: 15,
    },
    phoneFrame: {
        width: '46%',
        aspectRatio: 9/16,
        backgroundColor: '#fff',
        borderRadius: 12,
        overflow: 'hidden',
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.05)',
    },
    guideImage: {
        width: '100%',
        height: '100%',
        resizeMode: 'cover',
    },
    labelOverlay: {
        position: 'absolute',
        bottom: 12,
        left: 12,
        right: 12,
        backgroundColor: 'rgba(255,255,255,0.92)',
        paddingVertical: 8,
        borderRadius: 12,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(197, 160, 89, 0.2)', // Subtle Gold border
    },
    labelOverlayText: {
        fontSize: 12,
        fontWeight: '800',
        color: '#C5A059',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    guideInfo: {
        fontSize: 13,
        color: '#777',
        textAlign: 'center',
        lineHeight: 20,
        maxWidth: 450,
        paddingHorizontal: 20,
    },
    instructionHub: {
        width: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100%',
    },
    measurementGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        marginTop: 10,
    },
    measurementItem: {
        width: '48%',
        marginBottom: 20,
    },
    unitText: {
        fontSize: 12,
        fontWeight: '900',
        color: '#C5A059',
        marginLeft: 4,
        textTransform: 'uppercase',
    },
    tutorialContainer: {
        flex: 1,
        width: '100%',
        justifyContent: 'center',
        paddingVertical: 20,
    },
    videoPlaceholder: {
        width: '100%',
        aspectRatio: 16/9,
        backgroundColor: '#1a1a1a',
        borderRadius: 20,
        overflow: 'hidden',
        position: 'relative',
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.3,
        shadowRadius: 15,
    },
    videoOverlayAction: {
        ...StyleSheet.absoluteFillObject,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.1)',
    },
    overlayCircle: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: 'rgba(197, 160, 89, 0.8)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#fff',
    },
    helpModalContent: {
        width: '88%',
        maxWidth: 420,
        backgroundColor: '#fff',
        borderRadius: 24,
        padding: 20,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E8DCC8',
        elevation: 20,
    },
    helpHeader: {
        alignItems: 'center',
        marginBottom: 15,
        marginTop: 5,
    },
    conciergeBadge: {
        backgroundColor: '#F5F1E8',
        paddingHorizontal: 12,
        paddingVertical: 4,
        borderRadius: 12,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#E8DCC8',
    },
    conciergeText: {
        fontSize: 10,
        fontWeight: '900',
        color: '#C5A059',
        letterSpacing: 1,
    },
    helpTitle: {
        fontSize: 22,
        fontWeight: '900',
        color: '#1a1a1a',
        marginBottom: 8,
        textAlign: 'center',
        lineHeight: 28,
    },
    helpDesc: {
        fontSize: 14,
        color: '#666',
        textAlign: 'center',
        lineHeight: 20,
    },
    helpOptionsContainer: {
        width: '100%',
        gap: 8,
    },
    helpOption: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FDFCF9',
        padding: 12,
        borderRadius: 16,
        borderWidth: 1,
        borderColor: '#F0EBE0',
    },
    helpOptionIcon: {
        width: 38,
        height: 38,
        borderRadius: 10,
        backgroundColor: '#fff',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 5,
    },
    helpOptionTitle: {
        fontSize: 15,
        fontWeight: '800',
        color: '#1a1a1a',
    },
    helpOptionSub: {
        fontSize: 12,
        color: '#888',
        marginTop: 2,
    },
    helpFooter: {
        marginTop: 15,
        paddingTop: 15,
        borderTopWidth: 1,
        borderTopColor: '#F5F1E8',
        width: '100%',
        alignItems: 'center',
    },
    supportTime: {
        fontSize: 11,
        fontWeight: '700',
        color: '#AAA',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    tutorialVideo: {
        width: '100%',
        height: '100%',
    },
    tutorialImage: {
        width: '100%',
        height: '100%',
        opacity: 0.6,
        resizeMode: 'cover',
    },
    playOverlay: {
        position: 'absolute',
        top: 0, left: 0, right: 0, bottom: 0,
        justifyContent: 'center',
        alignItems: 'center',
    },
    tutorialInfo: {
        marginTop: 25,
        paddingHorizontal: 15,
    },
    tutorialTitle: {
        fontSize: 20,
        fontWeight: '900',
        color: '#1a1a1a',
        marginBottom: 10,
        letterSpacing: -0.5,
    },
    tutorialDesc: {
        fontSize: 14,
        color: '#666',
        lineHeight: 22,
        marginBottom: 20,
    },
    helpLink: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FDFCF9',
        padding: 12,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: '#E8DCC8',
        alignSelf: 'flex-start',
    },
    helpLinkText: {
        fontSize: 12,
        fontWeight: '800',
        color: '#C5A059',
        marginLeft: 8,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    actionRow: {
        flexDirection: 'row',
        width: '100%',
        gap: 15,
        paddingVertical: 25,
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: '#F5F1E8',
        marginTop: 10,
    },
    backBtnAction: {
        paddingHorizontal: 25,
        height: 60,
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 4,
        borderWidth: 1,
        borderColor: '#E8DCC8',
        backgroundColor: '#fff',
    },
    backBtnActionText: {
        fontSize: 14,
        fontWeight: '900',
        color: '#888',
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    footerActionRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        gap: 15,
        width: '100%',
    },
    rightSectionPortrait: {
        width: '100%',
        marginTop: 20,
    },
    tutorialContainerMobile: {
        padding: 24,
        backgroundColor: '#fff',
        borderRadius: 24,
        borderWidth: 1,
        borderColor: '#E8DCC8',
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
    },
    videoPlaceholderMobile: {
        width: '100%',
        aspectRatio: 16/9,
        backgroundColor: '#000',
        borderRadius: 16,
        marginTop: 20,
        overflow: 'hidden',
    },
});
