// Copyright 2020-2023 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: GPL-3.0

import {ConcordiumProjectManifestVersioned, VersionedProjectManifest} from './versioned';

export function parseConcordiumProjectManifest(raw: unknown): ConcordiumProjectManifestVersioned {
  const projectManifest = new ConcordiumProjectManifestVersioned(raw as VersionedProjectManifest);
  projectManifest.validate();
  return projectManifest;
}
