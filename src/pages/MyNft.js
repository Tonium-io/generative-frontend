// import { useFormik } from 'formik';
import { useContext } from 'react';
// material
import { Container, Stack, Typography } from '@mui/material';
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

  console.log('MyNft Data', myNfts);

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
