import * as React from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle
} from '@mui/material';
import PropTypes from 'prop-types';

DetailModal.propTypes = {
  isOpen: PropTypes.bool,
  handleModalClose: PropTypes.func
};

export default function DetailModal({ isOpen, handleModalClose }) {
  return (
    <div>
      <Dialog
        open={isOpen}
        onClose={handleModalClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">Title</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">Random Description</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleModalClose}>Close</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
