import { bech32m, bech32, BechLib } from 'bech32';
import * as utils from '../utils';
import { lookupNetwork } from '../utils';

function checkValidAddresses(addresses: string[], networkName: string, expectedValid: boolean) {
  const network = lookupNetwork(networkName);
  addresses.forEach((address: string) => {
    expect(utils.isValidAddress(address, network)).toEqual(expectedValid);
  });
}

function toBech32(data: Buffer, version: number, prefix: string, bech32variant: BechLib): string {
  const words = bech32.toWords(data);
  words.unshift(version);

  return bech32variant.encode(prefix, words);
}

const v0addrEncodedWithBase32 = toBech32(
  Buffer.from('7777777777777777777777777777777777777777777777777777777777777777', 'hex'),
  0,
  'bc',
  bech32
);
const v1addrEncodedWithBase32m = toBech32(
  Buffer.from('7777777777777777777777777777777777777777777777777777777777777777', 'hex'),
  1,
  'bc',
  bech32m
);
const v0addrEncodedWithBase32m = toBech32(
  Buffer.from('7777777777777777777777777777777777777777777777777777777777777777', 'hex'),
  0,
  'bc',
  bech32m
);
const v1addrEncodedWithBase32 = toBech32(
  Buffer.from('7777777777777777777777777777777777777777777777777777777777777777', 'hex'),
  1,
  'bc',
  bech32
);

describe('Unit tests for various utils functions', () => {
  it('Test isValidAddress accepts valid bech32 address', () => {
    const validMainnetAddresses = [
      // bech32
      'BC1QW508D6QEJXTDG4Y5R3ZARVARY0C5XW7KV8F3T4',
      v0addrEncodedWithBase32,
      // bech32m
      'bc1pw508d6qejxtdg4y5r3zarvary0c5xw7kw508d6qejxtdg4y5r3zarvary0c5xw7kt5nd6y',
      'BC1SW50QGDZ25J',
      'bc1zw508d6qejxtdg4y5r3zarvaryvaxxpcs',
      'bc1p0xlxvlhemja6c4dqv22uapctqupfhlxm9h8z3k2e72q4k9hcz7vqzk5jj0',
      v1addrEncodedWithBase32m,
    ];
    checkValidAddresses(validMainnetAddresses, 'mainnet', true);

    const validTestnetAddresses = [
      // bech32
      'tb1qrp33g0q5c5txsp9arysrx4k6zdkfs4nce4xj0gdcccefvpysxf3q0sl5k7',
      // bech32m
      'tb1qqqqqp399et2xygdj5xreqhjjvcmzhxw4aywxecjdzew6hylgvsesrxh6hy',
      'tb1pqqqqp399et2xygdj5xreqhjjvcmzhxw4aywxecjdzew6hylgvsesf3hn0c',
    ];
    checkValidAddresses(validTestnetAddresses, 'testnet', true);

    const invalidMainnetAddresses = [
      'bc1p0xlxvlhemja6c4dqv22uapctqupfhlxm9h8z3k2e72q4k9hcz7vqh2y7hd', // Invalid checksum (Bech32 instead of Bech32m)
      'BC1S0XLXVLHEMJA6C4DQV22UAPCTQUPFHLXM9H8Z3K2E72Q4K9HCZ7VQ54WELL', // Invalid checksum (Bech32 instead of Bech32m)
      'bc1qw508d6qejxtdg4y5r3zarvary0c5xw7kemeawh', // Invalid checksum (Bech32m instead of Bech32)
      'bc1p38j9r5y49hruaue7wxjce0updqjuyyx0kh56v8s25huc6995vvpql3jow4', // Invalid character in checksum
      'BC130XLXVLHEMJA6C4DQV22UAPCTQUPFHLXM9H8Z3K2E72Q4K9HCZ7VQ7ZWS8R', // Invalid witness version
      'bc1p0xlxvlhemja6c4dqv22uapctqupfhlxm9h8z3k2e72q4k9hcz7v07qwwzcrf', // zero padding of more than 4 bits
      'bc1pw5dgrnzv', // Invalid program length (1 byte)
      'bc1p0xlxvlhemja6c4dqv22uapctqupfhlxm9h8z3k2e72q4k9hcz7v8n0nx0muaewav253zgeav', // Invalid program length (41 bytes)
      'BC1QR508D6QEJXTDG4Y5R3ZARVARYV98GJ9P', // Invalid program length for witness version 0 (per BIP141)
      'tb1qqqqqp399et2xygdj5xreqhjjvcmzhxw4aywxecjdzew6hylgvsesrxh6hy', // Testnet addr used on mainnet
      'bc1gmk9yu', // Empty data section
      v0addrEncodedWithBase32m, // Version 0 address must be encoded with bech32
      v1addrEncodedWithBase32, // Version 1 address must be encoded with bech32m
    ];
    checkValidAddresses(invalidMainnetAddresses, 'mainnet', false);

    const invalidTestnetAddresses = [
      'tc1p0xlxvlhemja6c4dqv22uapctqupfhlxm9h8z3k2e72q4k9hcz7vq5zuyut', // Invalid human-readable part
      'tb1z0xlxvlhemja6c4dqv22uapctqupfhlxm9h8z3k2e72q4k9hcz7vqglt7rf', // Invalid checksum (Bech32 instead of Bech32m)
      'tb1q0xlxvlhemja6c4dqv22uapctqupfhlxm9h8z3k2e72q4k9hcz7vq24jc47', // Invalid checksum (Bech32m instead of Bech32)
      'tb1p0xlxvlhemja6c4dqv22uapctqupfhlxm9h8z3k2e72q4k9hcz7vq47Zagq', // Mixed case
      'tb1p0xlxvlhemja6c4dqv22uapctqupfhlxm9h8z3k2e72q4k9hcz7vpggkg4j', // Non-zero padding in 8-to-5 conversion
      'bc1pw508d6qejxtdg4y5r3zarvary0c5xw7kw508d6qejxtdg4y5r3zarvary0c5xw7kt5nd6y', // Mainnet addr used on testnet
    ];
    checkValidAddresses(invalidTestnetAddresses, 'testnet', false);
  });

  it('isValidAddress should default to mainnet', () => {
    expect(utils.isValidAddress('tb1qrp33g0q5c5txsp9arysrx4k6zdkfs4nce4xj0gdcccefvpysxf3q0sl5k7')).toBeFalsy();
    expect(utils.isValidAddress('BC1SW50QGDZ25J')).toBeTruthy();
  });
});
