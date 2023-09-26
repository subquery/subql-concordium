// Copyright 2020-2023 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: GPL-3.0

import {
  AccountTransferredEvent,
  BlockInfo,
  ConcordiumGRPCClient,
  TransactionEvent,
  TransactionKindString,
  TransactionSummaryType,
  streamToList,
} from '@concordium/node-sdk';
import { ChannelCredentials } from '@grpc/grpc-js';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { GrpcTransport, GrpcOptions } from '@protobuf-ts/grpc-transport';
import { getLogger } from '@subql/node-core';
import {
  ApiWrapper,
  ConcordiumBlock,
  ConcordiumBlockWrapper,
  ConcordiumSpecialEvent,
  ConcordiumTransaction,
  ConcordiumTransactionEvent,
} from '@subql/types-concordium';
import { flatMap, cloneDeep } from 'lodash';
import { ConcordiumBlockWrapped } from './block.concordium';
import SafeConcordiumGRPCClient from './safe-api';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const { version: packageVersion } = require('../../package.json');

const logger = getLogger('api.concordium');

export class ConcordiumApi implements ApiWrapper<ConcordiumBlockWrapper> {
  private client: ConcordiumGRPCClient;
  private transport: GrpcTransport;
  private genesisBlock: BlockInfo;
  private chainId: string;
  private name: string;

  constructor(private endpoint: string, private eventEmitter: EventEmitter2) {
    const options: GrpcOptions = {
      host: this.endpoint,
      channelCredentials: ChannelCredentials.createInsecure(),
      meta: {
        'User-Agent': `Subquery-Node ${packageVersion}`,
      },
    };

    this.transport = new GrpcTransport(options);

    this.client = new ConcordiumGRPCClient(this.transport);
  }

  async init(): Promise<void> {
    const genesisBlock = await this.client
      .getBlocksAtHeight(BigInt(0))
      .then((hashes) => {
        return this.client.getBlockInfo(hashes[0]);
      });

    this.genesisBlock = genesisBlock;
    this.chainId = genesisBlock.blockHash;
  }

  async getFinalizedBlock(): Promise<BlockInfo> {
    return this.client.getBlockInfo();
  }

  async getFinalizedBlockHeight(): Promise<bigint> {
    return (await this.getFinalizedBlock()).blockHeight;
  }

  async getBestBlockHeight(): Promise<bigint> {
    return (await this.client.getBlockInfo()).blockHeight;
  }

  getRuntimeChain(): string {
    return this.name;
  }

  getChainId(): string {
    return this.chainId;
  }

  getGenesisHash(): string {
    return this.genesisBlock.blockHash;
  }

  getSpecName(): string {
    return 'concordium';
  }

  async getBlockByHash(hash: string): Promise<BlockInfo> {
    return this.client.getBlockInfo(hash);
  }

  async getAndWrapSpecialEvents(
    blockHash: string,
  ): Promise<ConcordiumSpecialEvent[]> {
    const events = await streamToList(
      this.client.getBlockSpecialEvents(blockHash),
    );
    return events.map((evt) => {
      return {
        ...evt,
        block: null,
      } as ConcordiumSpecialEvent;
    });
  }

  /* eslint-disable complexity */
  wrapTransactionEvents(
    tx: ConcordiumTransaction,
  ): ConcordiumTransactionEvent[] {
    if (tx.type !== TransactionSummaryType.AccountTransaction) {
      return []; //other tx types doesn't seem to contain events;
    }

    const events: (TransactionEvent | AccountTransferredEvent)[] = [];

    switch (tx.transactionType) {
      case TransactionKindString.Transfer: {
        events.push(tx.transfer);
        break;
      }
      case TransactionKindString.TransferWithMemo: {
        events.push(tx.transfer);
        events.push(tx.memo);
        break;
      }
      case TransactionKindString.TransferWithSchedule: {
        events.push(tx.event);
        break;
      }
      case TransactionKindString.TransferWithScheduleAndMemo: {
        events.push(tx.transfer);
        events.push(tx.memo);
        break;
      }
      case TransactionKindString.EncryptedAmountTransfer: {
        events.push(tx.removed);
        events.push(tx.added);
        break;
      }
      case TransactionKindString.EncryptedAmountTransferWithMemo: {
        events.push(tx.removed);
        events.push(tx.added);
        events.push(tx.memo);
        break;
      }
      case TransactionKindString.DeployModule: {
        events.push(tx.moduleDeployed);
        break;
      }
      case TransactionKindString.InitContract: {
        events.push(tx.contractInitialized);
        break;
      }
      case TransactionKindString.Update: {
        events.push(...tx.events);
        break;
      }
      case TransactionKindString.RegisterData: {
        events.push(tx.dataRegistered);
        break;
      }
      case TransactionKindString.TransferToPublic: {
        events.push(tx.removed);
        events.push(tx.added);
        break;
      }
      case TransactionKindString.TransferToEncrypted: {
        events.push(tx.added);
        break;
      }
      case TransactionKindString.AddBaker: {
        events.push(tx.bakerAdded);
        break;
      }
      case TransactionKindString.RemoveBaker: {
        events.push(tx.bakerRemoved);
        break;
      }
      case TransactionKindString.UpdateBakerKeys: {
        events.push(tx.bakerKeysUpdated);
        break;
      }
      case TransactionKindString.UpdateBakerStake: {
        events.push(tx.bakerStakeChanged);
        break;
      }
      case TransactionKindString.UpdateBakerRestakeEarnings: {
        events.push(tx.bakerRestakeEarningsUpdated);
        break;
      }
      case TransactionKindString.ConfigureBaker: {
        events.push(...tx.events);
        break;
      }
      case TransactionKindString.ConfigureDelegation: {
        events.push(...tx.events);
        break;
      }
      case TransactionKindString.UpdateCredentialKeys: {
        events.push(tx.keysUpdated);
        break;
      }
      case TransactionKindString.UpdateCredentials: {
        events.push(tx.credentialsUpdated);
        break;
      }
      default:
    }

    return events.map((evt) => {
      return {
        ...evt,
        block: null,
        transaction: tx,
      } as ConcordiumTransactionEvent;
    });
  }
  /* eslint-enable complexity */

  async getAndWrapTransactions(
    blockHash: string,
  ): Promise<ConcordiumTransaction[]> {
    const transactions = await streamToList(
      this.client.getBlockTransactionEvents(blockHash),
    );
    return transactions.map((tx) => {
      return {
        ...tx,
        block: null,
      } as ConcordiumTransaction;
    });
  }

  async getAndWrapBlock(height: number): Promise<ConcordiumBlock> {
    const blockHash = (await this.client.getBlocksAtHeight(BigInt(height)))[0]; //there is only one finalized block per height
    const blockInfo = await this.getBlockByHash(blockHash);
    const wrappedBlock: ConcordiumBlock = {
      ...blockInfo,
      finalizationSummary: await this.client.getBlockFinalizationSummary(
        blockInfo.blockHash,
      ),
      transactions: await this.getAndWrapTransactions(blockInfo.blockHash),
      transactionEvents: null,
      specialEvents: await this.getAndWrapSpecialEvents(blockInfo.blockHash),
    };

    wrappedBlock.transactionEvents = flatMap(
      wrappedBlock.transactions.map((tx) => this.wrapTransactionEvents(tx)),
    );

    return wrappedBlock;
  }

  async fetchBlock(height: number): Promise<ConcordiumBlockWrapped> {
    const block = await this.getAndWrapBlock(height);
    const ret = new ConcordiumBlockWrapped(
      block,
      block.transactions,
      block.transactionEvents,
      block.specialEvents,
    );
    this.eventEmitter.emit('fetchBlock');
    return ret;
  }

  async fetchBlocks(bufferBlocks: number[]): Promise<ConcordiumBlockWrapper[]> {
    return Promise.all(bufferBlocks.map(async (num) => this.fetchBlock(num)));
  }

  get api(): ConcordiumGRPCClient {
    return this.client;
  }

  async getSafeApi(blockHeight: number): Promise<SafeConcordiumGRPCClient> {
    return new SafeConcordiumGRPCClient(
      this.transport,
      blockHeight,
      (await this.api.getBlocksAtHeight(BigInt(blockHeight)))[0],
    );
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  async connect(): Promise<void> {
    logger.error('Concordium API connect is not implemented');
    throw new Error('Not implemented');
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  async disconnect(): Promise<void> {
    return Promise.resolve();
  }
}
