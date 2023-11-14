// Copyright 2020-2023 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: GPL-3.0

import {
  TimeoutError,
  DisconnectionError,
  RateLimitError,
  ApiConnectionError,
  ApiErrorType,
} from '@subql/node-core';
import { EventEmitter2 } from 'eventemitter2';
import { ConcordiumApi } from './api.concordium';
import { ConcordiumApiConnection } from './api.connection';

const endpoint = 'http://node.testnet.concordium.com:20000';

describe('ConcordiumApiConnection', () => {
  let api: ConcordiumApi;
  let eventEmitter: EventEmitter2;
  let fetchBlocksBatches: jest.Mock;
  let connection: ConcordiumApiConnection;

  beforeEach(async () => {
    eventEmitter = new EventEmitter2();
    api = new ConcordiumApi(endpoint, eventEmitter);
    await api.init();
    fetchBlocksBatches = jest.fn();
    connection = await ConcordiumApiConnection.create(
      api,
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
      ConcordiumApiConnection.handleError(new Error(`timeout`)),
    ).toBeInstanceOf(TimeoutError);
    expect(
      ConcordiumApiConnection.handleError(new Error(`disconnected from `)),
    ).toBeInstanceOf(DisconnectionError);
    expect(
      ConcordiumApiConnection.handleError(new Error(`Ratelimit`)),
    ).toBeInstanceOf(RateLimitError);
    expect(
      ConcordiumApiConnection.handleError(new Error('Random error')),
    ).toEqual(
      new ApiConnectionError('Error', 'Random error', ApiErrorType.Default),
    );
  });
});
