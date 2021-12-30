import React from 'react';
import QRCode from 'qrcode.react';
import CopyToClipboard from 'react-copy-to-clipboard';
import { Stack, Card, Grid, Typography } from '@mui/material';
import PropTypes from 'prop-types';

CollectionCard.propTypes = {
  collectionData: PropTypes.array
};

function CollectionCard({ collectionData }) {
  return (
    <div style={{ marginTop: 30 }}>
      {collectionData.length ? (
        <Typography variant="h4" sx={{ mb: 3 }}>
          Collections
        </Typography>
      ) : (
        ''
      )}
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
                  <h3>Root address for minting</h3>
                  <CopyToClipboard text={item} onCopy={() => alert('Copied')}>
                    <div style={{ wordBreak: 'break-all', cursor: 'pointer' }}>{item}</div>
                  </CopyToClipboard>
                </Grid>
              </Stack>
            </Card>
          </Grid>
        ))}
      </Stack>
    </div>
  );
}

export default CollectionCard;
