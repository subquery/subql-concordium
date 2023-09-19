// Copyright 2020-2023 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: GPL-3.0

import { isMainThread } from 'worker_threads';
import { Module } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  ApiService,
  StoreService,
  PoiService,
  ConnectionPoolService,
  StoreCacheService,
  WorkerDynamicDsService,
  WorkerConnectionPoolStateManager,
  ConnectionPoolStateManager,
  NodeConfig,
} from '@subql/node-core';
import { ConcordiumApiService } from '../concordium';
import { ConcordiumApiConnection } from '../concordium/api.connection';
import { SubqueryProject } from '../configure/SubqueryProject';
import { DsProcessorService } from './ds-processor.service';
import { DynamicDsService } from './dynamic-ds.service';
import { IndexerManager } from './indexer.manager';
import { ProjectService } from './project.service';
import { SandboxService } from './sandbox.service';
import { UnfinalizedBlocksService } from './unfinalizedBlocks.service';
import { WorkerService } from './worker/worker.service';
import { WorkerUnfinalizedBlocksService } from './worker/worker.unfinalizedBlocks.service';

@Module({
  providers: [
    IndexerManager,
    StoreCacheService,
    StoreService,
    {
      provide: ConnectionPoolStateManager,
      useFactory: () => {
        if (isMainThread) {
          throw new Error('Expected to be worker thread');
        }
        return new WorkerConnectionPoolStateManager((global as any).host);
      },
    },
    ConnectionPoolService,
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
    SandboxService,
    DsProcessorService,
    {
      provide: DynamicDsService,
      useFactory: () => {
        if (isMainThread) {
          throw new Error('Expected to be worker thread');
        }
        return new WorkerDynamicDsService((global as any).host);
      },
    },
    PoiService,
    {
      provide: 'IProjectService',
      useClass: ProjectService,
    },
    WorkerService,
    {
      provide: UnfinalizedBlocksService,
      useFactory: () => {
        if (isMainThread) {
          throw new Error('Expected to be worker thread');
        }
        return new WorkerUnfinalizedBlocksService((global as any).host);
      },
    },
  ],
  exports: [StoreService],
})
export class IndexerModule {}
