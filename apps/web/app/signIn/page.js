'use client';
import React, { useEffect, useState } from 'react';
import Navbar from '../components/navbar';
import {
  Button,
  InlineNotification,
  Column,
  Form,
  Grid,
  TextInput,
} from '@carbon/react';
import { Tile } from '@carbon/react';
import Link from 'next/link';
import './signIn.scss';
import { useForm, Controller } from 'react-hook-form';
import { useOtp } from '../hooks/useOtp';
import CarbonModal from '../components/modal/index';
import Web3Provider from '../components/web3/Provider';
import { metaMask } from '../components/web3/connectors/metamask';
import { useGetNonce, useWalletLogin } from '../hooks/walletLogin';
import { useWeb3React } from '@web3-react/core';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  saveAccessToken,
  saveCurrentUser,
  saveConnectors,
} from '../utils/sessionManager';
import { useAuthContext } from '../auth/useAuthContext';
import { metaMaskLogin } from '../utils/metaMaskUtils';
import { getCurrentUser } from '../utils/sessionManager';

const SignIn = () => {
  const route = useRouter();
  const {
    handleSubmit,
    control,
    formState: { errors },
  } = useForm();
  const { initialize } = useAuthContext();
  const [error, setError] = useState();
  const loginMutation = useWalletLogin();
  const user = getCurrentUser();
  const getNonceQuery = useGetNonce();
  const searchParams = useSearchParams();
  const searchKey = searchParams.get('returnTo');
  const web3 = useWeb3React();
  const sendOtp = useOtp();
  const [email, setEmail] = useState('');
  const [openModal, setOpenModal] = useState(false);
  const [showEmailField, setShowEmailField] = useState(false);
  const [showSubmitButton, setShowSubmitButton] = useState(false);
  const [isSubmitted, setisSubmitted] = useState(false);
  const [notification, setNotification] = useState(null);
  const minute = process.env.NEXT_PUBLIC_OTP_DURATION_IN_MINS;
  const [seconds, setSeconds] = useState(minute * 60);

  const router = useRouter();

  const showEmailInput = () => {
    setShowEmailField(true);
    setShowSubmitButton(true);
  };

  useEffect(() => {
    if (user) {
      router.push(`/dashboard`)
    }
  }, [])

  useEffect(() => {
    if (!web3.isActive) {
      void metaMask.connectEagerly();
    }
  }, []);

  useEffect(() => {
    if (notification) {
      const timeoutId = setTimeout(() => {
        onCloseNotification();
      }, 4000);

      return () => clearTimeout(timeoutId);
    }
  }, [notification]);

  const getSignature = async (nonce) => {
    try {
      const signer = web3.provider.getSigner();
      let signature = await signer.signMessage(nonce);
      signature = `${nonce}:${signature}`;
      return signature;
    } catch (err) {
      return null;
    }
  };

  const onSubmit = async (data, e) => {
    e.preventDefault();
    if (!data.email) return setisSubmitted(true);
    setSeconds(minute * 60);
    setError();
    sendOtp
      .mutateAsync({ email: data.email })
      .then(() => {
        setOpenModal(true);
        setEmail(data.email);
      })

      .catch(() => {
        setNotification({
          kind: 'error',
          title: 'User not found.',
        });
      });
  };
  const handleWalletLogin = async () => {
    try {
      await metaMaskLogin();
      const { nonce } = await getNonceQuery.mutateAsync();
      const sign = await getSignature(nonce);
      const address = await web3.provider.getSigner().getAddress();
      if (!sign) {
        setNotification({
          kind: 'error',
          title: 'User rejected signature.',
        });
        return;
      }
      const payload = {
        walletAddress: address,
        signature: sign,
      };
      const res = await loginMutation.mutateAsync(payload);
      if (res.data.access_token) {
        saveCurrentUser(res.data);
        saveAccessToken(res.data.access_token);
        saveConnectors('metaMask');
        initialize();
        setNotification({
          kind: 'success',
          title: 'Wallet login successful',
        });
        if (searchKey) {
          route.push(searchKey);
          return;
        } else {
          route.push('/contributeSchool');
          return;
        }
      }
    } catch (error) {
      setNotification({
        kind: 'error',
        title: error?.response?.data?.message || error?.message,
      });
    }
  };

  const onClose = () => {
    setOpenModal(false);
  };

  const onCloseNotification = () => {
    setNotification(null);
  };

  return (
    <>
      {notification && (
        <InlineNotification
          aria-label="closes notification"
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
      <CarbonModal
        error={error}
        setError={setError}
        open={openModal}
        onClose={onClose}
        email={email}
        seconds={seconds}
        setSeconds={setSeconds}
      />
      <Navbar />
      <Grid className="landing-page preview1Background signUp-grid" fullWidth>
        <Column className="form" md={4} lg={8} sm={4}>
          <Tile className="signUp-tile">
            <h1>Sign In To Your Account</h1>
            <Form onSubmit={handleSubmit(onSubmit)}>
              {showEmailField && (
                <Controller
                  name="email"
                  control={control}
                  rules={{
                    required: isSubmitted ? 'Email is required' : false,
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i,
                      message: 'Invalid email address',
                    },
                  }}
                  render={({ field }) => (
                    <TextInput
                      {...field}
                      id="email"
                      style={{
                        marginBottom: '25px',
                        height: '48px',
                        color: '#525252',
                      }}
                      labelText="Email"
                      placeholder="Enter your email here"
                      onChange={(e) => {
                        field.onChange(e);
                      }}
                    />
                  )}
                />
              )}
              {errors.email && isSubmitted && (
                <p style={{ color: 'red' }}>{errors.email.message}</p>
              )}
              <br />
              {showSubmitButton ? (
                <Button
                  className="submit-btn"
                  type="submit"
                  style={{ marginRight: '14px', width: '100%' }}
                  onClick={(e) => {
                    handleSubmit(onSubmit)(e);
                  }}
                >
                  Submit
                </Button>
              ) : (
                <Button
                  className="submit-btn"
                  style={{ marginRight: '14px', width: '100%' }}
                  onClick={showEmailInput}
                >
                  Sign In With Email
                </Button>
              )}
              <Button
                className="submit-btn"
                style={{
                  marginRight: '14px',
                  width: '100%',
                  background: 'transparent',
                  color: '#0f62fe',
                  border: '1px solid #0f62fe',
                }}
                onClick={handleWalletLogin}
              >
                Login With Metamask
              </Button> 
            </Form>
          </Tile>
          <p style={{ marginLeft: '20px', color: '#000' }}>
            Don't have an account ?{' '}
            <Link className="link" href={`/signUp${searchKey ? `?returnTo=${searchKey}` : '' }`}>
              {' '}
              Sign Up
            </Link>
          </p>
        </Column>
      </Grid>
    </>
  );
};

const WalletLogin = () => {
  return (
    <Web3Provider>
      <SignIn />
    </Web3Provider>
  );
};

export default WalletLogin;
