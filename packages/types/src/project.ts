// Copyright 2020-2023 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: GPL-3.0

import {
  BaseTemplateDataSource,
  CommonSubqueryProject,
  FileReference,
  IProjectNetworkConfig,
  Processor,
  ProjectManifestV1_0_0,
} from '@subql/types-core';
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

export type RuntimeDatasourceTemplate = BaseTemplateDataSource<SubqlRuntimeDatasource>;
export type CustomDatasourceTemplate = BaseTemplateDataSource<SubqlCustomDatasource>;

export type ConcordiumProjectManifestV1_0_0 = ProjectManifestV1_0_0<SubqlRuntimeDatasource | SubqlCustomDatasource>;

/**
 * Kind of Concordium datasource.
 * @enum {string}
 */
export enum ConcordiumDatasourceKind {
  /**
   * The runtime kind of Concordium datasource.
   */
  Runtime = 'concordium/Runtime',
}

export enum ConcordiumHandlerKind {
  /**
   * Handler for Concordium blocks.
   */
  Block = 'concordium/BlockHandler',
  /**
   * Handler for Concordium transactions.
   */
  Transaction = 'concordium/TransactionHandler',
  /**
   * Handler for Concordium transaction events.
   */
  TransactionEvent = 'concordium/TransactionEventHandler',
  /**
   * Handler for Concordium special events.
   */
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

/**
 * Represents a handler for Concordium blocks.
 * @type {SubqlCustomHandler<ConcordiumHandlerKind.Block, ConcordiumBlockFilter>}
 */
export interface SubqlBlockHandler {
  handler: string;
  kind: ConcordiumHandlerKind.Block;
  filter?: ConcordiumBlockFilter;
}

/**
 * Represents a handler for Concordium transactions.
 * @type {SubqlCustomHandler<ConcordiumHandlerKind.Transaction, ConcordiumTransactionFilter>}
 */
export interface SubqlTransactionHandler {
  handler: string;
  kind: ConcordiumHandlerKind.Transaction;
  filter?: ConcordiumTransactionFilter;
}

/**
 * Represents a handler for Concordium transaction events.
 * @type {SubqlCustomHandler<ConcordiumHandlerKind.TransactionEvent, ConcordiumTransactionEventFilter>}
 */
export interface SubqlTransactionEventHandler {
  handler: string;
  kind: ConcordiumHandlerKind.TransactionEvent;
  filter?: ConcordiumTransactionEventFilter;
}

/**
 * Represents a handler for Concordium special events.
 * @type {SubqlCustomHandler<ConcordiumHandlerKind.SpecialEvent, ConcordiumSpecialEventFilter>}
 */
export interface SubqlSpecialEventHandler {
  handler: string;
  kind: ConcordiumHandlerKind.SpecialEvent;
  filter?: ConcordiumSpecialEventFilter;
}

/**
 * Represents a generic custom handler for Concordium.
 * @interface
 * @template K - The kind of the handler (default: string).
 * @template F - The filter type for the handler (default: Record<string, unknown>).
 */
export interface SubqlCustomHandler<K extends string = string, F = Record<string, unknown>> {
  handler: string;
  kind: K;
  filter?: F;
}

/**
 * Represents a runtime handler for Concordium, which can be a block handler, transaction handler, operation handler, effect handler or event handler.
 * @type {SubqlBlockHandler | SubqlTransactionHandler | SubqlTransactionEventHandler | SubqlSpecialEventHandler }
 */
export type SubqlRuntimeHandler =
  | SubqlBlockHandler
  | SubqlTransactionHandler
  | SubqlTransactionEventHandler
  | SubqlSpecialEventHandler;

/**
 * Represents a handler for Concordium, which can be a runtime handler or a custom handler with unknown filter type.
 * @type {SubqlRuntimeHandler | SubqlCustomHandler<string, unknown>}
 */
export type SubqlHandler = SubqlRuntimeHandler | SubqlCustomHandler<string, unknown>;

/**
 * Represents a filter for Concordium runtime handlers, which can be a block filter, transaction filter, operation filter, effects filter or event filter.
 * @type {ConcordiumBlockFilter | ConcordiumTransactionFilter | ConcordiumTransactionEventFilter | ConcordiumSpecialEventFilter}
 */
export type SubqlHandlerFilter =
  | ConcordiumBlockFilter
  | ConcordiumTransactionFilter
  | ConcordiumTransactionEventFilter
  | ConcordiumSpecialEventFilter;

/**
 * Represents a mapping for Concordium handlers, extending FileReference.
 * @interface
 * @extends {FileReference}
 */
export interface SubqlMapping<T extends SubqlHandler = SubqlHandler> {
  file: string;
  handlers: T[];
}

/**
 * Represents a Concordium datasource interface with generic parameters.
 * @interface
 * @template M - The mapping type for the datasource.
 */
interface ISubqlDatasource<M extends SubqlMapping> {
  name?: string;
  kind: string;
  startBlock?: number;
  mapping: M;
}

/**
 * Represents a runtime datasource for Concordium.
 * @interface
 * @template M - The mapping type for the datasource (default: SubqlMapping<ConcordiumRuntimeHandler>).
 */
export interface SubqlRuntimeDatasource<M extends SubqlMapping<SubqlRuntimeHandler> = SubqlMapping<SubqlRuntimeHandler>>
  extends ISubqlDatasource<M> {
  /**
   * The kind of the datasource, which is `concordium/Runtime`.
   * @type {ConcordiumDatasourceKind.Runtime}
   */
  kind: ConcordiumDatasourceKind.Runtime;
  assets?: Map<string, {file: string}>;
}

export interface SubqlNetworkFilter {
  specName?: string;
}

export type SubqlDatasource = SubqlRuntimeDatasource | SubqlCustomDatasource;

export type CustomDataSourceAsset = FileReference;

export interface SubqlCustomDatasource<
  K extends string = string,
  M extends SubqlMapping = SubqlMapping<SubqlCustomHandler>,
  O = any
> extends ISubqlDatasource<M> {
  kind: K;
  assets: Map<string, CustomDataSourceAsset>;
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

/**
 * Represents a Concordium project configuration based on the CommonSubqueryProject template.
 * @type {CommonSubqueryProject<IProjectNetworkConfig, SubqlDatasource, RuntimeDatasourceTemplate | CustomDatasourceTemplate>}
 */
export type ConcordiumProject<DS extends SubqlDatasource = SubqlRuntimeDatasource> = CommonSubqueryProject<
  IProjectNetworkConfig,
  SubqlRuntimeDatasource | DS,
  BaseTemplateDataSource<SubqlRuntimeDatasource> | BaseTemplateDataSource<DS>
>;
