// Copyright 2020-2023 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: GPL-3.0

import {
  ConcordiumBlock,
  ConcordiumBlockFilter,
  ConcordiumSpecialEvent,
  ConcordiumSpecialEventFilter,
  ConcordiumTransaction,
  ConcordiumTransactionFilter,
  ConcordiumTransactionEvent,
  ConcordiumTransactionEventFilter,
} from './concordium';
import {ApiWrapper} from './interfaces';

export enum ConcordiumDatasourceKind {
  Runtime = 'concordium/Runtime',
}

export enum ConcordiumHandlerKind {
  Block = 'concordium/BlockHandler',
  Transaction = 'concordium/TransactionHandler',
  TransactionEvent = 'concordium/TransactionEventHandler',
  SpecialEvent = 'concordium/SpecialEventHandler',
}

export type ConcordiumRuntimeHandlerInputMap = {
  [ConcordiumHandlerKind.Block]: ConcordiumBlock;
  [ConcordiumHandlerKind.Transaction]: ConcordiumTransaction;
  [ConcordiumHandlerKind.TransactionEvent]: ConcordiumTransactionEvent;
  [ConcordiumHandlerKind.SpecialEvent]: ConcordiumSpecialEvent;
};

type ConcordiumRuntimeFilterMap = {
  [ConcordiumHandlerKind.Block]: ConcordiumBlockFilter;
  [ConcordiumHandlerKind.Transaction]: ConcordiumTransactionFilter;
  [ConcordiumHandlerKind.TransactionEvent]: ConcordiumTransactionEventFilter;
  [ConcordiumHandlerKind.SpecialEvent]: ConcordiumSpecialEvent;
};

export interface ProjectManifest {
  specVersion: string;
  description: string;
  repository: string;

  schema: string;

  network: {
    endpoint: string | string[];
  };

  dataSources: SubqlDatasource[];
  bypassBlocks?: number[];
}

export interface SubqlBlockHandler {
  handler: string;
  kind: ConcordiumHandlerKind.Block;
  filter?: ConcordiumBlockFilter;
}

export interface SubqlTransactionHandler {
  handler: string;
  kind: ConcordiumHandlerKind.Transaction;
  filter?: ConcordiumTransactionFilter;
}

export interface SubqlTransactionEventHandler {
  handler: string;
  kind: ConcordiumHandlerKind.TransactionEvent;
  filter?: ConcordiumTransactionEventFilter;
}

export interface SubqlSpecialEventHandler {
  handler: string;
  kind: ConcordiumHandlerKind.SpecialEvent;
  filter?: ConcordiumSpecialEventFilter;
}

export interface SubqlCustomHandler<K extends string = string, F = Record<string, unknown>> {
  handler: string;
  kind: K;
  filter?: F;
}

export type SubqlRuntimeHandler =
  | SubqlBlockHandler
  | SubqlTransactionHandler
  | SubqlTransactionEventHandler
  | SubqlSpecialEventHandler;

export type SubqlHandler = SubqlRuntimeHandler | SubqlCustomHandler<string, unknown>;

export type SubqlHandlerFilter =
  | ConcordiumBlockFilter
  | ConcordiumTransactionFilter
  | ConcordiumTransactionEventFilter
  | ConcordiumSpecialEventFilter;

export interface SubqlMapping<T extends SubqlHandler = SubqlHandler> {
  file: string;
  handlers: T[];
}

interface ISubqlDatasource<M extends SubqlMapping> {
  name?: string;
  kind: string;
  startBlock?: number;
  mapping: M;
}

export interface SubqlConcordiumProcessorOptions {
  address?: string;
}

export interface SubqlRuntimeDatasource<M extends SubqlMapping<SubqlRuntimeHandler> = SubqlMapping<SubqlRuntimeHandler>>
  extends ISubqlDatasource<M> {
  kind: ConcordiumDatasourceKind.Runtime;
  options?: SubqlConcordiumProcessorOptions;
  assets?: Map<string, {file: string}>;
}

export interface SubqlNetworkFilter {
  specName?: string;
}

export type SubqlDatasource = SubqlRuntimeDatasource | SubqlCustomDatasource;

export interface FileReference {
  file: string;
}

export type CustomDataSourceAsset = FileReference;

export type Processor<O = any> = FileReference & {options?: O};

export interface SubqlCustomDatasource<
  K extends string = string,
  M extends SubqlMapping = SubqlMapping<SubqlCustomHandler>,
  O = any
> extends ISubqlDatasource<M> {
  kind: K;
  assets: Map<string, CustomDataSourceAsset>;
  options?: SubqlConcordiumProcessorOptions;
  processor: Processor<O>;
}

export interface HandlerInputTransformer_0_0_0<
  T extends ConcordiumHandlerKind,
  E,
  DS extends SubqlCustomDatasource = SubqlCustomDatasource
> {
  (input: ConcordiumRuntimeHandlerInputMap[T], ds: DS, api: ApiWrapper, assets?: Record<string, string>): Promise<E>; //  | SubstrateBuiltinDataSource
}

export interface HandlerInputTransformer_1_0_0<
  T extends ConcordiumHandlerKind,
  F,
  E,
  DS extends SubqlCustomDatasource = SubqlCustomDatasource
> {
  (params: {
    input: ConcordiumRuntimeHandlerInputMap[T];
    ds: DS;
    filter?: F;
    api: ApiWrapper;
    assets?: Record<string, string>;
  }): Promise<E[]>; //  | SubstrateBuiltinDataSource
}

export interface DictionaryQueryCondition {
  field: string;
  value: string | string[];
  matcher?: string;
}

export interface DictionaryQueryEntry {
  entity: string;
  conditions: DictionaryQueryCondition[];
}

export type SecondLayerHandlerProcessorArray<
  K extends string,
  F,
  T,
  DS extends SubqlCustomDatasource<K> = SubqlCustomDatasource<K>
> =
  | SecondLayerHandlerProcessor<ConcordiumHandlerKind.Block, F, T, DS>
  | SecondLayerHandlerProcessor<ConcordiumHandlerKind.Transaction, F, T, DS>
  | SecondLayerHandlerProcessor<ConcordiumHandlerKind.TransactionEvent, F, T, DS>
  | SecondLayerHandlerProcessor<ConcordiumHandlerKind.SpecialEvent, F, T, DS>;

export interface SubqlDatasourceProcessor<
  K extends string,
  F,
  DS extends SubqlCustomDatasource<K> = SubqlCustomDatasource<K>,
  P extends Record<string, SecondLayerHandlerProcessorArray<K, F, any, DS>> = Record<
    string,
    SecondLayerHandlerProcessorArray<K, F, any, DS>
  >
> {
  kind: K;
  validate(ds: DS, assets: Record<string, string>): void;
  dsFilterProcessor(ds: DS, api: ApiWrapper): boolean;
  handlerProcessors: P;
}

interface SecondLayerHandlerProcessorBase<
  K extends ConcordiumHandlerKind,
  F,
  DS extends SubqlCustomDatasource = SubqlCustomDatasource
> {
  baseHandlerKind: K;
  baseFilter: ConcordiumRuntimeFilterMap[K] | ConcordiumRuntimeFilterMap[K][];
  filterValidator: (filter?: F) => void;
  dictionaryQuery?: (filter: F, ds: DS) => DictionaryQueryEntry | undefined;
}

export interface SecondLayerHandlerProcessor_0_0_0<
  K extends ConcordiumHandlerKind,
  F,
  E,
  DS extends SubqlCustomDatasource = SubqlCustomDatasource
> extends SecondLayerHandlerProcessorBase<K, F, DS> {
  specVersion: undefined;
  transformer: HandlerInputTransformer_0_0_0<K, E, DS>;
  filterProcessor: (filter: F | undefined, input: ConcordiumRuntimeHandlerInputMap[K], ds: DS) => boolean;
}

export interface SecondLayerHandlerProcessor_1_0_0<
  K extends ConcordiumHandlerKind,
  F,
  E,
  DS extends SubqlCustomDatasource = SubqlCustomDatasource
> extends SecondLayerHandlerProcessorBase<K, F, DS> {
  specVersion: '1.0.0';
  transformer: HandlerInputTransformer_1_0_0<K, F, E, DS>;
  filterProcessor: (params: {filter: F | undefined; input: ConcordiumRuntimeHandlerInputMap[K]; ds: DS}) => boolean;
}

export type SecondLayerHandlerProcessor<
  K extends ConcordiumHandlerKind,
  F,
  E,
  DS extends SubqlCustomDatasource = SubqlCustomDatasource
> = SecondLayerHandlerProcessor_0_0_0<K, F, E, DS> | SecondLayerHandlerProcessor_1_0_0<K, F, E, DS>;
