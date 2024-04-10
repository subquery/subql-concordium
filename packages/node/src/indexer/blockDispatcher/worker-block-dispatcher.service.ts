// Copyright 2020-2024 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: GPL-3.0

import path from 'path';
import { Inject, Injectable, OnApplicationShutdown } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  NodeConfig,
  SmartBatchService,
  StoreService,
  StoreCacheService,
  IProjectService,
  WorkerBlockDispatcher,
  ConnectionPoolStateManager,
  IProjectUpgradeService,
  PoiSyncService,
  InMemoryCacheService,
  createIndexerWorker,
} from '@subql/node-core';
import { ConcordiumBlock, ConcordiumDatasource } from '@subql/types-concordium';
import { ConcordiumApiConnection } from '../../concordium/api.connection';

import { SubqueryProject } from '../../configure/SubqueryProject';
import { DynamicDsService } from '../dynamic-ds.service';
import { UnfinalizedBlocksService } from '../unfinalizedBlocks.service';
import { IIndexerWorker } from '../worker/worker';

type IndexerWorker = IIndexerWorker & {
  terminate: () => Promise<number>;
};

@Injectable()
export class WorkerBlockDispatcherService
  extends WorkerBlockDispatcher<
    ConcordiumDatasource,
    IndexerWorker,
    ConcordiumBlock
  >
  implements OnApplicationShutdown
{
  constructor(
    nodeConfig: NodeConfig,
    eventEmitter: EventEmitter2,
    @Inject('IProjectService')
    projectService: IProjectService<ConcordiumDatasource>,
    @Inject('IProjectUpgradeService')
    projectUpgadeService: IProjectUpgradeService,
    smartBatchService: SmartBatchService,
    cacheService: InMemoryCacheService,
    storeService: StoreService,
    storeCacheService: StoreCacheService,
    poiSyncService: PoiSyncService,
    @Inject('ISubqueryProject') project: SubqueryProject,
    dynamicDsService: DynamicDsService,
    unfinalizedBlocksSevice: UnfinalizedBlocksService,
    connectionPoolState: ConnectionPoolStateManager<ConcordiumApiConnection>,
  ) {
    super(
      nodeConfig,
      eventEmitter,
      projectService,
      projectUpgadeService,
      smartBatchService,
      storeService,
      storeCacheService,
      poiSyncService,
      project,
      dynamicDsService,
      () =>
        createIndexerWorker<
          IIndexerWorker,
          ConcordiumApiConnection,
          ConcordiumBlock,
          ConcordiumDatasource
        >(
          path.resolve(__dirname, '../../../dist/indexer/worker/worker.js'),
          [],
          storeService.getStore(),
          cacheService.getCache(),
          dynamicDsService,
          unfinalizedBlocksSevice,
          connectionPoolState,
          project.root,
          projectService.startHeight,
        ),
    );
  }

  protected async fetchBlock(
    worker: IndexerWorker,
    height: number,
  ): Promise<void> {
    const start = new Date();
    await worker.fetchBlock(height, null);
    const end = new Date();

    // const waitTime = end.getTime() - start.getTime();
    // if (waitTime > 1000) {
    //   logger.info(
    //     `Waiting to fetch block ${height}: ${chalk.red(`${waitTime}ms`)}`,
    //   );
    // } else if (waitTime > 200) {
    //   logger.info(
    //     `Waiting to fetch block ${height}: ${chalk.yellow(`${waitTime}ms`)}`,
    //   );
    // }
  }
}
