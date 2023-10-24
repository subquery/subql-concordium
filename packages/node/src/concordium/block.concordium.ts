// Copyright 2020-2023 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: GPL-3.0

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
  address?: string,
): boolean {
  if (filter?.modulo && Number(block.blockHeight) % filter.modulo !== 0) {
    return false;
  }
  return true;
}

export function filterTransactionsProcessor(
  transaction: ConcordiumTransaction,
  filter: ConcordiumTransactionFilter,
  address?: string,
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
  txEvent: ConcordiumTransactionEvent,
  filter: ConcordiumTransactionEventFilter,
  address?: string,
): boolean {
  if (!filter) return true;

  if (filter.type && txEvent.tag !== filter.type) return false;

  if (filter.values) {
    for (const key in filter.values) {
      if (filter.values[key] !== txEvent[key]) return false;
    }
  }

  return true;
}

export function filterSpecialEventProcessor(
  specialEvent: ConcordiumSpecialEvent,
  filter: ConcordiumSpecialEventFilter,
): boolean {
  if (!filter) return true;

  if (filter.type && specialEvent.tag !== filter.type) return false;

  if (filter.values) {
    for (const key in filter.values) {
      if (filter.values[key] !== specialEvent[key]) return false;
    }
  }

  return true;
}
