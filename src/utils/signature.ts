import { BigNumber, utils } from 'ethers';
import { Web3Provider } from '@ethersproject/providers';

export function buildData(amount: BigNumber, destinationAddress: string): string {
  destinationAddress = destinationAddress.replace('0x', '');
  const amountHexString = amount.toHexString().replace('0x', '').padStart(64, '0');
  const data = `0xa9059cbb000000000000000000000000${destinationAddress}${amountHexString}`;
  return data;
}

export async function signTypedData(
  from: string,
  multisigAddress: string,
  tokenAddress: string,
  data: string,
  nonce: number,
  provider: Web3Provider
): Promise<string> {
  const msgParams = JSON.stringify({
    domain: {
      verifyingContract: multisigAddress,
    },
    message: {
      to: tokenAddress,
      value: '0',
      data,
      operation: '0',
      safeTxGas: '0',
      baseGas: '0',
      gasPrice: '0',
      gasToken: '0x0000000000000000000000000000000000000000',
      refundReceiver: '0x0000000000000000000000000000000000000000',
      nonce,
    },
    primaryType: 'SafeTx',
    types: {
      EIP712Domain: [
        {
          type: 'address',
          name: 'verifyingContract',
        },
      ],
      SafeTx: [
        { type: 'address', name: 'to' },
        { type: 'uint256', name: 'value' },
        { type: 'bytes', name: 'data' },
        { type: 'uint8', name: 'operation' },
        { type: 'uint256', name: 'safeTxGas' },
        { type: 'uint256', name: 'baseGas' },
        { type: 'uint256', name: 'gasPrice' },
        { type: 'address', name: 'gasToken' },
        { type: 'address', name: 'refundReceiver' },
        { type: 'uint256', name: 'nonce' },
      ],
    },
  });

  return await provider.send('eth_signTypedData_v4', [from, msgParams]);
}

export function recoverTypedData(
  multisigAddress: string,
  tokenAddress: string,
  data: string,
  nonce: number,
  signature: string
): string {
  return utils.verifyTypedData(
    {
      verifyingContract: multisigAddress,
    },
    {
      SafeTx: [
        { type: 'address', name: 'to' },
        { type: 'uint256', name: 'value' },
        { type: 'bytes', name: 'data' },
        { type: 'uint8', name: 'operation' },
        { type: 'uint256', name: 'safeTxGas' },
        { type: 'uint256', name: 'baseGas' },
        { type: 'uint256', name: 'gasPrice' },
        { type: 'address', name: 'gasToken' },
        { type: 'address', name: 'refundReceiver' },
        { type: 'uint256', name: 'nonce' },
      ],
    },
    {
      to: tokenAddress,
      value: '0',
      data,
      operation: '0',
      safeTxGas: '0',
      baseGas: '0',
      gasPrice: '0',
      gasToken: '0x0000000000000000000000000000000000000000',
      refundReceiver: '0x0000000000000000000000000000000000000000',
      nonce,
    },
    signature
  );
}
