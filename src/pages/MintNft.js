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
import { useContext } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { signerKeys } from '@tonclient/core';
import Page from '../components/Page';
import StoreContext from '../store/StoreContext';
import UploaderABI from '../assets/contracts/UploadDeGenerative.abi.json';
import RootABI from '../assets/contracts/NftRoot.abi.json';
import { everscaleAccount } from '../utils/helpers';

const MintNft = () => {
  const {
    state: { account, ton }
  } = useContext(StoreContext);

  /**
   * Mint by admin (by Uploader)
   * @param values
   * @param formikHelpers
   */
  const onMintAdminHandler = async (values, formikHelpers) => {
    // Restore keys from phrase
    const keypair = await ton.client.crypto.mnemonic_derive_sign_keys({ phrase: values.phrase });
    console.debug('Keypair', keypair);

    // Create `Uploader` account
    const uploader = await everscaleAccount(UploaderABI, undefined, {
      client: ton.client,
      address: values.uploader,
      signer: signerKeys(keypair)
    });

    // Run contract `mintByAdmin` method
    await uploader.run('mintByAdmin', { adr: values.root });
    console.debug('Minted');
    formikHelpers.resetForm({});
  };

  /**
   * Mint tokens with connected account
   * @param values
   * @param formikHelpers
   * @return {Promise<void>}
   */
  const onMintHandler = async (values, formikHelpers) => {
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
    console.debug('Minted');
    formikHelpers.resetForm({});
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
                uploader: '',
                root: '',
                phrase: ''
              }}
              validationSchema={Yup.object().shape({
                uploader: Yup.string().required(),
                root: Yup.string().required(),
                phrase: Yup.string().required()
              })}
              onSubmit={onMintAdminHandler}
            >
              {({ errors, touched, isSubmitting }) => (
                <Form>
                  <Field name="uploader">
                    {({ field, form }) => (
                      <TextField
                        label="Uploader address"
                        fullWidth
                        autoComplete="off"
                        error={form.touched.uploader && Boolean(form.errors.uploader)}
                        {...field}
                      />
                    )}
                  </Field>
                  {touched.uploader && errors.uploader && (
                    <FormHelperText error>{errors.uploader}</FormHelperText>
                  )}

                  <Field name="root">
                    {({ field, form }) => (
                      <TextField
                        label="Root address"
                        fullWidth
                        autoComplete="off"
                        error={form.touched.root && Boolean(form.errors.root)}
                        {...field}
                      />
                    )}
                  </Field>
                  {touched.root && errors.root && (
                    <FormHelperText error>{errors.root}</FormHelperText>
                  )}

                  <Field name="phrase">
                    {({ field, form }) => (
                      <TextField
                        label="NFT mnemonic phrase"
                        fullWidth
                        autoComplete="off"
                        error={form.touched.phrase && Boolean(form.errors.phrase)}
                        {...field}
                      />
                    )}
                  </Field>
                  {touched.phrase && errors.phrase && (
                    <FormHelperText error>{errors.phrase}</FormHelperText>
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
                root: '',
                price: 0
              }}
              validationSchema={Yup.object().shape({
                root: Yup.string().required(),
                price: Yup.number().min(1)
              })}
              onSubmit={onMintHandler}
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
                      />
                    )}
                  </Field>
                  {touched.root && errors.root && (
                    <FormHelperText error>{errors.root}</FormHelperText>
                  )}

                  <Field name="price">
                    {({ field, form }) => (
                      <TextField
                        label="Token price"
                        fullWidth
                        autoComplete="off"
                        error={form.touched.price && Boolean(form.errors.price)}
                        {...field}
                      />
                    )}
                  </Field>
                  {touched.price && errors.price && (
                    <FormHelperText error>{errors.price}</FormHelperText>
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
    </Page>
  );
};

export default MintNft;
