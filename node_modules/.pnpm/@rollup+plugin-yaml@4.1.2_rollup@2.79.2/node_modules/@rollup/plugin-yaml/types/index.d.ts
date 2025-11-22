import type { FilterPattern } from '@rollup/pluginutils';
import type { Plugin } from 'rollup';

type ValidYamlType =
  | number
  | string
  | boolean
  | null
  | { [key: string]: ValidYamlType }
  | ValidYamlType[];

interface RollupYamlOptions {
  /**
   * A picomatch pattern, or array of patterns, which specifies the files in the build the plugin
   * should operate on.
   * By default all files are targeted.
   */
  include?: FilterPattern;
  /**
   * A picomatch pattern, or array of patterns, which specifies the files in the build the plugin
   * should _ignore_.
   * By default no files are ignored.
   */
  exclude?: FilterPattern;
  /**
   * A function which can optionally mutate parsed YAML.
   * The function should return the mutated `object`, or `undefined` which will make no changes to
   * the parsed YAML.
   * @default undefined
   */
  transform?: (data: ValidYamlType, filePath: string) => ValidYamlType | undefined;
  /**
   * - If `single`, specifies that the target YAML documents contain only one document in the
   * target file(s).
   * - If more than one [document stream](https://yaml.org/spec/1.2/spec.html#id2801681) exists in
   * the target YAML file(s), set `documentMode: 'multi'`.
   * @default 'single'
   */
  documentMode?: 'single' | 'multi';

  /**
   * File extensions to process. Useful if you have files that contain YAML but do not have a
   * `.yaml` or `.yml` extension.
   * @default ['.yaml', '.yml']
   */
  extensions?: string[];
}

/**
 * A Rollup plugin which Converts YAML files to ES6 modules.
 */
export default function yaml(options?: RollupYamlOptions): Plugin;
