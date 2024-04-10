// Copyright 2020-2024 SubQuery Pte Ltd authors & contributors
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

const NETWORK_ENDPOINT = 'http://node.testnet.concordium.com:20000';

function testSubqueryProject(endpoint: string): SubqueryProject {
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

const prepareApiService = async (
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
    const hash =
      '558218c8ed4cf4fa452df8c9bc282fd9d0f9f7eb95331a12fa259569854a9dda';
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
      //eslint-disable-next-line jest/no-conditional-expect
      expect(spy).toHaveBeenCalledTimes(6);
      // The error thrown should be the last error we simulated
      //eslint-disable-next-line jest/no-conditional-expect
      expect(error).toEqual(testError);
    }

    spy.mockRestore();
  });
});
