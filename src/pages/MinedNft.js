import React, { useContext } from 'react';
import { Container, Stack, Grid, Typography } from '@mui/material';
import { useLocation } from 'react-router-dom';
// components
import Page from '../components/Page';
import StoreContext from '../store/StoreContext';
import NFTCard from '../components/_dashboard/nft/NFTCard';

function MinedNft() {
  const {
    state: { myNfts }
  } = useContext(StoreContext);
  const { pathname } = useLocation();

  return (
    <Page title="MyNfts: Mint Nft | NeFerTiti">
      <Container>
        {/* <NFTList nfts={nftData} /> */}
        <Typography variant="h4" sx={{ mb: 5 }}>
          Mint Nfts
        </Typography>
        <Stack direction="row" spacing={2}>
          {myNfts.map((elem) => {
            if (elem.collection.rootAddress === pathname.split('/').pop()) {
              return elem.nftData.map((val, index) => (
                <Grid key={index} item xs={12} sm={6} md={3}>
                  <NFTCard key={index} nft={val} />
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
