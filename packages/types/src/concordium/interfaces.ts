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
import {BlockFilter} from '@subql/types-core';

/**
 * Represents a filter for Concordium blocks
 * @interface
 */
export type ConcordiumBlockFilter = BlockFilter;

/**
 * Represents a filter for Concordium Transactions
 * @interface
 */
export interface ConcordiumTransactionFilter {
  /**
   * The transaction summary type for filtering transactions (optional).
   * @type {TransactionSummaryType}
   * @example
   * type: 'accountTransaction'
   */
  type?: TransactionSummaryType;
  /**
   * Other fields of the transaction to filter by
   * */
  values?: {
    [key: string]: string;
  };
}

export interface ConcordiumTransactionEventFilter {
  /**
   * The transaction event type for filtering events (optional).
   * @type {TransactionEventTag}
   * @example
   * type: 'AccountCreated'
   */
  type?: TransactionEventTag;
  /**
   * Other fields of the event to filter by
   * */
  values?: {
    [key: string]: string;
  };
}

export interface ConcordiumSpecialEventFilter {
  /**
   * The speical event type for filtering special events (optional).
   * @type {string}
   * @example
   * type: 'blockReward'
   */
  type?: string;
  values?: {
    [key: string]: string;
  };
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
  id: number;
  block: ConcordiumBlock;
};

export type ConcordiumTransactionEvent = (TransactionEvent | AccountTransferredEvent) & {
  id: number;
  block: ConcordiumBlock;
  transaction: ConcordiumTransaction;
};
