import { ProviderRpcClient } from 'ton-inpage-provider';
import { useReducer, useEffect } from 'react';

import reducer from './reducer';
import { login } from './actions/account';
import { everscaleClient } from '../utils/helpers';

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const InitTon = async (dispatch) => {
  if (!window.hasTonProvider) {
    await delay(100);
    if (!window.hasTonProvider) {
      await delay(200);
      if (!window.hasTonProvider) {
        console.error('no ton provider');
        return;
      }
    }
  }
  const ton = new ProviderRpcClient();
  const providerState = await ton.getProviderState();
  await ton.ensureInitialized();

  dispatch({
    type: 'SET_TON',
    payload: {
      isReady: true,
      provider: ton,
      client: everscaleClient(providerState.selectedConnection)
    }
  });
};

const CreateReducer = () => {
  const [state, dispatch] = useReducer(reducer, {
    ton: {
      provider: null,
      client: null,
      isReady: false
    },
    account: {
      isReady: false,
      address: null,
      public: null,
      balance: null, // maybe in future we can use ton.getBalance().
      ava: null // maybe.
    },
    messages: [], // array to store notifications
    newRootAddress: '',
    myNfts: []
  });
  useEffect(() => {
    InitTon(dispatch).then();

    if (window.ton) {
      window.ton.on('networkChanged', (data) => {
        dispatch({
          type: 'SET_TON',
          payload: {
            client: everscaleClient(data.selectedConnection)
          }
        });
      });
    }
  }, []);

  useEffect(() => {
    login(state, dispatch, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.ton.isReady]);

  return [state, dispatch];
};

export default CreateReducer;
