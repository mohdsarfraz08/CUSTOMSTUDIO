const SHIRT_COLLARS = ['CR', 'CB', 'CT', 'CS', 'CE'];
const MANDARIN_COLLARS = ['CM', 'CC', 'CN'];
const CATEGORY_A_SADRI = ['SR', 'RR', 'SS', 'AA', 'BB', 'CC', 'DD', 'EE', 'FF', 'GG', 'HH', 'KK'];
const CATEGORY_B_BASE_TYPES = ['L', 'M', 'N'];

const isShirtCollar = (collar) => SHIRT_COLLARS.includes(collar);
const isMandarinCollar = (collar) => MANDARIN_COLLARS.includes(collar);
const getSadriCollarSuffix = (collar) => {
    if (isMandarinCollar(collar)) return 'C';
    if (isShirtCollar(collar)) return 'S';
    return 'R';
};

const getKurtaBaseCode = (collar, lengthStr, bottomCut, hasOuterwear, forceMandarin) => {
    const longLength = lengthStr === 'K';
    const roundCut = bottomCut === 'R';
    const useMandarin = forceMandarin || isMandarinCollar(collar);
    const useShirt = !useMandarin && isShirtCollar(collar);

    if (useShirt) {
        if (longLength) {
            return `${roundCut ? 'D' : 'T'}${hasOuterwear ? '0' : ''}`;
        }
        return `${roundCut ? 'P' : 'Q'}${hasOuterwear ? '0' : ''}`;
    }

    if (longLength) {
        return roundCut ? 'R' : 'S';
    }
    return roundCut ? 'K' : 'L';
};

export const getSadriLayerCodes = (sadriCode, selections = {}, selectedButton, viewMode = 0, slideIndex = 0) => {
    if (!sadriCode) return [];

    const bSuffix = viewMode === 0 ? '-F' : '-S';
    const collar = selections.collar || 'CM';
    const isCategoryA = CATEGORY_A_SADRI.includes(sadriCode);
    const categoryPrefix = sadriCode?.charAt(0);

    let finalSadriCode = sadriCode;
    if (!isCategoryA) {
        if (CATEGORY_B_BASE_TYPES.includes(sadriCode)) {
            finalSadriCode = `${sadriCode}${getSadriCollarSuffix(collar)}`;
        } else if (CATEGORY_B_BASE_TYPES.includes(categoryPrefix)) {
            finalSadriCode = `${categoryPrefix}${getSadriCollarSuffix(collar)}`;
        }
    }

    const layersToRender = [];

    const addGarmentPart = (partName, fabricCode, baseZIndex, type = 'fabric') => {
        layersToRender.push({ code: fabricCode, zIndex: baseZIndex, type: type });

        if (selections.embroideryID && ['SadriBase'].includes(partName)) {
            layersToRender.push({
                code: `E-${fabricCode}${bSuffix}`,
                zIndex: baseZIndex + 1,
                type: 'embroidery',
                collectionID: selections.embroideryID,
                part: partName
            });
        }
    };

    addGarmentPart('SadriBase', `${finalSadriCode}${bSuffix}`, 60);

    if (selectedButton?.material !== 'Ring') {
        layersToRender.push({ code: `KH${bSuffix}`, zIndex: 60 + 5 - 1, type: 'fabric' });
        layersToRender.push({ code: `KB${bSuffix}`, zIndex: 60 + 5, type: 'button' });
    }

    return layersToRender;
};

export const getKurtaLayerCodes = (
    selections,
    selectedButton,
    viewMode = 0,
    slideIndex = 0,
    hasCoat = false,
    hasSadri = false,
    sadriCode = null
) => {
    if (!selections) return [];

    const collar = selections.collar || 'CM';
    const bottomCut = selections.bottomCut || 'R';
    const lengthStr = selections.length || 'K';
    const placketStyle = selections.placketStyle || 'NS';
    const pocketQty = selections.pocketQty || '00';
    const pocketShape = selections.pocketShape || 'R';
    const flapYes = selections.flapYes || '0';
    const flapShape = selections.flapShape || 'R';
    const epaulette = selections.epaulette || '0';
    const sleeve = selections.sleeve || 'SN';
    const cuffStyle = selections.cuffStyle || 'US1';

    const forceMandarin = hasSadri && slideIndex === 0 && sadriCode && CATEGORY_A_SADRI.includes(sadriCode);
    const effectiveCollar = forceMandarin ? 'CM' : collar;
    const outerwearFlag = hasCoat || hasSadri;
    const baseCode = getKurtaBaseCode(effectiveCollar, lengthStr, bottomCut, outerwearFlag && !forceMandarin, forceMandarin);
    const pajamaType = selections.pajamaType || 'PJ';
    const bSuffix = viewMode === 0 ? '-F' : '-S';
    const isRing = selectedButton?.material === 'Ring';

    const layersToRender = [];

    // Helper function to enforce the Z-Index Sandwich
    const addGarmentPart = (partName, fabricCode, baseZIndex, type = 'fabric') => {
        // 1. BOTTOM LAYER: The Fabric itself
        layersToRender.push({ code: fabricCode, zIndex: baseZIndex, type: type });

        // 2. MIDDLE LAYER: The Embroidery (Only if it exists for this specific part)
        if (selections.embroideryID && ['Chest', 'Collar', 'Sleeve'].includes(partName)) {
            layersToRender.push({ 
                code: `E-${fabricCode}${bSuffix}`, 
                zIndex: baseZIndex + 1, // STRICTLY +1 over the fabric
                type: 'embroidery',
                collectionID: selections.embroideryID,
                part: partName 
            });
        }
    };

    // Pajama (Base Z-Index 5)
    addGarmentPart('Pajama', `${pajamaType}-${baseCode}`, 5, 'pajama');

    // Base/Chest (Base Z-Index 10)
    addGarmentPart('Chest', baseCode, 10);

    // Placket (Base Z-Index 20)
    let placketCode = placketStyle;
    if (outerwearFlag) {
        placketCode = `${placketStyle.charAt(0)}T3`;
    } else {
        placketCode = `${placketStyle}${isShirtCollar(effectiveCollar) ? '3' : '4'}`;
    }
    addGarmentPart('Placket', placketCode, 20);

    // Placket Holes & Buttons (+5)
    if (placketCode === 'NS4' || placketCode === 'QS4') {
        if (!isRing) layersToRender.push({ code: 'BHC', zIndex: 20 + 5 - 1, type: 'fabric' });
        layersToRender.push({ code: `BKC${bSuffix}`, zIndex: 20 + 5, type: 'button' });
    } else if (placketCode === 'NS3' || placketCode === 'QS3') {
        if (!isRing) layersToRender.push({ code: 'BHN', zIndex: 20 + 5 - 1, type: 'fabric' });
        layersToRender.push({ code: `BKN${bSuffix}`, zIndex: 20 + 5, type: 'button' });
    } else if (placketCode === 'NT3' || placketCode === 'QT3') {
        if (!isRing) layersToRender.push({ code: 'BHT', zIndex: 20 + 5 - 1, type: 'fabric' });
        layersToRender.push({ code: `BKT${bSuffix}`, zIndex: 20 + 5, type: 'button' });
    }

    // Pockets (Base Z-Index 30)
    if (pocketQty !== '00') {
        addGarmentPart('Pocket', `R${pocketShape}`, 30);
        if (flapYes === '1') {
            addGarmentPart('Flap', `FR${flapShape}`, 32);
            if (!isRing) layersToRender.push({ code: 'BHR', zIndex: 32 + 5 - 1, type: 'fabric' });
            layersToRender.push({ code: `BPR${bSuffix}`, zIndex: 32 + 5, type: 'button' });
        }

        if (pocketQty === '11') {
            addGarmentPart('Pocket', `L${pocketShape}`, 34);
            if (flapYes === '1') {
                addGarmentPart('Flap', `FL${flapShape}`, 36);
                if (!isRing) layersToRender.push({ code: 'BHL', zIndex: 36 + 5 - 1, type: 'fabric' });
                layersToRender.push({ code: `BPL${bSuffix}`, zIndex: 36 + 5, type: 'button' });
            }
        }
    }

    // Epaulette (Base Z-Index 45)
    if (epaulette === 'SE') {
        addGarmentPart('Epaulette', outerwearFlag ? 'SE0' : 'SE', 45);
        if (!isRing) layersToRender.push({ code: 'HE', zIndex: 45 + 5 - 1, type: 'fabric' });
        layersToRender.push({ code: `BE${bSuffix}`, zIndex: 45 + 5, type: 'button' });
    }

    // Sleeves (Base Z-Index 55)
    const sleeveCode = hasCoat ? 'SS' : sleeve;
    addGarmentPart('Sleeve', sleeveCode, 55);

    if (sleeve === 'SC') {
        addGarmentPart('Cuff', cuffStyle, 57);
        if (cuffStyle.endsWith('1')) {
            if (!isRing) layersToRender.push({ code: 'BH2', zIndex: 57 + 5 - 1, type: 'fabric' });
            layersToRender.push({ code: `BC2${bSuffix}`, zIndex: 57 + 5, type: 'button' });
        } else if (cuffStyle.endsWith('2')) {
            if (!isRing) layersToRender.push({ code: 'BH4', zIndex: 57 + 5 - 1, type: 'fabric' });
            layersToRender.push({ code: `BC4${bSuffix}`, zIndex: 57 + 5, type: 'button' });
        }
    }

    // Collar (Base Z-Index 65)
    addGarmentPart('Collar', effectiveCollar, 65);

    if (effectiveCollar === 'CB') {
        if (!isRing) layersToRender.push({ code: 'CBH', zIndex: 65 + 5 - 1, type: 'fabric' });
        layersToRender.push({ code: `CBB${bSuffix}`, zIndex: 65 + 5, type: 'button' });
    }

    return layersToRender;
};
