// Copyright 2020-2024 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: GPL-3.0

import {
  SecondLayerHandlerProcessor,
  ConcordiumCustomDatasource,
  ConcordiumDatasource,
  ConcordiumDatasourceKind,
  ConcordiumHandlerKind,
  ConcordiumRuntimeDatasource,
} from '@subql/types-concordium';

type DefaultFilter = Record<string, unknown>;

export function isBlockHandlerProcessor<E>(
  hp: SecondLayerHandlerProcessor<ConcordiumHandlerKind, DefaultFilter, unknown>
): hp is SecondLayerHandlerProcessor<ConcordiumHandlerKind.Block, DefaultFilter, E> {
  return hp.baseHandlerKind === ConcordiumHandlerKind.Block;
}

export function isTransactionHandlerProcessor<E>(
  hp: SecondLayerHandlerProcessor<ConcordiumHandlerKind, DefaultFilter, unknown>
): hp is SecondLayerHandlerProcessor<ConcordiumHandlerKind.Transaction, DefaultFilter, E> {
  return hp.baseHandlerKind === ConcordiumHandlerKind.Transaction;
}

export function isTransactionEventHandlerProcessor<E>(
  hp: SecondLayerHandlerProcessor<ConcordiumHandlerKind, DefaultFilter, unknown>
): hp is SecondLayerHandlerProcessor<ConcordiumHandlerKind.TransactionEvent, DefaultFilter, E> {
  return hp.baseHandlerKind === ConcordiumHandlerKind.TransactionEvent;
}

export function isSpecialEventHandlerProcessor<E>(
  hp: SecondLayerHandlerProcessor<ConcordiumHandlerKind, DefaultFilter, unknown>
): hp is SecondLayerHandlerProcessor<ConcordiumHandlerKind.SpecialEvent, DefaultFilter, E> {
  return hp.baseHandlerKind === ConcordiumHandlerKind.SpecialEvent;
}

export function isCustomDs(ds: ConcordiumDatasource): ds is ConcordiumCustomDatasource<string> {
  return ds.kind !== ConcordiumDatasourceKind.Runtime && !!(ds as ConcordiumCustomDatasource<string>).processor;
}

export function isRuntimeDs(ds: ConcordiumDatasource): ds is ConcordiumRuntimeDatasource {
  return ds.kind === ConcordiumDatasourceKind.Runtime;
}
