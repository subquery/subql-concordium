// Copyright 2020-2023 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: GPL-3.0

import { isMainThread } from 'worker_threads';
import { Injectable } from '@nestjs/common';
import {
  Header,
  HostUnfinalizedBlocks,
  IBlock,
  IUnfinalizedBlocksService,
} from '@subql/node-core';
import { ConcordiumBlock } from '@subql/types-concordium';

/**
 * @deprecated use node-core version once released https://github.com/subquery/subql/pull/2346 */
@Injectable()
export class WorkerUnfinalizedBlocksService
  implements IUnfinalizedBlocksService<ConcordiumBlock>
{
  constructor(private host: HostUnfinalizedBlocks) {
    if (isMainThread) {
      throw new Error('Expected to be worker thread');
    }
  }

  async processUnfinalizedBlockHeader(header: Header): Promise<number | null> {
    return this.host.unfinalizedBlocksProcess(header);
  }

  async processUnfinalizedBlocks(
    block: IBlock<ConcordiumBlock>,
  ): Promise<number | null> {
    return this.host.unfinalizedBlocksProcess(block.getHeader());
  }

  // eslint-disable-next-line @typescript-eslint/promise-function-async
  init(reindex: (targetHeight: number) => Promise<void>): Promise<number> {
    throw new Error('This method should not be called from a worker');
  }
  resetUnfinalizedBlocks(): void {
    throw new Error('This method should not be called from a worker');
  }
  resetLastFinalizedVerifiedHeight(): void {
    throw new Error('This method should not be called from a worker');
  }
  // eslint-disable-next-line @typescript-eslint/promise-function-async
  getMetadataUnfinalizedBlocks(): Promise<Header[]> {
    throw new Error('This method should not be called from a worker');
  }
}
