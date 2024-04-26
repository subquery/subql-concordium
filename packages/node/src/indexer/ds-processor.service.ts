// Copyright 2020-2024 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: GPL-3.0

import { Injectable } from '@nestjs/common';
import { isCustomDs, SubqlDatasourceProcessor } from '@subql/common-concordium';
import { BaseDsProcessorService } from '@subql/node-core';
import {
  ConcordiumCustomDatasource,
  ConcordiumDatasource,
} from '@subql/types-concordium';

@Injectable()
export class DsProcessorService extends BaseDsProcessorService<
  ConcordiumDatasource,
  ConcordiumCustomDatasource<string>,
  SubqlDatasourceProcessor<string, Record<string, unknown>>
> {
  protected isCustomDs = isCustomDs;
}
