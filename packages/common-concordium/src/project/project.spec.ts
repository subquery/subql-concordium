// Copyright 2020-2024 SubQuery Pte Ltd authors & contributors
// SPDX-License-Identifier: GPL-3.0

import fs from 'fs';
import path from 'path';
import {loadFromJsonOrYaml} from '@subql/common';
import {ConcordiumProjectManifestVersioned, VersionedProjectManifest} from './versioned';

const projectsDir = path.join(__dirname, '../../test');

function loadConcordiumProjectManifest(file: string): ConcordiumProjectManifestVersioned {
  let manifestPath = file;
  if (fs.existsSync(file) && fs.lstatSync(file).isDirectory()) {
    const yamlFilePath = path.join(file, 'project.yaml');
    const jsonFilePath = path.join(file, 'project.json');
    if (fs.existsSync(yamlFilePath)) {
      manifestPath = yamlFilePath;
    } else if (fs.existsSync(jsonFilePath)) {
      manifestPath = jsonFilePath;
    } else {
      throw new Error(`Could not find project manifest under dir ${file}`);
    }
  }

  const doc = loadFromJsonOrYaml(manifestPath);
  const projectManifest = new ConcordiumProjectManifestVersioned(doc as VersionedProjectManifest);
  projectManifest.validate();
  return projectManifest;
}

describe('project.yaml', () => {
  it('can validate a v1.0.0 project.yaml with templates', () => {
    expect(() => loadConcordiumProjectManifest(path.join(projectsDir, 'project_1.0.0.yaml'))).not.toThrow();
  });

  it('get v1.0.0 deployment mapping filter', () => {
    const manifestVersioned = loadConcordiumProjectManifest(path.join(projectsDir, 'project_1.0.0.yaml'));

    const deployment = manifestVersioned.asV1_0_0.deployment;
    const filter = deployment.dataSources[0].mapping.handlers[0].filter;
    const deploymentString = manifestVersioned.toDeployment();
    expect(filter).not.toBeNull();
    expect(deploymentString).toContain('accountTransaction');
  });

  it('can convert genesis hash in v1.0.0 to chainId in deployment', () => {
    const deployment = loadConcordiumProjectManifest(path.join(projectsDir, 'project_1.0.0.yaml')).asV1_0_0.deployment;
    expect(deployment.network.chainId).not.toBeNull();
    console.log(deployment.network.chainId);
  });
});
