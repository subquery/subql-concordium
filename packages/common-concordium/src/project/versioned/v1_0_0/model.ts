// Copyright 2020-2023 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: GPL-3.0

import {
  FileType,
  ParentProjectModel,
  ProjectManifestBaseImpl,
  RunnerNodeImpl,
  RunnerQueryBaseModel,
  BaseDeploymentV1_0_0,
  CommonProjectNetworkV1_0_0,
} from '@subql/common';
import {
  SubqlCustomDatasource,
  SubqlMapping,
  SubqlRuntimeDatasource,
  RuntimeDatasourceTemplate,
  CustomDatasourceTemplate,
  ConcordiumProjectManifestV1_0_0,
} from '@subql/types-concordium';
import {BaseMapping, NodeSpec, ParentProject, QuerySpec, RunnerSpecs} from '@subql/types-core';
import {plainToClass, Transform, TransformFnParams, Type} from 'class-transformer';
import {
  Equals,
  IsArray,
  IsIn,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
  validateSync,
} from 'class-validator';
import {CustomDataSourceBase, ConcordiumMapping, RuntimeDataSourceBase} from '../../models';
import {SubqlConcordiumDataSource, SubqlRuntimeHandler} from '../../types';

const Concordium_NODE_NAME = `@subql/node-concordium`;
const Flare_NODE_NAME = `@subql/node-flare`;

export class ConcordiumProjectMapping extends ConcordiumMapping {
  @IsString()
  file: string;
}

export class ConcordiumRunnerNodeImpl extends RunnerNodeImpl {
  @IsIn([Concordium_NODE_NAME, Flare_NODE_NAME], {
    message: `Runner Substrate node name incorrect, suppose be '${Concordium_NODE_NAME}'`,
  })
  name: string;
}

function validateObject(object: any, errorMessage = 'failed to validate object.'): void {
  const errors = validateSync(object, {whitelist: true, forbidNonWhitelisted: true});
  if (errors?.length) {
    const errorMsgs = errors.map((e) => e.toString()).join('\n');
    throw new Error(`${errorMessage}\n${errorMsgs}`);
  }
}

export class ConcordiumRuntimeDataSourceImpl
  extends RuntimeDataSourceBase<SubqlMapping<SubqlRuntimeHandler>>
  implements SubqlRuntimeDatasource
{
  validate(): void {
    return validateObject(this, 'failed to validate runtime datasource.');
  }
}

export class ConcordiumCustomDataSourceImpl<K extends string = string, M extends BaseMapping<any> = BaseMapping<any>>
  extends CustomDataSourceBase<K, M>
  implements SubqlCustomDatasource<K, M>
{
  validate(): void {
    return validateObject(this, 'failed to validate custom datasource.');
  }
}

export class RuntimeDatasourceTemplateImpl
  extends ConcordiumRuntimeDataSourceImpl
  implements RuntimeDatasourceTemplate
{
  @IsString()
  name: string;
}

export class CustomDatasourceTemplateImpl extends ConcordiumCustomDataSourceImpl implements CustomDatasourceTemplate {
  @IsString()
  name: string;
}

export class ConcordiumRunnerSpecsImpl implements RunnerSpecs {
  @IsObject()
  @ValidateNested()
  @Type(() => ConcordiumRunnerNodeImpl)
  node: NodeSpec;
  @IsObject()
  @ValidateNested()
  @Type(() => RunnerQueryBaseModel)
  query: QuerySpec;
}

export class ProjectNetworkDeploymentV1_0_0 {
  @IsNotEmpty()
  @Transform(({value}: TransformFnParams) => value.trim())
  @IsString()
  chainId: string;

  @IsOptional()
  @IsArray()
  bypassBlocks?: (number | string)[];
}

export class ProjectNetworkV1_0_0 extends CommonProjectNetworkV1_0_0<FileType> {
  @ValidateNested()
  @Type(() => FileType)
  @IsOptional()
  chaintypes?: FileType;
}

export class DeploymentV1_0_0 extends BaseDeploymentV1_0_0 {
  @Transform((params) => {
    if (params.value.genesisHash && !params.value.chainId) {
      params.value.chainId = params.value.genesisHash;
    }
    return plainToClass(ProjectNetworkDeploymentV1_0_0, params.value);
  })
  @ValidateNested()
  @Type(() => ProjectNetworkDeploymentV1_0_0)
  network: ProjectNetworkDeploymentV1_0_0;
  @IsObject()
  @ValidateNested()
  @Type(() => ConcordiumRunnerSpecsImpl)
  runner: RunnerSpecs;
  @IsArray()
  @ValidateNested()
  @Type(() => ConcordiumCustomDataSourceImpl, {
    discriminator: {
      property: 'kind',
      subTypes: [{value: ConcordiumRuntimeDataSourceImpl, name: 'concordium/Runtime'}],
    },
    keepDiscriminatorProperty: true,
  })
  dataSources: (SubqlRuntimeDatasource | SubqlCustomDatasource)[];
  @IsOptional()
  @IsArray()
  @ValidateNested()
  @Type(() => CustomDatasourceTemplateImpl, {
    discriminator: {
      property: 'kind',
      subTypes: [{value: RuntimeDatasourceTemplateImpl, name: 'concordium/Runtime'}],
    },
    keepDiscriminatorProperty: true,
  })
  templates?: (RuntimeDatasourceTemplate | CustomDatasourceTemplate)[];
}

export class ProjectManifestV1_0_0Impl
  extends ProjectManifestBaseImpl<DeploymentV1_0_0>
  implements ConcordiumProjectManifestV1_0_0
{
  constructor() {
    super(DeploymentV1_0_0);
  }

  @Equals('1.0.0')
  specVersion: string;
  @Type(() => ConcordiumCustomDataSourceImpl, {
    discriminator: {
      property: 'kind',
      subTypes: [{value: ConcordiumRuntimeDataSourceImpl, name: 'concordium/Runtime'}],
    },
    keepDiscriminatorProperty: true,
  })
  dataSources: SubqlConcordiumDataSource[];
  @Type(() => ProjectNetworkV1_0_0)
  network: ProjectNetworkV1_0_0;
  @IsString()
  name: string;
  @IsString()
  version: string;
  @ValidateNested()
  @Type(() => FileType)
  schema: FileType;
  @IsOptional()
  @IsArray()
  @ValidateNested()
  @Type(() => CustomDatasourceTemplateImpl, {
    discriminator: {
      property: 'kind',
      subTypes: [{value: RuntimeDatasourceTemplateImpl, name: 'concordium/Runtime'}],
    },
    keepDiscriminatorProperty: true,
  })
  templates?: (RuntimeDatasourceTemplate | CustomDatasourceTemplate)[];
  @IsObject()
  @ValidateNested()
  @Type(() => ConcordiumRunnerSpecsImpl)
  runner: RunnerSpecs;

  @IsOptional()
  @IsObject()
  @Type(() => ParentProjectModel)
  parent?: ParentProject;
}
