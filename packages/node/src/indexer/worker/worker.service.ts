// Copyright 2020-2024 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: GPL-3.0

import { Inject, Injectable } from '@nestjs/common';
import {
  NodeConfig,
  IProjectService,
  ProcessBlockResponse,
  BaseWorkerService,
  IProjectUpgradeService,
  ApiService,
  IBlock,
} from '@subql/node-core';
import { ConcordiumBlock, ConcordiumDatasource } from '@subql/types-concordium';
import { IndexerManager } from '../indexer.manager';

export type FetchBlockResponse = { parentHash: string } | undefined;

export type WorkerStatusResponse = {
  threadId: number;
  isIndexing: boolean;
  fetchedBlocks: number;
  toFetchBlocks: number;
};

@Injectable()
export class WorkerService extends BaseWorkerService<
  ConcordiumBlock,
  FetchBlockResponse,
  ConcordiumDatasource,
  {}
> {
  constructor(
    private apiService: ApiService,
    private indexerManager: IndexerManager,
    @Inject('IProjectService')
    projectService: IProjectService<ConcordiumDatasource>,
    @Inject('IProjectUpgradeService')
    projectUpgradeService: IProjectUpgradeService,
    nodeConfig: NodeConfig,
  ) {
    super(projectService, projectUpgradeService, nodeConfig);
  }

  protected async fetchChainBlock(
    heights: number,
    extra: {},
  ): Promise<IBlock<ConcordiumBlock>> {
    const [block] = await this.apiService.fetchBlocks([heights]);
    return block;
  }

  protected toBlockResponse(block: ConcordiumBlock): { parentHash: string } {
    return {
      parentHash: block.blockParent,
    };
  }

  protected async processFetchedBlock(
    block: IBlock<ConcordiumBlock>,
    dataSources: ConcordiumDatasource[],
  ): Promise<ProcessBlockResponse> {
    return this.indexerManager.indexBlock(block, dataSources);
  }
}
