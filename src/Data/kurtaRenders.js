// src/data/kurtaRenders.js

export const KURTA_RENDERS = {
    "FAB_001": {  // Manila 970 ke saare parts
        display: {
            "D": require('../../assets/images/renders/FAB_001/display/D.png'),
            "R": require('../../assets/images/renders/FAB_001/display/R.png'),
            "NS3": require('../../assets/images/renders/FAB_001/display/NS3.png'),
            "CM": require('../../assets/images/renders/FAB_001/display/CM.png'),
            "SN": require('../../assets/images/renders/FAB_001/display/SN.png'),
            // aise hi baaki layers...
        },
        style: { // Folded views
            "BASE": require('../../assets/images/renders/FAB_001/style/BASE.png'),
            "BASE_M": require('../../assets/images/renders/FAB_001/style/BASE_M.png'),
            "NSC": require('../../assets/images/renders/FAB_001/style/NSC.png'),
            // baaki folded layers...
        }
    },
    "FAB_002": {  // Genius 61 ke saare parts
        display: {
            "D": require('../../assets/images/renders/FAB_002/display/D.png'),
            // ... images for FAB_002
        },
        style: {
            "BASE": require('../../assets/images/renders/FAB_002/style/BASE.png'),
            // ... folded images for FAB_002
        }
    }
};