// Copyright 2020-2023 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: GPL-3.0

import {BlockInfo} from '@concordium/node-sdk';
import {ConcordiumBlock, ConcordiumSpecialEvent, ConcordiumTransactionEvent, ConcordiumTransaction} from './concordium';

export interface ApiWrapper {
  init: () => Promise<void>;
  getGenesisHash: () => string;
  getRuntimeChain: () => string;
  getChainId: () => string;
  getSpecName: () => string;
  getFinalizedBlockHeight: () => Promise<bigint>;
  getBestBlockHeight: () => Promise<bigint>;
  getBlockByHash: (hash: string) => Promise<BlockInfo>;
  fetchBlocks: (bufferBlocks: number[]) => Promise<ConcordiumBlock[]>;
}

export type DynamicDatasourceCreator = (name: string, args: Record<string, unknown>) => Promise<void>;
