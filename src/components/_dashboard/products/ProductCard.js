import PropTypes from 'prop-types';
import { Link as RouterLink } from 'react-router-dom';
// material
import { Box, Card, Link, Typography, Stack } from '@mui/material';
import { styled } from '@mui/material/styles';
// utils
import { fCurrency } from '../../../utils/formatNumber';
//
import Label from '../../Label';
// import ColorPreview from '../../ColorPreview';
// ----------------------------------------------------------------------

const ProductImgStyle = styled('img')({
  top: 0,
  width: '100%',
  height: '100%',
  objectFit: 'cover',
  position: 'absolute'
});

// ----------------------------------------------------------------------

ShopProductCard.propTypes = {
  product: PropTypes.object
};

export default function ShopProductCard({ product }) {
  const { name, cover, status, bg, tatu, medal, ramen, train, phrase, priceSale, price } = product;

  return (
    <Card>
      <Box sx={{ pt: '100%', position: 'relative' }}>
        {status && (
          <Label
            variant="filled"
            color={
              (status === 'sale' && 'error') ||
              (status === 'minted' && 'success') ||
              (status === 'new' && 'primary') ||
              'info'
            }
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
        <ProductImgStyle alt={name} src={cover} />
      </Box>

      <Stack sx={{ p: 3 }}>
        <Link to="#" color="inherit" underline="hover" component={RouterLink} sx={{ mb: 2 }}>
          <Typography variant="subtitle2" noWrap>
            {name}
          </Typography>
        </Link>

        {status === 'on auction' && (
          <Stack direction="row" alignItems="center" justifyContent="space-between">
            {/* <ColorPreview colors={colors} /> */}
            <Typography variant="subtitle1">
              <Typography
                component="span"
                variant="body1"
                sx={{
                  color: 'text.disabled',
                  textDecoration: 'line-through'
                }}
              >
                {priceSale && fCurrency(priceSale)}
              </Typography>
              &nbsp;
              {fCurrency(price)}
            </Typography>
          </Stack>
        )}
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Typography>bg</Typography>
          <Typography>{bg}</Typography>
        </Stack>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Typography>tatu</Typography>
          <Typography>{tatu}</Typography>
        </Stack>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Typography>medal</Typography>
          <Typography>{medal}</Typography>
        </Stack>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Typography>ramen</Typography>
          <Typography>{ramen}</Typography>
        </Stack>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Typography>Trait #5</Typography>
          <Typography>{train}</Typography>
        </Stack>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Typography>phrase</Typography>
          <Typography>{phrase}</Typography>
        </Stack>
      </Stack>
    </Card>
  );
}
