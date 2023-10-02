// Copyright 2020-2023 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: GPL-3.0

import { Injectable } from '@nestjs/common';
import {
  Header,
  HostUnfinalizedBlocks,
  IUnfinalizedBlocksService,
} from '@subql/node-core';
import { ConcordiumBlock } from '@subql/types-concordium';

@Injectable()
export class WorkerUnfinalizedBlocksService
  implements IUnfinalizedBlocksService<ConcordiumBlock>
{
  constructor(private host: HostUnfinalizedBlocks) {}

  async processUnfinalizedBlockHeader(header: Header): Promise<number | null> {
    return this.host.unfinalizedBlocksProcess(header);
  }

  async processUnfinalizedBlocks({
    blockHash,
    blockHeight,
    blockParent,
  }: ConcordiumBlock): Promise<number | null> {
    return this.host.unfinalizedBlocksProcess({
      blockHash,
      blockHeight: Number(blockHeight),
      parentHash: blockParent,
    });
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
