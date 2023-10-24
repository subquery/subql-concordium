// Copyright 2020-2023 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: GPL-3.0

import { EventEmitter2 } from 'eventemitter2';
import { ConcordiumApi } from './api.concordium';

describe('ConcordiumApi', () => {
  let api: ConcordiumApi;
  let eventEmitter: EventEmitter2;

  beforeEach(() => {
    eventEmitter = new EventEmitter2();
    api = new ConcordiumApi('node.testnet.concordium.com:20000', eventEmitter);
  });

  it('should initialize properly', async () => {
    await expect(api.init()).resolves.not.toThrow();
    expect(api.getChainId()).toBeDefined();
    expect(api.getGenesisHash()).toBeDefined();
  });

  it('should get blocks at a specific height', async () => {
    const block = await api.fetchBlock(0);

    expect(block.blockHeight).toEqual(BigInt(0));
  });

  it('should get finalized block height', async () => {
    await api.init();
    expect(await api.getFinalizedBlockHeight()).toBeGreaterThan(4816306);
  });

  it('should get best block height', async () => {
    await api.init();
    expect(await api.getBestBlockHeight()).toBeGreaterThan(4816306);
  });
});
