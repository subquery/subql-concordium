// Copyright 2020-2023 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: GPL-3.0

import { ApiWrapper } from '@subql/types-concordium';

export function calcInterval(api: ApiWrapper): number {
  // TODO find a way to get this from the blockchain
  return 6000;
}
