// Copyright 2020-2023 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: GPL-3.0

import { Inject, Injectable } from '@nestjs/common';
import {
  isBlockHandlerProcessor,
  isTransactionHandlerProcessor,
  isTransactionEventHandlerProcessor,
  isCustomDs,
  isRuntimeDs,
  SubqlConcordiumCustomDataSource,
  ConcordiumRuntimeHandlerInputMap,
  SubqlConcordiumDataSource,
  isSpecialEventHandlerProcessor,
} from '@subql/common-concordium';
import {
  NodeConfig,
  getLogger,
  profiler,
  IndexerSandbox,
  ProcessBlockResponse,
  BaseIndexerManager,
  ApiService,
} from '@subql/node-core';
import {
  ConcordiumTransaction,
  ConcordiumBlock,
  ConcordiumBlockFilter,
  ConcordiumTransactionFilter,
  ConcordiumSpecialEvent,
  ConcordiumTransactionEvent,
  ConcordiumSpecialEventFilter,
  ConcordiumTransactionEventFilter,
  ConcordiumHandlerKind,
  SubqlDatasource,
} from '@subql/types-concordium';
import { ConcordiumApi, ConcordiumApiService } from '../concordium';
import {
  filterBlocksProcessor,
  filterTransactionsProcessor,
  filterTxEventProcessor,
} from '../concordium/block.concordium';
import SafeConcordiumGRPCClient from '../concordium/safe-api';
import { ConcordiumProjectDs } from '../configure/SubqueryProject';
import {
  asSecondLayerHandlerProcessor_1_0_0,
  DsProcessorService,
} from './ds-processor.service';
import { DynamicDsService } from './dynamic-ds.service';
import { ProjectService } from './project.service';
import { SandboxService } from './sandbox.service';
import { UnfinalizedBlocksService } from './unfinalizedBlocks.service';

const logger = getLogger('indexer');

@Injectable()
export class IndexerManager extends BaseIndexerManager<
  SafeConcordiumGRPCClient,
  ConcordiumApi,
  ConcordiumBlock,
  ApiService,
  SubqlConcordiumDataSource,
  SubqlConcordiumCustomDataSource,
  typeof FilterTypeMap,
  typeof ProcessorTypeMap,
  ConcordiumRuntimeHandlerInputMap
> {
  protected isRuntimeDs = isRuntimeDs;
  protected isCustomDs = isCustomDs;
  protected updateCustomProcessor = asSecondLayerHandlerProcessor_1_0_0;

  constructor(
    apiService: ApiService,
    nodeConfig: NodeConfig,
    sandboxService: SandboxService,
    dsProcessorService: DsProcessorService,
    dynamicDsService: DynamicDsService,
    unfinalizedBlocksService: UnfinalizedBlocksService,
    @Inject('IProjectService') private projectService: ProjectService,
  ) {
    super(
      apiService,
      nodeConfig,
      sandboxService,
      dsProcessorService,
      dynamicDsService,
      unfinalizedBlocksService,
      FilterTypeMap,
      ProcessorTypeMap,
    );
  }

  async start(): Promise<void> {
    await this.projectService.init();
    logger.info('indexer manager started');
  }

  @profiler()
  async indexBlock(
    block: ConcordiumBlock,
    dataSources: SubqlConcordiumDataSource[],
  ): Promise<ProcessBlockResponse> {
    return super.internalIndexBlock(block, dataSources, () =>
      this.getApi(block),
    );
  }

  getBlockHeight(block: ConcordiumBlock): number {
    return Number(block.blockHeight);
  }

  getBlockHash(block: ConcordiumBlock): string {
    return block.blockHash;
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  private async getApi(
    block: ConcordiumBlock,
  ): Promise<SafeConcordiumGRPCClient> {
    return (this.apiService as ConcordiumApiService).getSafeApi(
      Number(block.blockHeight),
      block.blockHash,
    );
  }

  protected async indexBlockData(
    block: ConcordiumBlock,
    dataSources: ConcordiumProjectDs[],
    getVM: (d: ConcordiumProjectDs) => Promise<IndexerSandbox>,
  ): Promise<void> {
    await this.indexBlockContent(block, dataSources, getVM);

    for (const tx of block.transactions) {
      await this.indexTransaction(tx, dataSources, getVM);

      for (const event of block.transactionEvents?.filter(
        (evt) => evt.transaction.hash === tx.hash,
      ) ?? []) {
        await this.indexTransactionEvent(event, dataSources, getVM);
      }
    }

    for (const event of block.specialEvents) {
      await this.indexSpecialEvent(event, dataSources, getVM);
    }
  }

  private async indexBlockContent(
    block: ConcordiumBlock,
    dataSources: ConcordiumProjectDs[],
    getVM: (d: ConcordiumProjectDs) => Promise<IndexerSandbox>,
  ): Promise<void> {
    for (const ds of dataSources) {
      await this.indexData(ConcordiumHandlerKind.Block, block, ds, getVM);
    }
  }

  private async indexTransaction(
    tx: ConcordiumTransaction,
    dataSources: ConcordiumProjectDs[],
    getVM: (d: ConcordiumProjectDs) => Promise<IndexerSandbox>,
  ): Promise<void> {
    for (const ds of dataSources) {
      await this.indexData(ConcordiumHandlerKind.Transaction, tx, ds, getVM);
    }
  }

  private async indexSpecialEvent(
    event: ConcordiumSpecialEvent,
    dataSources: ConcordiumProjectDs[],
    getVM: (d: ConcordiumProjectDs) => Promise<IndexerSandbox>,
  ): Promise<void> {
    for (const ds of dataSources) {
      await this.indexData(
        ConcordiumHandlerKind.SpecialEvent,
        event,
        ds,
        getVM,
      );
    }
  }

  private async indexTransactionEvent(
    event: ConcordiumTransactionEvent,
    dataSources: ConcordiumProjectDs[],
    getVM: (d: ConcordiumProjectDs) => Promise<IndexerSandbox>,
  ): Promise<void> {
    for (const ds of dataSources) {
      await this.indexData(
        ConcordiumHandlerKind.TransactionEvent,
        event,
        ds,
        getVM,
      );
    }
  }

  protected async prepareFilteredData<T = any>(
    kind: ConcordiumHandlerKind,
    data: T,
    ds: SubqlDatasource,
  ): Promise<T> {
    return Promise.resolve(data);
  }
}

type ProcessorTypeMap = {
  [ConcordiumHandlerKind.Block]: typeof isBlockHandlerProcessor;
  [ConcordiumHandlerKind.Transaction]: typeof isTransactionHandlerProcessor;
  [ConcordiumHandlerKind.TransactionEvent]: typeof isTransactionEventHandlerProcessor;
  [ConcordiumHandlerKind.SpecialEvent]: typeof isSpecialEventHandlerProcessor;
};

const ProcessorTypeMap = {
  [ConcordiumHandlerKind.Block]: isBlockHandlerProcessor,
  [ConcordiumHandlerKind.Transaction]: isTransactionHandlerProcessor,
  [ConcordiumHandlerKind.TransactionEvent]: isTransactionEventHandlerProcessor,
  [ConcordiumHandlerKind.SpecialEvent]: isSpecialEventHandlerProcessor,
};

const FilterTypeMap = {
  [ConcordiumHandlerKind.Block]: (
    data: ConcordiumBlock,
    filter: ConcordiumBlockFilter,
    ds: SubqlConcordiumDataSource,
  ) => filterBlocksProcessor(data, filter),
  [ConcordiumHandlerKind.SpecialEvent]: (
    data: ConcordiumSpecialEvent,
    filter: ConcordiumSpecialEventFilter,
    ds: SubqlConcordiumDataSource,
  ) => filterTxEventProcessor(data, filter),
  [ConcordiumHandlerKind.TransactionEvent]: (
    data: ConcordiumTransactionEvent,
    filter: ConcordiumTransactionEventFilter,
    ds: SubqlConcordiumDataSource,
  ) => filterTxEventProcessor(data, filter),
  [ConcordiumHandlerKind.Transaction]: (
    data: ConcordiumTransaction,
    filter: ConcordiumTransactionFilter,
    ds: SubqlConcordiumDataSource,
  ) => filterTransactionsProcessor(data, filter),
};
