// Copyright 2020-2023 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: GPL-3.0

import { Module } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  PoiBenchmarkService,
  IndexingBenchmarkService,
  StoreService,
  PoiService,
  ApiService,
  NodeConfig,
  ConnectionPoolService,
  ConnectionPoolStateManager,
  SmartBatchService,
  StoreCacheService,
  IProjectUpgradeService,
  PoiSyncService,
  InMemoryCacheService,
} from '@subql/node-core';
import { ConcordiumApiConnection } from '../concordium/api.connection';
import { ConcordiumApiService } from '../concordium/api.service.concordium';
import { SubqueryProject } from '../configure/SubqueryProject';
import {
  BlockDispatcherService,
  WorkerBlockDispatcherService,
} from './blockDispatcher';
import { DictionaryService } from './dictionary/dictionary.service';
import { DsProcessorService } from './ds-processor.service';
import { DynamicDsService } from './dynamic-ds.service';
import { FetchService } from './fetch.service';
import { IndexerManager } from './indexer.manager';
import { ProjectService } from './project.service';
import { SandboxService } from './sandbox.service';
import { UnfinalizedBlocksService } from './unfinalizedBlocks.service';

@Module({
  providers: [
    InMemoryCacheService,
    StoreService,
    StoreCacheService,
    {
      provide: ApiService,
      useFactory: async (
        project: SubqueryProject,
        connectionPoolService: ConnectionPoolService<ConcordiumApiConnection>,
        eventEmitter: EventEmitter2,
        nodeConfig: NodeConfig,
      ) => {
        const apiService = new ConcordiumApiService(
          project,
          connectionPoolService,
          eventEmitter,
          nodeConfig,
        );
        await apiService.init();
        return apiService;
      },
      inject: [
        'ISubqueryProject',
        ConnectionPoolService,
        EventEmitter2,
        NodeConfig,
      ],
    },
    IndexerManager,
    ConnectionPoolStateManager,
    ConnectionPoolService,
    PoiSyncService,
    {
      provide: SmartBatchService,
      useFactory: (nodeConfig: NodeConfig) => {
        return new SmartBatchService(nodeConfig.batchSize);
      },
      inject: [NodeConfig],
    },
    {
      provide: 'IBlockDispatcher',
      useFactory: (
        nodeConfig: NodeConfig,
        eventEmitter: EventEmitter2,
        projectService: ProjectService,
        projectUpgradeService: IProjectUpgradeService,
        apiService: ConcordiumApiService,
        indexerManager: IndexerManager,
        smartBatchService: SmartBatchService,
        cacheService: InMemoryCacheService,
        storeService: StoreService,
        storeCacheService: StoreCacheService,
        poiSyncService: PoiSyncService,
        project: SubqueryProject,
        dynamicDsService: DynamicDsService,
        unfinalizedBlocks: UnfinalizedBlocksService,
        connectionPoolState: ConnectionPoolStateManager<ConcordiumApiConnection>,
      ) =>
        nodeConfig.workers
          ? new WorkerBlockDispatcherService(
              nodeConfig,
              eventEmitter,
              projectService,
              projectUpgradeService,
              smartBatchService,
              cacheService,
              storeService,
              storeCacheService,
              poiSyncService,
              project,
              dynamicDsService,
              unfinalizedBlocks,
              connectionPoolState,
            )
          : new BlockDispatcherService(
              apiService,
              nodeConfig,
              indexerManager,
              eventEmitter,
              projectService,
              projectUpgradeService,
              smartBatchService,
              storeService,
              storeCacheService,
              poiSyncService,
              project,
              dynamicDsService,
            ),
      inject: [
        NodeConfig,
        EventEmitter2,
        'IProjectService',
        'IProjectUpgradeService',
        ApiService,
        IndexerManager,
        SmartBatchService,
        InMemoryCacheService,
        StoreService,
        StoreCacheService,
        PoiSyncService,
        'ISubqueryProject',
        DynamicDsService,
        UnfinalizedBlocksService,
        ConnectionPoolStateManager,
      ],
    },
    FetchService,
    ConnectionPoolService,
    IndexingBenchmarkService,
    PoiBenchmarkService,
    DictionaryService,
    SandboxService,
    DsProcessorService,
    DynamicDsService,
    PoiService,
    {
      useClass: ProjectService,
      provide: 'IProjectService',
    },
    UnfinalizedBlocksService,
  ],
  exports: [StoreService, StoreCacheService],
})
export class FetchModule {}
