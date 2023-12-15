import { useState, ChangeEvent, useEffect, use } from 'react';
import * as Yup from 'yup';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import { Box, Card, Grid, Stack, MenuItem, Select, Button, Container } from '@mui/material';
import FormProvider, { ProfileTextField } from '@components/hook-form';
import { useSchoolGetById } from '@hooks/school/useSchool';
import CustomBreadcrumbs from '@components/custom-breadcrumbs';
// @ts-ignore
import Identicon from 'react-identicons';
import { useMintSchools } from '@hooks/school/useSchool';
import { useWeb3React } from '@web3-react/core';
import { PATH_DASHBOARD, PATH_SCHOOL } from '@routes/paths';
import { useSnackbar } from 'notistack';
import { useRouter } from 'next/router';

interface Props {
  isEdit?: boolean;
  currentUser?: any;
  id?: string | string[] | undefined;
}

interface FormValuesProps {
  id: string;
  name: string;
  email: string;
  position: string | null;
  phone: string;
  affiliation: string | null;
  roles: string;
  is_active: boolean;
}

export default function SchoolDetails({ id }: Props) {
  const [profile, setProfile] = useState({
    fullname: '',
    location: '',
    latitude: '',
    longitude: '',
    connectivity: '',
    coverage: '',
    mintedStatus: '',
  });

  const { data, isSuccess, isError, refetch } = useSchoolGetById(id);

  const { enqueueSnackbar } = useSnackbar();

  const {
    mutate,
    isError: isMintError,
    data: mintData,
    isSuccess: isMintSuccess,
    error: mintError,
  } = useMintSchools();

  const web3 = useWeb3React();
  const router = useRouter()

  const [nftData, setNftData] = useState({
    id: '',
    giga_school_id: '',
    schoolName: '',
    longitude: '',
    latitude: '',
    schoolType: '',
    country: '',
    connectivity: '',
    coverage_availabitlity: '',
    electricity_availabilty: '',
    mintedStatus: '',
  });

  useEffect(() => {
    isSuccess &&
      setProfile({
        fullname: data?.name,
        location: data?.country,
        latitude: data?.latitude,
        longitude: data?.longitude,
        connectivity: data?.connectivity,
        coverage: data?.coverage_availability,
        mintedStatus: data?.minted,
      });
  }, [isSuccess, isError, data]);

  useEffect(() => {
    setNftData({
      id: data?.id,
      giga_school_id: data?.giga_school_id,
      schoolName: data?.name,
      longitude: data?.longitude,
      latitude: data?.latitude,
      schoolType: data?.school_type,
      country: data?.country,
      connectivity: data?.connectivity,
      coverage_availabitlity: data?.coverage_availability,
      electricity_availabilty: data?.electricity_available,
      mintedStatus: data?.minted,
    });
  }, [data]);

  const UpdateUserSchema = Yup.object().shape({
    name: Yup.string()
      .required()
      .matches(/^[a-zA-Z\s]+$/, 'Name must contain only alphabets and spaces'),
    email: Yup.string().email('Email must be a valid email address'),
    phone: Yup.number().typeError('Phone must be a valid number'),
    position: Yup.string(),
    affiliation: Yup.string(),
    roles: Yup.string(),
  });

  const methods = useForm<FormValuesProps>({
    resolver: yupResolver(UpdateUserSchema),
  });

  const {
    handleSubmit,
    formState: { isSubmitting },
  } = methods;

  const mintSchool = async () => {
    mutate({ data: nftData });
  };

  useEffect(() => {
    isMintSuccess && enqueueSnackbar('Minted successfully'); refetch();
    isMintSuccess &&  back();
    isMintError && enqueueSnackbar('Minting unsuccessful'); refetch();
  }, [isMintSuccess, isMintError])

  const back = () => {
    router.push('/school/minted');
  };

  return (
    <>
      <Grid item xs={8}>
        <Container>
          <CustomBreadcrumbs
            heading="School Detail Page"
            links={[
              { name: 'Dashboard', href: PATH_DASHBOARD.root },
              { name: 'Unminted School', href: PATH_SCHOOL.contributed },
              { name: 'Detail' },
            ]}
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
                      />
                      <ProfileTextField
                        name="longitude"
                        value={profile?.longitude || ''}
                        label="Longitude"
                      />
                      <ProfileTextField
                        name="connectivity"
                        value={profile?.connectivity || ''}
                        label="Connectivity"
                      />
                      <ProfileTextField
                        name="coverage"
                        value={profile?.coverage || ''}
                        label="Coverage"
                      />
                    </Box>
                  </Box>

                  <Stack alignItems="flex-start" sx={{ mt: 3 }}>
                    <Button variant="contained" style={{ width: '300px', background: '#474747' }} onClick={back}>
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
            {/* <Image width={250} height={250} alt='USER' src={'/assets/Image-right.svg'}/> */}
            <Stack alignItems="center" sx={{ mt: 1 }}>
              {profile.mintedStatus === 'NOTMINTED' && (
                <Button
                  variant="contained"
                  color={'info'}
                  style={{ width: '300px', background: '#474747' }}
                  onClick={mintSchool}
                >
                  Mint
                </Button>
              )}
            </Stack>
            <Stack sx={{ mt: 8 }}>
              <Box display="flex" justifyContent="center">
                <Identicon string={profile?.fullname} size={200} />
              </Box>
            </Stack>
          </Box>
        </Container>
      </Grid>
    </>
  );
}
