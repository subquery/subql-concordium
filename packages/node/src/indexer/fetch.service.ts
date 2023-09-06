// Copyright 2020-2023 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: GPL-3.0

import { Inject, Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { SchedulerRegistry } from '@nestjs/schedule';

import {
  isCustomDs,
  SubqlConcordiumHandlerKind,
  SubqlConcordiumProcessorOptions,
  ConcordiumTransactionFilter,
} from '@subql/common-concordium';
import {
  NodeConfig,
  BaseFetchService,
  ApiService,
  getLogger,
  getModulos,
} from '@subql/node-core';
import { DictionaryQueryCondition, DictionaryQueryEntry } from '@subql/types';
import { SubqlDatasource } from '@subql/types-concordium';
import { groupBy, partition, sortBy, uniqBy } from 'lodash';
import { ConcordiumApi } from '../concordium';
import { calcInterval } from '../concordium/utils.concordium';
import {
  ConcordiumProjectDs,
  SubqueryProject,
} from '../configure/SubqueryProject';
import { eventToTopic, functionToSighash } from '../utils/string';
import { yargsOptions } from '../yargs';
import { IConcordiumBlockDispatcher } from './blockDispatcher';
import { DictionaryService } from './dictionary.service';
import { DsProcessorService } from './ds-processor.service';
import { DynamicDsService } from './dynamic-ds.service';
import { ProjectService } from './project.service';
import {
  blockToHeader,
  UnfinalizedBlocksService,
} from './unfinalizedBlocks.service';

const logger = getLogger('fetch.service');

const BLOCK_TIME_VARIANCE = 5000;

const INTERVAL_PERCENT = 0.9;

function appendDsOptions(
  dsOptions:
    | SubqlConcordiumProcessorOptions
    | SubqlConcordiumProcessorOptions[],
  conditions: DictionaryQueryCondition[],
): void {
  const queryAddressLimit = yargsOptions.argv['query-address-limit'];
  if (Array.isArray(dsOptions)) {
    const addresses = dsOptions.map((option) => option.address).filter(Boolean);

    if (addresses.length > queryAddressLimit) {
      logger.warn(
        `Addresses length: ${addresses.length} is exceeding limit: ${queryAddressLimit}. Consider increasing this value with the flag --query-address-limit  `,
      );
    }

    if (addresses.length !== 0 && addresses.length <= queryAddressLimit) {
      conditions.push({
        field: 'address',
        value: addresses,
        matcher: 'in',
      });
    }
  } else {
    if (dsOptions?.address) {
      conditions.push({
        field: 'address',
        value: dsOptions.address.toLowerCase(),
        matcher: 'equalTo',
      });
    }
  }
}

type GroupedConcordiumProjectDs = SubqlDatasource & {
  groupedOptions?: SubqlConcordiumProcessorOptions[];
};
export function buildDictionaryQueryEntries(
  dataSources: GroupedConcordiumProjectDs[],
): DictionaryQueryEntry[] {
  const queryEntries: DictionaryQueryEntry[] = [];

  for (const ds of dataSources) {
    for (const handler of ds.mapping.handlers) {
      // No filters, cant use dictionary
      if (!handler.filter) return [];

      switch (handler.kind) {
        case SubqlConcordiumHandlerKind.Block:
          return [];
        case SubqlConcordiumHandlerKind.Transaction: {
          // TODO
          return [];
        }
        case SubqlConcordiumHandlerKind.TransactionEvent: {
          return []; // TODO
        }
        case SubqlConcordiumHandlerKind.SpecialEvent: {
          return []; // TODO
        }
        default:
      }
    }
  }

  return uniqBy(
    queryEntries,
    (item) =>
      `${item.entity}|${JSON.stringify(
        sortBy(item.conditions, (c) => c.field),
      )}`,
  );
}

@Injectable()
export class FetchService extends BaseFetchService<
  SubqlDatasource,
  IConcordiumBlockDispatcher,
  DictionaryService
> {
  constructor(
    private apiService: ApiService,
    nodeConfig: NodeConfig,
    @Inject('IProjectService') projectService: ProjectService,
    @Inject('ISubqueryProject') project: SubqueryProject,
    @Inject('IBlockDispatcher')
    blockDispatcher: IConcordiumBlockDispatcher,
    dictionaryService: DictionaryService,
    private dsProcessorService: DsProcessorService,
    dynamicDsService: DynamicDsService,
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
      dynamicDsService,
      eventEmitter,
      schedulerRegistry,
    );
  }

  get api(): ConcordiumApi {
    return this.apiService.unsafeApi;
  }

  protected buildDictionaryQueryEntries(
    dataSources: SubqlDatasource[],
  ): DictionaryQueryEntry[] {
    const [normalDataSources, templateDataSources] = partition(
      dataSources,
      (ds) => !ds.name,
    );

    // Group templ
    const groupedDataSources = Object.values(
      groupBy(templateDataSources, (ds) => ds.name),
    ).map((grouped) => {
      if (grouped.length === 1) {
        return grouped[0];
      }

      const options = grouped.map((ds) => ds.options);
      const ref = grouped[0];

      return {
        ...ref,
        groupedOptions: options,
      };
    });

    const filteredDs = [...normalDataSources, ...groupedDataSources];

    return buildDictionaryQueryEntries(filteredDs);
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

  protected getModulos(): number[] {
    return getModulos(
      this.projectService.getAllDataSources(),
      isCustomDs,
      SubqlConcordiumHandlerKind.Block,
    );
  }

  protected async initBlockDispatcher(): Promise<void> {
    await this.blockDispatcher.init(this.resetForNewDs.bind(this));
  }

  protected async preLoopHook(): Promise<void> {
    // Concordium doesn't need to do anything here
    return Promise.resolve();
  }
}
