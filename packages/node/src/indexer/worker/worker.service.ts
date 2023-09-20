// Copyright 2020-2023 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: GPL-3.0

import { Inject, Injectable } from '@nestjs/common';
import { SubqlConcordiumDataSource } from '@subql/common-concordium';
import {
  NodeConfig,
  IProjectService,
  ProcessBlockResponse,
  BaseWorkerService,
  IProjectUpgradeService,
} from '@subql/node-core';
import { BlockWrapper } from '@subql/types-concordium';
import { ConcordiumApiService } from '../../concordium';
import { ConcordiumProjectDs } from '../../configure/SubqueryProject';
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
  BlockWrapper,
  FetchBlockResponse,
  SubqlConcordiumDataSource,
  {}
> {
  constructor(
    private apiService: ConcordiumApiService,
    private indexerManager: IndexerManager,
    @Inject('IProjectService')
    projectService: IProjectService<ConcordiumProjectDs>,
    @Inject('IProjectUpgradeService')
    projectUpgradeService: IProjectUpgradeService,
    nodeConfig: NodeConfig,
  ) {
    super(projectService, projectUpgradeService, nodeConfig);
  }

  protected async fetchChainBlock(
    heights: number,
    extra: {},
  ): Promise<BlockWrapper> {
    const [block] = await this.apiService.fetchBlocks([heights]);
    return block;
  }

  protected toBlockResponse(block: BlockWrapper): { parentHash: string } {
    return {
      parentHash: block.block.blockParent,
    };
  }

  protected async processFetchedBlock(
    block: BlockWrapper,
    dataSources: SubqlConcordiumDataSource[],
  ): Promise<ProcessBlockResponse> {
    return this.indexerManager.indexBlock(block, dataSources);
  }
}
