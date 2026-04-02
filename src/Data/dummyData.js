// src/Data/dummyData.js

export const DUMMY_FABRICS = [
    {
        fabricID: "FAB_001",
        name: "Manila 970",
        brand: "Siyarams",
        price: 9600,
        thumbnail: { uri: 'https://images.unsplash.com/photo-1584031535798-1a5223ab44fb?q=80&w=200&auto=format&fit=crop' } 
    }
];

// ABHI TESTING KE LIYE EK HI IMAGE SARE CODES KO DE RAHE HAIN
const dummyImage = require('../../assets/images/renders/FAB_001/display/D.webp');

export const KURTA_RENDERS = {
    "FAB_001": {
        // NOTE: Make sure 'display' key is here!
        display: {
            "D": dummyImage,
            "T": dummyImage,
            "P": dummyImage,
            "Q": dummyImage,
            "R": dummyImage,
            "S": dummyImage,
            "K": dummyImage,
            "L": dummyImage,
            
            "NS4": dummyImage,
            "NS3": dummyImage,
            "QS4": dummyImage,
            "QS3": dummyImage,
            
            "CM": dummyImage, 
            "CT": dummyImage,
            
            "SN": dummyImage,
            "SC": dummyImage,
            
            "RR": dummyImage, // Round Right pocket
            "LR": dummyImage, // Round Left pocket
        }
    }
};

export const INITIAL_SELECTION = {
    bottomCut: 'R',
    length: 'K',
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