// Copyright 2020-2023 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: GPL-3.0

import {ConcordiumGRPCClient} from '@concordium/node-sdk';

declare global {
  const api: ConcordiumGRPCClient;
  const unsafeApi: ConcordiumGRPCClient | undefined;
}
