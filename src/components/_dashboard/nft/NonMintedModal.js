import React, { useContext } from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle
} from '@mui/material';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import StoreContext from '../../../store/StoreContext';

DeleteCardDialog.propTypes = {
  open: PropTypes.bool,
  handleClose: PropTypes.func,
  handleMint: PropTypes.func,
  rootAddress: PropTypes.string
};

export default function DeleteCardDialog({ open, handleClose, handleMint, rootAddress }) {
  const history = useNavigate();

  const { dispatch } = useContext(StoreContext);

  return (
    <div>
      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">Mint Nft</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Do you really want to go to the Mint NFT page and mint a random NFT from this
            collection?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              dispatch({
                type: 'ADD_ROOTADDRESS',
                payload: rootAddress
              });
              history(`/dashboard/mint`);
              handleMint();
            }}
            autoFocus
          >
            Yes
          </Button>
          <Button onClick={() => handleClose()}>No</Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
