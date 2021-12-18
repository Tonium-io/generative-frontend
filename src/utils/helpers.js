/**
 * Read binary file to ArrayBuffer
 * @param file
 * @return {Promise<ArrayBuffer>}
 */
import { Account, AccountType } from '@tonclient/appkit';

export const readBinaryFile = async (file) => {
  const response = await fetch(file);
  return response.arrayBuffer();
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
 * Deploy Everscale contract
 * @param account Everscale `Account` object
 * @param deployOptions Everscale `AccountDeployOptions`
 */
export const everscaleDeploy = async (account, deployOptions = undefined) => {
  // Check account status (for case, if it was topuped somehow before)
  const acc = await account.getAccount();
  if (acc.acc_type === AccountType.active) return;
  if (acc.acc_type === AccountType.uninit) {
    await account.deploy(deployOptions);
    return;
  }

  // If account still has status `notExist`, subscribe for account status
  await new Promise((resolve) => {
    account.subscribeAccount('acc_type', async (data) => {
      console.debug('[EVERSCALE] - Deploy: AccType', data.acc_type);
      if (data.acc_type === AccountType.uninit) {
        await account.deploy(deployOptions);
        await account.free();
        resolve();
      }
    });
  });
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
  const recipient = await account.getAddress();
  await provider.sendMessage({
    ...providerOptions,
    recipient
  });
  await everscaleDeploy(account, deployOptions);
};
