// Copyright 2020-2024 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: GPL-3.0

import { Inject, Injectable } from '@nestjs/common';
import {
  ConcordiumRuntimeDataSourceImpl,
  isCustomDs,
  isRuntimeDs,
} from '@subql/common-concordium';
import {
  DatasourceParams,
  DynamicDsService as BaseDynamicDsService,
} from '@subql/node-core';
import { ConcordiumDatasource } from '@subql/types-concordium';
import { plainToClass } from 'class-transformer';
import { validateSync } from 'class-validator';
import { cloneDeep } from 'lodash';
import { SubqueryProject } from '../configure/SubqueryProject';
import { DsProcessorService } from './ds-processor.service';

@Injectable()
export class DynamicDsService extends BaseDynamicDsService<ConcordiumDatasource> {
  constructor(
    private readonly dsProcessorService: DsProcessorService,
    @Inject('ISubqueryProject') private readonly project: SubqueryProject,
  ) {
    super();
  }

  protected async getDatasource(
    params: DatasourceParams,
  ): Promise<ConcordiumDatasource> {
    const t = this.project.templates?.find(
      (t) => t.name === params.templateName,
    );

    if (!t) {
      throw new Error(
        `Unable to find matching template in project for name: "${params.templateName}"`,
      );
    }

    const { name, ...template } = cloneDeep(t);

    const dsObj = {
      ...template,
      startBlock: params.startBlock,
    } as ConcordiumDatasource;
    try {
      if (isCustomDs(dsObj)) {
        dsObj.processor.options = {
          ...dsObj.processor.options,
          ...params.args,
        };
        await this.dsProcessorService.validateCustomDs([dsObj]);
      } else if (isRuntimeDs(dsObj)) {
        const parsedDs = plainToClass(ConcordiumRuntimeDataSourceImpl, dsObj);

        const errors = validateSync(parsedDs, {
          whitelist: true,
          forbidNonWhitelisted: false,
        });
        if (errors.length) {
          throw new Error(
            `Dynamic ds is invalid\n${errors
              .map((e) => e.toString())
              .join('\n')}`,
          );
        }
      }
      return dsObj;
    } catch (e) {
      throw new Error(`Unable to create dynamic datasource.\n ${e.message}`);
    }
  }
}
