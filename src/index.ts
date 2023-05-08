import { commands, ExtensionContext, window, workspace } from 'coc.nvim';

import fs from 'fs';
import path from 'path';

import * as phpstanCodeActionFeature from './action';
import { download } from './downloader';
import * as neonLintFeature from './neonLint';
import * as phpstanLintFeature from './phpstanLint';

export async function activate(context: ExtensionContext): Promise<void> {
  if (!workspace.getConfiguration('phpstan').get('enable')) return;

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
  let toolPath = workspace.getConfiguration('phpstan').get('toolPath', '');
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
  if (workspace.getConfiguration('phpstan').get<boolean>('download.checkOnStartup', true)) {
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

  phpstanLintFeature.register(context, toolPath, outputChannel);
  neonLintFeature.register(context, outputChannel);
  phpstanCodeActionFeature.register(context);
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
