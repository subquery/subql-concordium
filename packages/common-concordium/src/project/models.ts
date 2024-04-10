// Copyright 2020-2024 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: GPL-3.0

import {TransactionEventTag, TransactionSummaryType} from '@concordium/node-sdk';
import {BaseDataSource, BlockFilterImpl, ProcessorImpl} from '@subql/common';
import {
  ConcordiumHandlerKind,
  ConcordiumDatasourceKind,
  SubqlCustomHandler,
  SubqlMapping,
  SubqlHandler,
  SubqlRuntimeHandler,
  ConcordiumRuntimeDatasource,
  ConcordiumCustomDatasource,
  CustomDataSourceAsset,
  SubqlBlockHandler,
  ConcordiumTransactionFilter,
  ConcordiumTransactionEventFilter,
  ConcordiumSpecialEventFilter,
  SubqlTransactionHandler,
  SubqlTransactionEventHandler,
  SubqlSpecialEventHandler,
} from '@subql/types-concordium';
import {FileReference, Processor} from '@subql/types-core';
import {plainToClass, Transform, Type} from 'class-transformer';
import {IsArray, IsEnum, IsInt, IsOptional, IsString, IsObject, ValidateNested} from 'class-validator';

export class TransactionFilter implements ConcordiumTransactionFilter {
  @IsOptional()
  @IsString()
  type?: TransactionSummaryType;
  @IsOptional()
  @IsObject()
  values?: {[key: string]: string};
}

export class TransactionEventFilter implements ConcordiumTransactionEventFilter {
  @IsOptional()
  @IsString()
  type?: TransactionEventTag;
  @IsOptional()
  @IsObject()
  values?: {[key: string]: string};
}

export class SpecialEventFilter implements ConcordiumSpecialEventFilter {
  @IsOptional()
  @IsString()
  type?: string;
  @IsOptional()
  @IsObject()
  values?: {[key: string]: string};
}

export class BlockHandler implements SubqlBlockHandler {
  @IsObject()
  @IsOptional()
  @Type(() => BlockFilterImpl)
  filter?: BlockFilterImpl;
  @IsEnum(ConcordiumHandlerKind, {groups: [ConcordiumHandlerKind.Block]})
  kind: ConcordiumHandlerKind.Block;
  @IsString()
  handler: string;
}

export class TransactionHandler implements SubqlTransactionHandler {
  @IsOptional()
  @ValidateNested()
  @Type(() => TransactionFilter)
  filter?: ConcordiumTransactionFilter;
  @IsEnum(ConcordiumHandlerKind, {groups: [ConcordiumHandlerKind.Transaction]})
  kind: ConcordiumHandlerKind.Transaction;
  @IsString()
  handler: string;
}

export class TransactionEventHandler implements SubqlTransactionEventHandler {
  @IsOptional()
  @ValidateNested()
  @Type(() => TransactionEventFilter)
  filter?: ConcordiumTransactionEventFilter;
  @IsEnum(ConcordiumHandlerKind, {groups: [ConcordiumHandlerKind.TransactionEvent]})
  kind: ConcordiumHandlerKind.TransactionEvent;
  @IsString()
  handler: string;
}

export class SpecialEventHandler implements SubqlSpecialEventHandler {
  @IsOptional()
  @ValidateNested()
  @Type(() => SpecialEventFilter)
  filter?: ConcordiumTransactionEventFilter;
  @IsEnum(ConcordiumHandlerKind, {groups: [ConcordiumHandlerKind.SpecialEvent]})
  kind: ConcordiumHandlerKind.SpecialEvent;
  @IsString()
  handler: string;
}

export class CustomHandler implements SubqlCustomHandler {
  @IsString()
  kind: string;
  @IsString()
  handler: string;
  @IsObject()
  @IsOptional()
  filter?: Record<string, unknown>;
}

export class ConcordiumMapping implements SubqlMapping {
  @Transform((params) => {
    const handlers: SubqlHandler[] = params.value;
    return handlers.map((handler) => {
      switch (handler.kind) {
        case ConcordiumHandlerKind.SpecialEvent:
          return plainToClass(SpecialEventHandler, handler);
        case ConcordiumHandlerKind.TransactionEvent:
          return plainToClass(TransactionEventHandler, handler);
        case ConcordiumHandlerKind.Transaction:
          return plainToClass(TransactionHandler, handler);
        case ConcordiumHandlerKind.Block:
          return plainToClass(BlockHandler, handler);
        default:
          throw new Error(`handler ${(handler as any).kind} not supported`);
      }
    });
  })
  @IsArray()
  @ValidateNested()
  handlers: SubqlHandler[];
  @IsString()
  file: string;
}

export class CustomMapping implements SubqlMapping<SubqlCustomHandler> {
  @IsArray()
  @Type(() => CustomHandler)
  @ValidateNested()
  handlers: CustomHandler[];
  @IsString()
  file: string;
}

export class RuntimeDataSourceBase<M extends SubqlMapping<SubqlRuntimeHandler>>
  extends BaseDataSource
  implements ConcordiumRuntimeDatasource<M>
{
  @IsEnum(ConcordiumDatasourceKind, {
    groups: [ConcordiumDatasourceKind.Runtime],
  })
  kind: ConcordiumDatasourceKind.Runtime;
  @Type(() => ConcordiumMapping)
  @ValidateNested()
  mapping: M;
  @IsOptional()
  assets?: Map<string, FileReference>;
}

export class FileReferenceImpl implements FileReference {
  @IsString()
  file: string;
}

export class CustomDataSourceBase<K extends string, M extends SubqlMapping = SubqlMapping<SubqlCustomHandler>, O = any>
  extends BaseDataSource
  implements ConcordiumCustomDatasource<K, M>
{
  @IsString()
  kind: K;
  @Type(() => CustomMapping)
  @ValidateNested()
  mapping: M;
  @IsOptional()
  @IsInt()
  startBlock?: number;
  @Type(() => FileReferenceImpl)
  @ValidateNested({each: true})
  assets: Map<string, CustomDataSourceAsset>;
  @Type(() => ProcessorImpl)
  @IsObject()
  processor: Processor<O>;
}
