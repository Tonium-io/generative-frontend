import React, { useState } from 'react';
import PropTypes from 'prop-types';
// material
import { Box, Card, Typography, Stack, Button } from '@mui/material';
import { styled } from '@mui/material/styles';

import Label from '../../Label';
import NonMintedModal from './NonMintedModal';

// ----------------------------------------------------------------------

const NFTCardImage = styled('img')({
  top: 0,
  width: '100%',
  height: '100%',
  objectFit: 'cover',
  position: 'absolute'
});

// ----------------------------------------------------------------------

MinedNFTCard.propTypes = {
  nft: PropTypes.object,
  ipfsUploaded: PropTypes.string,
  rootAddress: PropTypes.string,
  price: PropTypes.string,
  status: PropTypes.string
};

export default function MinedNFTCard({ nft, ipfsUploaded, rootAddress, price, status }) {
  const { name, image, traits, ipfs } = nft;
  // added this state to intiliaze Nft as NFT ... later will change
  const [isMinted, setIsMinted] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  const handleCardClick = () => {
    if (!isMinted) {
      setModalOpen(true);
    }
  };

  const handleClose = () => {
    setModalOpen(false);
  };

  return (
    <>
      <Card onClick={handleCardClick} sx={{ mb: 2 }}>
        <Box sx={{ pt: '100%', position: 'relative' }}>
          <Label
            variant="filled"
            color={status === 'minted' ? 'success' : 'error'}
            sx={{
              zIndex: 9,
              top: 16,
              right: 16,
              position: 'absolute',
              textTransform: 'uppercase'
            }}
          >
            {status === 'minted' ? 'Minted' : 'Non-Minted'}
          </Label>
          <NFTCardImage alt={name} src={image} />
          <div
            className="frostedWrapper"
            style={{
              background: 'rgba(255, 255, 255, 0.192)',
              backdropFilter: 'blur(15px)',
              height: '100%',
              width: '100%',
              position: 'absolute',
              top: 0,
              left: 0
            }}
          />
        </Box>

        <Stack spacing={2} sx={{ p: 3 }}>
          <Typography variant="subtitle2" noWrap>
            {name}
          </Typography>

          <Stack alignItems="center" justifyContent="space-between">
            {traits.map((trait) => (
              <Stack
                alignItems="center"
                direction="row"
                justifyContent="space-between"
                width="100%"
                key={`${name}_${trait.trait_type}`}
              >
                <Typography variant="subtitle2">{trait.trait_type}</Typography>
                <Typography variant="subtitle2">{trait.value}</Typography>
              </Stack>
            ))}
          </Stack>
          {ipfs && (
            <Button variant="contained" href={`https://ipfs.io/ipfs/${ipfs}`} target="_blank">
              View on IPFS
            </Button>
          )}
          {ipfsUploaded && status === 'minted' && (
            <Button
              variant="contained"
              href={`https://ipfs.io/ipfs/${ipfsUploaded}`}
              target="_blank"
            >
              View on IPFS
            </Button>
          )}
        </Stack>
      </Card>
      <NonMintedModal
        open={modalOpen}
        handleClose={handleClose}
        handleMint={() => setIsMinted(true)}
        rootAddress={rootAddress}
        price={price}
      />
    </>
  );
}
