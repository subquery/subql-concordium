// Copyright 2020-2023 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: GPL-3.0

import {IProjectManifest, ProjectNetworkConfig} from '@subql/common';
import {SubqlDatasource} from '@subql/types-concordium';

// All of these used to be redefined in this file, re-exporting for simplicity
export {
  SubqlConcordiumProcessorOptions,
  SubqlRuntimeHandler,
  SubqlCustomHandler,
  SubqlHandler,
  ConcordiumHandlerKind as SubqlConcordiumHandlerKind,
  SubqlDatasource as SubqlConcordiumDataSource,
  SubqlCustomDatasource as SubqlConcordiumCustomDataSource,
  ConcordiumBlockFilter,
  ConcordiumTransactionFilter,
  SubqlDatasourceProcessor,
  SubqlHandlerFilter,
  ConcordiumDatasourceKind as SubqlConcordiumDatasourceKind,
  ConcordiumRuntimeHandlerInputMap as ConcordiumRuntimeHandlerInputMap,
} from '@subql/types-concordium';

export type IConcordiumProjectManifest = IProjectManifest<SubqlDatasource>;

export interface ConcordiumProjectNetworkConfig extends ProjectNetworkConfig {
  genesisHash?: string;
  chainId?: string;
}
