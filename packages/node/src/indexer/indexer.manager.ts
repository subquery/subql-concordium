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
  ConcordiumBlockWrapper,
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
import { ConcordiumBlockWrapped } from '../concordium/block.concordium';
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
  ConcordiumBlockWrapper,
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
    block: ConcordiumBlockWrapper,
    dataSources: SubqlConcordiumDataSource[],
  ): Promise<ProcessBlockResponse> {
    return super.internalIndexBlock(block, dataSources, () =>
      this.getApi(block),
    );
  }

  getBlockHeight(block: ConcordiumBlockWrapper): number {
    return block.blockHeight;
  }

  getBlockHash(block: ConcordiumBlockWrapper): string {
    return block.hash;
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  private async getApi(
    block: ConcordiumBlockWrapper,
  ): Promise<SafeConcordiumGRPCClient> {
    return null;
  }

  protected async indexBlockData(
    {
      block,
      specialEvents,
      transactionEvents,
      transactions,
    }: ConcordiumBlockWrapper,
    dataSources: ConcordiumProjectDs[],
    getVM: (d: ConcordiumProjectDs) => Promise<IndexerSandbox>,
  ): Promise<void> {
    await this.indexBlockContent(block, dataSources, getVM);

    for (const event of specialEvents) {
      await this.indexSpecialEvent(event, dataSources, getVM);
    }

    for (const tx of transactions) {
      await this.indexTransaction(tx, dataSources, getVM);

      for (const event of transactionEvents?.filter(
        (evt) => evt.transaction.hash === tx.hash,
      ) ?? []) {
        await this.indexTransactionEvent(event, dataSources, getVM);
      }
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
  ) =>
    ConcordiumBlockWrapped.filterBlocksProcessor(
      data,
      filter,
      ds.options?.address,
    ),
  [ConcordiumHandlerKind.SpecialEvent]: (
    data: ConcordiumSpecialEvent,
    filter: ConcordiumSpecialEventFilter,
    ds: SubqlConcordiumDataSource,
  ) => ConcordiumBlockWrapped.filterSpecialEventProcessor(data, filter),
  [ConcordiumHandlerKind.TransactionEvent]: (
    data: ConcordiumTransactionEvent,
    filter: ConcordiumTransactionEventFilter,
    ds: SubqlConcordiumDataSource,
  ) =>
    ConcordiumBlockWrapped.filterTxEventProcessor(
      data,
      filter,
      ds.options?.address,
    ),
  [ConcordiumHandlerKind.Transaction]: (
    data: ConcordiumTransaction,
    filter: ConcordiumTransactionFilter,
    ds: SubqlConcordiumDataSource,
  ) =>
    ConcordiumBlockWrapped.filterTransactionsProcessor(
      data,
      filter,
      ds.options?.address,
    ),
};
