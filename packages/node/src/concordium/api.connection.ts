// Copyright 2020-2023 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: GPL-3.0

import { EventEmitter2 } from '@nestjs/event-emitter';
import {
  ApiConnectionError,
  ApiErrorType,
  DisconnectionError,
  NetworkMetadataPayload,
  RateLimitError,
  TimeoutError,
  IApiConnectionSpecific,
} from '@subql/node-core';
import { ConcordiumBlock } from '@subql/types-concordium';
import { ConcordiumApi } from './api.concordium';
import SafeConcordiumGRPCClient from './safe-api';

type FetchFunc = (
  api: ConcordiumApi,
  batch: number[],
) => Promise<ConcordiumBlock[]>;

export class ConcordiumApiConnection
  implements
    IApiConnectionSpecific<
      ConcordiumApi,
      SafeConcordiumGRPCClient,
      ConcordiumBlock[]
    >
{
  readonly networkMeta: NetworkMetadataPayload;

  constructor(
    public unsafeApi: ConcordiumApi,
    private fetchBlocksBatches: FetchFunc,
  ) {
    this.networkMeta = {
      chain: unsafeApi.getChainId().toString(),
      specName: unsafeApi.getSpecName(),
      genesisHash: unsafeApi.getGenesisHash(),
    };
  }

  static async create(
    endpoint: string,
    fetchBlockBatches: FetchFunc,
    eventEmitter: EventEmitter2,
  ): Promise<ConcordiumApiConnection> {
    const api = new ConcordiumApi(endpoint, eventEmitter);

    await api.init();

    return new ConcordiumApiConnection(api, fetchBlockBatches);
  }

  safeApi(height: number): SafeConcordiumGRPCClient {
    throw new Error(`Not Implemented`);
  }

  async apiConnect(): Promise<void> {
    await this.unsafeApi.connect();
  }

  async apiDisconnect(): Promise<void> {
    await this.unsafeApi.disconnect();
  }

  async fetchBlocks(heights: number[]): Promise<ConcordiumBlock[]> {
    const blocks = await this.fetchBlocksBatches(this.unsafeApi, heights);
    return blocks;
  }

  handleError = ConcordiumApiConnection.handleError;

  static handleError(e: Error): ApiConnectionError {
    let formatted_error: ApiConnectionError;
    if (e.message.toLowerCase().includes(`timeout`)) {
      formatted_error = new TimeoutError(e);
    } else if (e.message.toLowerCase().includes(`disconnected`)) {
      formatted_error = new DisconnectionError(e);
    } else if (e.message.toLowerCase().includes(`ratelimit`)) {
      formatted_error = new RateLimitError(e);
    } else {
      formatted_error = new ApiConnectionError(
        e.name,
        e.message,
        ApiErrorType.Default,
      );
    }
    return formatted_error;
  }
}
