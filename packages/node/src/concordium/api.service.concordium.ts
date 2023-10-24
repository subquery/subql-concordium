// Copyright 2020-2023 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: GPL-3.0

import { Inject, Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ConcordiumProjectNetworkConfig } from '@subql/common-concordium';
import {
  ApiService,
  ConnectionPoolService,
  getLogger,
  NodeConfig,
} from '@subql/node-core';
import { ConcordiumBlock } from '@subql/types-concordium';
import { SubqueryProject } from '../configure/SubqueryProject';
import { ConcordiumApi } from './api.concordium';
import { ConcordiumApiConnection } from './api.connection';
import SafeConcordiumGRPCClient from './safe-api';

const logger = getLogger('api');

@Injectable()
export class ConcordiumApiService extends ApiService<
  ConcordiumApi,
  SafeConcordiumGRPCClient,
  ConcordiumBlock[]
> {
  constructor(
    @Inject('ISubqueryProject') private project: SubqueryProject,
    connectionPoolService: ConnectionPoolService<ConcordiumApiConnection>,
    eventEmitter: EventEmitter2,
    private nodeConfig: NodeConfig,
  ) {
    super(connectionPoolService, eventEmitter);
  }

  async init(): Promise<ConcordiumApiService> {
    let network;
    try {
      network = this.project.network;

      if (this.nodeConfig.primaryNetworkEndpoint) {
        network.endpoint.push(this.nodeConfig.primaryNetworkEndpoint);
      }
    } catch (e) {
      logger.error(Object.keys(e));
      process.exit(1);
    }

    await this.createConnections(
      network,
      (endpoint) =>
        ConcordiumApiConnection.create(
          endpoint,
          this.fetchBlockBatches,
          this.eventEmitter,
        ),
      //eslint-disable-next-line @typescript-eslint/require-await
      async (connection: ConcordiumApiConnection) => {
        const api = connection.unsafeApi;
        return api.getChainId();
      },
    );

    return this;
  }

  get api(): ConcordiumApi {
    return this.unsafeApi;
  }

  getSafeApi(height: number, hash: string): SafeConcordiumGRPCClient {
    const maxRetries = 5;

    const retryErrorCodes = [
      'UNKNOWN_ERROR',
      'NETWORK_ERROR',
      'SERVER_ERROR',
      'TIMEOUT',
      'BAD_DATA',
      'CANCELLED',
    ];

    const handler: ProxyHandler<SafeConcordiumGRPCClient> = {
      get: (target, prop, receiver) => {
        const originalMethod = target[prop as keyof SafeConcordiumGRPCClient];
        if (typeof originalMethod === 'function') {
          return async (...args: any[]) => {
            let retries = 0;
            let currentApi = target;
            let throwingError: Error;

            while (retries < maxRetries) {
              try {
                return await originalMethod.apply(currentApi, args);
              } catch (error: any) {
                // other than retryErrorCodes, other errors does not have anything to do with network request, retrying would not change its outcome
                if (!retryErrorCodes.includes(error?.code)) {
                  throw error;
                }

                logger.warn(
                  `Request failed with api at height ${height} (retry ${retries}): ${error.message}`,
                );
                throwingError = error;
                currentApi = this.unsafeApi.getSafeApi(height, hash);
                retries++;
              }
            }

            logger.error(
              `Maximum retries (${maxRetries}) exceeded for api at height ${height}`,
            );
            throw throwingError;
          };
        }
        return Reflect.get(target, prop, receiver);
      },
    };

    return new Proxy(this.unsafeApi.getSafeApi(height, hash), handler);
  }

  private async fetchBlockBatches(
    api: ConcordiumApi,
    batch: number[],
  ): Promise<ConcordiumBlock[]> {
    return api.fetchBlocks(batch);
  }
}
