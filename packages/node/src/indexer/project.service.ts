// Copyright 2020-2024 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: GPL-3.0

import { isMainThread } from 'node:worker_threads';
import { BlockInfo } from '@concordium/node-sdk';
import { Inject, Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  PoiService,
  BaseProjectService,
  StoreService,
  NodeConfig,
  ApiService,
  IProjectUpgradeService,
  ISubqueryProject,
  mainThreadOnly,
  PoiSyncService,
  profiler,
} from '@subql/node-core';
import { ConcordiumBlock, ConcordiumDatasource } from '@subql/types-concordium';
import {
  IProjectNetworkConfig,
  BaseTemplateDataSource,
} from '@subql/types-core';
import { Sequelize } from '@subql/x-sequelize';
import { ConcordiumApi } from '../concordium';
import SafeConcordiumGRPCClient from '../concordium/safe-api';
import { SubqueryProject } from '../configure/SubqueryProject';
import { DsProcessorService } from './ds-processor.service';
import { DynamicDsService } from './dynamic-ds.service';
import { UnfinalizedBlocksService } from './unfinalizedBlocks.service';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { version: packageVersion } = require('../../package.json');

@Injectable()
export class ProjectService extends BaseProjectService<
  ApiService<ConcordiumApi, SafeConcordiumGRPCClient, ConcordiumBlock[]>,
  ConcordiumDatasource
> {
  protected packageVersion = packageVersion;

  constructor(
    dsProcessorService: DsProcessorService,
    apiService: ApiService,
    @Inject(isMainThread ? PoiService : 'Null') poiService: PoiService,
    @Inject(isMainThread ? PoiSyncService : 'Null')
    poiSyncService: PoiSyncService,
    @Inject(isMainThread ? Sequelize : 'Null') sequelize: Sequelize,
    @Inject('ISubqueryProject') project: SubqueryProject,
    @Inject('IProjectUpgradeService')
    projectUpgradeService: IProjectUpgradeService<SubqueryProject>,
    @Inject(isMainThread ? StoreService : 'Null') storeService: StoreService,
    nodeConfig: NodeConfig,
    dynamicDsService: DynamicDsService,
    eventEmitter: EventEmitter2,
    unfinalizedBlockService: UnfinalizedBlocksService,
  ) {
    super(
      dsProcessorService,
      apiService,
      poiService,
      poiSyncService,
      sequelize,
      project,
      projectUpgradeService,
      storeService,
      nodeConfig,
      dynamicDsService,
      eventEmitter,
      unfinalizedBlockService,
    );
  }

  @profiler()
  async init(startHeight?: number): Promise<void> {
    return super.init(startHeight);
  }

  protected async getBlockTimestamp(height: number): Promise<Date> {
    const blockHash = (
      await this.apiService.unsafeApi.api.getBlocksAtHeight(BigInt(height))
    )[0]; //there is only one finalized block per height
    const blockInfo: BlockInfo = await this.apiService.unsafeApi.getBlockByHash(
      blockHash,
    );

    return blockInfo.blockReceiveTime;
  }

  @mainThreadOnly()
  protected onProjectChange(
    project: ISubqueryProject<
      IProjectNetworkConfig,
      ConcordiumDatasource,
      BaseTemplateDataSource<ConcordiumDatasource>,
      unknown
    >,
  ): void | Promise<void> {
    // TODO update this when implementing skipBlock feature for Eth
    // this.apiService.updateBlockFetching();
  }
}
