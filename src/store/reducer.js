import faker from 'faker';
import { set } from 'date-fns';

const reducer = (state, action) => {
  switch (action.type) {
    case 'SET_ACCOUNT':
      return { ...state, account: { ...state.account, ...action.payload } };
    case 'SET_TON':
      return {
        ...state,
        ton: { ...state.ton, ...action.payload }
      };
    case 'ADD_NOTIFICATION':
      return {
        ...state,
        messages: [
          {
            id: faker.datatype.uuid(),
            title: action.payload,
            description: '',
            avatar: null,
            type: 'system_generated',
            createdAt: set(new Date(), {
              hours: new Date().getHours(),
              minutes: new Date().getHours(),
              seconds: new Date().getSeconds()
            }),
            isUnRead: true
          },
          ...state.messages
        ]
      };
    case 'REMOVE_NOTIFICATION':
      return {
        ...state,
        messages: []
      };
    case 'READ_NOTIFICATION':
      return {
        ...state,
        messages: state.messages.map((notification) => ({
          ...notification,
          isUnRead: false
        }))
      };
    case 'ADD_ROOTADDRESS':
      return {
        ...state,
        newRootAddress: action.payload
      };
    case 'ADD_NFTDATA':
      return {
        ...state,
        myNfts: [...state.myNfts, action.payload]
      };
    case 'ADD_PRICE':
      return {
        ...state,
        price: action.payload
      };
    case 'MINTNFT':
      return {
        ...state,
        myNfts: state.myNfts.map((nft) =>
          state.newRootAddress === nft.collection.rootAddress
            ? {
                ...nft,
                status: 'minted'
              }
            : nft
        )
      };
    default:
      throw new Error();
  }
};

export default reducer;
