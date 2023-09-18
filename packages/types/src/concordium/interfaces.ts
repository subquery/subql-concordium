// Copyright 2020-2023 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: GPL-3.0

import {
  AccountTransferredEvent,
  BlockFinalizationSummary,
  BlockInfo,
  BlockItemSummary,
  BlockSpecialEvent,
  TransactionEvent,
  TransactionSummaryType,
  TransactionEventTag,
} from '@concordium/node-sdk';
import {BlockWrapper} from '../interfaces';

export interface ConcordiumBlockFilter {
  modulo?: number;
  timestamp?: string;
}

export interface ConcordiumTransactionFilter {
  type?: TransactionSummaryType;
  values?: {
    [key: string]: string;
  };
}

export interface ConcordiumTransactionEventFilter {
  type?: TransactionEventTag;
  values?: {
    [key: string]: string;
  };
}

export interface ConcordiumSpecialEventFilter {
  type?: string;
}

export type ConcordiumBlock = BlockInfo & {
  finalizationSummary: BlockFinalizationSummary;
  transactions: ConcordiumTransaction[];
  specialEvents: ConcordiumSpecialEvent[];
  transactionEvents: ConcordiumTransactionEvent[];
};

export type ConcordiumTransaction = BlockItemSummary & {
  block: ConcordiumBlock;
  // tx events are already stored in BlockItemSummary under different names
  // transactionEvents: TransactionEvent[];
};

export type ConcordiumSpecialEvent = BlockSpecialEvent & {
  block: ConcordiumBlock;
};

export type ConcordiumTransactionEvent = (TransactionEvent | AccountTransferredEvent) & {
  block: ConcordiumBlock;
  transaction: ConcordiumTransaction;
};

export type ConcordiumBlockWrapper = BlockWrapper<
  ConcordiumBlock,
  ConcordiumTransaction,
  ConcordiumTransactionEvent,
  ConcordiumSpecialEvent
>;
