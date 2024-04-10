// Copyright 2020-2024 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: GPL-3.0

import * as v1 from '@concordium/common-sdk/lib/types';
import {
  AccountAddress,
  ConcordiumGRPCClient,
  HexString,
  BlockItemStatus,
  ModuleReference,
  Base58String,
  BlockItemSummary,
} from '@concordium/node-sdk';
import { GrpcTransport } from '@protobuf-ts/grpc-transport';
import { getLogger } from '@subql/node-core';

export default class SafeConcordiumGRPCClient extends ConcordiumGRPCClient {
  constructor(
    private transport: GrpcTransport,
    private blockHeight: number,
    private blockHash: string,
  ) {
    super(transport);
  }

  //eslint-disable-next-line @typescript-eslint/require-await
  async getNextAccountNonce(
    accountAddress: AccountAddress,
  ): Promise<v1.NextAccountNonce> {
    throw new Error('Method `getNextAccountNonce` not supported.');
  }

  async getCryptographicParameters(): Promise<v1.CryptographicParameters> {
    return super.getCryptographicParameters(this.blockHash);
  }

  async getAccountInfo(
    accountIdentifier: v1.AccountIdentifierInput,
  ): Promise<v1.AccountInfo> {
    return super.getAccountInfo(accountIdentifier, this.blockHash);
  }

  //eslint-disable-next-line @typescript-eslint/require-await
  async getBlockItemStatus(
    transactionHash: HexString,
  ): Promise<BlockItemStatus> {
    throw new Error('Method `getBlockItemStatus` not supported.');
  }

  //eslint-disable-next-line @typescript-eslint/require-await
  async getConsensusStatus(): Promise<v1.ConsensusStatus> {
    throw new Error('Method `getConsensusStatus` not supported.');
  }

  async getModuleSource(
    moduleRef: ModuleReference,
  ): Promise<v1.VersionedModuleSource> {
    return super.getModuleSource(moduleRef, this.blockHash);
  }

  async getInstanceInfo(
    contractAddress: v1.ContractAddress,
  ): Promise<v1.InstanceInfo> {
    return super.getInstanceInfo(contractAddress, this.blockHash);
  }

  async invokeContract(
    context: v1.ContractContext,
  ): Promise<v1.InvokeContractResult> {
    return super.invokeContract(context, this.blockHash);
  }

  //eslint-disable-next-line @typescript-eslint/require-await
  async sendAccountTransaction(
    transaction: v1.AccountTransaction,
    signature: v1.AccountTransactionSignature,
  ): Promise<HexString> {
    throw new Error('Method `sendAccountTransaction` not supported.');
  }

  //eslint-disable-next-line @typescript-eslint/require-await
  async sendCredentialDeploymentTransaction(
    credentialDeploymentTransaction: v1.CredentialDeploymentTransaction,
    signatures: string[],
  ): Promise<HexString> {
    throw new Error(
      'Method `sendCredentialDeploymentTransaction` not supported.',
    );
  }

  async getBlockChainParameters(): Promise<v1.ChainParameters> {
    return super.getBlockChainParameters(this.blockHash);
  }

  async getPoolInfo(bakerId: v1.BakerId): Promise<v1.BakerPoolStatus> {
    return super.getPoolInfo(bakerId, this.blockHash);
  }

  async getPassiveDelegationInfo(): Promise<v1.PassiveDelegationStatus> {
    return super.getPassiveDelegationInfo(this.blockHash);
  }

  async getTokenomicsInfo(): Promise<v1.TokenomicsInfo> {
    return super.getTokenomicsInfo(this.blockHash);
  }

  //eslint-disable-next-line @typescript-eslint/require-await
  getFinalizedBlocks(
    abortSignal?: AbortSignal,
  ): AsyncIterable<v1.FinalizedBlockInfo> {
    throw new Error('Method `getFinalizedBlocks` not supported.');
  }

  //eslint-disable-next-line @typescript-eslint/require-await
  getBlocks(abortSignal?: AbortSignal): AsyncIterable<v1.ArrivedBlockInfo> {
    throw new Error('Method `getBlocks` not supported.');
  }

  //eslint-disable-next-line @typescript-eslint/require-await
  async waitForTransactionFinalization(
    transactionHash: HexString,
    timeoutTime?: number,
  ): Promise<v1.BlockItemSummaryInBlock> {
    throw new Error('Method `getBlocks` not supported.');
  }

  getAccountList(
    blockHash?: string,
    abortSignal?: AbortSignal,
  ): AsyncIterable<Base58String> {
    return super.getAccountList(this.blockHash, abortSignal);
  }

  getModuleList(
    blockHash?: HexString,
    abortSignal?: AbortSignal,
  ): AsyncIterable<HexString> {
    return super.getModuleList(this.blockHash, abortSignal);
  }

  getAncestors(
    maxAmountOfAncestors: bigint,
    blockHash?: HexString,
    abortSignal?: AbortSignal,
  ): AsyncIterable<HexString> {
    return super.getAncestors(
      maxAmountOfAncestors,
      this.blockHash,
      abortSignal,
    );
  }

  getInstanceState(
    contractAddress: v1.ContractAddress,
    blockHash?: HexString,
    abortSignal?: AbortSignal,
  ): AsyncIterable<v1.InstanceStateKVPair> {
    return super.getInstanceState(contractAddress, this.blockHash, abortSignal);
  }

  async instanceStateLookup(
    contractAddress: v1.ContractAddress,
    key: HexString,
  ): Promise<HexString> {
    return super.instanceStateLookup(contractAddress, key, this.blockHash);
  }

  getIdentityProviders(
    blockHash?: HexString,
    abortSignal?: AbortSignal,
  ): AsyncIterable<v1.IpInfo> {
    return super.getIdentityProviders(this.blockHash, abortSignal);
  }

  getAnonymityRevokers(
    blockHash?: HexString,
    abortSignal?: AbortSignal,
  ): AsyncIterable<v1.ArInfo> {
    return this.getAnonymityRevokers(this.blockHash, abortSignal);
  }

  async getBlocksAtHeight(): Promise<HexString[]> {
    return super.getBlocksAtHeight(BigInt(this.blockHeight));
  }

  async getBlockInfo(): Promise<v1.BlockInfo> {
    return super.getBlockInfo(this.blockHash);
  }

  getBakerList(
    blockHash?: HexString,
    abortSignal?: AbortSignal,
  ): AsyncIterable<v1.BakerId> {
    return super.getBakerList(this.blockHash, abortSignal);
  }

  getPoolDelegators(
    baker: v1.BakerId,
    blockHash?: HexString,
    abortSignal?: AbortSignal,
  ): AsyncIterable<v1.DelegatorInfo> {
    return super.getPoolDelegators(baker, this.blockHash, abortSignal);
  }

  getPoolDelegatorsRewardPeriod(
    baker: v1.BakerId,
    blockHash?: HexString,
    abortSignal?: AbortSignal,
  ): AsyncIterable<v1.DelegatorRewardPeriodInfo> {
    return super.getPoolDelegatorsRewardPeriod(
      baker,
      this.blockHash,
      abortSignal,
    );
  }

  getPassiveDelegators(
    blockHash?: HexString,
    abortSignal?: AbortSignal,
  ): AsyncIterable<v1.DelegatorInfo> {
    return super.getPassiveDelegators(this.blockHash, abortSignal);
  }

  getPassiveDelegatorsRewardPeriod(
    blockHash?: HexString,
    abortSignal?: AbortSignal,
  ): AsyncIterable<v1.DelegatorRewardPeriodInfo> {
    return super.getPassiveDelegatorsRewardPeriod(this.blockHash, abortSignal);
  }

  //eslint-disable-next-line @typescript-eslint/require-await
  async getBranches(): Promise<v1.Branch> {
    throw new Error('Method `getBranches` not supported.');
  }

  async getElectionInfo(): Promise<v1.ElectionInfo> {
    return super.getElectionInfo(this.blockHash);
  }

  //eslint-disable-next-line @typescript-eslint/require-await
  getAccountNonFinalizedTransactions(
    accountAddress: AccountAddress,
    abortSignal?: AbortSignal,
  ): AsyncIterable<HexString> {
    throw new Error(
      'Method `getAccountNonFinalizedTransactions` not supported.',
    );
  }

  getBlockTransactionEvents(
    blockHash?: HexString,
    abortSignal?: AbortSignal,
  ): AsyncIterable<BlockItemSummary> {
    return super.getBlockTransactionEvents(this.blockHash, abortSignal);
  }

  async getNextUpdateSequenceNumbers(): Promise<v1.NextUpdateSequenceNumbers> {
    return super.getNextUpdateSequenceNumbers(this.blockHash);
  }

  //eslint-disable-next-line @typescript-eslint/require-await
  async shutdown(): Promise<void> {
    throw new Error('Method `shutdown` not supported.');
  }

  //eslint-disable-next-line @typescript-eslint/require-await
  async peerConnect(ip: v1.IpAddressString, port: number): Promise<void> {
    throw new Error('Method `peerConnect` not supported.');
  }

  //eslint-disable-next-line @typescript-eslint/require-await
  async peerDisconnect(ip: v1.IpAddressString, port: number): Promise<void> {
    throw new Error('Method `peerDisconnect` not supported.');
  }

  //eslint-disable-next-line @typescript-eslint/require-await
  async getBannedPeers(): Promise<v1.IpAddressString[]> {
    throw new Error('Method `getBannedPeers` not supported.');
  }

  //eslint-disable-next-line @typescript-eslint/require-await
  async banPeer(ip: v1.IpAddressString): Promise<void> {
    throw new Error('Method `banPeer` not supported.');
  }

  //eslint-disable-next-line @typescript-eslint/require-await
  async unbanPeer(ip: v1.IpAddressString): Promise<void> {
    throw new Error('Method `unbanPeer` not supported.');
  }

  //eslint-disable-next-line @typescript-eslint/require-await
  async dumpStart(filePath: string, raw: boolean): Promise<void> {
    throw new Error('Method `dumpStart` not supported.');
  }

  //eslint-disable-next-line @typescript-eslint/require-await
  async dumpStop(): Promise<void> {
    throw new Error('Method `dumpStop` not supported.');
  }

  //eslint-disable-next-line @typescript-eslint/require-await
  async getNodeInfo(): Promise<v1.NodeInfo> {
    throw new Error('Method `getNodeInfo` not supported.');
  }

  //eslint-disable-next-line @typescript-eslint/require-await
  async getPeersInfo(): Promise<v1.PeerInfo[]> {
    throw new Error('Method `getPeerInfo` not supported.');
  }

  getBlockSpecialEvents(
    blockHash?: HexString,
    abortSignal?: AbortSignal,
  ): AsyncIterable<v1.BlockSpecialEvent> {
    return super.getBlockSpecialEvents(this.blockHash, abortSignal);
  }

  getBlockPendingUpdates(
    blockHash?: HexString,
    abortSignal?: AbortSignal,
  ): AsyncIterable<v1.PendingUpdate> {
    return super.getBlockPendingUpdates(this.blockHash, abortSignal);
  }

  async getBlockFinalizationSummary(): Promise<v1.BlockFinalizationSummary> {
    return super.getBlockFinalizationSummary(this.blockHash);
  }

  //eslint-disable-next-line @typescript-eslint/require-await
  getFinalizedBlocksFrom(
    startHeight: v1.AbsoluteBlocksAtHeightRequest = BigInt(0),
    end?: AbortSignal | v1.AbsoluteBlocksAtHeightRequest,
  ): AsyncIterable<v1.FinalizedBlockInfo> {
    throw new Error('Method `getFinalizedBlocksFrom` not supported.');
  }

  //eslint-disable-next-line @typescript-eslint/require-await
  async findEarliestFinalized<R>(
    predicate: (bi: v1.FinalizedBlockInfo) => Promise<R | undefined>,
    from: v1.AbsoluteBlocksAtHeightRequest = BigInt(0),
    to?: v1.AbsoluteBlocksAtHeightRequest,
  ): Promise<R | undefined> {
    throw new Error('Method `findEarliestFinalized` not supported.');
  }

  //eslint-disable-next-line @typescript-eslint/require-await
  async findInstanceCreation(
    address: v1.ContractAddress,
    from?: v1.AbsoluteBlocksAtHeightRequest,
    to?: v1.AbsoluteBlocksAtHeightRequest,
  ): Promise<any> {
    throw new Error('Method `findInstanceCreation` not supported.');
  }

  //eslint-disable-next-line @typescript-eslint/require-await
  async findFirstFinalizedBlockNoLaterThan(
    time: Date,
    from?: v1.AbsoluteBlocksAtHeightRequest,
    to?: v1.AbsoluteBlocksAtHeightRequest,
  ): Promise<v1.BlockInfo | undefined> {
    throw new Error(
      'Method `findFirstFinalizedBlockNoLaterThan` not supported.',
    );
  }
}
