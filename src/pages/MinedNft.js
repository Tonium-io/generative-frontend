import React, { useContext } from 'react';
import { Container, Stack, Grid, Typography } from '@mui/material';
import { useLocation } from 'react-router-dom';
// components
import Page from '../components/Page';
import StoreContext from '../store/StoreContext';
import MinedNFTCard from '../components/_dashboard/nft/MinedNFTCard';

function MinedNft() {
  const {
    state: { myNfts }
  } = useContext(StoreContext);
  const { pathname } = useLocation();

  return (
    <Page title="MyNfts: Mint Nft | NeFerTiti">
      <Container>
        {/* <NFTList nfts={nftData} /> */}
        <Typography variant="h4" sx={{ mb: 4 }}>
          Mint Nfts
        </Typography>
        <Typography variant="h6" sx={{ mb: 3 }}>
          Raraity Value:
          {myNfts.map((elem) => {
            if (elem.collection.rootAddress === pathname.split('/').pop()) {
              if (elem.layerData.length === 1) {
                return '10%';
              }
              if (elem.layerData.length === 2) {
                return '5%';
              }
              return '4.5%';
            }
            return '';
          })}
        </Typography>
        <Stack
          direction="row"
          spacing={2}
          alignItems="center"
          justifyContent="space-between"
          style={{ flexWrap: 'wrap' }}
        >
          {myNfts.map((elem) => {
            if (elem.collection.rootAddress === pathname.split('/').pop()) {
              return elem.nftData.map((val, index) => (
                <Grid key={index} item xs={12} sm={6} md={3}>
                  <MinedNFTCard
                    key={index}
                    nft={val}
                    ipfsUploaded={elem.ipfsUploaded}
                    rootAddress={pathname.split('/').pop()}
                  />
                </Grid>
              ));
            }
            return '';
          })}
        </Stack>
      </Container>
    </Page>
  );
}

export default MinedNft;
