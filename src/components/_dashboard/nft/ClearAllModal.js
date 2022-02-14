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

ClearAllModal.propTypes = {
  open: PropTypes.bool,
  handleClose: PropTypes.func,
  handleDelete: PropTypes.func
};

export default function ClearAllModal({ open, handleClose, handleDelete }) {
  return (
    <div>
      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">Delete</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Are you sure, you will loose all your data of this page?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button onClick={handleDelete} autoFocus>
            Clear All
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
