import faker from 'faker';
import { sample } from 'lodash';
// utils
import { mockImgProduct } from '../utils/mockImages';

// ----------------------------------------------------------------------

// const PRODUCT_NAME = [
//   'Nike Air Force 1 NDESTRUKT',
//   'Nike Space Hippie 04',
//   'Nike Air Zoom Pegasus 37 A.I.R. Chaz Bear',
//   'Nike Blazer Low 77 Vintage',
//   'Nike ZoomX SuperRep Surge',
//   'Zoom Freak 2',
//   'Nike Air Max Zephyr',
//   'Jordan Delta',
//   'Air Jordan XXXV PF',
//   'Nike Waffle Racer Crater',
//   'Kyrie 7 EP Sisterhood',
//   'Nike Air Zoom BB NXT',
//   'Nike Air Force 1 07 LX',
//   'Nike Air Force 1 Shadow SE',
//   'Nike Air Zoom Tempo NEXT%',
//   'Nike DBreak-Type',
//   'Nike Air Max Up',
//   'Nike Air Max 270 React ENG',
//   'NikeCourt Royale',
//   'Nike Air Zoom Pegasus 37 Premium',
//   'Nike Air Zoom SuperRep',
//   'NikeCourt Royale',
//   'Nike React Art3mis',
//   'Nike React Infinity Run Flyknit A.I.R. Chaz Bear'
// ];
const PRODUCT_COLOR = [
  '#00AB55',
  '#000000',
  '#FFFFFF',
  '#FFC0CB',
  '#FF4842',
  '#1890FF',
  '#94D82D',
  '#FFC107'
];
const BG = ['grey', 'white', 'blue', 'green', 'red', 'yellow'];
const TATU = ['blood', 'scar', 'tatu'];
const MEDEL = ['bitcoin', 'none', 'crystal'];
const RAMEN = 'remen';
const PHRASE = ['none', 'hodl_times', 'on_the_legend'];
// ----------------------------------------------------------------------

const products = [...Array(24)].map((_, index) => {
  const setIndex = index + 1;

  return {
    id: faker.datatype.uuid(),
    cover: mockImgProduct(Math.ceil(Math.random() * 4)),
    name: `collection #${index}`,
    price: faker.datatype.number({ min: 4, max: 99, precision: 0.01 }),
    priceSale: setIndex % 3 ? null : faker.datatype.number({ min: 19, max: 29, precision: 0.01 }),
    bg: BG[Math.floor(Math.random() * BG.length)],
    tatu: TATU[Math.floor(Math.random() * TATU.length)],
    medal: MEDEL[Math.floor(Math.random() * MEDEL.length)],
    ramen: RAMEN,
    train: Math.floor(Math.random() * 10),
    phrase: PHRASE[Math.floor(Math.random() * PHRASE.length)],
    colors:
      (setIndex === 1 && PRODUCT_COLOR.slice(0, 2)) ||
      (setIndex === 2 && PRODUCT_COLOR.slice(1, 3)) ||
      (setIndex === 3 && PRODUCT_COLOR.slice(2, 4)) ||
      (setIndex === 4 && PRODUCT_COLOR.slice(3, 6)) ||
      (setIndex === 23 && PRODUCT_COLOR.slice(4, 6)) ||
      (setIndex === 24 && PRODUCT_COLOR.slice(5, 6)) ||
      PRODUCT_COLOR,
    status: sample(['on auction', 'new', 'sale', 'minted'])
  };
});

export default products;
