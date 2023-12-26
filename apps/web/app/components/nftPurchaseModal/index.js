// ModalComponent.js
import React, { useState, useEffect } from 'react';
import { Modal, ModalBody, Column, Grid, Button } from '@carbon/react';
import { toSvg } from 'jdenticon';
import { useRouter } from 'next/navigation';
import { ArrowRight } from '@carbon/icons-react';
import {
  useSellerContract,
  useSignerSellerContract,
} from '../../hooks/useContract';
import { useWeb3React } from '@web3-react/core';
import CongratulationModalComponent from '../../components/nftPurchaseSuccessModal';
import { ethers } from 'ethers';
import {
  metaMaskLogin,
  switchMetaMaskNetwork,
} from '../../utils/metaMaskUtils';

const ModalComponent = ({ isOpen, onClose, schooldata, tokenId }) => {
  const sellerContract = useSellerContract();
  const signerSellerContract = useSignerSellerContract();
  const { account, chainId } = useWeb3React();
  const [loading, setLoading] = useState(false);
  const [showCongratulationModal, setShowCongratulationModal] = useState(true);
  const [switchNetwork, setSwitchNetwork] = useState(false);
  const [price, setPrice] = useState(0);
  const [priceInEth, setPriceEth] = useState(0);

  const generateIdenticon = (image) => {
    const size = 200;
    const svgString = toSvg(image, size);
    return `data:image/svg+xml,${encodeURIComponent(svgString)}`;
  };

  const fetchPrice = async () => {
    if (!sellerContract) return;
    try {
      const price = await sellerContract.methods
        .calculatePrice()
        .call({ from: account });
      const priceInEth = ethers.formatEther(price);
      setPrice(price);
      setPriceEth(priceInEth);
    } catch (err) {
      console.log(err);
    }
  };

  const handleSubmit = async () => {
    if (!signerSellerContract) return;
    if (!account) return;

    try {
      setLoading(true);
      const tx = await signerSellerContract
        .purchaseNft(tokenId, account, { value: price })
        .then((hash) => {
          if (hash) {
            onClose();
            setShowCongratulationModal(true);
          }
        })
        .catch((err) => {
          console.log(err);
          setLoading(false);
        });
    } catch (err) {
      console.log(err);
      setLoading(false);
    }
  };

  const connectMetaMask = async () => {
    if (!account) {
      await metaMaskLogin();
    }
  };

  const closeCongratulationModal = () => {
    setShowCongratulationModal(false);
  };

  const handleSwitchNetwork = async () => {
    await switchMetaMaskNetwork();
    setSwitchNetwork(false);
  };

  useEffect(() => {
    if (account) {
      if (chainId !== 421613) setSwitchNetwork(true);
    }
  }, [account, chainId]);

  useEffect(() => {
    fetchPrice();
  });

  return (
    <>
      <Modal open={isOpen} onRequestClose={onClose} passiveModal={true}>
        <ModalBody>
          <p>
            You are about to purchase {schooldata?.schoolName} from{' '}
            {schooldata?.owner.slice(0, 8) +
              '...' +
              schooldata?.owner.slice(-6)}
          </p>
          <Grid style={{ marginTop: '18px' }}>
            <Column
              md={4}
              lg={7}
              sm={4}
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-end',
              }}
            >
              <img
                style={{
                  width: '80%',
                }}
                alt="School Map"
                src={generateIdenticon(schooldata?.image)}
              />
            </Column>
            <Column
              md={4}
              lg={9}
              sm={4}
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-end',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: '12px',
                }}
              >
                <p style={{ fontWeight: '600' }}>NFT Name</p>
                <p style={{ fontWeight: '600' }}>{schooldata?.schoolName}</p>
              </div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: '12px',
                }}
              >
                <p>Price</p>
                <p>{priceInEth}MATIC</p>
              </div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: '12px',
                }}
              ></div>
            </Column>
            <Column md={4} lg={16} sm={4} style={{ marginTop: '6px' }}>
              <div className="border-bottom"></div>
            </Column>
            <Column md={4} lg={16} sm={4} style={{ marginTop: '24px' }}>
              {account ? (
                <>
                  <p style={{ fontWeight: '600' }}>Go to you wallet.</p>
                  <p>
                    You will be asked to approve this purchase from your wallet.
                  </p>

                  <Button
                    className="submit-btn"
                    onClick={handleSubmit}
                    renderIcon={ArrowRight}
                    style={{ marginTop: '12px', marginBottom: '12px' }}
                  >
                    {loading ? 'Loading...' : 'Submit'}
                  </Button>
                </>
              ) : (
                <>
                  <p> First you need to connect your MetaMask</p>
                  <Button
                    className="submit-btn"
                    onClick={connectMetaMask}
                    renderIcon={ArrowRight}
                  >
                    Connect MetaMask
                  </Button>
                </>
              )}
              {switchNetwork && (
                <>
                  <br />
                  <a onClick={handleSwitchNetwork}>{} Switch Network</a>
                </>
              )}
            </Column>
          </Grid>
        </ModalBody>
      </Modal>
      {showCongratulationModal && (
        <CongratulationModalComponent
          schooldata={schooldata}
          isOpen={showCongratulationModal}
          onClose={closeCongratulationModal}
        />
      )}
    </>
  );
};

export default ModalComponent;
