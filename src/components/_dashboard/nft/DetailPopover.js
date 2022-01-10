import * as React from 'react';
import Popover from '@mui/material/Popover';
import Typography from '@mui/material/Typography';
import PropTypes from 'prop-types';

BasicPopover.propTypes = {
  open: PropTypes.bool,
  title: PropTypes.string,
  type: PropTypes.string,
  handleClose: PropTypes.func
};

export default function BasicPopover({ open, handleClose, title, type }) {
  //   const id = open ? 'simple-popover' : undefined;

  return (
    <Popover
      // id={id}
      open={open}
      anchorEl={open}
      onClose={handleClose}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: type === 'price' ? 'left' : 'center'
      }}
      sx={{ mt: 3 }}
    >
      <Typography sx={{ p: 2 }}>{title}</Typography>
    </Popover>
  );
}
