import { Web3ReactHooks } from '@web3-react/core';
import { GnosisSafe } from '@web3-react/gnosis-safe';
import type { MetaMask } from '@web3-react/metamask';
import { Network } from '@web3-react/network';
import { useCallback, useEffect, useState } from 'react';
import { useAuthContext } from 'src/auth/useAuthContext';
import { Button } from '@mui/material';
import { loginSignature } from './utils/wallet';
import { JsonRpcProvider, Signer } from 'ethers';
import { useLoginWallet, useNonceGet } from '@hooks/web3/useMetamask';
import { useRouter } from 'next/router';
import { useSnackbar } from '@components/snackbar';
import {
  saveAccessToken,
  saveConnectors,
  saveCurrentUser,
  saveRefreshToken,
} from '@utils/sessionManager';
import { DEFAULT_CHAIN_ID } from './chains';
import { metaMaskLogin } from './utils/metamask';

function ChainSelect({
  activeChainId,
  connectWallet,
}: {
  activeChainId: number;
  connectWallet: () => void;
}) {
  return (
    <Button
      variant="contained"
      value={activeChainId}
      onClick={(e) => {
        connectWallet();
      }}
    >
      Connect Metamask
    </Button>
  );
}

export default function ConnectWithSelect({
  connector,
  activeChainId,
  isActivating,
  isActive,
  error,
  provider,
  setError,
}: {
  connector: MetaMask;
  activeChainId: ReturnType<Web3ReactHooks['useChainId']>;
  chainIds?: ReturnType<Web3ReactHooks['useChainId']>[];
  isActivating: ReturnType<Web3ReactHooks['useIsActivating']>;
  isActive: ReturnType<Web3ReactHooks['useIsActive']>;
  error: Error | undefined;
  provider: ReturnType<Web3ReactHooks['useProvider']>;
  setError: (error: Error | undefined) => void;
}) {
  const [desiredChainId, setDesiredChainId] = useState<any>(undefined);
  const [enableGetNonce, setEnableGetNonce] = useState<boolean>(false);
  const [refetchNonce, setRefetchNonce] = useState<boolean>(false);
  const [invalidNonce, setInvalidNonce] = useState<boolean>(false)

  const {
    data: nonceData,
    isSuccess: isNonceSuccess,
    isError: isNonceError,
    refetch: nonceRefetch
  } = useNonceGet(enableGetNonce);
  
  const { enqueueSnackbar } = useSnackbar();
  const { push } = useRouter();
  const { setAuthState } = useAuthContext();

  const {
    mutate,
    isError,
    data: loginWalletData,
    isSuccess: isLoginWalletSuccess,
    error: loginWalletError,
  } = useLoginWallet();

  const getSignature = async () => {
    if (!isActive && JsonRpcProvider) return;
    if (!refetchNonce || invalidNonce) {
      nonceRefetch();
    }
    if (isNonceSuccess) {
      try {
        const signer = (provider as unknown as JsonRpcProvider).getSigner() as unknown as Signer;
        const address = await signer.getAddress();
        const signature = await loginSignature(signer, nonceData?.nonce);
        if (!signature) {
          enqueueSnackbar('Invalid Signature', { variant: 'error' });
          return Error('Signature is null');
        }
        mutate({ walletAddress: address, signature });
        setRefetchNonce(false)
      } catch (err) {
        enqueueSnackbar(err.message, { variant: 'error' });
      }
    } else {
      setRefetchNonce(true)
      enqueueSnackbar('Fetching nonce, please wait...', { variant: 'warning' });
    }
  };

  useEffect( () => {
    if(refetchNonce || invalidNonce){
      getSignature();
    }
  }, [refetchNonce, isNonceSuccess, invalidNonce])

  useEffect(() => {
    isNonceError && enqueueSnackbar("Couldn't get Nonce", { variant: 'error' });
  }, [isNonceError]);

  useEffect(() => {
    if(isError){
      //@ts-ignore
      enqueueSnackbar(loginWalletError.response.data.message, { variant: 'error' }); 
      setInvalidNonce(true)
    }
    if (isLoginWalletSuccess) {
      const currentUser = {
        email: loginWalletData.data.email,
        username: loginWalletData.data.name,
        id: loginWalletData.data.id,
        role: loginWalletData.data.role,
      };
      setAuthState((prev: any) => ({
        ...prev,
        isAuthenticated: true,
        isInitialized: true,
        token: loginWalletData.data.access_token,
        user: currentUser,
      }));
      saveCurrentUser(currentUser);
      saveAccessToken(loginWalletData.data.access_token);
      saveRefreshToken(loginWalletData.data.refresh_token);
      saveConnectors('metaMask');
      push('/dashboard');
    }
  }, [isError, isLoginWalletSuccess]);

  useEffect(() => {
    if (activeChainId && (!desiredChainId || desiredChainId === -1)) {
      setDesiredChainId(activeChainId);
    }
  }, [desiredChainId, activeChainId]);

  const connectWallet = useCallback(async () => {
    setEnableGetNonce(false);
    try {
      setError(undefined);
      await metaMaskLogin(connector)
    } catch (error) {
      setError(error);
    }
  }, [connector, setError]);

  return (
    <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'flex-end' }}>
      <div style={{ marginBottom: '1rem' }} />
      {isActive ? (
        error ? (
          <Button variant="contained" color="error" onClick={() => connectWallet()}>
            Try again?
          </Button>
        ) : (
          <>
            <Button
              sx={{ marginRight: '15px' }}
              variant="contained"
              style={{background: '#0050e6'}}
              onClick={() => {
                getSignature();
              }}
            >
              Login with metamask
            </Button>
            <Button
              variant="contained"
              color="error"
              onClick={() => {
                if (connector?.deactivate) {
                  void connector.deactivate();
                } else {
                  void connector.resetState();
                }
                setDesiredChainId(undefined);
              }}
            >
              Disconnect
            </Button>
          </>
        )
      ) : (
        <ChainSelect activeChainId={desiredChainId} connectWallet={connectWallet} />
      )}
    </div>
  );
}
