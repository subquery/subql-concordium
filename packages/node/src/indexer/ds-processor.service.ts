// Copyright 2020-2024 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: GPL-3.0

import { Injectable } from '@nestjs/common';
import {
  ConcordiumHandlerKind,
  isCustomDs,
  SubqlDatasourceProcessor,
} from '@subql/common-concordium';
import { BaseDsProcessorService } from '@subql/node-core';
import {
  ConcordiumCustomDatasource,
  ConcordiumDatasource,
  SecondLayerHandlerProcessor_0_0_0,
  SecondLayerHandlerProcessor_1_0_0,
} from '@subql/types-concordium';

export function isSecondLayerHandlerProcessor_0_0_0<
  K extends ConcordiumHandlerKind,
  F extends Record<string, unknown>,
  E,
  DS extends ConcordiumCustomDatasource = ConcordiumCustomDatasource,
>(
  processor:
    | SecondLayerHandlerProcessor_0_0_0<K, F, E, DS>
    | SecondLayerHandlerProcessor_1_0_0<K, F, E, DS>,
): processor is SecondLayerHandlerProcessor_0_0_0<K, F, E, DS> {
  // Exisiting datasource processors had no concept of specVersion, therefore undefined is equivalent to 0.0.0
  return processor.specVersion === undefined;
}

export function isSecondLayerHandlerProcessor_1_0_0<
  K extends ConcordiumHandlerKind,
  F extends Record<string, unknown>,
  E,
  DS extends ConcordiumCustomDatasource = ConcordiumCustomDatasource,
>(
  processor:
    | SecondLayerHandlerProcessor_0_0_0<K, F, E, DS>
    | SecondLayerHandlerProcessor_1_0_0<K, F, E, DS>,
): processor is SecondLayerHandlerProcessor_1_0_0<K, F, E, DS> {
  return processor.specVersion === '1.0.0';
}

export function asSecondLayerHandlerProcessor_1_0_0<
  K extends ConcordiumHandlerKind,
  F extends Record<string, unknown>,
  E,
  DS extends ConcordiumCustomDatasource = ConcordiumCustomDatasource,
>(
  processor:
    | SecondLayerHandlerProcessor_0_0_0<K, F, E, DS>
    | SecondLayerHandlerProcessor_1_0_0<K, F, E, DS>,
): SecondLayerHandlerProcessor_1_0_0<K, F, E, DS> {
  if (isSecondLayerHandlerProcessor_1_0_0(processor)) {
    return processor;
  }

  if (!isSecondLayerHandlerProcessor_0_0_0(processor)) {
    throw new Error('Unsupported ds processor version');
  }

  return {
    ...processor,
    specVersion: '1.0.0',
    filterProcessor: (params) =>
      processor.filterProcessor(params.filter, params.input, params.ds),
    transformer: (params) =>
      processor
        .transformer(params.input, params.ds, params.api, params.assets)
        .then((res) => [res]),
  };
}

@Injectable()
export class DsProcessorService extends BaseDsProcessorService<
  ConcordiumDatasource,
  ConcordiumCustomDatasource<string>,
  SubqlDatasourceProcessor<string, Record<string, unknown>>
> {
  protected isCustomDs = isCustomDs;
}
