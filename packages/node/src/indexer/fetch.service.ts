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
import {
  ConcordiumSpecialEventFilter,
  ConcordiumTransactionEventFilter,
  SubqlDatasource,
} from '@subql/types-concordium';
import {
  DictionaryQueryCondition,
  DictionaryQueryEntry,
} from '@subql/types-core';
import { groupBy, partition, setWith, sortBy, uniqBy } from 'lodash';
import { ConcordiumApi } from '../concordium';
import { calcInterval } from '../concordium/utils.concordium';
import { SubqueryProject } from '../configure/SubqueryProject';
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

export function txFilterToQueryEntry(
  filter: ConcordiumTransactionFilter,
): DictionaryQueryEntry {
  const conditions: DictionaryQueryCondition[] = [
    {
      field: 'type',
      value: filter.type,
      matcher: 'equalTo',
    },
  ];

  if (filter.values !== undefined) {
    const nested = {};

    Object.keys(filter.values).map((key) => {
      const value = filter.values[key];
      setWith(nested, key, value);
    });

    conditions.push({
      field: 'data',
      value: nested as any, // Cast to any for compat with node core
      matcher: 'contains',
    });
  }
  return {
    entity: 'transactions',
    conditions: conditions,
  };
}

export function txEventFilterToQueryEntry(
  filter: ConcordiumTransactionEventFilter,
): DictionaryQueryEntry {
  const conditions: DictionaryQueryCondition[] = [
    {
      field: 'type',
      value: filter.type,
      matcher: 'equalTo',
    },
  ];

  if (filter.values !== undefined) {
    const nested = {};

    Object.keys(filter.values).map((key) => {
      const value = filter.values[key];
      setWith(nested, key, value);
    });

    conditions.push({
      field: 'data',
      value: nested as any, // Cast to any for compat with node core
      matcher: 'contains',
    });
  }
  return {
    entity: 'txEvents',
    conditions: conditions,
  };
}

export function speicalEventFilterToQueryEntry(
  filter: ConcordiumSpecialEventFilter,
): DictionaryQueryEntry {
  const conditions: DictionaryQueryCondition[] = [
    {
      field: 'type',
      value: filter.type,
      matcher: 'equalTo',
    },
  ];

  if (filter.values !== undefined) {
    const nested = {};

    Object.keys(filter.values).map((key) => {
      const value = filter.values[key];
      setWith(nested, key, value);
    });

    conditions.push({
      field: 'data',
      value: nested as any, // Cast to any for compat with node core
      matcher: 'contains',
    });
  }
  return {
    entity: 'specialEvents',
    conditions: conditions,
  };
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
        case SubqlConcordiumHandlerKind.Block: {
          const filter = handler.filter;
          if (filter.modulo === undefined) {
            return [];
          }
          break;
        }
        case SubqlConcordiumHandlerKind.Transaction: {
          const filter = handler.filter;
          if (filter.type || filter.values) {
            queryEntries.push(txFilterToQueryEntry(filter));
          } else {
            return [];
          }
          break;
        }
        case SubqlConcordiumHandlerKind.TransactionEvent: {
          const filter = handler.filter;
          if (filter.type || filter.values) {
            queryEntries.push(txEventFilterToQueryEntry(filter));
          } else {
            return [];
          }
          break;
        }
        case SubqlConcordiumHandlerKind.SpecialEvent: {
          const filter = handler.filter;
          if (filter.type || filter.values) {
            queryEntries.push(speicalEventFilterToQueryEntry(filter));
          } else {
            return [];
          }
          break;
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

  protected getGenesisHash(): string {
    return this.apiService.networkMeta.genesisHash;
  }

  protected buildDictionaryQueryEntries(
    dataSources: (SubqlDatasource & { name?: string })[],
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
