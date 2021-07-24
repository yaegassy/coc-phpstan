import {
  CodeAction,
  CodeActionContext,
  CodeActionProvider,
  languages,
  Position,
  Range,
  TextEdit,
  TextDocument,
  workspace,
} from 'coc.nvim';

export class PHPStanCodeActionProvider implements CodeActionProvider {
  private readonly source = 'phpstan';
  private diagnosticCollection = languages.createDiagnosticCollection(this.source);

  public async provideCodeActions(document: TextDocument, range: Range, context: CodeActionContext) {
    const doc = workspace.getDocument(document.uri);
    const wholeRange = Range.create(0, 0, doc.lineCount, 0);
    let whole = false;
    if (
      range.start.line === wholeRange.start.line &&
      range.start.character === wholeRange.start.character &&
      range.end.line === wholeRange.end.line &&
      range.end.character === wholeRange.end.character
    ) {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      whole = true;
    }
    const codeActions: CodeAction[] = [];

    /** Add phpstan ignore comment */
    if (this.lineRange(range) && context.diagnostics.length > 0) {
      let existsPHPStanDiagnostics = false;
      context.diagnostics.forEach((d) => {
        if (d.source === 'phpstan') {
          existsPHPStanDiagnostics = true;
        }
      });

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const line = doc.getline(range.start.line);

      const thisLineFullLength = doc.getline(range.start.line).length;
      const thisLineTrimLength = doc.getline(range.start.line).trim().length;
      const suppressLineLength = thisLineFullLength - thisLineTrimLength;

      let suppressLineNewText = '/** @phpstan-ignore-next-line */\n';
      if (suppressLineLength > 0) {
        const addIndentSpace = ' '.repeat(suppressLineLength);
        suppressLineNewText = '/** @phpstan-ignore-next-line */\n' + addIndentSpace;
      }

      let thisLineContent = doc.getline(range.start.line);
      thisLineContent = thisLineContent.trim();

      // Add @phpstan-ignore-next-line
      if (!thisLineContent.startsWith('/**') && !thisLineContent.startsWith('*') && existsPHPStanDiagnostics) {
        const edit = TextEdit.insert(Position.create(range.start.line, suppressLineLength), suppressLineNewText);
        codeActions.push({
          title: 'Add @phpstan-ignore-next-line',
          edit: {
            changes: {
              [doc.uri]: [edit],
            },
          },
        });
      }

      // MEMO: Expose features as they become necessary.
      //
      // Add @phpstan-ignore-line
      // ------------------------
      // if (!thisLineContent.startsWith('/**') && !thisLineContent.startsWith('*') && existsPHPStanDiagnostics) {
      //   const edit = TextEdit.replace(range, line + ' /* @phpstan-ignore-line */');
      //   codeActions.push({
      //     title: 'Add @phpstan-ignore-line',
      //     edit: {
      //       changes: {
      //         [doc.uri]: [edit],
      //       },
      //     },
      //   });
      // }
    }

    return codeActions;
  }

  private lineRange(r: Range): boolean {
    return (
      (r.start.line + 1 === r.end.line && r.start.character === 0 && r.end.character === 0) ||
      (r.start.line === r.end.line && r.start.character === 0)
    );
  }
}
