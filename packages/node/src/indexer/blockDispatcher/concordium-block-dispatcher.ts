// Copyright 2020-2023 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: GPL-3.0

import { IBlockDispatcher } from '@subql/node-core';
import { ConcordiumBlock } from '@subql/types-concordium';

export interface IConcordiumBlockDispatcher
  extends IBlockDispatcher<ConcordiumBlock> {
  init(onDynamicDsCreated: (height: number) => Promise<void>): Promise<void>;
}
