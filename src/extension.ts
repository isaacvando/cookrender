import * as vscode from 'vscode';
import { TextEncoder } from 'util';
import { Parser, ParseResult } from '@cooklang/cooklang-ts';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export async function activate(context: vscode.ExtensionContext) {
	let disposable = vscode.commands.registerCommand('cookrender.render', async () => {
		const editor = vscode.window.activeTextEditor;
		if(editor && vscode.workspace.workspaceFolders !== undefined) {
			const md = getMarkdown(new Parser().parse(editor.document.getText()));
			console.log(md);

			const path = vscode.workspace.workspaceFolders[0].uri.path;
			console.log("path: " + path);
			vscode.workspace.fs.writeFile(vscode.Uri.parse(path + '/testfile.md'), new TextEncoder().encode(md));
		}

		vscode.window.showInformationMessage('Time to render .cook');
	});

	context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
export function deactivate() {}

function getMarkdown(parsed: ParseResult): string {
	let md = ""

	for (let key in parsed.metadata) {
		md += `**${key}** ${parsed.metadata[key]} \\\n`;
	}

	return md;
}
