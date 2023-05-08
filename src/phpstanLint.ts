import {
  Diagnostic,
  DiagnosticCollection,
  DiagnosticSeverity,
  ExtensionContext,
  languages,
  OutputChannel,
  Position,
  Range,
  TextDocument,
  Uri,
  workspace,
  WorkspaceConfiguration,
} from 'coc.nvim';

import cp from 'child_process';
import fs from 'fs';

export function register(context: ExtensionContext, toolPath: string, outputChannel: OutputChannel) {
  const engine = new LintEngine(toolPath, outputChannel);

  // lint onOpen
  workspace.documents.map(async (doc) => {
    await engine.lint(doc.textDocument);
  });

  workspace.onDidOpenTextDocument(
    async (e) => {
      await engine.lint(e);
    },
    null,
    context.subscriptions
  );

  // lint onSave
  workspace.onDidSaveTextDocument(
    async (e) => {
      await engine.lint(e);
    },
    null,
    context.subscriptions
  );
}

type PHPStanDiagnosticsType = {
  totals: {
    errors: number;
    file_errors: number;
  };
  files: {
    [filepath: string]: {
      errors: number;
      messages: {
        message: string;
        line: number | null;
        ignorable: boolean;
      }[];
    };
  };
  errors: string[];
};

class LintEngine {
  private collection: DiagnosticCollection;
  private toolPath: string;
  private outputChannel: OutputChannel;
  private extensionConfig: WorkspaceConfiguration;

  constructor(toolPath: string, outputChannel: OutputChannel) {
    this.collection = languages.createDiagnosticCollection('phpstan');
    this.toolPath = toolPath;
    this.outputChannel = outputChannel;

    const extensionConfig = workspace.getConfiguration('phpstan');
    this.extensionConfig = extensionConfig;
  }

  public async lint(textDocument: TextDocument): Promise<void> {
    if (textDocument.languageId !== 'php') return;

    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const self = this;
    const filePath = Uri.parse(textDocument.uri).fsPath;
    const args: string[] = [];
    const cwd = Uri.file(workspace.root).fsPath;
    const opts = { cwd, shell: true };

    args.push('analyze');
    args.push('--no-progress');
    args.push('--no-ansi');
    args.push('--no-interaction');
    args.push('--error-format=json');

    const ruleLevel = this.extensionConfig.get<string | null>('level', null);
    if (ruleLevel !== null) {
      args.push(`--level=${ruleLevel}`);
    }

    const analyzeMemoryLimit = this.extensionConfig.get<string>('memoryLimit', '-1');
    if (analyzeMemoryLimit) {
      // MEMO: Since the value -1 is also valid, we pass the value with =
      args.push(`--memory-limit=${analyzeMemoryLimit}`);
    }

    const configrationFile = this.extensionConfig.get<string | null>('configuration', null);
    if (configrationFile && fs.existsSync(configrationFile)) {
      args.push(`--configuration=${configrationFile}`);
    }

    this.outputChannel.appendLine(`${'#'.repeat(10)} phpstan\n`);
    this.outputChannel.appendLine(`Cwd: ${opts.cwd}`);
    this.outputChannel.appendLine(`Tool: ${this.toolPath}`);
    this.outputChannel.appendLine(`Args: ${args.join(' ')}`);
    this.outputChannel.appendLine(`File: ${filePath}\n`);

    this.collection.set(textDocument.uri);

    return new Promise(function (resolve) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      cp.execFile(self.toolPath, [...args, filePath], opts, function (_error, stdout, stderr) {
        if (stderr) {
          self.outputChannel.appendLine(`**STDERR**\n\n${stderr}`);
        }

        self.outputChannel.appendLine(`**STDOUT**\n\n${stdout}\n`);
        self.collection.set(textDocument.uri, self.getDiagnostics(stdout));
        resolve();
      });
    });
  }

  private getDiagnostics(decoded: string): Diagnostic[] {
    const diagnostics: Diagnostic[] = [];

    if (!this.IsJsonString(decoded)) {
      return diagnostics;
    }

    const phpstanDiagnostics: PHPStanDiagnosticsType = JSON.parse(decoded);

    for (const filepath in phpstanDiagnostics.files) {
      const filepathItem = phpstanDiagnostics.files[filepath];
      for (const messageItem of filepathItem.messages) {
        const line = messageItem.line ? messageItem.line - 1 : 0;
        const range = Range.create(Position.create(line, 0), Position.create(line, 0));
        diagnostics.push(
          Diagnostic.create(
            range,
            messageItem.message + ` (ignorable: ${messageItem.ignorable})`,
            DiagnosticSeverity.Error,
            'analyze'
          )
        );
      }
    }

    return diagnostics;
  }

  private IsJsonString(str: string): boolean {
    try {
      JSON.parse(str);
    } catch (e) {
      return false;
    }
    return true;
  }
}
