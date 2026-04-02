// src/icons/KurtaIcons.js
import React from 'react';
import { Image } from 'react-native';

// --- IMPORTS (Ensure these match your actual folder structure) ---
import LenLong from '../../assets/images/style_icons/kurta/len_long.png';
import LenShort from '../../assets/images/style_icons/kurta/len_short.png';
import CutRound from '../../assets/images/style_icons/kurta/cut_round.png';
import CutStraight from '../../assets/images/style_icons/kurta/cut_straight.png';
import PlacketNotch from '../../assets/images/style_icons/kurta/placket_notch.png';
import PlacketSquare from '../../assets/images/style_icons/kurta/placket_square.png';
import Pocket0 from '../../assets/images/style_icons/kurta/pocket_0.png';
import Pocket1 from '../../assets/images/style_icons/kurta/pocket_1.png';
import Pocket2 from '../../assets/images/style_icons/kurta/pocket_2.png';
import Flap0 from '../../assets/images/style_icons/kurta/flap_0.png';
import Flap1 from '../../assets/images/style_icons/kurta/flap_1.png';
import TypeRound from '../../assets/images/style_icons/kurta/type_round.png';
import TypeNotch from '../../assets/images/style_icons/kurta/type_notch.png';
import TypeSquare from '../../assets/images/style_icons/kurta/type_square.png';
import EpNo from '../../assets/images/style_icons/kurta/ep_no.png';
import EpYes from '../../assets/images/style_icons/kurta/ep_yes.png';

// Collars
import CollarRound from '../../assets/images/style_icons/kurta/col_round_neck.png';
import CollarMandarin from '../../assets/images/style_icons/kurta/col_mandarin.png';
import CollarChinese from '../../assets/images/style_icons/kurta/col_chinese.png';
import CollarShirt from '../../assets/images/style_icons/kurta/col_shirt_round.png';
import CollarButtonDown from '../../assets/images/style_icons/kurta/col_button_down.png';
import CollarStandard from '../../assets/images/style_icons/kurta/col_standard.png';
import CollarSemiSpread from '../../assets/images/style_icons/kurta/col_semi_spread.png';
import CollarSpread from '../../assets/images/style_icons/kurta/col_spread.png';

// Sleeves & Cuffs
import SleeveNocuff from '../../assets/images/style_icons/kurta/sleeve_nocuff.png';
import SleeveCuff from '../../assets/images/style_icons/kurta/sleeve_cuff.png';

// Cuff Styles (Using same icons as pockets/flaps for now as per your data, or separate if you have them)
import CuffSquare1 from '../../assets/images/style_icons/kurta/type_square_c.png';
import CuffRound1 from '../../assets/images/style_icons/kurta/type_round_c.png';
import CuffNotch1 from '../../assets/images/style_icons/kurta/type_notch_c.png';
import CuffSquare2 from '../../assets/images/style_icons/kurta/type_square_c2.png';
import CuffRound2 from '../../assets/images/style_icons/kurta/type_round_c2.png';
import CuffNotch2 from '../../assets/images/style_icons/kurta/type_notch_c2.png';


// --- WRAPPER FUNCTION ---
const wrapIcon = (src) => ({ color = null, size = 60, style, ...rest }) => (
  <Image
    source={src}
    style={[ { width: size, height: size }, color ? { tintColor: color } : null, style ]}
    resizeMode="contain"
    {...rest}
  />
);

// --- EXPORTS (Yahan se error aa raha tha kyunki ye missing the) ---
export const IconLenLong = wrapIcon(LenLong);
export const IconLenShort = wrapIcon(LenShort);
export const IconCutRound = wrapIcon(CutRound);
export const IconCutStraight = wrapIcon(CutStraight);
export const IconPlacketNotch = wrapIcon(PlacketNotch);
export const IconPlacketSquare = wrapIcon(PlacketSquare);
export const IconPocket0 = wrapIcon(Pocket0);
export const IconPocket1 = wrapIcon(Pocket1);
export const IconPocket2 = wrapIcon(Pocket2);
export const IconFlap0 = wrapIcon(Flap0);
export const IconFlap1 = wrapIcon(Flap1);
export const IconTypeRound = wrapIcon(TypeRound);
export const IconTypeNotch = wrapIcon(TypeNotch);
export const IconTypeSquare = wrapIcon(TypeSquare);
export const IconEpNo = wrapIcon(EpNo);
export const IconEpYes = wrapIcon(EpYes);

export const IconColRound = wrapIcon(CollarRound);
export const IconColMandarin = wrapIcon(CollarMandarin);
export const IconColChinese = wrapIcon(CollarChinese);
export const IconColShirtRound = wrapIcon(CollarShirt);
export const IconColButtonDown = wrapIcon(CollarButtonDown);
export const IconColStandard = wrapIcon(CollarStandard);
export const IconColSemiSpread = wrapIcon(CollarSemiSpread);
export const IconColSpread = wrapIcon(CollarSpread);

export const IconSleeveNocuff = wrapIcon(SleeveNocuff);
export const IconSleeveCuff = wrapIcon(SleeveCuff);

export const IconTypeSquareC1 = wrapIcon(CuffSquare1 || TypeSquare);
export const IconTypeRoundC1 = wrapIcon(CuffRound1 || TypeRound);
export const IconTypeNotchC1 = wrapIcon(CuffNotch1 || TypeNotch);
export const IconTypeSquareC2 = wrapIcon(CuffSquare2 || TypeSquare);
export const IconTypeRoundC2 = wrapIcon(CuffRound2 || TypeRound);
export const IconTypeNotchC2 = wrapIcon(CuffNotch2 || TypeNotch);