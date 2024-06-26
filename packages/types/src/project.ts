// Copyright 2020-2024 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: GPL-3.0

import {ConcordiumGRPCClient} from '@concordium/node-sdk';
import {
  BaseTemplateDataSource,
  CommonSubqueryProject,
  FileReference,
  IProjectNetworkConfig,
  Processor,
  ProjectManifestV1_0_0,
  SecondLayerHandlerProcessor_0_0_0,
  SecondLayerHandlerProcessor_1_0_0,
  DsProcessor,
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

export type RuntimeDatasourceTemplate = BaseTemplateDataSource<ConcordiumRuntimeDatasource>;
export type CustomDatasourceTemplate = BaseTemplateDataSource<ConcordiumCustomDatasource>;

export type ConcordiumProjectManifestV1_0_0 = ProjectManifestV1_0_0<
  ConcordiumRuntimeDatasource | ConcordiumCustomDatasource
>;

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
export interface ConcordiumRuntimeDatasource<
  M extends SubqlMapping<SubqlRuntimeHandler> = SubqlMapping<SubqlRuntimeHandler>
> extends ISubqlDatasource<M> {
  /**
   * The kind of the datasource, which is `concordium/Runtime`.
   * @type {ConcordiumDatasourceKind.Runtime}
   */
  kind: ConcordiumDatasourceKind.Runtime;
  assets?: Map<string, {file: string}>;
}

export type ConcordiumDatasource = ConcordiumRuntimeDatasource | ConcordiumCustomDatasource;

export type CustomDataSourceAsset = FileReference;

export interface ConcordiumCustomDatasource<
  K extends string = string,
  M extends SubqlMapping = SubqlMapping<SubqlCustomHandler>,
  O = any
> extends ISubqlDatasource<M> {
  kind: K;
  assets: Map<string, CustomDataSourceAsset>;
  processor: Processor<O>;
}

export type SecondLayerHandlerProcessor<
  K extends ConcordiumHandlerKind,
  F extends Record<string, unknown>,
  E,
  DS extends ConcordiumCustomDatasource = ConcordiumCustomDatasource
> =
  | SecondLayerHandlerProcessor_0_0_0<ConcordiumRuntimeHandlerInputMap, K, F, E, DS, ConcordiumGRPCClient>
  | SecondLayerHandlerProcessor_1_0_0<ConcordiumRuntimeHandlerInputMap, K, F, E, DS, ConcordiumGRPCClient>;

export type SecondLayerHandlerProcessorArray<
  K extends string,
  F extends Record<string, unknown>,
  T,
  DS extends ConcordiumCustomDatasource<K> = ConcordiumCustomDatasource<K>
> =
  | SecondLayerHandlerProcessor<ConcordiumHandlerKind.Block, F, T, DS>
  | SecondLayerHandlerProcessor<ConcordiumHandlerKind.Transaction, F, T, DS>
  | SecondLayerHandlerProcessor<ConcordiumHandlerKind.TransactionEvent, F, T, DS>
  | SecondLayerHandlerProcessor<ConcordiumHandlerKind.SpecialEvent, F, T, DS>;

export type SubqlDatasourceProcessor<
  K extends string,
  F extends Record<string, unknown>,
  DS extends ConcordiumCustomDatasource<K> = ConcordiumCustomDatasource<K>,
  P extends Record<string, SecondLayerHandlerProcessorArray<K, F, any, DS>> = Record<
    string,
    SecondLayerHandlerProcessorArray<K, F, any, DS>
  >
> = DsProcessor<DS, P, ConcordiumGRPCClient>;

/**
 * Represents a Ethereum subquery network configuration, which is based on the CommonSubqueryNetworkConfig template.
 * @type {IProjectNetworkConfig}
 */
export type ConcordiumNetworkConfig = IProjectNetworkConfig;

/**
 * Represents a Concordium project configuration based on the CommonSubqueryProject template.
 * @type {CommonSubqueryProject<IProjectNetworkConfig, SubqlDatasource, RuntimeDatasourceTemplate | CustomDatasourceTemplate>}
 */
export type ConcordiumProject<DS extends ConcordiumDatasource = ConcordiumRuntimeDatasource> = CommonSubqueryProject<
  ConcordiumNetworkConfig,
  ConcordiumRuntimeDatasource | DS,
  BaseTemplateDataSource<ConcordiumRuntimeDatasource> | BaseTemplateDataSource<DS>
>;
