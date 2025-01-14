import { getResultsByModule, loadModulesForRule } from '../utils/tests';

import rule from './module-folder-structure';

const defaultConfigName = '.monolint.json';

describe('given a folder with default configuration', () => {
  const baseDir = 'src/rules/test-cases/module-folder-structure/defaults';

  describe('when rule is enabled', () => {
    const modules = loadModulesForRule(baseDir, defaultConfigName, rule.name);

    it('then should return error accordingly to existent folder structure', async () => {
      const results = rule.checkModules(modules, baseDir);
      expect(results).toHaveLength(2);
      if (results) {
        // Performs checks for result basic once! so we don't need to re-check in other tests
        // Basics: module.name, rule, resource, valid, message

        expect(results[0].module?.name).toEqual('mod-enabled-error-1');
        expect(results[1].module?.name).toEqual('mod-enabled-success-1');
        expect(results[0].valid).toBeFalsy();
        expect(results[1].valid).toBeTruthy();
        expect(results[0].message).toEqual('Required folder not found');
        expect(results[1].message).toEqual('Required folder found');
        results.forEach((result) => {
          expect(result.resource).toEqual('src');
          expect(result.rule).toEqual(rule.name);
        });
      }
    });
  });
});

describe('given a folder with non-strict configuration', () => {
  const baseDir = 'src/rules/test-cases/module-folder-structure/non-strict';

  describe('when required folders are non-glob patterns', () => {
    const modules = loadModulesForRule(`${baseDir}/without-glob`, defaultConfigName, rule.name);

    it('then should return error accordingly to existent folder structure', async () => {
      const results = rule.checkModules(modules, baseDir);

      expect(results).toHaveLength(12);
      if (results) {
        const resultsByModule = getResultsByModule(results);
        resultsByModule['mod-non-strict-error-1'].forEach((result) => {
          expect(result.valid).toBeFalsy();
        });

        resultsByModule['mod-non-strict-error-2'].forEach((result) => {
          if (result.resource === 'docs') {
            expect(result.valid).toBeFalsy();
          } else {
            expect(result.valid).toBeTruthy();
          }
        });

        resultsByModule['mod-non-strict-success-1'].forEach((result) => {
          expect(result.valid).toBeTruthy();
        });

        // With folders beyond the allowed ones
        resultsByModule['mod-non-strict-success-2'].forEach((result) => {
          expect(result.valid).toBeTruthy();
        });
      }
    });
  });

  describe('when required folders are glob patterns', () => {
    const modules = loadModulesForRule(`${baseDir}/with-glob`, defaultConfigName, rule.name);

    it('then should return error accordingly to existent folder structure', async () => {
      const results = rule.checkModules(modules, baseDir);

      expect(results).toHaveLength(12);
      if (results) {
        const resultsByModule = getResultsByModule(results);

        resultsByModule['mod-non-strict-glob-success-1'].forEach((result) => {
          expect(result.valid).toBeTruthy();
        });

        resultsByModule['mod-non-strict-glob-success-2'].forEach((result) => {
          expect(result.valid).toBeTruthy();
        });

        resultsByModule['mod-non-strict-glob-error-1'].forEach((result) => {
          if (result.resource === 'src/**/utils') {
            expect(result.valid).toBeFalsy();
          } else {
            expect(result.valid).toBeTruthy();
          }
        });

        resultsByModule['mod-non-strict-glob-error-2'].forEach((result) => {
          expect(result.valid).toBeFalsy();
        });
      }
    });
  });
});

describe('given a folder with strict configuration', () => {
  const baseDir = 'src/rules/test-cases/module-folder-structure/strict';

  describe('when required folders are non-glob patterns', () => {
    const modules = loadModulesForRule(`${baseDir}/without-glob`, defaultConfigName, rule.name);

    it('then should return error accordingly to existent folder structure', async () => {
      const results = rule.checkModules(modules, baseDir);

      expect(results).toHaveLength(13);
      if (results) {
        const resultsByModule = getResultsByModule(results);
        resultsByModule['mod-strict-error-1'].forEach((result) => {
          expect(result.valid).toBeFalsy();
        });

        resultsByModule['mod-strict-error-2'].forEach((result) => {
          if (result.resource === 'docs') {
            expect(result.valid).toBeFalsy();
          } else {
            expect(result.valid).toBeTruthy();
          }
        });

        resultsByModule['mod-strict-error-3'].forEach((result) => {
          if (result.resource === 'another-folder') {
            expect(result.valid).toBeFalsy();
            expect(result.message).toEqual('Folder outside the required list not allowed (strict mode)');
          } else {
            expect(result.valid).toBeTruthy();
          }
        });

        resultsByModule['mod-strict-success-1'].forEach((result) => {
          expect(result.valid).toBeTruthy();
        });
      }
    });
  });

  describe('when required folders are glob patterns', () => {
    const modules = loadModulesForRule(`${baseDir}/with-glob`, defaultConfigName, rule.name);

    it('then should return error accordingly to existent folder structure', async () => {
      const results = rule.checkModules(modules, baseDir);

      expect(results).toHaveLength(19);
      if (results) {
        const resultsByModule = getResultsByModule(results);

        resultsByModule['mod-strict-glob-success-1'].forEach((result) => {
          expect(result.valid).toBeTruthy();
        });

        resultsByModule['mod-strict-glob-success-2'].forEach((result) => {
          expect(result.valid).toBeTruthy();
        });

        resultsByModule['mod-strict-glob-error-1'].forEach((result) => {
          expect(result.valid).toBeFalsy();
        });

        // Missing folder
        resultsByModule['mod-strict-glob-error-2'].forEach((result) => {
          if (result.resource === 'src/test') {
            expect(result.valid).toBeFalsy();
          } else {
            expect(result.valid).toBeTruthy();
          }
        });

        // With extra folders
        resultsByModule['mod-strict-glob-error-3'].forEach((result) => {
          if (result.resource.includes('extra')) {
            expect(result.valid).toBeFalsy();
          } else {
            expect(result.valid).toBeTruthy();
          }
        });
      }
    });
  });
});
