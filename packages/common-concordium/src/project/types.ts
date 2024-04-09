// Copyright 2020-2023 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: GPL-3.0

import {ConcordiumDatasource} from '@subql/types-concordium';
import {IProjectManifest} from '@subql/types-core';

// All of these used to be redefined in this file, re-exporting for simplicity
export {
  SubqlRuntimeHandler,
  SubqlCustomHandler,
  SubqlHandler,
  ConcordiumHandlerKind,
  ConcordiumDatasource,
  ConcordiumCustomDatasource,
  ConcordiumBlockFilter,
  ConcordiumTransactionFilter,
  SubqlDatasourceProcessor,
  SubqlHandlerFilter,
  ConcordiumDatasourceKind as SubqlConcordiumDatasourceKind,
  ConcordiumRuntimeHandlerInputMap as ConcordiumRuntimeHandlerInputMap,
} from '@subql/types-concordium';

export type IConcordiumProjectManifest = IProjectManifest<ConcordiumDatasource>;
