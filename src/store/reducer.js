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
    default:
      throw new Error();
  }
};

export default reducer;
