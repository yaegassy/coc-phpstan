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
  workspace,
} from 'coc.nvim';

import neon from 'neon-js';

export function register(context: ExtensionContext, outputChannel: OutputChannel) {
  if (!workspace.getConfiguration('phpstan').get('neonLint.enable')) return;

  const engine = new NeonLintEngine(outputChannel);

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

  workspace.onDidChangeTextDocument(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async (_e) => {
      const doc = await workspace.document;
      await engine.lint(doc.textDocument);
    },
    null,
    context.subscriptions
  );

  workspace.onDidSaveTextDocument(
    async (e) => {
      await engine.lint(e);
    },
    null,
    context.subscriptions
  );
}

class NeonLintEngine {
  private collection: DiagnosticCollection;
  private outputChannel: OutputChannel;

  constructor(outputChannel: OutputChannel) {
    this.collection = languages.createDiagnosticCollection('phpstan-neon');
    this.outputChannel = outputChannel;
  }

  public async lint(textDocument: TextDocument): Promise<void> {
    if (
      !textDocument.uri.endsWith('phpstan.neon') &&
      !textDocument.uri.endsWith('phpstan.neon.dist') &&
      !textDocument.uri.endsWith('phpstan.dist.neon')
    )
      return;

    const text = textDocument.getText();

    this.outputChannel.appendLine(`${'#'.repeat(10)} phpstan-neon\n`);

    try {
      neon.decode(text);
      this.outputChannel.appendLine(`RES: success\n`);
      this.collection.set(textDocument.uri, null);
    } catch (e: any) {
      if (e instanceof neon.Error) {
        this.collection.set(textDocument.uri, this.getDiagnostics(e));
        this.outputChannel.appendLine(`ERR: ${e.message}\n`);
      }
    }
  }

  private getDiagnostics(e: any): Diagnostic[] {
    const diagnostics: Diagnostic[] = [];

    if ('line' in e && 'column' in e && 'message' in e) {
      const line = e.line - 1;
      const column = e.column - 1;

      const range = Range.create(Position.create(line, column), Position.create(line, column));

      diagnostics.push(Diagnostic.create(range, e.message, DiagnosticSeverity.Error));
    }

    return diagnostics;
  }
}
