// Copyright 2020-2023 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: GPL-3.0

import {
  TransactionEventTag,
  TransactionSummaryType,
} from '@concordium/node-sdk';
import {
  ConcordiumBlock,
  ConcordiumSpecialEvent,
  ConcordiumTransaction,
  ConcordiumTransactionEvent,
} from '@subql/types-concordium';
import { ConcordiumBlockWrapped } from './block.concordium';

describe('ConcordiumBlockWrapped', () => {
  let instance: ConcordiumBlockWrapped;

  beforeEach(() => {
    const block = {
      blockHeight: '10',
      blockHash: 'hash',
    } as unknown as ConcordiumBlock;
    const transactions = [
      { type: 'transfer', amount: '100' } as unknown as ConcordiumTransaction,
    ];
    const txEvents = [
      { tag: 'event1', amount: '100' } as unknown as ConcordiumTransactionEvent,
    ];
    const specialEvents = [
      { tag: 'event2', amount: '100' } as unknown as ConcordiumSpecialEvent,
    ];
    instance = new ConcordiumBlockWrapped(
      block,
      transactions,
      txEvents,
      specialEvents,
    );
  });

  it('should get block height as number', () => {
    expect(instance.blockHeight).toBe(10);
  });

  it('should get block hash', () => {
    expect(instance.hash).toBe('hash');
  });

  it('should filter blocks', () => {
    const block = {
      blockHeight: '10',
      blockHash: 'hash',
    } as unknown as ConcordiumBlock;
    const filter = { modulo: 2 };

    expect(ConcordiumBlockWrapped.filterBlocksProcessor(block, filter)).toBe(
      true,
    );
  });

  it('should filter transactions - without values - for true', () => {
    const transaction = {
      type: 'accountTransaction',
      amount: '100',
    } as unknown as ConcordiumTransaction;
    const filter = { type: TransactionSummaryType.AccountTransaction };

    expect(
      ConcordiumBlockWrapped.filterTransactionsProcessor(transaction, filter),
    ).toBe(true);
  });

  it('should filter transactions - without values - for false', () => {
    const transaction = {
      type: 'accountTransaction',
      amount: '100',
    } as unknown as ConcordiumTransaction;
    const filter = { type: TransactionSummaryType.AccountCreation };

    expect(
      ConcordiumBlockWrapped.filterTransactionsProcessor(transaction, filter),
    ).toBe(false);
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

    expect(
      ConcordiumBlockWrapped.filterTransactionsProcessor(transaction, filter),
    ).toBe(true);
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

    expect(
      ConcordiumBlockWrapped.filterTransactionsProcessor(transaction, filter),
    ).toBe(false);
  });

  it('should filter transaction events - without values - for true', () => {
    const txEvent = {
      tag: TransactionEventTag.Transferred,
      amount: '100',
    } as unknown as ConcordiumTransactionEvent;
    const filter = { type: TransactionEventTag.Transferred };

    expect(ConcordiumBlockWrapped.filterTxEventProcessor(txEvent, filter)).toBe(
      true,
    );
  });

  it('should filter transaction events - without values - for false', () => {
    const txEvent = {
      tag: TransactionEventTag.Transferred,
      amount: '100',
    } as unknown as ConcordiumTransactionEvent;
    const filter = { type: TransactionEventTag.AccountCreated };

    expect(ConcordiumBlockWrapped.filterTxEventProcessor(txEvent, filter)).toBe(
      false,
    );
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

    expect(ConcordiumBlockWrapped.filterTxEventProcessor(txEvent, filter)).toBe(
      true,
    );
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

    expect(ConcordiumBlockWrapped.filterTxEventProcessor(txEvent, filter)).toBe(
      false,
    );
  });

  it('should filter special events - without values - for true', () => {
    const specialEvent = {
      tag: 'event2',
      amount: '100',
    } as unknown as ConcordiumSpecialEvent;
    const filter = { type: 'event2' };

    expect(
      ConcordiumBlockWrapped.filterSpecialEventProcessor(specialEvent, filter),
    ).toBe(true);
  });

  it('should filter special events - without values - for false', () => {
    const specialEvent = {
      tag: 'event2',
      amount: '100',
    } as unknown as ConcordiumSpecialEvent;
    const filter = { type: 'event1' };

    expect(
      ConcordiumBlockWrapped.filterSpecialEventProcessor(specialEvent, filter),
    ).toBe(false);
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

    expect(
      ConcordiumBlockWrapped.filterSpecialEventProcessor(specialEvent, filter),
    ).toBe(true);
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

    expect(
      ConcordiumBlockWrapped.filterSpecialEventProcessor(specialEvent, filter),
    ).toBe(false);
  });
});
