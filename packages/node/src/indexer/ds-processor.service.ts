// Copyright 2020-2023 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: GPL-3.0

import { Injectable } from '@nestjs/common';
import {
  SubqlConcordiumHandlerKind,
  isCustomDs,
  SubqlConcordiumCustomDataSource,
  SubqlConcordiumDataSource,
  SubqlDatasourceProcessor,
} from '@subql/common-concordium';
import { BaseDsProcessorService } from '@subql/node-core';
import {
  SecondLayerHandlerProcessor_0_0_0,
  SecondLayerHandlerProcessor_1_0_0,
  SubqlCustomDatasource,
} from '@subql/types-concordium';

export function isSecondLayerHandlerProcessor_0_0_0<
  K extends SubqlConcordiumHandlerKind,
  F,
  E,
  DS extends SubqlCustomDatasource = SubqlConcordiumCustomDataSource,
>(
  processor:
    | SecondLayerHandlerProcessor_0_0_0<K, F, E, DS>
    | SecondLayerHandlerProcessor_1_0_0<K, F, E, DS>,
): processor is SecondLayerHandlerProcessor_0_0_0<K, F, E, DS> {
  // Exisiting datasource processors had no concept of specVersion, therefore undefined is equivalent to 0.0.0
  return processor.specVersion === undefined;
}

export function isSecondLayerHandlerProcessor_1_0_0<
  K extends SubqlConcordiumHandlerKind,
  F,
  E,
  DS extends SubqlConcordiumCustomDataSource = SubqlConcordiumCustomDataSource,
>(
  processor:
    | SecondLayerHandlerProcessor_0_0_0<K, F, E, DS>
    | SecondLayerHandlerProcessor_1_0_0<K, F, E, DS>,
): processor is SecondLayerHandlerProcessor_1_0_0<K, F, E, DS> {
  return processor.specVersion === '1.0.0';
}

export function asSecondLayerHandlerProcessor_1_0_0<
  K extends SubqlConcordiumHandlerKind,
  F,
  E,
  DS extends SubqlConcordiumCustomDataSource = SubqlConcordiumCustomDataSource,
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
  SubqlConcordiumDataSource,
  SubqlConcordiumCustomDataSource<string>,
  SubqlDatasourceProcessor<string, unknown>
> {
  protected isCustomDs = isCustomDs;
}
