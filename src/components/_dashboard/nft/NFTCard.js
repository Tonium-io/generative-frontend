import PropTypes from 'prop-types';
import { Link as RouterLink } from 'react-router-dom';
// material
import { Box, Card, Link, Typography, Stack, ListItemText } from '@mui/material';
import { styled } from '@mui/material/styles';

import Label from '../../Label';

// ----------------------------------------------------------------------

const NFTCardImage = styled('img')({
  top: 0,
  width: '100%',
  height: '100%',
  objectFit: 'cover',
  position: 'absolute'
});

// ----------------------------------------------------------------------

NFTCard.propTypes = {
  nft: PropTypes.object
};

export default function NFTCard({ nft }) {
  const { name, cover, status, traits } = nft;

  return (
    <Card>
      <Box sx={{ pt: '100%', position: 'relative' }}>
        {status && (
          <Label
            variant="filled"
            color={(status === 'sale' && 'error') || 'info'}
            sx={{
              zIndex: 9,
              top: 16,
              right: 16,
              position: 'absolute',
              textTransform: 'uppercase'
            }}
          >
            {status}
          </Label>
        )}
        <NFTCardImage alt={name} src={cover} />
      </Box>

      <Stack spacing={2} sx={{ p: 3 }}>
        <Typography variant="subtitle2" noWrap>
          {name}
        </Typography>

        <Stack direction="row" alignItems="center" justifyContent="space-between">
          {traits.map((trait) => (
            <div key={`${name}_${trait.trait_type}`}>
              <Typography variant="subtitle1">{trait.trait_type}</Typography>
              <Typography variant="subtitle1">{trait.trait_value}</Typography>
            </div>
          ))}
        </Stack>
      </Stack>
    </Card>
  );
}