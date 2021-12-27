import { Fragment, useEffect, useState } from 'react';
import { ChainId, useContractCall, useEthers, useToken, useTokenBalance } from '@usedapp/core';
import { Link, Route, Routes, useLocation, useSearchParams } from 'react-router-dom';
import { utils } from 'ethers';
import { Gnosis } from '../utils/contracts';
import Sign from './Sign';
import Send from './Send';

export default function Dapp() {
  const { activateBrowserWallet, account, chainId, library } = useEthers();

  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();

  const [multisigAddressInput, setMultisigAddressInput] = useState(
    searchParams.get('multisigAddress')?.toString() ?? ''
  );
  const [tokenAddressInput, setTokenAddressInput] = useState(searchParams.get('tokenAddress')?.toString() ?? '');
  const [destinationAddressInput, setDestinationAddressInput] = useState(
    searchParams.get('destinationAddress')?.toString() ?? ''
  );
  const [amountInput, setAmountInput] = useState(searchParams.get('amount')?.toString() ?? '');
  const [nonceInput, setNonceInput] = useState(searchParams.get('nonce')?.toString() ?? '');

  const [multisigAddress, setMultisigAddress] = useState(searchParams.get('multisigAddress')?.toString());
  const [tokenAddress, setTokenAddress] = useState(searchParams.get('tokenAddress')?.toString() ?? '');
  const [destinationAddress, setDestinationAddress] = useState(
    searchParams.get('destinationAddress')?.toString() ?? ''
  );

  const [linkButtonText, setLinkButtonText] = useState('Share Recovery Details');
  const [link, setLink] = useState(false);

  const tokenBalance = useTokenBalance(tokenAddress, multisigAddress);
  const tokenInfo = useToken(tokenAddress);

  useEffect(() => {
    if (!amountInput && tokenBalance && tokenInfo) {
      setAmountInput(utils.formatUnits(tokenBalance, tokenInfo.decimals));
    }
  }, [tokenBalance]);

  useEffect(() => {
    if(tokenAddress != searchParams.get('tokenAddress')?.toString()) {
      setAmountInput('');
    }
  }, [tokenAddressInput]);

  const [nonceContract] =
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
      setNonceInput(nonceContract);
    }
  }, [nonceContract]);

  useEffect(() => {
    setSearchParams('', {replace: true});
  }, []);

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

  const onNumberInput = (numberTarget: EventTarget & HTMLInputElement, inputSetter: any) => {
    numberTarget.validity.valid && inputSetter(numberTarget.value);
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

              {account &&
                library &&
                tokenBalance &&
                tokenBalance.gt('0') &&
                tokenInfo &&
                multisigAddress &&
                tokenAddress && (
                  <>
                    <h3>Amount of {tokenInfo.symbol} to send</h3>
                    <input
                      type="text"
                      pattern={`\\d*\\.?\\d{0,${tokenInfo.decimals ?? 0}}$`}
                      onChange={(e) => onNumberInput(e.target, setAmountInput)}
                      value={amountInput}
                    />
                    <p className="small">
                      Prefilled to current balance, but you can manually change this if needed. We have detected{' '}
                      {tokenInfo.decimals} decimal places.
                    </p>

                    <h3>Send {amountInput} {tokenInfo?.symbol} to</h3>
                    <input
                      type="text"
                      onChange={(v) =>
                        onAddressInput(v.target.value, setDestinationAddressInput, setDestinationAddress)
                      }
                      value={destinationAddressInput}
                    />

                    {destinationAddress && amountInput && (
                      <>
                        <h3>Gnosis Safe Nonce</h3>
                        <input
                          type="text"
                          pattern="[0-9]*"
                          onChange={(e) => onNumberInput(e.target, setNonceInput)}
                          value={nonceInput}
                        />
                        <p className="small">Prefilled to current nonce, but you can manually change this if needed.</p>

                        <div>
                          <button
                            type="button"
                            onClick={async () => {
                              navigator.clipboard.writeText(
                                `${window.location.origin}${process.env.PUBLIC_URL}#/sign?multisigAddress=${multisigAddress}&tokenAddress=${tokenAddress}&amount=${amountInput}&destinationAddress=${destinationAddress}&nonce=${nonceInput}`
                              );

                              setLinkButtonText('Copied to cliboard...');
                              setLink(true);

                              setTimeout(() => {
                                setLinkButtonText('Share Recovery Details');
                                setLink(false);
                              }, 3 * 1000);
                            }}
                          >
                            {linkButtonText}
                          </button>
                        </div>

                        {link && (
                          <div>
                            <p className="small">
                              Send this link to any other signatories on the multisig and ask them to also Sign.
                            </p>
                          </div>
                        )}

                        <div className="tabs">
                          <Link
                            to="/sign"
                            style={{
                              fontWeight: location.pathname == '/sign' ? 'bold' : 'normal',
                            }}
                          >
                            Sign
                          </Link>
                          <Link
                            to="/send"
                            style={{
                              fontWeight: location.pathname == '/send' ? 'bold' : 'normal',
                            }}
                          >
                            Send
                          </Link>
                        </div>

                        <Routes>
                          <Route
                            path="/sign"
                            element={
                              <Sign
                                multisigAddress={multisigAddress}
                                tokenAddress={tokenAddress}
                                destinationAddress={destinationAddress}
                                amount={utils.parseUnits(amountInput, tokenInfo.decimals)}
                                nonce={parseInt(nonceInput)}
                                tokenInfo={tokenInfo}
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
                                amount={utils.parseUnits(amountInput, tokenInfo.decimals)}
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
