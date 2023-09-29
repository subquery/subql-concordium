// Copyright 2020-2023 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: GPL-3.0

import { EventEmitterModule } from '@nestjs/event-emitter';
import { Test } from '@nestjs/testing';
import {
  ConnectionPoolService,
  ConnectionPoolStateManager,
  NodeConfig,
} from '@subql/node-core';
import { GraphQLSchema } from 'graphql';
import { SubqueryProject } from '../configure/SubqueryProject';
import { ConcordiumApi } from './api.concordium';
import { ConcordiumApiService } from './api.service.concordium';

const NETWORK_ENDPOINT = 'node.testnet.concordium.com:20000';

export function testSubqueryProject(endpoint: string): SubqueryProject {
  return {
    network: {
      endpoint: [endpoint],
      chainId:
        '4221332d34e1694168c2a0c0b3fd0f273809612cb13d000d5c2e00e85f50f796',
    },
    dataSources: [],
    id: 'test',
    root: './',
    schema: new GraphQLSchema({}),
    templates: [],
  } as unknown as SubqueryProject;
}

export const prepareApiService = async (
  endpoint: string = NETWORK_ENDPOINT,
  project?: SubqueryProject,
): Promise<ConcordiumApiService> => {
  const module = await Test.createTestingModule({
    providers: [
      ConnectionPoolService,
      ConnectionPoolStateManager,
      {
        provide: NodeConfig,
        useFactory: () => ({}),
      },
      {
        provide: 'ISubqueryProject',
        useFactory: () => project ?? testSubqueryProject(endpoint),
      },
      ConcordiumApiService,
    ],
    imports: [EventEmitterModule.forRoot()],
  }).compile();

  const apiService = module.get(ConcordiumApiService);
  await apiService.init();
  return apiService;
};

describe('ConcordiumApiService', () => {
  let apiService: ConcordiumApiService;

  beforeEach(async () => {
    apiService = await prepareApiService();
  });

  it('should instantiate api', () => {
    expect(apiService.api).toBeInstanceOf(ConcordiumApi);
  });

  it('should fetch block batches', async () => {
    const batch = [0, 1, 2];
    const blocks = await apiService.fetchBlocks(batch);
    expect(blocks).toBeInstanceOf(Array);
  });

  it('should throw error when chainId does not match', async () => {
    const faultyProject = {
      ...testSubqueryProject(NETWORK_ENDPOINT),
      network: {
        ...testSubqueryProject(NETWORK_ENDPOINT).network,
        chainId: 'Incorrect ChainId',
      },
    };

    await expect(
      prepareApiService(
        NETWORK_ENDPOINT,
        faultyProject as unknown as SubqueryProject,
      ),
    ).rejects.toThrow();
  });

  it('fails after maximum retries', async () => {
    const api = apiService.unsafeApi;

    // Mock the fetchBlocks method to always throw an error
    (api as any).fetchBlocks = jest
      .fn()
      .mockRejectedValue(new Error('Network error'));

    await expect((api as any).fetchBlocks([0, 1, 2])).rejects.toThrow();
  });

  it('should return a proxy object with safeApi method and handle retry attempts', async () => {
    const height = 1;
    const hash = '0x1';
    const api = apiService.getSafeApi(height, hash);
    const testError = { code: 'NETWORK_ERROR', message: 'Network error' };

    const spy = jest.spyOn(apiService.unsafeApi, 'getSafeApi');

    spy.mockImplementation(() => {
      throw testError;
    });

    try {
      await api.getBlockInfo();
    } catch (error) {
      // The method should have been called maxRetries + 1 times (5 retries + initial call)
      expect(spy).toHaveBeenCalledTimes(6);
      // The error thrown should be the last error we simulated
      expect(error).toEqual(testError);
    }

    spy.mockRestore();
  });
});
