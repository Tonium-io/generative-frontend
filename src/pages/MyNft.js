// import { useFormik } from 'formik';
import { useContext } from 'react';
// import { Link as RouterLink } from 'react-router-dom';
// material
import { Container, Stack, Typography } from '@mui/material';
// import AddIcon from '@mui/icons-material/Add';
// components
import Page from '../components/Page';
import StoreContext from '../store/StoreContext';
import CollectionCard from '../components/CollectionCard';

// ----------------------------------------------------------------------

export default function MyNft() {
  // const [openFilter, setOpenFilter] = useState(false);
  const {
    state: { myNfts }
  } = useContext(StoreContext);

  // const formik = useFormik({
  //   initialValues: {
  //     gender: '',
  //     category: '',
  //     colors: '',
  //     priceRange: '',
  //     rating: ''
  //   },
  //   onSubmit: () => {
  //     setOpenFilter(false);
  //   }
  // });

  // const { resetForm, handleSubmit } = formik;

  // const handleOpenFilter = () => {
  //   setOpenFilter(true);
  // };

  // const handleCloseFilter = () => {
  //   setOpenFilter(false);
  // };

  // const handleResetFilter = () => {
  //   handleSubmit();
  //   resetForm();
  // };

  return (
    <Page title="MyNfts: Collections | NeFerTiti">
      <Container>
        <Typography variant="h4" sx={{ mb: 5 }}>
          Collections
        </Typography>

        <Stack direction="row" flexWrap="wrap" alignItems="center" spacing={2}>
          {myNfts.map((val, index) => (
            <CollectionCard key={index} collectionDetails={val.collection} />
          ))}
          {/* <Link underline="none" component={RouterLink} to="/dashboard/create">
            <Card variant="outlined" sx={{ mb: 2, px: 2, py: 2 }}>
              <Stack direction="column" alignItems="center">
                <AddIcon />
                Create New Collection
              </Stack>
            </Card>
          </Link> */}
        </Stack>

        {/* <Stack
          direction="row"
          flexWrap="wrap-reverse"
          alignItems="center"
          justifyContent="flex-end"
          sx={{ mb: 5 }}
        >
          <Stack direction="row" spacing={1} flexShrink={0} sx={{ my: 1 }}>
            {/* <ProductFilterSidebar
              formik={formik}
              isOpenFilter={openFilter}
              onResetFilter={handleResetFilter}
              onOpenFilter={handleOpenFilter}
              onCloseFilter={handleCloseFilter}
            /> 
            <ProductSort />
          </Stack>
        </Stack> */}

        {/* <ProductList products={PRODUCTS} /> */}
        {/* <ProductCartWidget /> */}
      </Container>
    </Page>
  );
}
