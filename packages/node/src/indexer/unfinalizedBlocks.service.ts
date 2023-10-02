// Copyright 2020-2023 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: GPL-3.0

import { BlockInfo } from '@concordium/node-sdk';
import { Injectable } from '@nestjs/common';
import {
  ApiService,
  BaseUnfinalizedBlocksService,
  Header,
  NodeConfig,
  StoreCacheService,
} from '@subql/node-core';
import { ConcordiumBlock } from '@subql/types-concordium';

export function blockToHeader(block: ConcordiumBlock | BlockInfo): Header {
  return {
    blockHeight: Number(block.blockHeight),
    blockHash: block.blockHash,
    parentHash: block.blockParent,
  };
}

@Injectable()
export class UnfinalizedBlocksService extends BaseUnfinalizedBlocksService<ConcordiumBlock> {
  constructor(
    private readonly apiService: ApiService,
    nodeConfig: NodeConfig,
    storeCache: StoreCacheService,
  ) {
    super(nodeConfig, storeCache);
  }

  protected blockToHeader(block: ConcordiumBlock): Header {
    return blockToHeader(block);
  }

  protected async getFinalizedHead(): Promise<Header> {
    const finalizedBlock = await this.apiService.api.getFinalizedBlock();
    return blockToHeader(finalizedBlock);
  }

  protected async getHeaderForHash(hash: string): Promise<Header> {
    const block = await this.apiService.api.getBlockByHeightOrHash(hash);
    return blockToHeader(block);
  }

  protected async getHeaderForHeight(height: number): Promise<Header> {
    const block = await this.apiService.api.getBlockByHeightOrHash(height);
    return blockToHeader(block);
  }
}
