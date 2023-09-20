// Copyright 2020-2023 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: GPL-3.0

import { getLogger } from '@subql/node-core';
import {
  ConcordiumBlock,
  ConcordiumTransactionFilter,
  ConcordiumTransactionEventFilter,
  ConcordiumBlockFilter,
  ConcordiumBlockWrapper,
  ConcordiumTransaction,
  ConcordiumTransactionEvent,
  ConcordiumSpecialEvent,
  ConcordiumSpecialEventFilter,
} from '@subql/types-concordium';

const logger = getLogger('block');

export class ConcordiumBlockWrapped implements ConcordiumBlockWrapper {
  constructor(
    private _block: ConcordiumBlock,
    private _txs: ConcordiumTransaction[],
    private _txEvents: ConcordiumTransactionEvent[],
    private _specialEvents: ConcordiumSpecialEvent[],
  ) {}

  get block(): ConcordiumBlock {
    return this._block;
  }

  get blockHeight(): number {
    return Number(this.block.blockHeight);
  }

  get hash(): string {
    return this.block.blockHash;
  }

  get transactions(): ConcordiumTransaction[] {
    return this._txs;
  }

  get transactionEvents(): ConcordiumTransactionEvent[] {
    return this._txEvents;
  }

  get specialEvents(): ConcordiumSpecialEvent[] {
    return this._specialEvents;
  }

  static filterBlocksProcessor(
    block: ConcordiumBlock,
    filter: ConcordiumBlockFilter,
    address?: string,
  ): boolean {
    if (filter?.modulo && Number(block.blockHeight) % filter.modulo !== 0) {
      return false;
    }
    return true;
  }

  static filterTransactionsProcessor(
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

  static filterTxEventProcessor(
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

  static filterSpecialEventProcessor(
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
}
