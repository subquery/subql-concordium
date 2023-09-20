// Copyright 2020-2023 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: GPL-3.0

import {
  TimeoutError,
  DisconnectionError,
  RateLimitError,
  LargeResponseError,
  ApiConnectionError,
  ApiErrorType,
} from '@subql/node-core';
import { EventEmitter2 } from 'eventemitter2';
import { ConcordiumApi } from './api.concordium';
import { ConcordiumApiConnection } from './api.connection';

describe('ConcordiumApiConnection', () => {
  let api: ConcordiumApi;
  let eventEmitter: EventEmitter2;
  let fetchBlocksBatches: jest.Mock;
  let connection: ConcordiumApiConnection;

  beforeEach(async () => {
    eventEmitter = new EventEmitter2();
    api = new ConcordiumApi('node.testnet.concordium.com:20000', eventEmitter);
    await api.init();
    fetchBlocksBatches = jest.fn();
    connection = await ConcordiumApiConnection.create(
      'node.testnet.concordium.com:20000',
      fetchBlocksBatches,
      eventEmitter,
    );
  });

  it('should create connection properly', () => {
    expect(connection).toBeInstanceOf(ConcordiumApiConnection);
    expect(connection.networkMeta).toEqual({
      chain: api.getChainId().toString(),
      specName: api.getSpecName(),
      genesisHash: api.getGenesisHash(),
    });
  });

  it('should handle errors properly', () => {
    expect(
      ConcordiumApiConnection.handleError(
        new Error(`No response received from RPC endpoint in`),
      ),
    ).toBeInstanceOf(TimeoutError);
    expect(
      ConcordiumApiConnection.handleError(new Error(`disconnected from `)),
    ).toBeInstanceOf(DisconnectionError);
    expect(
      ConcordiumApiConnection.handleError(
        new Error(`Rate Limited at endpoint`),
      ),
    ).toBeInstanceOf(RateLimitError);
    expect(
      ConcordiumApiConnection.handleError(new Error(`Exceeded max limit of`)),
    ).toBeInstanceOf(LargeResponseError);
    expect(
      ConcordiumApiConnection.handleError(new Error('Random error')),
    ).toEqual(
      new ApiConnectionError('Error', 'Random error', ApiErrorType.Default),
    );
  });
});
