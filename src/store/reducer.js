const reducer = (state, action) => {
  switch (action.type) {
    case 'SET_ACCOUNT':
      return { ...state, account: { ...state.account, ...action.payload } };
    case 'SET_TON':
      return {
        ...state,
        ton: { ...state.ton, ...action.payload }
      };
    default:
      throw new Error();
  }
};

export default reducer;
