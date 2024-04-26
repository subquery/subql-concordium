// Copyright 2020-2024 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: GPL-3.0

import { Inject, Injectable } from '@nestjs/common';
import { NodeConfig, DictionaryV1 as BaseDictionaryV1 } from '@subql/node-core';
import {
  ConcordiumSpecialEventFilter,
  ConcordiumTransactionEventFilter,
  ConcordiumTransactionFilter,
  ConcordiumDatasource,
  ConcordiumHandlerKind,
} from '@subql/types-concordium';
import {
  DictionaryQueryCondition,
  DictionaryQueryEntry,
  DsProcessor,
} from '@subql/types-core';
import { setWith, sortBy, uniqBy } from 'lodash';
import { SubqueryProject } from '../../../configure/SubqueryProject';

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

export function buildDictionaryQueryEntries(
  dataSources: ConcordiumDatasource[],
): DictionaryQueryEntry[] {
  const queryEntries: DictionaryQueryEntry[] = [];

  for (const ds of dataSources) {
    for (const handler of ds.mapping.handlers) {
      // No filters, cant use dictionary
      if (!handler.filter) return [];

      switch (handler.kind) {
        case ConcordiumHandlerKind.Block: {
          const filter = handler.filter;
          if (filter.modulo === undefined) {
            return [];
          }
          break;
        }
        case ConcordiumHandlerKind.Transaction: {
          const filter = handler.filter;
          if (filter.type || filter.values) {
            queryEntries.push(txFilterToQueryEntry(filter));
          } else {
            return [];
          }
          break;
        }
        case ConcordiumHandlerKind.TransactionEvent: {
          const filter = handler.filter;
          if (filter.type || filter.values) {
            queryEntries.push(txEventFilterToQueryEntry(filter));
          } else {
            return [];
          }
          break;
        }
        case ConcordiumHandlerKind.SpecialEvent: {
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
export class DictionaryV1 extends BaseDictionaryV1<ConcordiumDatasource> {
  private constructor(
    @Inject('ISubqueryProject') protected project: SubqueryProject,
    nodeConfig: NodeConfig,
    protected getDsProcessor: (
      ds: ConcordiumDatasource,
    ) => DsProcessor<ConcordiumDatasource>,
    dictionaryUrl?: string,
  ) {
    super(dictionaryUrl, project.network.chainId, nodeConfig);
  }

  static async create(
    project: SubqueryProject,
    nodeConfig: NodeConfig,
    getDsProcessor: (
      ds: ConcordiumDatasource,
    ) => DsProcessor<ConcordiumDatasource>,
    dictionaryUrl?: string,
  ): Promise<DictionaryV1> {
    const dictionary = new DictionaryV1(
      project,
      nodeConfig,
      getDsProcessor,
      dictionaryUrl,
    );
    await dictionary.init();
    return dictionary;
  }

  buildDictionaryQueryEntries(
    dataSources: ConcordiumDatasource[],
  ): DictionaryQueryEntry[] {
    return buildDictionaryQueryEntries(dataSources /*, this.getDsProcessor*/);
  }
}
