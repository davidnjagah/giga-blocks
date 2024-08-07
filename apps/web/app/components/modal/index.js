import {
  Modal,
  TextInput,
  Form,
  InlineNotification,
  Button,
} from '@carbon/react';
import { useLogin } from '../../hooks/useSignUp';
import { useForm, Controller } from 'react-hook-form';
import { saveAccessToken, saveCurrentUser } from '../../utils/sessionManager';
import { useRouter,useSearchParams } from 'next/navigation';
import { useAuthContext } from '../../auth/useAuthContext';
import { useEffect, useState } from 'react';
import CountdownTimer from '../countdowntimer'
import { useOtp } from '../../hooks/useOtp';
import { Typography } from '@mui/material';

const CarbonModal = ({ open, onClose, email, setSeconds, seconds, error, setError }) => {
  const { handleSubmit, control, setValue } = useForm();
  
  const [otpError, setOtpError] = useState(true)
  const { initialize } = useAuthContext();
  const login = useLogin();
  const route = useRouter();
  const { mutateAsync: otpMutateAsync } = useOtp();
  const [notification, setNotification] = useState(null);
  const searchParams = useSearchParams();


  const searchKey = searchParams.get('returnTo');


  const onAdd = async (data) => {

    const payload = {
      email,
      otp: data.name,
    };
    login
      .mutateAsync(payload)
      .then((res) => {
        saveCurrentUser(res.data);
        saveAccessToken(res.data.access_token);
        initialize();
        setNotification({
          kind: 'success',
          title: 'OTP login successful.',
        });
        if (searchKey) {
          route.push(searchKey);
        } else {
          route.push('/dashboard');
        }      })
      .catch((err) => {
        console.log({err});
        setValue('name','')
        setNotification({
          kind: 'error',
          title: `${err.response.data.message}`,
        });
        setError(`${err.response.data.message}, please re-send OTP and try again.`);
      });
  };

  useEffect(() => {
    if (notification) {
      const timeoutId = setTimeout(() => {
        onCloseNotification();
      }, 4000);

      return () => clearTimeout(timeoutId);
    }
  }, [notification]);

  const onCloseNotification = () => {
    setNotification(null);
  };

  const onSubmit = async () => {
    setValue('name','')

    if(email === ''){
      setNotification({
        kind: 'error',
        title: 'Please enter email',
      })
      return null
    }

    otpMutateAsync({ email })
      .then(() => {
        setNotification({
          kind: 'success',
          title: 'Sent successfully',
        })
        setError('Please enter the new OTP.');
        setSeconds(180)
      })
      .catch((error) => {
        setNotification({
          kind: 'error',
          title: 'User not found.',
        });
      });
  };

  const checkEmpty = (e) => {
    const value = e.target.value;
    if (value.length === 6){
      setOtpError(false)
    }
    else{
      setOtpError(true)
    }
  }

  const handleKeyDown = (e) => {
    const value = e.target.value
    if(value.length === 6){
      if (e.key === 'Enter') {
    e.preventDefault();
        onAdd({name: value});
      }
    }
  };

  return (
    <>
      {notification && (
        <InlineNotification
          aria-label="closes notification"
          timeout={1}
          kind={notification.kind}
          onClose={onCloseNotification}
          title={notification.title}
          style={{
            position: 'fixed',
            top: '50px',
            right: '2px',
            width: '400px',
            zIndex: 1000,
          }}
        />
      )}
      <Modal
        open={open}
        onSecondarySubmit={onClose}
        modalHeading={!error ? `Please check your email` : error}
        onRequestClose={onClose}
        modalLabel={`OTP sent to ${email}.`}
        secondaryButtonText="Cancel"
        primaryButtonText="Submit"
        primaryButtonDisabled={otpError}
        onRequestSubmit={handleSubmit(onAdd)}
      >
        <Form>
          <Controller
            name="name"
            control={control}
            rules={{ required: 'OTP is required', 
            pattern: {
              message: 'OTP',
            }, }}
            
            render={({ field }) => (
              <TextInput
                {...field}
                id="name"
                labelText="Enter OTP here"
                onKeyDown={handleKeyDown}
                onChange={(e) => {
                  checkEmpty(e);
                  field.onChange(e);
                }}
                type='number'
                maxLength={6}
              />
            )}
          />
        </Form>
        {seconds && <CountdownTimer setSeconds={setSeconds} seconds={seconds}/> ||   <Typography variant="body2" sx={{ color: '#f7931e', my: 3 }}>
          Your OTP has expired, please resend OTP to login.
        </Typography>}
        <a
                style={{
                  marginTop: '10px',
                  cursor: 'pointer'
                }}
                onClick={onSubmit}
              >
                Resend OTP
        </a>
      </Modal>
    </>
  );
};

export default CarbonModal;
