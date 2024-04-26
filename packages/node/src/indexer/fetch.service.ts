// Copyright 2020-2024 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: GPL-3.0

import { Inject, Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { SchedulerRegistry } from '@nestjs/schedule';

import { isCustomDs } from '@subql/common-concordium';
import {
  NodeConfig,
  BaseFetchService,
  ApiService,
  getLogger,
  getModulos,
} from '@subql/node-core';
import {
  ConcordiumBlock,
  ConcordiumDatasource,
  ConcordiumHandlerKind,
} from '@subql/types-concordium';
import { blockToHeader, ConcordiumApi } from '../concordium';
import { calcInterval } from '../concordium/utils.concordium';
import { SubqueryProject } from '../configure/SubqueryProject';
import { IConcordiumBlockDispatcher } from './blockDispatcher';
import { DictionaryService } from './dictionary/dictionary.service';
import { ProjectService } from './project.service';
import { UnfinalizedBlocksService } from './unfinalizedBlocks.service';

const logger = getLogger('fetch.service');

const BLOCK_TIME_VARIANCE = 5000;

const INTERVAL_PERCENT = 0.9;

@Injectable()
export class FetchService extends BaseFetchService<
  ConcordiumDatasource,
  IConcordiumBlockDispatcher,
  ConcordiumBlock
> {
  constructor(
    private apiService: ApiService,
    nodeConfig: NodeConfig,
    @Inject('IProjectService') projectService: ProjectService,
    @Inject('ISubqueryProject') project: SubqueryProject,
    @Inject('IBlockDispatcher')
    blockDispatcher: IConcordiumBlockDispatcher,
    dictionaryService: DictionaryService,
    private unfinalizedBlocksService: UnfinalizedBlocksService,
    eventEmitter: EventEmitter2,
    schedulerRegistry: SchedulerRegistry,
  ) {
    super(
      nodeConfig,
      projectService,
      project.network,
      blockDispatcher,
      dictionaryService,
      eventEmitter,
      schedulerRegistry,
    );
  }

  get api(): ConcordiumApi {
    return this.apiService.unsafeApi;
  }

  protected async getFinalizedHeight(): Promise<number> {
    const block = await this.api.getFinalizedBlock();

    const header = blockToHeader(block);

    this.unfinalizedBlocksService.registerFinalizedBlock(header);
    return header.blockHeight;
  }

  protected async getBestHeight(): Promise<number> {
    return Number(await this.api.getBestBlockHeight());
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  protected async getChainInterval(): Promise<number> {
    const CHAIN_INTERVAL = calcInterval(this.api) * INTERVAL_PERCENT;

    return Math.min(BLOCK_TIME_VARIANCE, CHAIN_INTERVAL);
  }

  protected getModulos(dataSources: ConcordiumDatasource[]): number[] {
    return getModulos(dataSources, isCustomDs, ConcordiumHandlerKind.Block);
  }

  protected async initBlockDispatcher(): Promise<void> {
    await this.blockDispatcher.init(this.resetForNewDs.bind(this));
  }

  protected async preLoopHook(): Promise<void> {
    // Concordium doesn't need to do anything here
    return Promise.resolve();
  }
}
