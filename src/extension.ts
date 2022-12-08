import * as vscode from 'vscode';
import { TextEncoder } from 'util';
import { Parser, ParseResult } from '@cooklang/cooklang-ts';
import { posix } from 'path';
import { getVSCodeDownloadUrl } from '@vscode/test-electron/out/util';

export function activate(context: vscode.ExtensionContext) {
	let disposable = vscode.commands.registerCommand('cookrender.enableRendering', () => {
		vscode.window.showInformationMessage("Rendering enabled");
		render();
		vscode.workspace.onDidChangeTextDocument((event) => {
			render();
		});
	});

	context.subscriptions.push(disposable);
}

export function deactivate() {}

function render() {
	const editor = vscode.window.activeTextEditor;
	if (!editor)
		return;

	const uri: vscode.Uri = editor.document.uri;
	const fileName = posix.basename(editor.document.fileName);
	if (posix.extname(fileName) !== ".cook")
		return;

	const fileNameNoExt: string = fileName.split('.')[0];
	const md: string = getMarkdown(new Parser().parse(editor.document.getText()), fileNameNoExt);

	if (vscode.workspace.workspaceFolders === undefined)
		return;
	let wf = vscode.workspace.workspaceFolders![0].uri.path ;
	const targetUri: string = posix.join(...[wf, fileNameNoExt + '.md']);
	vscode.workspace.fs.writeFile(vscode.Uri.parse(targetUri), new TextEncoder().encode(md));
}

function getMarkdown(parsed: ParseResult, fileName: string): string {
	let md = `# ${fileName}\n\n`;

	for (let key in parsed.metadata)
		md += `**${key}:** ${parsed.metadata[key]}  \n`;

	md += parsed.ingredients.length ? "\n## Ingredients\n" : "";
	parsed.ingredients.forEach((ingredient) => {
		let amount = ingredient.units ? `${ingredient.quantity} ${ingredient.units}` : `${ingredient.quantity}`;
		md += `- **${amount}** ${ingredient.name}\n`;
	});

	md += parsed.cookwares.length ? "\n## Cookware\n" : "";
	parsed.cookwares.forEach((cookware) => {
		md += `- **${cookware.quantity}** ${cookware.name}\n`;
	});

	md += parsed.steps.length ? "\n## Steps\n" : "";
	parsed.steps.forEach((step) => {
		md += "- ";
		step.forEach((part) => {
			md += part.type === "text" ? escapeMD(part.value) : `**${escapeMD(part.name).trim()}**`;
		});
		md += "\n";
	});

	return md;
}

// escape markdown control symbols so they are printed as literals instead of disrupting the expected formatting
// currently this method escapes all control symbols regardless of context which means sometims the output will have uneccesarily
// escaped symbols which is kind of annoying
function escapeMD(x: string | undefined): string {
	if (!x)
		return "";

	return x.replace(/#/g, '\\#')
		.replace(/-/g, '\\-')
		.replace(/~/g, '\\~')
		.replace(/_/g, '\\_')
		.replace(/\*/g, '\\*')
		.replace(/>/g, '\\>')
		.replace(/</g, '\\<')
		.replace(/\(/g, '\\(')
		.replace(/\(/g, '\\)')
		.replace(/`/g, '\\`')
		.replace(/\|/g, '\\|')
		.replace(/!/g, '\\!')
		.replace(/\./g, '\\.');
}
