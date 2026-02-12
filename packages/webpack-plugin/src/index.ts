interface AssetProcessingHook {
  tap(
    options: { name: string; stage: number },
    callback: () => void
  ): void;
}

interface CompilationLike {
  hooks: {
    processAssets: AssetProcessingHook;
  };
  warnings: Error[];
}

interface CompilerLike {
  hooks: {
    compilation: {
      tap(name: string, callback: (compilation: CompilationLike) => void): void;
    };
  };
}

const PROCESS_ASSETS_STAGE_REPORT = 5000;

export interface ManaflowPluginOptions {
  replayPath?: string;
}

export class ManaflowPlugin {
  constructor(private readonly options: ManaflowPluginOptions = {}) {}

  apply(compiler: CompilerLike): void {
    compiler.hooks.compilation.tap('ManaflowPlugin', (compilation) => {
      compilation.hooks.processAssets.tap(
        {
          name: 'ManaflowPlugin',
          stage: PROCESS_ASSETS_STAGE_REPORT
        },
        () => {
          if (this.options.replayPath) {
            compilation.warnings.push(
              new Error(`ManaflowPlugin configured replayPath=${this.options.replayPath}`)
            );
          }
        }
      );
    });
  }
}

export default ManaflowPlugin;
