// Copyright 2020-2023 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: GPL-3.0

import { Inject, Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { NETWORK_FAMILY } from '@subql/common';
import {
  NodeConfig,
  DictionaryService as CoreDictionaryService,
} from '@subql/node-core';
import { SubqueryProject } from '../configure/SubqueryProject';

@Injectable()
export class DictionaryService extends CoreDictionaryService {
  private constructor(
    @Inject('ISubqueryProject') protected project: SubqueryProject,
    nodeConfig: NodeConfig,
    eventEmitter: EventEmitter2,
    dictionaryUrl?: string,
  ) {
    super(dictionaryUrl, project.network.chainId, nodeConfig, eventEmitter);
  }

  static async create(
    project: SubqueryProject,
    nodeConfig: NodeConfig,
    eventEmitter: EventEmitter2,
  ): Promise<DictionaryService> {
    let url =
      project.network.dictionary ??
      (await CoreDictionaryService.resolveDictionary(
        NETWORK_FAMILY.concordium,
        project.network.chainId,
        nodeConfig.dictionaryRegistry,
      ));
    if (Array.isArray(url)) {
      url = url[0];
    }

    return new DictionaryService(project, nodeConfig, eventEmitter, url);
  }
}
