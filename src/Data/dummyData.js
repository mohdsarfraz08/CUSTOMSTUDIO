// src/Data/dummyData.js
import { FABRIC_PROFILES } from './fabrics';
import { KURTA_RENDERS as KURTA_RENDERS_SOURCE } from './kurtaRenders';

export const DUMMY_FABRICS = FABRIC_PROFILES;

export const DUMMY_BUTTONS = [
    {
        id: "BTN_001",
        name: "Standard Plastic",
        material: "Plastic",
        icon: null,
        renders: {
            "BKC-F": null, "BKN-F": null, "BKT-F": null, "BPR-F": null, "BPL-F": null, "BE-F": null, "CBB-F": null, "BC2-F": null, "BC4-F": null,
            "BKC-S": null, "BKN-S": null, "BKT-S": null, "BPR-S": null, "BPL-S": null, "BE-S": null, "CBB-S": null, "BC2-S": null, "BC4-S": null,
        }
    },
    {
        id: "BTN_002",
        name: "Classic Metal",
        material: "Metal",
        icon: null,
        renders: {}
    },
    {
        id: "BTN_003",
        name: "Oak Wood",
        material: "Wood",
        icon: null,
        renders: {}
    },
    {
        id: "BTN_004",
        name: "Standard Ring",
        material: "Ring",
        icon: null,
        renders: {}
    },
    {
        id: "BTN_005",
        name: "Matching Fabric",
        material: "Fabric",
        linkedFabricID: "FAB_001",
        icon: require('../../assets/images/buttons/fabric_button/button_icon/button_001.png'),
        renders: {
            "BKC-F": require('../../assets/images/buttons/fabric_button/render/button_001/BKC-F.webp'),
            "BKN-F": require('../../assets/images/buttons/fabric_button/render/button_001/BKN-F.webp'),
            "BKT-F": require('../../assets/images/buttons/fabric_button/render/button_001/BKT-F.webp'),
            "BPR-F": require('../../assets/images/buttons/fabric_button/render/button_001/BPR-F.webp'),
            "BPL-F": require('../../assets/images/buttons/fabric_button/render/button_001/BPL-F.webp'),
            "BE-F": require('../../assets/images/buttons/fabric_button/render/button_001/BE-F.webp'),
            "CBB-F": require('../../assets/images/buttons/fabric_button/render/button_001/CBB-F.webp'),
            "BC2-F": null, 
            "BC4-F": null,

            "BKC-S": require('../../assets/images/buttons/fabric_button/render/button_001/BKC-S.webp'),
            "BKN-S": require('../../assets/images/buttons/fabric_button/render/button_001/BKN-S.webp'),
            "BKT-S": null, 
            "BPR-S": require('../../assets/images/buttons/fabric_button/render/button_001/BPR-S.webp'),
            "BPL-S": require('../../assets/images/buttons/fabric_button/render/button_001/BPL-S.webp'),
            "BE-S": require('../../assets/images/buttons/fabric_button/render/button_001/BE-S.webp'),
            "CBB-S": require('../../assets/images/buttons/fabric_button/render/button_001/CBB-S.webp'),
            "BC2-S": require('../../assets/images/buttons/fabric_button/render/button_001/BC2-S.webp'),
            "BC4-S": require('../../assets/images/buttons/fabric_button/render/button_001/BC4-S.webp'),
        }
    }
];

export const INITIAL_SELECTION = {
    button: DUMMY_BUTTONS[0],
    length: 'K',
    bottomCut: 'R',
    placketStyle: 'NS',
    pocketQty: '00',
    pocketShape: 'R',
    flapYes: '0',
    flapShape: 'R',
    epaulette: '0',
    collar: 'CM',
    sleeve: 'SN',
    cuffStyle: 'US1'
};

export const KURTA_RENDERS = KURTA_RENDERS_SOURCE;
