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

CloseStopProcess.propTypes = {
  open: PropTypes.bool,
  handleCloseLoadModal: PropTypes.func,
  handleDelete: PropTypes.func
};

export default function CloseStopProcess({ open, handleCloseLoadModal, handleDelete }) {
  return (
    <div>
      <Dialog
        open={open}
        onClose={handleCloseLoadModal}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">End Process</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Do you really want to cancel this operation?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseLoadModal}>Cancel</Button>
          <Button onClick={handleDelete} autoFocus>
            Yes
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
