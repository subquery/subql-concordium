// Copyright 2020-2023 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: GPL-3.0

import {TransactionEventTag, TransactionSummaryType} from '@concordium/node-sdk';
import {
  ConcordiumHandlerKind,
  ConcordiumDatasourceKind,
  SubqlCustomHandler,
  SubqlMapping,
  SubqlHandler,
  SubqlRuntimeHandler,
  SubqlRuntimeDatasource,
  SubqlCustomDatasource,
  FileReference,
  CustomDataSourceAsset,
  ConcordiumBlockFilter,
  SubqlBlockHandler,
  ConcordiumTransactionFilter,
  ConcordiumTransactionEventFilter,
  ConcordiumSpecialEventFilter,
  SubqlTransactionHandler,
  SubqlTransactionEventHandler,
  SubqlSpecialEventHandler,
} from '@subql/types-concordium';
import {plainToClass, Transform, Type} from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsObject,
  ValidateNested,
  registerDecorator,
  ValidationOptions,
  ValidationArguments,
} from 'class-validator';
import {SubqlConcordiumDatasourceKind, SubqlConcordiumHandlerKind, SubqlConcordiumProcessorOptions} from './types';

export class BlockFilter implements ConcordiumBlockFilter {
  @IsOptional()
  @IsInt()
  modulo?: number;
  @IsOptional()
  @IsString()
  timestamp?: string;
}

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

export class SpecialEventFilter implements ConcordiumSpecialEventFilter {}

export function forbidNonWhitelisted(keys: any, validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      name: 'forbidNonWhitelisted',
      target: object.constructor,
      propertyName: propertyName,
      constraints: [],
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          const isValid = !Object.keys(value).some((key) => !(key in keys));
          if (!isValid) {
            throw new Error(
              `Invalid keys present in value: ${JSON.stringify(value)}. Whitelisted keys: ${JSON.stringify(
                Object.keys(keys)
              )}`
            );
          }
          return isValid;
        },
      },
    });
  };
}

export class BlockHandler implements SubqlBlockHandler {
  @IsObject()
  @IsOptional()
  @Type(() => BlockFilter)
  filter?: BlockFilter;
  @IsEnum(SubqlConcordiumHandlerKind, {groups: [SubqlConcordiumHandlerKind.Block]})
  kind: ConcordiumHandlerKind.Block;
  @IsString()
  handler: string;
}

export class TransactionHandler implements SubqlTransactionHandler {
  @IsOptional()
  @ValidateNested()
  @Type(() => TransactionFilter)
  filter?: ConcordiumTransactionFilter;
  @IsEnum(SubqlConcordiumHandlerKind, {groups: [SubqlConcordiumHandlerKind.Transaction]})
  kind: ConcordiumHandlerKind.Transaction;
  @IsString()
  handler: string;
}

export class TransactionEventHandler implements SubqlTransactionEventHandler {
  @IsOptional()
  @ValidateNested()
  @Type(() => TransactionEventFilter)
  filter?: ConcordiumTransactionEventFilter;
  @IsEnum(SubqlConcordiumHandlerKind, {groups: [SubqlConcordiumHandlerKind.TransactionEvent]})
  kind: ConcordiumHandlerKind.TransactionEvent;
  @IsString()
  handler: string;
}

export class SpecialEventHandler implements SubqlSpecialEventHandler {
  @IsOptional()
  @ValidateNested()
  @Type(() => SpecialEventFilter)
  filter?: ConcordiumTransactionEventFilter;
  @IsEnum(SubqlConcordiumHandlerKind, {groups: [SubqlConcordiumHandlerKind.SpecialEvent]})
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
        case SubqlConcordiumHandlerKind.SpecialEvent:
          return plainToClass(SpecialEventHandler, handler);
        case SubqlConcordiumHandlerKind.TransactionEvent:
          return plainToClass(TransactionEventHandler, handler);
        case SubqlConcordiumHandlerKind.Transaction:
          return plainToClass(TransactionHandler, handler);
        case SubqlConcordiumHandlerKind.Block:
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

export class ConcordiumProcessorOptions implements SubqlConcordiumProcessorOptions {
  @IsOptional()
  @IsString()
  abi?: string;
  @IsOptional()
  @IsString()
  address?: string;
}

export class RuntimeDataSourceBase<M extends SubqlMapping<SubqlRuntimeHandler>> implements SubqlRuntimeDatasource<M> {
  @IsEnum(SubqlConcordiumDatasourceKind, {
    groups: [SubqlConcordiumDatasourceKind.Runtime],
  })
  kind: ConcordiumDatasourceKind.Runtime;
  @Type(() => ConcordiumMapping)
  @ValidateNested()
  mapping: M;
  @IsOptional()
  @IsInt()
  startBlock?: number;
  @IsOptional()
  assets?: Map<string, FileReference>;
  @IsOptional()
  @ValidateNested()
  @Type(() => ConcordiumProcessorOptions)
  options?: ConcordiumProcessorOptions;
}

export class FileReferenceImpl implements FileReference {
  @IsString()
  file: string;
}

export class CustomDataSourceBase<K extends string, M extends SubqlMapping = SubqlMapping<SubqlCustomHandler>>
  implements SubqlCustomDatasource<K, M>
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
  @Type(() => FileReferenceImpl)
  @IsObject()
  processor: FileReference;
  @IsOptional()
  @ValidateNested()
  options?: ConcordiumProcessorOptions;
}
