import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Box, Card, Grid, Stack, Button, Container, CircularProgress } from '@mui/material';
import { useRouter } from 'next/router';
import { useSnackbar } from '@components/snackbar';
import FormProvider, { ProfileTextField } from '@components/hook-form';
import CustomBreadcrumbs from '@components/custom-breadcrumbs';
import { PATH_DASHBOARD, PATH_CONTRIBUTE } from '@routes/paths';
import { useContributionGetById, useContributionValidate } from '@hooks/contribute/useContribute';

interface Props {
  isEdit?: boolean;
  currentUser?: any;
  id?: string | string[] | undefined;
}

export default function ContributeDetail({ id }: Props) {
  const [profile, setProfile] = useState<any>({
    fullname: '',
    schoolName: '',
    createdAt: '',
    status: '',
    contributed_data: '',
    coverage: '',
    validatedUser: '',
    mintedStatus: '',
  });

  const { data, isSuccess, isError, refetch,isFetching } = useContributionGetById(id);
  const { enqueueSnackbar } = useSnackbar();

  const {
    mutate,
    isSuccess: isValidationSuccess,
    isError: isValidationError,
  } = useContributionValidate();
  const router = useRouter();


  useEffect(() => {
    if (isSuccess && data ) {
      const keyValue = Object?.entries(data?.contributed_data);
      const jsonString = JSON?.parse(keyValue?.map((pair) => pair[1])?.join(''));
      setProfile({
        fullname: data?.contributedUser?.name,
        schoolName: data?.school.name,
        createdAt: new Date(data?.createdAt).toLocaleDateString(),
        status: data?.status,
        contributed_data: jsonString,
        coverage: data?.coverage_availability,
        validatedUser: data?.validatedUser?.name || '',
        mintedStatus: data?.minted,
      });
    }
  }, [isSuccess, isError, data]);

  useEffect(() => {
    refetch();
  }, [isValidationSuccess, isValidationError]);

  const methods = useForm();

  const onContribute = (validity: boolean) => {
    const payload = { contributions: [{ contributionId: id, isValid: validity }] };
    mutate(payload);
    !validity ? enqueueSnackbar(`Contributed Data are invalidated. Please check invalidated Data Section`, { variant: 'success' })
    : enqueueSnackbar(`Contributed Data are validated. Please check validated Data Section`, { variant: 'success' });
    router.push('/contribute')
  };

  const back = () => {
    router.push('/contribute');
  };

  return (
    <>
   { isFetching ?<div style={{width: '100%', height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
      <CircularProgress color="inherit" />
      </div>:
   (
   <>
      <Grid item xs={12} lg={8}>
        <Container>
          <CustomBreadcrumbs
            heading="Contribution Detail"
            links={[
              { name: 'Dashboard', href: PATH_DASHBOARD.root },
              { name: 'Contribute', href: PATH_CONTRIBUTE.root },
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
                      label="Contributed by"
                      disabled
                    />

                    <ProfileTextField
                      name="location"
                      value={profile?.schoolName || ''}
                      label="School Name"
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
                        value={profile?.createdAt || ''}
                        label="Created At"
                        disabled
                      />
                      <ProfileTextField
                        name="longitude"
                        value={profile?.status || ''}
                        label="Status"
                        disabled
                      />
                      {profile?.status != 'Pending' && <ProfileTextField
                        name="longitude"
                        value={profile?.validatedUser || ''}
                        label={`${profile?.status === 'Validated' ? 'Validated by' : 'Invalidated By'}`}
                        disabled
                      />}
                    </Box>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <span>Contributed Data</span>
                        <span>
                          <ProfileTextField
                            name="coverage"
                            value={Object.values(profile?.contributed_data)[0]  === true ? 'Yes' : Object.values(profile?.contributed_data)[0] === false ? 'No' : Object.values(profile?.contributed_data)[0]  || ''}
                            label={Object.keys(profile?.contributed_data)[0] || ''}
                            disabled
                          />
                        </span>
                      </div>
                  </Box>

                  <Stack alignItems="flex-start" sx={{ mt: 3 }}>
                    <Button
                      onClick={back}
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
      {profile?.status === 'Pending' && (
        <Grid item xs={12} lg={4}>
          <Container>
            <Box justifyContent={'center'}>
              <Stack direction="row" alignItems="center">
                <Button
                  variant="contained"
                  color={'info'}
                  style={{ width: '150px', background: '#474747' }}
                  onClick={() => onContribute(false)}
                >
                  Invalidate
                </Button>
                <Button
                  sx={{ ml: 2 }}
                  variant="contained"
                  color={'info'}
                  style={{ width: '150px', background: '#474747' }}
                  onClick={() => onContribute(true)}
                >
                  Validate
                </Button>
              </Stack>
            </Box>
          </Container>
        </Grid>
      )}
    </>)
    }
    </>
  );
}
