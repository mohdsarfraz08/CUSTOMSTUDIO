// src/Functions/layerEngine.js

export const getKurtaLayerCodes = (selections, selectedButton, viewMode = 0, hasCoat = false, hasSadri = false) => {

    // --- 1. EXTREME SAFETY CHECKS ---
    if (!selections) return [];

    // Agar koi value undefined hai, toh use default de do taaki crash na ho
    const collar = selections.collar || "CM";
    const bottomCut = selections.bottomCut || "R";
    const lengthStr = selections.length || "K";
    const placketStyle = selections.placketStyle || "NS";
    const pocketQty = selections.pocketQty || "00";
    const pocketShape = selections.pocketShape || "R";
    const flapYes = selections.flapYes || "0";
    const flapShape = selections.flapShape || "R";
    const epaulette = selections.epaulette || "0";
    const sleeve = selections.sleeve || "SN";
    const cuffStyle = selections.cuffStyle || "US1";

    const shirt_collars = ["CR", "CB", "CT", "CS", "CE"];
    const isShirtCollar = shirt_collars.includes(collar);

    const isLongLength = lengthStr === 'K';
    const isRoundCut = bottomCut === 'R';
    
    // ViewMode suffix
    const bSuffix = viewMode === 0 ? "-F" : "-S";
    // Check ring
    const isRing = selectedButton?.material === "Ring";

    let layersToRender = [];

    // --- 2. BASE LAYER ---
    let baseCode = "R";
    if (isShirtCollar) {
        if (isLongLength) {
            baseCode = isRoundCut ? "D" : "T";
            if (hasCoat || hasSadri) baseCode += "0";
        } else {
            baseCode = isRoundCut ? "P" : "Q";
            if (hasCoat || hasSadri) baseCode += "0";
        }
    } else {
        if (isLongLength) {
            baseCode = isRoundCut ? "R" : "S";
        } else {
            baseCode = isRoundCut ? "K" : "L";
        }
    }
    layersToRender.push({ code: baseCode, zIndex: 10, type: 'fabric' });

    // --- 3. PLACKET ---
    let placketCode = placketStyle;
    if (hasCoat || hasSadri) {
        const prefix = placketStyle.charAt(0); // N or Q
        placketCode = `${prefix}T3`;
    } else {
        placketCode = placketCode + (isShirtCollar ? "3" : "4");
    }
    layersToRender.push({ code: placketCode, zIndex: 20, type: 'fabric' });

    if (placketCode === "NS4" || placketCode === "QS4") {
        if (!isRing) layersToRender.push({ code: "BHC", zIndex: 21, type: 'fabric' });
        layersToRender.push({ code: `BKC${bSuffix}`, zIndex: 90, type: 'button' });
    } else if (placketCode === "NS3" || placketCode === "QS3") {
        if (!isRing) layersToRender.push({ code: "BHN", zIndex: 21, type: 'fabric' });
        layersToRender.push({ code: `BKN${bSuffix}`, zIndex: 90, type: 'button' });
    } else if (placketCode === "NT3" || placketCode === "QT3") {
        if (!isRing) layersToRender.push({ code: "BHT", zIndex: 21, type: 'fabric' });
        layersToRender.push({ code: `BKT${bSuffix}`, zIndex: 90, type: 'button' });
    }

    // --- 4. POCKETS & FLAPS ---
    if (pocketQty !== "00") {
        layersToRender.push({ code: `R${pocketShape}`, zIndex: 30, type: 'fabric' });
        if (flapYes === "1") {
            layersToRender.push({ code: `FR${flapShape}`, zIndex: 31, type: 'fabric' });
            if (!isRing) layersToRender.push({ code: "BHR", zIndex: 32, type: 'fabric' });
            layersToRender.push({ code: `BPR${bSuffix}`, zIndex: 91, type: 'button' });
        }

        if (pocketQty === "11") {
            layersToRender.push({ code: `L${pocketShape}`, zIndex: 33, type: 'fabric' });
            if (flapYes === "1") {
                layersToRender.push({ code: `FL${flapShape}`, zIndex: 34, type: 'fabric' });
                if (!isRing) layersToRender.push({ code: "BHL", zIndex: 35, type: 'fabric' });
                layersToRender.push({ code: `BPL${bSuffix}`, zIndex: 91, type: 'button' });
            }
        }
    }

    // --- 5. EPAULETTE (Shoulder) ---
    if (epaulette === "SE") {
        layersToRender.push({ code: hasSadri ? "SE0" : "SE", zIndex: 35, type: 'fabric' });
        if (!isRing) layersToRender.push({ code: "HE", zIndex: 36, type: 'fabric' });
        layersToRender.push({ code: `BE${bSuffix}`, zIndex: 92, type: 'button' });
    }

    // --- 6. SLEEVES & CUFFS ---
    let sleeveCode = hasCoat ? "SS" : sleeve;
    layersToRender.push({ code: sleeveCode, zIndex: 40, type: 'fabric' });

    if (sleeve === "SC") {
        layersToRender.push({ code: cuffStyle, zIndex: 41, type: 'fabric' });
        if (cuffStyle.endsWith("1")) {
            if (!isRing) layersToRender.push({ code: "BH2", zIndex: 42, type: 'fabric' });
            layersToRender.push({ code: `BC2${bSuffix}`, zIndex: 93, type: 'button' });
        } else if (cuffStyle.endsWith("2")) {
            if (!isRing) layersToRender.push({ code: "BH4", zIndex: 42, type: 'fabric' });
            layersToRender.push({ code: `BC4${bSuffix}`, zIndex: 93, type: 'button' });
        }
    }

    // --- 7. COLLAR ---
    layersToRender.push({ code: collar, zIndex: 50, type: 'fabric' });
    
    if (collar === "CB") {
        if (!isRing) layersToRender.push({ code: "CBH", zIndex: 51, type: 'fabric' });
        layersToRender.push({ code: `CBB${bSuffix}`, zIndex: 94, type: 'button' });
    }

    return layersToRender;
};