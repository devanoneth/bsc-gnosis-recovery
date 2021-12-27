import { useEthers } from '@usedapp/core';
import { TokenInfo } from '@usedapp/core/dist/esm/src/model/TokenInfo';
import { BigNumber, utils } from 'ethers';
import { useEffect, useState } from 'react';
import { buildData, signTypedData } from '../utils/signature';

type BuildProps = {
  multisigAddress: string;
  tokenAddress: string;
  destinationAddress: string;
  amount: BigNumber;
  nonce: number;
  tokenInfo: TokenInfo;
};

export default function Sign({ multisigAddress, tokenAddress, destinationAddress, amount, tokenInfo, nonce }: BuildProps) {
  const { account, library } = useEthers();

  const [signature, setSignature] = useState('');

  useEffect(() => {
    signature && setSignature('');
  }, [multisigAddress, tokenAddress, destinationAddress, nonce]);

  return (
    <div className="main">
      {account && library && (
        <>
          <p>This will sign a Gnosis Multisig compatible message (based on <a href="https://eips.ethereum.org/EIPS/eip-712" target="_blank">EIP-712</a>) for a transfer of {utils.formatUnits(amount, tokenInfo.decimals)} {tokenInfo.symbol} to {destinationAddress}.</p>
          <div>
            <button
              type="button"
              onClick={async () => {
                const data = buildData(amount, destinationAddress);

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
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(signature);
                  }}
                >
                  Copy
                </button>
              </div>
              <p className="small">Copy this and use it in the "Send" tab.</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
