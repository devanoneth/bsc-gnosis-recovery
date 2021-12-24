import { useEthers } from '@usedapp/core';
import { BigNumber } from 'ethers';
import { useEffect, useState } from 'react';
import { buildData, signTypedData } from '../utils/signature';

type BuildProps = {
  multisigAddress: string;
  tokenAddress: string;
  destinationAddress: string;
  tokenBalance: BigNumber;
  nonce: number;
};

export default function Sign({ multisigAddress, tokenAddress, destinationAddress, tokenBalance, nonce }: BuildProps) {
  const { account, library } = useEthers();

  const [link, setLink] = useState('');
  const [signature, setSignature] = useState('');


  useEffect(() => {
    link && setLink('');
    signature && setSignature('');
  }, [multisigAddress, tokenAddress, destinationAddress, nonce]);

  return (
    <div className="App">
      {account && library && (
        <>
          <div>
            <button
              type="button"
              onClick={async () => {
                setLink(
                  `${window.location.origin}/build?multisigAddress=${multisigAddress}&tokenAddress=${tokenAddress}&destinationAddress=${destinationAddress}&nonce=${nonce}`
                );
              }}
            >
              Share
            </button>
          </div>

          {link && (
            <div>
              <div className="code" id="linkAnchor">
                <pre>{link}</pre>
                <a
                  href="#linkAnchor"
                  onClick={() => {
                    navigator.clipboard.writeText(link);
                  }}
                >
                  Copy
                </a>
              </div>
              <p className="small">Send this to any other signatories on the multisig and ask them to Sign.</p>
            </div>
          )}

          <div>
            <button
              type="button"
              onClick={async () => {
                const data = buildData(tokenBalance, destinationAddress);

                const localSignature = await signTypedData(
                  account,
                  multisigAddress,
                  tokenAddress,
                  data,
                  nonce,
                  library
                );

                setSignature(localSignature);
              }}
            >
              Sign
            </button>
          </div>

          {signature && (
            <div>
              <div className="code" id="signatureAnchor">
                <pre>{signature}</pre>
                <a
                  href="#signatureAnchor"
                  onClick={() => {
                    navigator.clipboard.writeText(signature);
                  }}
                >
                  Copy
                </a>
              </div>
              <p className="small">Copy this and use it in the "Send" tab.</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
