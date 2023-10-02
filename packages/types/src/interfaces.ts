// Copyright 2020-2023 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: GPL-3.0

import {BlockInfo} from '@concordium/node-sdk';
import {
  ConcordiumBlock,
  ConcordiumBlockWrapper,
  ConcordiumSpecialEvent,
  ConcordiumTransactionEvent,
  ConcordiumTransaction,
} from './concordium';

export interface Entity {
  id: string;
  _name?: string;
  save?: () => Promise<void>;
}

export type FunctionPropertyNames<T> = {
  [K in keyof T]: T[K] extends Function ? K : never;
}[keyof T];

export interface Store {
  get(entity: string, id: string): Promise<Entity | undefined>;
  getByField(entity: string, field: string, value: any, options?: {offset?: number; limit?: number}): Promise<Entity[]>;
  getOneByField(entity: string, field: string, value: any): Promise<Entity | undefined>;
  set(entity: string, id: string, data: Entity): Promise<void>;
  bulkCreate(entity: string, data: Entity[]): Promise<void>;
  //if fields in provided, only specify fields will be updated
  bulkUpdate(entity: string, data: Entity[], fields?: string[]): Promise<void>;
  remove(entity: string, id: string): Promise<void>;
  bulkRemove(entity: string, ids: string[]): Promise<void>;
}

export interface BlockWrapper<
  B extends ConcordiumBlock = ConcordiumBlock,
  T extends ConcordiumTransaction = ConcordiumTransaction,
  TE extends ConcordiumTransactionEvent = ConcordiumTransactionEvent,
  SE extends ConcordiumSpecialEvent = ConcordiumSpecialEvent
> {
  block: B;
  blockHeight: number;
  hash: string;
  transactions?: T[];
  transactionEvents?: TE[];
  specialEvents?: SE[];
}

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
