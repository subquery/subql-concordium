// Copyright 2020-2023 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: GPL-3.0

import { Injectable } from '@nestjs/common';
import {
  ApiService,
  BaseUnfinalizedBlocksService,
  Header,
  NodeConfig,
  StoreCacheService,
  mainThreadOnly,
} from '@subql/node-core';
import { ConcordiumBlock } from '@subql/types-concordium';
import { blockToHeader } from '../concordium';

@Injectable()
export class UnfinalizedBlocksService extends BaseUnfinalizedBlocksService<ConcordiumBlock> {
  constructor(
    private readonly apiService: ApiService,
    nodeConfig: NodeConfig,
    storeCache: StoreCacheService,
  ) {
    super(nodeConfig, storeCache);
  }

  @mainThreadOnly()
  protected async getFinalizedHead(): Promise<Header> {
    const finalizedBlock = await this.apiService.api.getFinalizedBlock();
    return blockToHeader(finalizedBlock);
  }

  @mainThreadOnly()
  protected async getHeaderForHash(hash: string): Promise<Header> {
    const block = await this.apiService.api.getBlockByHeightOrHash(hash);
    return blockToHeader(block);
  }

  @mainThreadOnly()
  protected async getHeaderForHeight(height: number): Promise<Header> {
    const block = await this.apiService.api.getBlockByHeightOrHash(height);
    return blockToHeader(block);
  }
}
