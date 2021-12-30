import {
  Container,
  Grid,
  TextField,
  Button,
  FormHelperText,
  Typography,
  Link
} from '@mui/material';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import { useContext, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { signerExternal } from '@tonclient/core';
import CopyToClipboard from 'react-copy-to-clipboard';
import { AccountType } from '@tonclient/appkit';
import Page from '../components/Page';
import StoreContext from '../store/StoreContext';
import UploaderABI from '../assets/contracts/UploadDeGenerative.abi.json';
import UploaderTVC from '../assets/contracts/UploadDeGenerative.tvc';
import RootABI from '../assets/contracts/NftRoot.abi.json';
import DataABI from '../assets/contracts/Data.abi.json';
import { everscaleAccount, everscaleSendMessage, everscaleSignWithWallet } from '../utils/helpers';
import MintNFTModal from '../components/_dashboard/nft/MintNFTModal';
import ShopProductCard from '../components/_dashboard/products/ProductCard';

const MintNft = () => {
  const {
    state: { account, ton, newRootAddress }
  } = useContext(StoreContext);
  const [modal, setModal] = useState({ isOpen: false, title: undefined, content: undefined });

  const getRootData = async (address) => {
    const root = await everscaleAccount(RootABI, undefined, { address, client: ton.client });
    await root.refresh();
    const acc = await root.getAccount();
    const result = await root.client.abi.decode_account_data({
      abi: root.abi,
      data: acc.data
    });
    return result.data;
  };

  const getMetadata = async (address, rootData) => {
    const root = await everscaleAccount(RootABI, undefined, { address, client: ton.client });
    const resolvedData = await root.runLocal('resolveData', {
      addrRoot: await root.getAddress(),
      id: +rootData._totalMinted - 1,
      name: rootData._name
    });

    const dataAddress = resolvedData.decoded.output.addrData;
    await new Promise((resolve) => {
      const interval = setInterval(async () => {
        const result = await ton.client.net.query_collection({
          collection: 'accounts',
          filter: { id: { eq: dataAddress } },
          result: 'acc_type'
        });

        console.debug('[MINT NFT] - Wait for data account', result.result);
        if (result.result.length && result.result[0].acc_type === AccountType.active) {
          clearInterval(interval);
          resolve();
        }
      }, 3000);
    });

    const dataAccount = await everscaleAccount(DataABI, undefined, {
      address: dataAddress,
      client: ton.client
    });
    const dataInfo = await dataAccount.runLocal('getInfo', {});
    const compressed = Buffer.from(dataInfo.decoded.output.metadata, 'hex').toString('base64');
    const zstd = await ton.client.utils.decompress_zstd({ compressed });
    const metadata = JSON.parse(Buffer.from(zstd.decompressed, 'base64').toString());
    console.log(metadata);

    const product = {
      name: metadata.name,
      cover: metadata.image.replace('ipfs://', 'https://ipfs.io/ipfs/'),
      price: metadata.price
    };
    setModal({
      isOpen: true,
      title: 'Minted token',
      content: (
        <Grid container style={{ minWidth: '320px' }}>
          <Grid item xs={12}>
            <CopyToClipboard text={dataAddress} onCopy={() => alert('Copied')}>
              <div style={{ margin: '1rem 0', cursor: 'pointer' }}>
                {dataAddress.slice(0, 12)}...{dataAddress.slice(-12)}
              </div>
            </CopyToClipboard>
            <ShopProductCard product={product} />
          </Grid>
        </Grid>
      )
    });
  };

  /**
   * Mint by admin (by Uploader)
   * @param values
   * @param formikHelpers
   */
  const onMintAdminHandler = async (values, formikHelpers) => {
    // Create `Uploader` account
    const uploader = await everscaleAccount(UploaderABI, UploaderTVC, {
      client: ton.client,
      signer: signerExternal(account.public)
    });

    // Get root data before minting
    let rootData = await getRootData(values.root);
    if (!rootData.preGenerateMetadata.length) {
      alert('All tokens are minted :(');
      return;
    }

    // Run contract `mintByAdmin` method
    const encodeMintByAdmin = {
      abi: uploader.abi,
      address: await uploader.getAddress(),
      call_set: {
        function_name: 'mintByAdmin',
        input: { adr: values.root }
      },
      signer: signerExternal(account.public)
    };
    const signed = await everscaleSignWithWallet(ton.provider, ton.client, encodeMintByAdmin);
    await everscaleSendMessage(ton.client, signed.message, uploader.abi);

    // Wait for minting completed
    // TODO: Do it in more pretty way
    await new Promise((resolve) => {
      const interval = setInterval(async () => {
        const _data = await getRootData(values.root);
        console.debug('[MINT NFT] - Check root', _data._totalMinted, rootData._totalMinted);
        if (+_data._totalMinted > +rootData._totalMinted) {
          rootData = _data;
          clearInterval(interval);
          resolve();
        }
      }, 3000);
    });
    console.debug('[MINT NFT] - Minted');

    // Get minted token metadata
    await getMetadata(values.root, rootData);
    formikHelpers.resetForm({});
  };

  /**
   * Mint tokens with connected account
   * @param values
   * @param formikHelpers
   * @return {Promise<void>}
   */
  const onMintHandler = async (values, formikHelpers) => {
    // Get root data before minting
    let rootData = await getRootData(values.root);
    if (!rootData.preGenerateMetadata.length) {
      alert('All tokens are minted :(');
      return;
    }

    // Mint token
    await ton.provider.sendMessage({
      sender: account.address,
      recipient: values.root,
      amount: (values.price * 10 ** 9).toString(),
      bounce: true,
      payload: {
        abi: JSON.stringify(RootABI),
        method: 'mintNft',
        params: {}
      }
    });

    // Wait for minting completed
    // TODO: Do it in more pretty way
    await new Promise((resolve) => {
      const interval = setInterval(async () => {
        const _data = await getRootData(values.root);
        console.debug('[MINT NFT] - Check root', _data._totalMinted, rootData._totalMinted);
        if (+_data._totalMinted > +rootData._totalMinted) {
          rootData = _data;
          clearInterval(interval);
          resolve();
        }
      }, 3000);
    });
    console.debug('[MINT NFT] - Minted');

    // Get minted token metadata
    await getMetadata(values.root, rootData);
    formikHelpers.resetForm({});
  };

  const handleModalClose = () => {
    setModal({ isOpen: !modal.isOpen, title: undefined, content: undefined });
  };

  if (!account.isReady) {
    return (
      <Page title="Mint NFT">
        <Container>
          <Typography variant="h4" sx={{ mb: 5 }}>
            <Link underline="none" component={RouterLink} to="/dashboard/login">
              <Button fullWidth variant="contained">
                Login first
              </Button>
            </Link>
          </Typography>
        </Container>
      </Page>
    );
  }

  return (
    <Page title="Mint NFT">
      <Container>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <h3>Mint by admin</h3>
            <Formik
              initialValues={{
                root: newRootAddress
              }}
              validationSchema={Yup.object().shape({
                root: Yup.string().required()
              })}
              onSubmit={onMintAdminHandler}
            >
              {({ errors, touched, isSubmitting }) => (
                <Form>
                  <Field name="root">
                    {({ field, form }) => (
                      <TextField
                        label="Root address"
                        fullWidth
                        autoComplete="off"
                        error={form.touched.root && Boolean(form.errors.root)}
                        {...field}
                        sx={{ mt: 2, mb: 2 }}
                      />
                    )}
                  </Field>
                  {touched.root && errors.root && (
                    <FormHelperText sx={{ mt: -1, mb: 2 }} error>
                      {errors.root}
                    </FormHelperText>
                  )}

                  <div>
                    <Button
                      variant="contained"
                      sx={{ whiteSpace: 'nowrap' }}
                      color="primary"
                      type="submit"
                      disabled={isSubmitting}
                    >
                      Mint by admin
                    </Button>
                  </div>
                </Form>
              )}
            </Formik>
          </Grid>

          <Grid item xs={12} md={6}>
            <h3>Mint by anybody (using connected wallet)</h3>
            <Formik
              initialValues={{
                root: newRootAddress,
                price: ''
              }}
              validationSchema={Yup.object().shape({
                root: Yup.string().required(),
                price: Yup.number().min(1)
              })}
              onSubmit={onMintHandler}
            >
              {({ errors, touched, isSubmitting, setFieldValue }) => (
                <Form>
                  <Field name="root">
                    {({ field, form }) => (
                      <TextField
                        label="Root address"
                        fullWidth
                        autoComplete="off"
                        error={form.touched.root && Boolean(form.errors.root)}
                        {...field}
                        sx={{ mt: 2, mb: 2 }}
                        onChange={async (e) => {
                          const address = e.target.value;
                          setFieldValue('root', address, true);
                          if (address) {
                            const data = await getRootData(address);
                            setFieldValue('price', +data.price / 10 ** 9 + 2, true);
                          }
                        }}
                      />
                    )}
                  </Field>
                  {touched.root && errors.root && (
                    <FormHelperText sx={{ mt: -1, mb: 2 }} error>
                      {errors.root}
                    </FormHelperText>
                  )}

                  <Field name="price">
                    {({ field, form }) => (
                      <TextField
                        label="Token price (+2 commission)"
                        fullWidth
                        autoComplete="off"
                        error={form.touched.price && Boolean(form.errors.price)}
                        {...field}
                        sx={{ mb: 2 }}
                        disabled
                      />
                    )}
                  </Field>
                  {touched.price && errors.price && (
                    <FormHelperText sx={{ mt: -1, mb: 2 }} error>
                      {errors.price}
                    </FormHelperText>
                  )}

                  <div>
                    <Button
                      variant="contained"
                      sx={{ whiteSpace: 'nowrap' }}
                      color="primary"
                      type="submit"
                      disabled={isSubmitting}
                    >
                      Mint
                    </Button>
                  </div>
                </Form>
              )}
            </Formik>
          </Grid>
        </Grid>
      </Container>
      <MintNFTModal handleModalClose={handleModalClose} {...modal} />
    </Page>
  );
};

export default MintNft;
