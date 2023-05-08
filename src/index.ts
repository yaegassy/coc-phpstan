import { commands, DocumentSelector, ExtensionContext, languages, window, workspace } from 'coc.nvim';
import fs from 'fs';
import path from 'path';
import { PHPStanCodeActionProvider } from './action';
import { download } from './downloader';
import { LintEngine } from './lint';
import * as neonLintFeature from './neonLint';

export async function activate(context: ExtensionContext): Promise<void> {
  const extensionConfig = workspace.getConfiguration('phpstan');
  const isEnable = extensionConfig.get<boolean>('enable', true);
  if (!isEnable) return;

  const extensionStoragePath = context.storagePath;
  if (!fs.existsSync(extensionStoragePath)) {
    fs.mkdirSync(extensionStoragePath, { recursive: true });
  }

  const outputChannel = window.createOutputChannel('phpstan');

  context.subscriptions.push(
    commands.registerCommand('phpstan.showOutput', () => {
      if (outputChannel) {
        outputChannel.show();
      }
    })
  );

  context.subscriptions.push(
    commands.registerCommand('phpstan.download', async () => {
      await downloadWrapper(context);
    })
  );

  // 1. phpstan.toolPath
  let toolPath = extensionConfig.get('toolPath', '');
  if (!toolPath) {
    if (fs.existsSync(path.join(workspace.root, 'vendor', 'bin', 'phpstan'))) {
      // 2. Project's "phpstan"
      toolPath = path.join(workspace.root, 'vendor', 'bin', 'phpstan');
    } else if (fs.existsSync(path.join(context.storagePath, 'phpstan'))) {
      // 3. builtin "phpstan"
      toolPath = path.join(context.storagePath, 'phpstan');
    }
  }

  // Donwload "phpstan" if it does not exist.
  if (extensionConfig.get<boolean>('download.checkOnStartup', true)) {
    if (!toolPath) {
      await downloadWrapper(context);
      if (fs.existsSync(path.join(context.storagePath, 'phpstan'))) {
        toolPath = path.join(context.storagePath, 'phpstan');
      } else {
        return;
      }
    }
  }

  if (!toolPath) return;

  const { subscriptions } = context;
  const engine = new LintEngine(toolPath, outputChannel);

  //
  // lint onOpen
  //

  workspace.documents.map(async (doc) => {
    await engine.lint(doc.textDocument);
  });

  workspace.onDidOpenTextDocument(
    async (e) => {
      await engine.lint(e);
    },
    null,
    subscriptions
  );

  //
  // lint onSave
  //

  workspace.onDidSaveTextDocument(
    async (e) => {
      await engine.lint(e);
    },
    null,
    subscriptions
  );

  neonLintFeature.register(context, outputChannel);

  //
  // Code actions
  //

  const languageSelector: DocumentSelector = [{ language: 'php', scheme: 'file' }];
  const codeActionProvider = new PHPStanCodeActionProvider();
  context.subscriptions.push(languages.registerCodeActionProvider(languageSelector, codeActionProvider, 'phpstan'));
}

async function downloadWrapper(context: ExtensionContext) {
  let msg = 'Do you want to download "phpstan"?';
  const ret = await window.showPrompt(msg);
  if (ret) {
    try {
      await download(context);
    } catch (e) {
      console.error(e);
      msg = 'Download phpstan failed, you can get it from https://github.com/phpstan/phpstan';
      window.showErrorMessage(msg);
      return;
    }
  } else {
    return;
  }
}
