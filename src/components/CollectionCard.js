import React, { useState } from 'react';
import QRCode from 'qrcode.react';
import CopyToClipboard from 'react-copy-to-clipboard';
import { Stack, Card, Grid, Typography, Link, Button } from '@mui/material';
import PropTypes from 'prop-types';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import 'react-toastify/dist/ReactToastify.css';
import { toast } from 'react-toastify';

CollectionCard.propTypes = {
  collectionData: PropTypes.array,
  collectionDetails: PropTypes.object
};

toast.configure();

function CollectionCard({ collectionData, collectionDetails }) {
  const [contentCopied, setContentCopied] = useState('');
  const history = useNavigate();

  const handleCopied = (content) => {
    if (content === contentCopied) {
      toast.info('Already Copied!', {
        position: 'top-right',
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined
      });
    } else {
      toast.success('Copied!', {
        position: 'top-right',
        autoClose: 3000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined
      });
    }
    setContentCopied(content);
  };

  return (
    <div style={{ marginTop: 30 }}>
      {collectionData && collectionData.length ? (
        <>
          <Typography variant="h4" sx={{ mb: 3 }}>
            Collections
          </Typography>
          <Stack direction="row" alignItems="center" spacing={2}>
            {collectionData.map((item) => (
              <Grid key={item} xs={12} md={3}>
                <Card variant="outlined" sx={{ mb: 2, px: 2, py: 2 }}>
                  <Stack
                    direction="column"
                    alignItems="center"
                    justifyContent="space-between"
                    style={{ flexWrap: 'wrap' }}
                  >
                    <Grid item sx={{ mt: 1 }}>
                      <QRCode value={item} />
                    </Grid>
                    <Grid item>
                      <Stack
                        direction="row"
                        alignItems="center"
                        justifyContent="space-between"
                        spacing={2}
                      >
                        <h3>Root address for minting</h3>
                        <ContentCopyIcon onClick={() => handleCopied(item)} />
                      </Stack>
                      <CopyToClipboard text={item} onCopy={() => {}}>
                        <div style={{ wordBreak: 'break-all', cursor: 'pointer' }}>{item}</div>
                      </CopyToClipboard>
                    </Grid>
                    <Button
                      variant="contained"
                      onClick={() => history(`/dashboard/mynfts/${item}`)}
                      sx={{ mt: 1.5 }}
                    >
                      Mint Nfts
                    </Button>
                  </Stack>
                </Card>
              </Grid>
            ))}
          </Stack>
        </>
      ) : (
        ''
      )}

      {/* coll */}

      {collectionDetails && collectionDetails.collectionName ? (
        <Link underline="none" component={RouterLink} to={`${collectionDetails.rootAddress}`}>
          <Grid xs={12}>
            <Card variant="outlined" sx={{ mb: 2, px: 2, py: 2 }}>
              <Stack
                direction="column"
                // alignItems="center"
                justifyContent="space-between"
                style={{ flexWrap: 'wrap' }}
              >
                <Grid item sx={{ mt: 1 }} style={{ margin: 'auto' }}>
                  <QRCode value={collectionDetails.rootAddress} />
                </Grid>
                <Grid item>
                  <Typography variant="h4">{collectionDetails.collectionName}</Typography>
                  <Typography variant="h6">{collectionDetails.collectionDesc}</Typography>
                </Grid>
              </Stack>
            </Card>
          </Grid>
        </Link>
      ) : (
        ''
      )}
    </div>
  );
}

export default CollectionCard;
