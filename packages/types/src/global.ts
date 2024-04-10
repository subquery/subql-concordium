// Copyright 2020-2024 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: GPL-3.0

import {ConcordiumGRPCClient} from '@concordium/node-sdk';
import '@subql/types-core/dist/global';

declare global {
  const api: ConcordiumGRPCClient;
  const unsafeApi: ConcordiumGRPCClient | undefined;
}
