import React from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle
} from '@mui/material';
import PropTypes from 'prop-types';

CreateDuplicateCollection.propTypes = {
  open: PropTypes.bool,
  handleDuplicateGenerate: PropTypes.func,
  setIsDuplicateModalOpen: PropTypes.func
};

export default function CreateDuplicateCollection({
  open,
  handleDuplicateGenerate,
  setIsDuplicateModalOpen
}) {
  return (
    <div>
      <Dialog
        open={open}
        onClose={() => setIsDuplicateModalOpen(false)}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">Deploy NFTs</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description" as="div">
            Attention! Your collection has already been deployed to the blockchain. A repeated
            operation will create another collection. Continue?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIsDuplicateModalOpen(false)}>No</Button>
          <Button onClick={handleDuplicateGenerate} autoFocus>
            Yes
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
