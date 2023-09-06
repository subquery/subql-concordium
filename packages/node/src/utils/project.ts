// Copyright 2020-2023 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: GPL-3.0

import {
  SubqlRuntimeHandler,
  SubqlCustomHandler,
  SubqlHandler,
  SubqlConcordiumHandlerKind,
} from '@subql/common-concordium';

export function isBaseHandler(
  handler: SubqlHandler,
): handler is SubqlRuntimeHandler {
  return Object.values<string>(SubqlConcordiumHandlerKind).includes(
    handler.kind,
  );
}

export function isCustomHandler(
  handler: SubqlHandler,
): handler is SubqlCustomHandler {
  return !isBaseHandler(handler);
}
