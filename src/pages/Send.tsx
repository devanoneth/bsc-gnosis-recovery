import { useContractCall, useContractFunction } from '@usedapp/core';
import { useEffect, useState } from 'react';
import { Gnosis } from '../utils/contracts';
import { BigNumber, Contract } from 'ethers';
import { buildData, recoverTypedData } from '../utils/signature';

type SendProps = {
  multisigAddress: string;
  tokenAddress: string;
  destinationAddress: string;
  tokenBalance: BigNumber;
  nonce: number;
};

export default function Send({ multisigAddress, tokenAddress, destinationAddress, tokenBalance, nonce }: SendProps) {
  const [signatureNumbers, setSignatureNumbers] = useState([0]);
  const [signatureInputs, setSignatureInputs] = useState(['']);
  const [addressOutputs, setAddressOuputs] = useState(['']);
  const [combinedSignatures, setCombinedSignatures] = useState('');
  const [statusMessage, setStatusMessage] = useState('');

  const [lastThreshold, setLastThreshold] = useState(0);

  const [threshold] =
    useContractCall(
      multisigAddress && {
        abi: Gnosis,
        address: multisigAddress,
        method: 'getThreshold',
        args: [],
      }
    ) ?? [];

  const GnosisContract = new Contract(multisigAddress, Gnosis);

  const { send, state } = useContractFunction(GnosisContract, 'execTransaction', {
    transactionName: 'ExecTransaction',
  });

  useEffect(() => {
    if (threshold) {
      const thresholdNumber = threshold.toNumber();

      if (lastThreshold !== thresholdNumber) {
        setLastThreshold(thresholdNumber);

        const signatureNumbersArray = [];
        const signatureInputsArray = [];
        const addressOutputsArray = [];
        for (let i = 0; i < thresholdNumber; i++) {
          signatureNumbersArray.push(i);
          signatureInputsArray.push('');
          addressOutputsArray.push('');
        }

        setSignatureNumbers(signatureNumbersArray);
        setSignatureInputs(signatureInputsArray);
        setAddressOuputs(addressOutputsArray);
      }
    }
  }, [threshold]);

  useEffect(() => {
    const data = buildData(tokenBalance, destinationAddress);
    const addressArray = addressOutputs.concat();

    signatureInputs.map((signatureInput, i) => {
      if (signatureInput.length == 132) {
        try {
          const address = recoverTypedData(multisigAddress, tokenAddress, data, nonce, signatureInput);

          addressArray[i] = address;
        } catch (e) {
          console.error(e);
          addressArray[i] = '';
        }
      } else {
        addressArray[i] = '';
      }
    });
    setAddressOuputs(addressArray);

    const signatureInputsWithoutPrefix = signatureInputs.map((signatureInput) => signatureInput.replace('0x', ''));
    const signatures = signatureInputsWithoutPrefix.join('');

    if (signatures.length == 130 * lastThreshold) {
      setCombinedSignatures('0x' + signatures);
    }
  }, [signatureInputs]);

  useEffect(() => {
    console.log(state);
    if(state.status == 'Exception') {
      setStatusMessage(state.errorMessage ?? '');
    } else if (state.status == 'Mining') {
      setStatusMessage(`Mining... Transaction hash: ${state?.transaction?.hash}`);
    } else if (state.status == 'Success') {
      // TODO: stop the entire page reloading because of the fact that now the multisig has no tokens... (this happens right now)
      setStatusMessage(`Success!`);
    }
  }, [state]);

  const onSignatureInput = (signature: string, signatureNumber: number) => {
    const signatureInputsArray = signatureInputs.concat();
    signatureInputsArray[signatureNumber] = signature;
    setSignatureInputs(signatureInputsArray);
  };

  return (
    <div className="App">
      {threshold && (
        <>
          {signatureNumbers.map((signatureNumber) => {
            return (
              <div key={signatureNumber}>
                <h3>Signature {(signatureNumber + 1).toString()}</h3>
                <input
                  type="text"
                  onChange={(e) => onSignatureInput(e.target.value, signatureNumber)}
                  value={signatureInputs[signatureNumber]}
                />
                {addressOutputs[signatureNumber] && <p className="small">Signed by {addressOutputs[signatureNumber]}</p>}
              </div>
            );
          })}

          {combinedSignatures && (
            <div>
              <button
                type="button"
                onClick={async () => {
                  const data = buildData(tokenBalance, destinationAddress);

                  console.log(data);

                  console.log(GnosisContract);

                  await send(
                    tokenAddress,
                    '0',
                    data,
                    '0',
                    '0',
                    '0',
                    '0',
                    '0x0000000000000000000000000000000000000000',
                    '0x0000000000000000000000000000000000000000',
                    combinedSignatures
                  );
                }}
              >
                Send
              </button>

              {statusMessage && <p className="small">{statusMessage}</p>}
            </div>
          )}
        </>
      )}
    </div>
  );
}
