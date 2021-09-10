/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the Source EULA. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

import * as should from 'should';
import * as sinon from 'sinon';
import * as testUtils from './testUtils';
import * as utils from '../common/utils';
import * as path from 'path';
import { TestContext, createContext } from './testContext';
import { AutorestHelper } from '../tools/autorestHelper';
import { promises as fs } from 'fs';

let testContext: TestContext;

describe('Publish profile tests', function (): void {
	beforeEach(function (): void {
		testContext = createContext();
	});

	afterEach(function (): void {
		sinon.restore();
	});

	it('Should detect autorest', async function (): Promise<void> {
		const autorestHelper = new AutorestHelper(testContext.outputChannel);
		should(await autorestHelper.detectAutorestInstallation()).equal(true, 'autorest command should be found in default path');
	});

	it('Should run an autorest command successfully', async function (): Promise<void> {
		const autorestHelper = new AutorestHelper(testContext.outputChannel);
		const dummyFile = path.join(await testUtils.generateTestFolderPath(), 'testoutput.log');
		sinon.stub(autorestHelper, 'constructAutorestCommand').returns(`autorest -version > ${dummyFile}`);

		try {
		await autorestHelper.generateAutorestFiles('fakespec.yaml', 'fakePath');
		const text = await fs.readFile(dummyFile);
		should(text.toString().includes('AutoRest code generation utility'));
		} finally {
			if (await utils.exists(dummyFile)) {
				await fs.unlink(dummyFile);
			}
		}
	});

	it('Should construct a correct autorest command for project generation', async function (): Promise<void> {
		const expectedOutput = 'autorest --use:autorest-sql-testing@0.0.2 --input-file="/some/path/test.yaml" --output-folder="/some/output/path" --clear-output-folder';

		const autorestHelper = new AutorestHelper(testContext.outputChannel);
		should(autorestHelper.constructAutorestCommand('/some/path/test.yaml', '/some/output/path')).equal(expectedOutput);
	});
});
