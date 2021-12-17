/* eslint-disable no-restricted-syntax */
import { useContext, useEffect, useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { create } from 'ipfs-http-client';

// material
import {
  Container,
  Typography,
  Button,
  Stack,
  Card,
  CardContent,
  CardActions,
  Box,
  Link,
  TextField,
  Grid,
  FormHelperText,
  Backdrop,
  CircularProgress
} from '@mui/material';
import { useDropzone } from 'react-dropzone';
import mergeImages from 'merge-images';
import { styled } from '@mui/material/styles';
import DeleteIcon from '@mui/icons-material/Delete';
import QRCode from 'qrcode.react';
import CopyToClipboard from 'react-copy-to-clipboard';
// components
import { signerExternal } from '@tonclient/core';
import Page from '../components/Page';
import NFTList from '../components/_dashboard/nft/NFTList';
import DeleteCardDialog from '../components/_dashboard/nft/DeleteCardDialog';
import DetailModal from '../components/_dashboard/nft/DetailModal';
import { validateForm } from '../components/_dashboard/nft/validateForm';

import StoreContext from '../store/StoreContext';
import UploaderTVC from '../assets/contracts/UploadDeGenerative.tvc';
import UploaderABI from '../assets/contracts/UploadDeGenerative.abi.json';
import RootTVC from '../assets/contracts/NftRoot.tvc';
import RootABI from '../assets/contracts/NftRoot.abi.json';
import IndexTVC from '../assets/contracts/Index.tvc';
import DataTVC from '../assets/contracts/Data.tvc';
import {
  everscaleAccount,
  everscaleDeployWithWallet,
  everscaleSendMessage,
  everscaleSignWithWallet,
  readBinaryFile
} from '../utils/helpers';

// let ipfs;
// IPFS.create().then(async (node) => {
//   ipfs = node;
// });
const ipfsClient = create('https://ipfs.infura.io:5001/api/v0');

const ProductImgStyle = styled('img')({
  top: 0,
  width: '100%',
  height: '100%',
  objectFit: 'contain',
  position: 'absolute',
  transition: 'all 0.3s ease',
  '&:hover': {
    backgroundColor: 'rgba(0,0,0,0.2)'
  }
});

//

// ----------------------------------------------------------------------

export default function CreateNFT() {
  const [collectionName, setCollectionName] = useState('');
  const [collectionDesc, setCollectionDesc] = useState('');
  const [isSubmitClick, setIsSubmitClick] = useState(false);
  const [layerData, setLayerData] = useState([]);
  const [totalImages, setTotalImages] = useState(10);
  const [nftPrice, setNftPrice] = useState(100);
  const [nftPriceCoeff, setNftPriceCoeff] = useState(1);
  const [nftData, setNftData] = useState([]);
  const [currentLayer, setCurrentLayer] = useState();
  const [currentDeletedIndex, setCurrentDeletedIndex] = useState();
  const [open, setOpen] = useState(false);
  const [modal, setModal] = useState({ isOpen: false, title: undefined, content: undefined });
  const [currentDeleting, setCurrentDeleting] = useState('');
  const [isSpinner, setIsSpinner] = useState(false);
  const {
    state: { account, ton }
  } = useContext(StoreContext);

  const { getRootProps, getInputProps, acceptedFiles, isDragActive } = useDropzone();

  const uploadImageToIpfs = async (key, image) => {
    const base64 = image.image;
    if (image.ipfs) {
      return image.ipfs;
    }
    // TODO implement upload to IPFS
    // file is data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAgAA…SjVDpQJfhcdt/3Hrt7ev+H+rDD13H5jEOAAAAAElFTkSuQmCC
    // console.log('uploadImageTiIpfs', file);
    const file = await fetch(base64)
      .then((res) => res.blob())
      .then((blob) => new File([blob], 'File name', { type: 'image/png' }));

    const fileInfo = await ipfsClient.add(file);

    setNftData((nftD) => {
      const newNFTData = [...nftD];
      newNFTData[key] = { ...newNFTData[key], status: 'uploaded', ipfs: fileInfo.path };
      return newNFTData;
    });
    return fileInfo.path;
  };

  const handleAddMultiImage = (files) => {
    const newArr = layerData.filter((elem) => {
      if (elem.id === currentLayer) {
        Object.entries(files).forEach(([, value]) => {
          elem.imagArr.push({
            id: Math.floor(Math.random() * 100000),
            traitVal: value.name.replace(/\.[^/.]+$/, ''),
            src: URL.createObjectURL(value),
            traitRar: '1'
          });
        });
      }
      return elem;
    });
    setLayerData(newArr);
  };

  const getDataForBlockchain = async () => {
    setIsSpinner(true);
    const uploadArrayPromise = [];
    for (const [key, value] of Object.entries(nftData)) {
      uploadArrayPromise.push(uploadImageToIpfs(key, value));
    }
    const uploadedData = await Promise.all(uploadArrayPromise);

    const returnData = [];

    for (const [key, data] of Object.entries(nftData)) {
      returnData.push({
        name: data.name,
        description: data.description,
        traits: data.traits,
        price: nftPrice,
        image: `ipfs://${uploadedData[key]}`
      });
    }

    const rootAddress = await uploadBlockchainData(returnData);
    setIsSpinner(false);
    setModal({
      isOpen: true,
      title: 'Deploy NFTs',
      content: (
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <QRCode value={rootAddress} />
          </Grid>
          <Grid item xs={12} md={6}>
            <h3>Root address for minting</h3>
            <CopyToClipboard text={rootAddress} onCopy={() => alert('Copied')}>
              <div style={{ wordBreak: 'break-all', cursor: 'pointer' }}>{rootAddress}</div>
            </CopyToClipboard>
          </Grid>
        </Grid>
      )
    });

    // const a = document.createElement('a');
    // const file = new Blob([JSON.stringify(returnData)], { type: 'application/json' });
    // a.href = URL.createObjectURL(file);
    // a.download = 'nefertit_io_generated_data.json';
    // a.click();
    //
    // return returnData;
  };

  useEffect(() => {
    handleAddMultiImage(acceptedFiles);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [acceptedFiles]);

  const handleAddLayer = () => {
    setLayerData([
      ...layerData,
      {
        id: Math.floor(Math.random() * 1000),
        traitName: `Trait #${layerData.length + 1}`,
        imagArr: []
      }
    ]);
  };

  const handleGenerateImages = async () => {
    setIsSubmitClick(true);

    // validation
    if (!totalImages || !collectionName || !collectionDesc || !nftPrice) {
      return;
    }

    const validate = await validateForm(layerData);
    if (validate) {
      return;
    }
    setIsSpinner(true);

    const imagesToGenerate = [];

    // eslint-disable-next-line no-restricted-syntax
    for (const layer of layerData) {
      let totalRarity = 0;
      const newLayer = {
        traitName: layer.traitName,
        images: []
      };
      // eslint-disable-next-line no-restricted-syntax
      for (const image of layer.imagArr) {
        // TODO errors
        totalRarity += parseInt(image.traitRar, 10) || 1;
      }

      const coeefficient = totalImages / totalRarity;
      for (const image of layer.imagArr) {
        const images = new Array(Math.ceil(coeefficient * parseInt(image.traitRar, 10))).fill({
          traitValue: image.traitVal,
          src: image.src
        });
        newLayer.images = [...newLayer.images, ...images];
      }
      imagesToGenerate.push(newLayer);
    }

    const finalImagesList = [];

    for (let i = 0; i < totalImages; i += 1) {
      const layers = [];
      for (const layer of imagesToGenerate) {
        const randomIndex = Math.floor(Math.random() * layer.images.length);
        layers.push({
          image: layer.images[randomIndex].src,
          traitName: layer.traitName,
          traitValue: layer.images[randomIndex].traitValue
        });
        layer.images.splice(randomIndex, 1);
      }
      finalImagesList.push(layers);
    }

    const mergePromise = [];
    for (const image of finalImagesList) {
      const images = [];
      for (const layer of image) {
        images.push(layer.image);
      }
      mergePromise.push(mergeImages(images));
    }

    const img = await Promise.all(mergePromise);

    const andFinalImages = [];
    for (const [key, image] of Object.entries(finalImagesList)) {
      const traits = [];
      for (const i of image) {
        traits.push({
          trait_type: i.traitName,
          value: i.traitValue
        });
      }
      andFinalImages.push({
        name: `${collectionName}#${key}`,
        description: collectionDesc,
        image: img[key],
        traits,
        status: 'new'
      });
    }
    setNftData(andFinalImages);
    setIsSpinner(false);

    //  TODO add method to upload chunks
  };

  const handleTraitNameChange = (val, currentId) => {
    const newArr = layerData.filter((elem) =>
      elem.id === currentId ? (elem.traitName = val) : elem
    );
    setLayerData(newArr);
  };

  const handleDeleteLayer = () => {
    const newArr = layerData.filter((elem) => elem.id !== currentLayer);
    setLayerData(newArr);
    setOpen(false);
  };

  const handleImageUpdate = (val, type, index, currentId) => {
    const newArr = layerData.filter((elem) => {
      if (elem.id === currentId) {
        if (type === 'name') {
          elem.imagArr[index].traitVal = val;
        } else {
          elem.imagArr[index].traitRar = val;
        }
      }
      return elem;
    });
    setLayerData(newArr);
  };

  const handleClickOpen = (id, name, index) => {
    setCurrentDeleting(name);
    setCurrentLayer(id);
    setCurrentDeletedIndex(index);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleModalClose = () => {
    setModal({ isOpen: !modal.isOpen, title: undefined, content: undefined });
  };

  const handleImageDelete = () => {
    const newArr = layerData.filter((elem) => {
      if (elem.id === currentLayer) {
        elem.imagArr.splice(currentDeletedIndex, 1);
      }
      return elem;
    });
    setLayerData(newArr);
    setOpen(false);
  };

  /**
   * Deploy NFT contracts (Uploader, Root) and upload metadata
   * @param metadata
   * @return {Promise<void>}
   */
  const uploadBlockchainData = async (metadata) => {
    // Create and deploy `Uploader` account
    const uploader = await everscaleAccount(UploaderABI, UploaderTVC, {
      client: ton.client,
      signer: signerExternal(account.public)
    });
    const uploaderAddress = await uploader.getAddress();
    console.debug('[CREATE NFT] - Uploader address:', uploaderAddress);

    await everscaleDeployWithWallet(
      ton.provider,
      {
        sender: account.address,
        amount: (20 * 10 ** 9).toString(),
        bounce: false
      },
      uploader
    );

    // Create and deploy `NFTRoot` account
    const root = await everscaleAccount(RootABI, RootTVC, {
      client: ton.client,
      signer: signerExternal(account.public),
      initData: {
        _addrOwner: await uploader.getAddress(),
        _name: Buffer.from(collectionName).toString('hex')
      }
    });
    const rootAddress = await root.getAddress();
    console.debug('[CREATE NFT] - Root address:', rootAddress);

    const codeIndex = await ton.client.boc.get_code_from_tvc({
      tvc: Buffer.from(await readBinaryFile(IndexTVC)).toString('base64')
    });
    const codeData = await ton.client.boc.get_code_from_tvc({
      tvc: Buffer.from(await readBinaryFile(DataTVC)).toString('base64')
    });
    await everscaleDeployWithWallet(
      ton.provider,
      {
        sender: account.address,
        amount: (100 * 10 ** 9).toString(),
        bounce: false
      },
      root,
      {
        initInput: {
          codeIndex: codeIndex.code,
          codeData: codeData.code,
          pay: nftPrice,
          koef: nftPriceCoeff
        }
      }
    );

    // Upload metadata
    for (const item of metadata) {
      const uncompressed = Buffer.from(JSON.stringify(item)).toString('base64');
      // eslint-disable-next-line no-await-in-loop
      const zstd = await ton.client.utils.compress_zstd({ uncompressed });
      const encodeSendMetadata = {
        abi: uploader.abi,
        address: uploaderAddress,
        call_set: {
          function_name: 'sendMetadata',
          input: {
            adr: rootAddress,
            metadata: Buffer.from(zstd.compressed, 'base64').toString('hex')
          }
        },
        signer: signerExternal(account.public)
      };
      // eslint-disable-next-line no-await-in-loop
      const signed = await everscaleSignWithWallet(ton.provider, ton.client, encodeSendMetadata);
      // eslint-disable-next-line no-await-in-loop
      await everscaleSendMessage(ton.client, signed.message, uploader.abi);
    }
    // await Promise.all(
    //   metadata.map(async (item) => {
    //     const uncompressed = Buffer.from(JSON.stringify(item)).toString('base64');
    //     const zstd = await ton.client.utils.compress_zstd({ uncompressed });
    //     const encodeSendMetadata = {
    //       abi: uploader.abi,
    //       address: uploaderAddress,
    //       call_set: {
    //         function_name: 'sendMetadata',
    //         input: {
    //           adr: rootAddress,
    //           metadata: Buffer.from(zstd.compressed, 'base64').toString('hex')
    //         }
    //       },
    //       signer: signerExternal(account.public)
    //     };
    //     const signed = await everscaleSignWithWallet(ton.provider, ton.client, encodeSendMetadata);
    //     await everscaleSendMessage(ton.client, signed.message, uploader.abi);
    //   })
    // );
    console.debug('[CREATE NFT] - Metadata sent');

    // Start selling
    const encodeStartSelling = {
      abi: uploader.abi,
      address: uploaderAddress,
      call_set: {
        function_name: 'startSelling',
        input: { adr: rootAddress }
      },
      signer: signerExternal(account.public)
    };
    const signed = await everscaleSignWithWallet(ton.provider, ton.client, encodeStartSelling);
    await everscaleSendMessage(ton.client, signed.message, uploader.abi);
    console.debug('[CREATE NFT] - Selling started');
    return rootAddress;
  };

  if (!account.isReady) {
    return (
      <Page title="Create you new Nft">
        <Container>
          <Typography variant="h4" sx={{ mb: 5 }}>
            <Link underline="none" component={RouterLink} to="/dashboard/login">
              <Button fullWidth variant="contained">
                Login first
              </Button>
            </Link>
          </Typography>
        </Container>
      </Page>
    );
  }

  return (
    <Page title="Create you new Nft">
      <Backdrop sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.drawer + 1 }} open={isSpinner}>
        <CircularProgress color="inherit" />
      </Backdrop>
      <Container>
        <Typography variant="h4" sx={{ mb: 5 }}>
          Create a new NFTs
        </Typography>
        <Typography variant="h4" sx={{ mb: 0 }}>
          Welcome!
        </Typography>
        <Typography variant="h6" sx={{ mb: 0 }}>
          Here you can create your own NFT collection. Upload and edit layers, adjust the parameters
          of the collection and traits, and enjoy the result!
        </Typography>
        <Typography variant="h6" sx={{ mb: 5 }}>
          The process is described in detail in the
          <Link
            href="https://drive.google.com/file/d/1mXScyRSkHIfHR_J3KExNLa4bL0da483j/view?usp=sharing"
            target="_blank"
            underline="none"
          >
            {` WhitePaper `}
          </Link>
          in the "User flow" section. Please keep in mind that NeFerTiti is still working in test
          mode.
        </Typography>
        <Typography variant="subtitle1" sx={{ marginBottom: 5 }}>
          Test mode limitations are:
          <ul>
            <li>
              You can't upload more then 10 images per minute (we are working on own ipfs gateway).
              Sometimes you can upload more. Please, be patient. But you able to generate images
              with no limitations
            </li>
            <li>
              Generation a lot of images (1000+) can be slow (10+ seconds). Future optimization is
              needed
            </li>
            <li>
              Blockchain integration is not available on web, please use TON CLI to deploy prepared
              data. Also will be implemented in future
            </li>
            <li>Some pages on development stage now</li>
            <li>Product contains bugs. Please forgive us</li>
          </ul>
        </Typography>
      </Container>

      <Container>
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <TextField
              label="Collection Name"
              value={collectionName}
              onChange={(e) => setCollectionName(e.target.value)}
              error={isSubmitClick && !collectionName}
              fullWidth
            />
            {isSubmitClick && !collectionName ? (
              <FormHelperText error>Please Enter Collection Name</FormHelperText>
            ) : (
              ''
            )}
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              label="Number of NFTs (up to 10 for test mode)"
              type="number"
              value={totalImages}
              onChange={(e) => {
                const number = e.target.value;
                // if (number > 100) {
                //   number = 100;
                // }
                if (number >= 0) {
                  setTotalImages(number);
                }
              }}
              error={isSubmitClick && !totalImages}
              fullWidth
            />
            {isSubmitClick && !totalImages ? (
              <FormHelperText error>Please Enter Number of NFTs greater than 0</FormHelperText>
            ) : (
              ''
            )}
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              label="NFT price (in TON)"
              type="number"
              value={nftPrice}
              onChange={(e) => {
                const number = e.target.value;
                if (number >= 0) {
                  setNftPrice(number);
                }
              }}
              error={isSubmitClick && !nftPrice}
              fullWidth
            />
            {isSubmitClick && !nftPrice ? (
              <FormHelperText error>Please Enter price of NFTs greater than 0</FormHelperText>
            ) : (
              ''
            )}
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              label="NFT price coefficient"
              type="number"
              value={nftPriceCoeff}
              onChange={(e) => {
                const number = e.target.value;
                if (number >= 0) {
                  setNftPriceCoeff(number);
                }
              }}
              error={isSubmitClick && !nftPriceCoeff}
              fullWidth
            />
            {isSubmitClick && !nftPriceCoeff ? (
              <FormHelperText error>Please Enter price coefficient greater than 0</FormHelperText>
            ) : (
              ''
            )}
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Collection Description"
              value={collectionDesc}
              onChange={(e) => setCollectionDesc(e.target.value)}
              error={isSubmitClick && !collectionDesc}
              fullWidth
            />
            {isSubmitClick && !collectionDesc ? (
              <FormHelperText error>Please Enter Collection Name</FormHelperText>
            ) : (
              ''
            )}
          </Grid>
        </Grid>
        <Stack direction="row" alignItems="flex-end" justifyContent="space-between">
          <Typography variant="h6" sx={{ marginTop: 5 }}>
            Layers
          </Typography>
        </Stack>
        {layerData &&
          layerData.map((data) => (
            <Card variant="outlined" key={data.id} sx={{ margin: '10px 0' }}>
              <CardActions>
                <TextField
                  sx={{ marginRight: 1 }}
                  label="Trait Name"
                  size="small"
                  fullWidth
                  value={data.traitName}
                  onChange={(e) => handleTraitNameChange(e.target.value, data.id)}
                  error={isSubmitClick && !data.traitName}
                />
                <Button
                  variant="contained"
                  sx={{ whiteSpace: 'nowrap' }}
                  color="error"
                  onClick={() => handleClickOpen(data.id, 'layer')}
                >
                  Delete Layer
                </Button>
              </CardActions>
              <CardActions sx={{ mt: -2 }}>
                {isSubmitClick && !data.traitName ? (
                  <FormHelperText error>Please Enter Trait Name</FormHelperText>
                ) : (
                  ''
                )}
              </CardActions>
              <CardContent
                onClick={() => setCurrentLayer(data.id)}
                sx={{
                  '> div:hover': { cursor: 'pointer' },
                  transition: 'all 0.3s ease',
                  backgroundColor: isDragActive ? '#d5d5d5' : 'initial'
                }}
              >
                <div
                  style={{
                    width: '100%'
                  }}
                  {...getRootProps({
                    onDragEnter: () => setCurrentLayer(data.id)
                  })}
                >
                  <input {...getInputProps()} accept="image/*" />
                  <Stack
                    direction="row"
                    alignItems="center"
                    justifyContent="space-between"
                    style={{ flexWrap: 'wrap' }}
                  >
                    {data.imagArr.length ? (
                      data.imagArr.map((file, index) => (
                        <Card
                          key={file.id}
                          variant="outlined"
                          onClick={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                          }}
                          sx={{ mb: 2 }}
                        >
                          <Box
                            sx={{
                              pt: '100%',
                              position: 'relative',
                              background: 'url(/static/bg.svg)',
                              backgroundSize: '20px',
                              backgroundRepeat: 'repeat'
                            }}
                          >
                            <DeleteIcon
                              variant="filled"
                              color="error"
                              sx={{
                                zIndex: 9,
                                top: 16,
                                right: 16,
                                position: 'absolute',
                                textTransform: 'uppercase'
                              }}
                              onClick={() => handleClickOpen(data.id, 'card', index)}
                            />
                            <ProductImgStyle alt={file.src} src={file.src} />
                          </Box>
                          <Stack
                            drection="row"
                            justifyContent="space-between"
                            style={{ flexDirection: 'row' }}
                            sx={{ padding: 2 }}
                            spacing={1}
                          >
                            <Stack direction="column" spacing={1}>
                              <TextField
                                label="Trait Value"
                                value={file.traitVal}
                                onChange={(e) =>
                                  handleImageUpdate(e.target.value, 'name', index, data.id)
                                }
                                error={isSubmitClick && !file.traitVal}
                                size="small"
                              />
                              {isSubmitClick && !file.traitVal ? (
                                <FormHelperText error>Please Enter Trait Value</FormHelperText>
                              ) : (
                                ''
                              )}
                              <TextField
                                label="Trait Rarity (number)"
                                value={file.traitRar}
                                onChange={(e) => {
                                  if (e.target.value > 0) {
                                    handleImageUpdate(e.target.value, 'rarity', index, data.id);
                                  }
                                }}
                                error={isSubmitClick && !file.traitRar}
                                type="number"
                                size="small"
                              />
                              {isSubmitClick && !file.traitRar ? (
                                <FormHelperText error>
                                  Please Enter Trait Rarity Number
                                </FormHelperText>
                              ) : (
                                ''
                              )}
                            </Stack>
                          </Stack>
                        </Card>
                      ))
                    ) : (
                      <p
                        style={{
                          width: '100%',
                          marginBlockStart: 0,
                          height: 80,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center'
                        }}
                      >
                        {isDragActive
                          ? 'Drop the files here ...'
                          : "Drag 'n' drop some files here, or click to select files"}
                      </p>
                    )}
                  </Stack>
                </div>
              </CardContent>
            </Card>
          ))}
        <Box sx={{ marginTop: 5 }}>
          <Button onClick={handleAddLayer} variant="contained" fullWidth>
            Add another layer
          </Button>
          {!!layerData.length && (
            <Button
              onClick={handleGenerateImages}
              variant="contained"
              fullWidth
              color="warning"
              sx={{ marginTop: 5, marginBottom: 5 }}
            >
              Generate images
            </Button>
          )}
          <NFTList nfts={nftData} />
          {!!nftData.length && (
            <Button
              onClick={getDataForBlockchain}
              variant="contained"
              fullWidth
              sx={{ marginTop: 5 }}
            >
              GetDataForBlockchain
            </Button>
          )}
        </Box>
      </Container>
      <DeleteCardDialog
        open={open}
        handleClose={handleClose}
        handleDelete={currentDeleting === 'card' ? handleImageDelete : handleDeleteLayer}
        currentDeleting={currentDeleting}
      />
      <DetailModal handleModalClose={handleModalClose} {...modal} />
    </Page>
  );
}
