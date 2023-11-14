// Copyright 2020-2023 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: GPL-3.0

import {
  TransactionEventTag,
  TransactionSummaryType,
  TransactionKindString,
} from '@concordium/node-sdk';
import {
  ConcordiumBlock,
  ConcordiumSpecialEvent,
  ConcordiumTransaction,
  ConcordiumTransactionEvent,
} from '@subql/types-concordium';
import {
  filterBlocksProcessor,
  filterTransactionsProcessor,
  filterTxEventProcessor,
} from './block.concordium';

describe('ConcordiumBlockWrapped', () => {
  it('should filter blocks', () => {
    const block = {
      blockHeight: '10',
      blockHash: 'hash',
    } as unknown as ConcordiumBlock;
    const filter = { modulo: 2 };

    expect(filterBlocksProcessor(block, filter)).toBe(true);
  });

  it('should filter transactions - without values - for true', () => {
    const transaction = {
      type: 'accountTransaction',
      amount: '100',
    } as unknown as ConcordiumTransaction;
    const filter = { type: TransactionSummaryType.AccountTransaction };

    expect(filterTransactionsProcessor(transaction, filter)).toBe(true);
  });

  it('should filter transactions - without values - for false', () => {
    const transaction = {
      type: 'accountTransaction',
      amount: '100',
    } as unknown as ConcordiumTransaction;
    const filter = { type: TransactionSummaryType.AccountCreation };

    expect(filterTransactionsProcessor(transaction, filter)).toBe(false);
  });

  it('should filter transactions - with values - for true', () => {
    const transaction = {
      type: 'accountTransaction',
      amount: '100',
    } as unknown as ConcordiumTransaction;
    const filter = {
      type: TransactionSummaryType.AccountTransaction,
      values: {
        amount: '100',
      },
    };

    expect(filterTransactionsProcessor(transaction, filter)).toBe(true);
  });

  it('should filter transactions - with values - for false', () => {
    const transaction = {
      type: 'accountTransaction',
      amount: '100',
    } as unknown as ConcordiumTransaction;
    const filter = {
      type: TransactionSummaryType.AccountTransaction,
      values: {
        amount: '10',
      },
    };

    expect(filterTransactionsProcessor(transaction, filter)).toBe(false);
  });

  it('should filter transaction events - without values - for true', () => {
    const txEvent = {
      tag: TransactionEventTag.Transferred,
      amount: '100',
    } as unknown as ConcordiumTransactionEvent;
    const filter = { type: TransactionEventTag.Transferred };

    expect(filterTxEventProcessor(txEvent, filter)).toBe(true);
  });

  it('should filter transaction events - without values - for false', () => {
    const txEvent = {
      tag: TransactionEventTag.Transferred,
      amount: '100',
    } as unknown as ConcordiumTransactionEvent;
    const filter = { type: TransactionEventTag.AccountCreated };

    expect(filterTxEventProcessor(txEvent, filter)).toBe(false);
  });

  it('should filter transaction events - with values - for true', () => {
    const txEvent = {
      tag: TransactionEventTag.Transferred,
      amount: '100',
    } as unknown as ConcordiumTransactionEvent;
    const filter = {
      type: TransactionEventTag.Transferred,
      values: {
        amount: '100',
      },
    };

    expect(filterTxEventProcessor(txEvent, filter)).toBe(true);
  });

  it('should filter transaction events - with values - for false', () => {
    const txEvent = {
      tag: TransactionEventTag.Transferred,
      amount: '100',
    } as unknown as ConcordiumTransactionEvent;
    const filter = {
      type: TransactionEventTag.Transferred,
      values: {
        amount: '10',
      },
    };

    expect(filterTxEventProcessor(txEvent, filter)).toBe(false);
  });

  it('should filter special events - without values - for true', () => {
    const specialEvent = {
      tag: 'event2',
      amount: '100',
    } as unknown as ConcordiumSpecialEvent;
    const filter = { type: 'event2' };

    expect(filterTxEventProcessor(specialEvent, filter)).toBe(true);
  });

  it('should filter special events - without values - for false', () => {
    const specialEvent = {
      tag: 'event2',
      amount: '100',
    } as unknown as ConcordiumSpecialEvent;
    const filter = { type: 'event1' };

    expect(filterTxEventProcessor(specialEvent, filter)).toBe(false);
  });

  it('should filter special events - with values - for true', () => {
    const specialEvent = {
      tag: 'event2',
      amount: '100',
    } as unknown as ConcordiumSpecialEvent;
    const filter = {
      type: 'event2',
      values: {
        amount: '100',
      },
    };

    expect(filterTxEventProcessor(specialEvent, filter)).toBe(true);
  });

  it('should filter special events - with values - for false', () => {
    const specialEvent = {
      tag: 'event2',
      amount: '100',
    } as unknown as ConcordiumSpecialEvent;
    const filter = {
      type: 'event2',
      values: {
        amount: '10',
      },
    };

    expect(filterTxEventProcessor(specialEvent, filter)).toBe(false);
  });

  it('should filter nested values', () => {
    const tx = {
      index: BigInt(0),
      energyCost: BigInt(3739),
      hash: '574289208dfd6dff2065e2549164bcfdd97f91e65cb42941a40e574ceccbf7b9',
      type: TransactionSummaryType.AccountTransaction,
      cost: BigInt(14685685),
      sender: '4AuT5RRmBwcdkLMA6iVjxTDb1FQmxwAh3wHBS22mggWL8xH6s3',
      transactionType: TransactionKindString.Update,
    } as ConcordiumTransaction;

    const match = filterTransactionsProcessor(tx, {
      type: TransactionSummaryType.AccountTransaction,
      values: {
        sender: '4AuT5RRmBwcdkLMA6iVjxTDb1FQmxwAh3wHBS22mggWL8xH6s3',
      },
    });
    expect(match).toBeTruthy();

    const event = {
      tag: 'Updated',
      contractVersion: 1,
      address: { index: BigInt(6536), subindex: BigInt(0) },
      instigator: {
        type: 'AddressAccount',
        address: '4AuT5RRmBwcdkLMA6iVjxTDb1FQmxwAh3wHBS22mggWL8xH6s3',
      },
      amount: BigInt(0),
      message:
        '35000000b0373129de61634f2c72ee0c008a9d37f6d10367875108b622bd9480cff50d9f0c000000544539445156524a5430343d005e94526500000000',
      receiveName: 'Provenance-tag.update_tag_log',
      events: [],
    } as ConcordiumTransactionEvent;

    const matchEvent = filterTxEventProcessor(event, {
      type: TransactionEventTag.Updated,
      values: {
        instigator: '4AuT5RRmBwcdkLMA6iVjxTDb1FQmxwAh3wHBS22mggWL8xH6s3',
        address: '6536',
        amount: '0',
      },
    });
    expect(matchEvent).toBeTruthy();
  });
});
