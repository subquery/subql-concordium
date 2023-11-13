// Copyright 2020-2023 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: GPL-3.0

import { ContractAddress, AddressAccount, Address } from '@concordium/node-sdk';

import {
  ConcordiumBlock,
  ConcordiumTransactionFilter,
  ConcordiumTransactionEventFilter,
  ConcordiumBlockFilter,
  ConcordiumTransaction,
  ConcordiumTransactionEvent,
  ConcordiumSpecialEvent,
  ConcordiumSpecialEventFilter,
} from '@subql/types-concordium';

export function filterBlocksProcessor(
  block: ConcordiumBlock,
  filter: ConcordiumBlockFilter,
): boolean {
  if (filter?.modulo && Number(block.blockHeight) % filter.modulo !== 0) {
    return false;
  }
  return true;
}

export function filterTransactionsProcessor(
  transaction: ConcordiumTransaction,
  filter: ConcordiumTransactionFilter,
): boolean {
  if (!filter) return true;

  if (filter.type && transaction.type !== filter.type) return false;

  if (filter.values) {
    for (const key in filter.values) {
      if (filter.values[key] !== transaction[key]) return false;
    }
  }

  return true;
}

export function filterTxEventProcessor(
  txEvent: ConcordiumTransactionEvent | ConcordiumSpecialEvent,
  filter: ConcordiumTransactionEventFilter | ConcordiumSpecialEventFilter,
): boolean {
  if (!filter) return true;

  if (filter.type && txEvent.tag !== filter.type) return false;

  if (filter.values) {
    for (const key in filter.values) {
      const filterValue = filter.values[key];
      const eventValue = txEvent[key];
      if (
        filterValue !== eventValue &&
        !equalsAddressAccount(eventValue, filterValue) &&
        !equalsContractAddress(eventValue, filterValue) &&
        !equalsAddress(eventValue, filterValue) &&
        !equalsBigInt(eventValue, filterValue)
      ) {
        return false;
      }
    }
  }

  return true;
}

function isAddressAccount(t: any): t is AddressAccount {
  return t.type === 'AddressAccount';
}

function equalsAddressAccount(t: any, address: string): boolean {
  return isAddressAccount(t) && t.address === address;
}

function isContractAddress(t: any): t is ContractAddress {
  return typeof t.index === 'bigint' && typeof t.subindex === 'bigint';
}

function equalsContractAddress(t: any, index: string): boolean {
  return isContractAddress(t) && t.index === BigInt(index);
}

function isAddress(t: any): t is Address {
  return t.type === 'AddressContract' || isAddressAccount(t);
}

function equalsAddress(t: any, addressOrIndex: string): boolean {
  if (!isAddress(t)) return false;

  return (
    equalsAddressAccount(t, addressOrIndex) ||
    equalsContractAddress(t.address, addressOrIndex)
  );
}

function equalsBigInt(a: bigint, b: string): boolean {
  try {
    return a === BigInt(b);
  } catch (e) {
    return false;
  }
}
