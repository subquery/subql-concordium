// Copyright 2020-2023 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: GPL-3.0

import { EventEmitter2 } from '@nestjs/event-emitter';
import { ConcordiumApi, ConcordiumApiService } from '../concordium';
import { ProjectService } from './project.service';

const mockApiService = (): ConcordiumApiService => {
  const api = new ConcordiumApi(
    'node.testnet.concordium.com:20000',
    new EventEmitter2(),
  );

  return {
    unsafeApi: api,
  } as any;
};

describe('ProjectService', () => {
  let projectService: ProjectService;

  beforeEach(() => {
    const apiService = mockApiService();

    projectService = new ProjectService(
      null,
      apiService,
      null,
      null,
      null,
      null,
      null,
      null,
      {} as any,
      null,
      null,
      null,
    );
  });

  it('can get a block timestamps', async () => {
    const timestamp = await (projectService as any).getBlockTimestamp(
      4_000_000,
    );

    expect(timestamp).toEqual(new Date('2023-08-30T18:36:29.979Z'));
  });
});
