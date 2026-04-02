// src/Functions/layerEngine.js

const shirt_collars = ["CR", "CB", "CT", "CS", "CE"];

// ==========================================
// ENGINE 1: FULL BODY MODEL (Display Images)
// ==========================================
export const getKurtaDisplayLayers = (selections, hasCoat = false, hasSadri = false) => {
    const isShirtCollar = shirt_collars.includes(selections.collar);
    const isLong = selections.length === 'K';
    const isRound = selections.bottomCut === 'R';
    let layers = [];

    // 1. BASE
    let baseCode = "";
    if (isShirtCollar) baseCode = (hasCoat || hasSadri) ? (isLong ? "D0" : "P0") : (isLong ? "D" : "P");
    else baseCode = isLong ? (isRound ? "R" : "S") : (isRound ? "K" : "L");
    layers.push({ code: baseCode, zIndex: 10 });

    // 2. PLACKET
    let placketCode = selections.placketStyle;
    if (hasCoat || hasSadri) placketCode += "3"; 
    else placketCode += (isShirtCollar ? "3" : "4");
    layers.push({ code: placketCode, zIndex: 20 });

    // 3. POCKETS & FLAPS
    if (selections.pocketQty !== "00") {
        layers.push({ code: "R" + selections.pocketShape, zIndex: 30 }); // Right Pocket
        if(selections.flapYes === "1") layers.push({ code: "FR" + selections.flapShape, zIndex: 31 });
        
        if (selections.pocketQty === "11" || selections.pocketQty === "02") { // Left Pocket
            layers.push({ code: "L" + selections.pocketShape, zIndex: 32 });
            if(selections.flapYes === "1") layers.push({ code: "FL" + selections.flapShape, zIndex: 33 });
        }
    }

    // 4. SLEEVES
    layers.push({ code: hasCoat ? "SS" : selections.sleeve, zIndex: 40 });

    // 5. COLLAR
    layers.push({ code: selections.collar, zIndex: 50 });

    // 6. EPAULETTE
    if (selections.epaulette === "SE") layers.push({ code: hasSadri ? "SE0" : "SE", zIndex: 60 });

    return layers;
};

// ==========================================
// ENGINE 2: FOLDED VIEW (Style Images)
// ==========================================
export const getKurtaStyleLayers = (selections) => {
    const isShirtCollar = shirt_collars.includes(selections.collar);
    let layers = [];

    // 1. FOLDED BASE
    let foldedBase = "";
    if (isShirtCollar) foldedBase = "BASE";
    else if (selections.collar === "CC") foldedBase = "BASE_C";
    else if (selections.collar === "CM") foldedBase = "BASE_M";
    else foldedBase = "BASE_R"; // Round neck default
    layers.push({ code: foldedBase, zIndex: 10 });

    // 2. FOLDED PLACKET
    let fPlacket = "";
    if (foldedBase === "BASE_R") fPlacket = selections.placketStyle + "R"; // NSR / QSR
    else if (foldedBase === "BASE_C") fPlacket = selections.placketStyle + "C"; // NSC / QSC
    else fPlacket = selections.placketStyle + "0"; // NS0 / QS0
    layers.push({ code: fPlacket, zIndex: 20 });

    // 3. FOLDED COLLAR
    layers.push({ code: selections.collar, zIndex: 50 });

    // 4. FOLDED SLEEVES & CUFFS
    layers.push({ code: selections.sleeve, zIndex: 40 }); // SN or SC
    if (selections.sleeve === "SC") {
        layers.push({ code: selections.cuffStyle, zIndex: 41 }); // UN1, UR2, etc.
    }

    // Note: Pockets/Flaps in folded view usually use the same codes (UN1, UR1) or standard Left/Right. 
    // Isko hum data structure dekh kar fine-tune karenge.

    return layers;
};