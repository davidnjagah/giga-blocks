import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Box, Card, Grid, Stack, Button, Container } from '@mui/material';
import { useSnackbar } from '@components/snackbar';
import FormProvider, { ProfileTextField } from '@components/hook-form';
import CustomBreadcrumbs from '@components/custom-breadcrumbs';
// @ts-ignore
import Identicon from 'react-identicons';
import { useQuery } from 'urql';
import { Queries } from 'src/libs/graph-query';
import { PATH_DASHBOARD } from '@routes/paths';

interface Props {
  isEdit?: boolean;
  currentUser?: any;
  id?: string | string[] | undefined;
}

export default function SchoolDetails({ id }: Props) {
  const { enqueueSnackbar } = useSnackbar();

  const [profile, setProfile] = useState({
    fullname: '',
    location: '',
    latitude: '',
    longitude: '',
    connectivity: '',
    coverage: '',
    mintedStatus: '',
    tokenId: '',
  });

  const [result] = useQuery({ query: Queries.nftDetailsQuery, variables: { id } });
  const { data, fetching, error } = result;

  const decodeData = (schooldata: any) => {
    const encodeddata = schooldata?.schoolTokenUri;
    const decodedData = atob(encodeddata.tokenUri.substring(29));
    const schoolData = {
      tokenId: encodeddata?.id,
      ...JSON.parse(decodedData),
    };
    setProfile({
      fullname: schoolData.schoolName,
      location: schoolData.country,
      latitude: schoolData.latitude,
      longitude: schoolData.longitude,
      connectivity: schoolData.connectivity,
      coverage: schoolData.coverage_availabitlity,
      mintedStatus: schoolData.minted,
      tokenId: schoolData.tokenId,
    });
  };

  useEffect(() => {
    if (data) decodeData(data);
    if (error) enqueueSnackbar(error.message, { variant: 'error' });
  }, [data, error]);

  const methods = useForm();

  return (
    <>
      {fetching && <p>Loading...</p>}
      {!fetching && (
        <>
          <Grid item xs={8}>
            <Container>
              <CustomBreadcrumbs
                heading="School Detail Page"
                links={[{ name: 'Dashboard', href: PATH_DASHBOARD.root }, { name: 'Detail' }]}
              />
              <FormProvider methods={methods}>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={12}>
                    <Card sx={{ p: 3 }}>
                      <Box rowGap={3} columnGap={2} display="grid">
                        <ProfileTextField
                          name="name"
                          value={profile?.fullname || ''}
                          label="Full Name"
                          disabled
                        />

                        <ProfileTextField
                          name="location"
                          value={profile?.location || ''}
                          label="Location"
                          disabled
                        />
                        <Box
                          display="grid"
                          rowGap={3}
                          columnGap={8}
                          gridTemplateColumns={{
                            xs: 'repeat(1, 1fr)',
                            sm: 'repeat(2, 1fr)',
                          }}
                        >
                          <ProfileTextField
                            name="latitude"
                            value={profile?.latitude || ''}
                            label="Latitude"
                            disabled
                          />
                          <ProfileTextField
                            name="longitude"
                            value={profile?.longitude || ''}
                            label="Longitude"
                            disabled
                          />
                          <ProfileTextField
                            name="connectivity"
                            value={profile?.connectivity || ''}
                            label="Connectivity"
                            disabled
                          />
                          <ProfileTextField
                            name="coverage"
                            value={profile?.coverage || ''}
                            label="Coverage"
                            disabled
                          />
                          <ProfileTextField
                            name="tokenId"
                            value={profile?.tokenId || ''}
                            label="TokenId"
                            disabled
                          />
                        </Box>
                      </Box>

                      <Stack alignItems="flex-start" sx={{ mt: 3 }}>
                        <Button
                          variant="contained"
                          style={{ width: '300px', background: '#474747' }}
                        >
                          Back
                        </Button>
                      </Stack>
                    </Card>
                  </Grid>
                </Grid>
              </FormProvider>
            </Container>
          </Grid>
          <Grid item xs={4}>
            <Container>
              <Box justifyContent={'center'}>
                <Stack sx={{ mt: 8 }}>
                  <Box display="flex" justifyContent="center">
                    <Identicon string={profile?.fullname} size={200} />
                  </Box>
                </Stack>
              </Box>
            </Container>
          </Grid>
        </>
      )}
    </>
  );
}
