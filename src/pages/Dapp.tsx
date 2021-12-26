import { Fragment, useEffect, useState } from 'react';
import { ChainId, useContractCall, useEthers, useToken, useTokenBalance } from '@usedapp/core';
import { Link, Route, Routes, useSearchParams } from 'react-router-dom';
import { utils } from 'ethers';
import { Gnosis } from '../utils/contracts';
import Sign from './Sign';
import Send from './Send';

export default function Dapp() {
  const { activateBrowserWallet, account, chainId, library } = useEthers();

  const [searchParams, setSearchParams] = useSearchParams();

  const [multisigAddressInput, setMultisigAddressInput] = useState(
    searchParams.get('multisigAddress')?.toString() ?? ''
  );
  const [tokenAddressInput, setTokenAddressInput] = useState(searchParams.get('tokenAddress')?.toString() ?? '');
  const [destinationAddressInput, setDestinationAddressInput] = useState(
    searchParams.get('destinationAddress')?.toString() ?? ''
  );
  const [nonceInput, setNonceInput] = useState(searchParams.get('nonce')?.toString() ?? '');

  const [multisigAddress, setMultisigAddress] = useState(searchParams.get('multisigAddress')?.toString());
  const [tokenAddress, setTokenAddress] = useState(searchParams.get('tokenAddress')?.toString() ?? '');
  const [destinationAddress, setDestinationAddress] = useState(
    searchParams.get('destinationAddress')?.toString() ?? ''
  );

  const tokenBalance = useTokenBalance(tokenAddress, multisigAddress);
  const tokenInfo = useToken(tokenAddress);

  const nonceContract =
    useContractCall(
      multisigAddress && {
        abi: Gnosis,
        address: multisigAddress,
        method: 'nonce',
        args: [],
      }
    ) ?? [];

  useEffect(() => {
    if (!nonceInput) {
      setNonceInput(nonceContract?.toString());
    }
  }, [nonceContract]);

  const onAddressInput = (address: string, inputSetter: any, setter: any) => {
    inputSetter(address);
    try {
      address = utils.getAddress(address);

      setter(address);
    } catch (err) {
      console.error(err);
      setter('');
      // TODO: Show error somewhere
    }
  };

  const onNonceInput = (nonceTarget: EventTarget & HTMLInputElement) => {
    nonceTarget.validity.valid && setNonceInput(nonceTarget.value);
  };

  return (
    <Fragment>
      <button type="button" disabled={!!account} onClick={() => activateBrowserWallet()}>
        {account ? 'connected' : 'connect'}
      </button>
      {account && <p>{account}</p>}
      {chainId && chainId !== ChainId.BSC && <p>Please connect to BSC</p>}

      {account && library && chainId && chainId === ChainId.BSC && (
        <>
          <h3>Gnosis Multisig Address</h3>
          <input
            type="text"
            onChange={(e) => onAddressInput(e.target.value, setMultisigAddressInput, setMultisigAddress)}
            value={multisigAddressInput}
          />

          {multisigAddress && (
            <>
              <h3>ERC20 Token Address</h3>
              <input
                type="text"
                onChange={(e) => onAddressInput(e.target.value, setTokenAddressInput, setTokenAddress)}
                value={tokenAddressInput}
              />

              {account && library && tokenBalance && tokenBalance.gt('0') && multisigAddress && tokenAddress && (
                <>
                  <h3>Gnosis Safe Balance</h3>
                  <p>
                    {utils.formatUnits(tokenBalance, tokenInfo?.decimals)} {tokenInfo?.symbol}
                  </p>

                  <h3>Send entire {tokenInfo?.symbol} balance to</h3>
                  <input
                    type="text"
                    onChange={(v) => onAddressInput(v.target.value, setDestinationAddressInput, setDestinationAddress)}
                    value={destinationAddressInput}
                  />

                  {destinationAddress && (
                    <>
                      <h3>Gnosis Safe Nonce</h3>
                      <input type="text" pattern="[0-9]*" onChange={(e) => onNonceInput(e.target)} value={nonceInput} />
                      <p className="small">
                        Prefilled based on blockchain, but you can manually change this if needed.
                      </p>

                      <div className="tabs">
                        <Link to="/sign">Sign</Link>
                        <Link to="/send">Send</Link>
                      </div>

                      <Routes>
                        <Route
                          path="/sign"
                          element={
                            <Sign
                              multisigAddress={multisigAddress}
                              tokenAddress={tokenAddress}
                              destinationAddress={destinationAddress}
                              tokenBalance={tokenBalance}
                              nonce={parseInt(nonceInput)}
                            />
                          }
                        />
                        <Route
                          path="/send"
                          element={
                            <Send
                              multisigAddress={multisigAddress}
                              tokenAddress={tokenAddress}
                              destinationAddress={destinationAddress}
                              tokenBalance={tokenBalance}
                              nonce={parseInt(nonceInput)}
                            />
                          }
                        />
                      </Routes>
                    </>
                  )}
                </>
              )}

              {account && library && tokenBalance && tokenBalance.eq('0') && (
                <p className="small">No balance found for {tokenInfo?.name}</p>
              )}
            </>
          )}
        </>
      )}
    </Fragment>
  );
}
