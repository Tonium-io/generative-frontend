/**
 * Read binary file to ArrayBuffer
 * @param file
 * @return {Promise<ArrayBuffer>}
 */
import { Account, AccountType } from '@tonclient/appkit';
import { TonClient } from '@tonclient/core';

export const readBinaryFile = async (file) => {
  const response = await fetch(file);
  return response.arrayBuffer();
};

/**
 * Create Everscale client object
 * @param connectionName
 * @return {TonClient}
 */
export const everscaleClient = (connectionName) => {
  const endpoints = {
    mainnet: ['main2.ton.dev', 'main3.ton.dev', 'main4.ton.dev'],
    testnet: ['net1.ton.dev', 'net5.ton.dev'],
    fld: ['gql.custler.net']
  };
  return new TonClient({
    network: {
      endpoints: endpoints[connectionName] || ['http://localhost']
    }
  });
};

/**
 * Everscale account
 * @param abi Imported ABI from file, e.g. `import ABI from '../Contract.abi.json'`
 * @param tvc Imported TVC from file, e.g. `import TVC from '../Contract.tvc'`
 * @param accountOptions Everscale `AccountOptions`
 */
export const everscaleAccount = async (abi, tvc = undefined, accountOptions = undefined) =>
  new Account(
    {
      abi,
      tvc: tvc ? Buffer.from(await readBinaryFile(tvc)).toString('base64') : undefined
    },
    accountOptions
  );

/**
 * Sign message with wallet
 * @param provider
 * @param client
 * @param paramsOfEncode
 * @return {Promise<ResultOfAttachSignature>}
 */
export const everscaleSignWithWallet = async (provider, client, paramsOfEncode) => {
  const unsignedMessage = await client.abi.encode_message(paramsOfEncode);
  console.debug('[EVERSCALE] - Unsigned message', unsignedMessage);

  const signature = await provider.signDataRaw({
    data: unsignedMessage.data_to_sign,
    publicKey: paramsOfEncode.signer.public_key
  });
  console.debug('[WALLET] - Signature', signature);

  const signed = await client.abi.attach_signature({
    abi: paramsOfEncode.abi,
    public_key: paramsOfEncode.signer.public_key,
    message: unsignedMessage.message,
    signature: signature.signatureHex
  });
  console.debug('[EVERSCALE] - Signed message', signed);
  return signed;
};

/**
 * Send message to the network
 * @param client
 * @param message
 * @param abi
 * @return {Promise<void>}
 */
export const everscaleSendMessage = async (client, message, abi = undefined) => {
  // Send message to the network
  const sendResult = await client.processing.send_message({
    message,
    abi,
    send_events: false
  });
  console.debug('[EVERSCALE] - Send message result', sendResult);

  // Wait for transaction
  const waitResult = await client.processing.wait_for_transaction({
    abi,
    message,
    shard_block_id: sendResult.shard_block_id,
    send_events: false
  });
  console.debug('[EVERSCALE] - Wait for transaction result', waitResult);
};

/**
 * Deploy everscale contract using connected wallet
 * @param provider Connected wallet provider
 * @param providerOptions Options for provider `sendMessage`. Params `recipient` is not needed
 * @param account Everscale `Account` object
 * @param deployOptions Everscale `AccountDeployOptions`
 * @return {Promise<void>}
 */
export const everscaleDeployWithWallet = async (
  provider,
  providerOptions,
  account,
  deployOptions = undefined
) => {
  /**
   * Inner function to sign deploy message with wallet and
   * send to the network
   * @return {Promise<void>}
   */
  const deploy = async () => {
    const paramsOfDeploy = account.getParamsOfDeployMessage(deployOptions);
    const signed = await everscaleSignWithWallet(provider, account.client, paramsOfDeploy);
    await everscaleSendMessage(account.client, signed.message, paramsOfDeploy.abi);
  };

  // Check account status (for case, if it was topuped somehow before)
  const acc = await account.getAccount();
  if (acc.acc_type === AccountType.active) return;
  if (acc.acc_type === AccountType.uninit) {
    await deploy();
    return;
  }

  // If account still has status `notExist`, subscribe for account status
  // and topup it.
  const recipient = await account.getAddress();
  await new Promise((resolve) => {
    account.subscribeAccount('acc_type', async (data) => {
      console.debug('[EVERSCALE] - Deploy: AccType', data.acc_type);
      if (data.acc_type === AccountType.uninit) {
        await deploy();
        await account.free();
        resolve();
      }
    });
    provider.sendMessage({ ...providerOptions, recipient });
  });
};
