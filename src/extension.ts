import * as vscode from 'vscode';
import { TextEncoder } from 'util';
import { Parser, ParseResult } from '@cooklang/cooklang-ts';
import { posix } from 'path';

export function activate(context: vscode.ExtensionContext) {
	let disposable = vscode.commands.registerCommand('cookrender.enableRendering', () => {
		vscode.window.showInformationMessage("Rendering enabled");
		render();
		vscode.workspace.onDidChangeTextDocument(() => {
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

	const fileName = posix.basename(editor.document.fileName);
	if (posix.extname(fileName) !== ".cook")
		return;

	const fileNameNoExt: string = fileName.split('.')[0];
	const md: string = getMarkdown(new Parser().parse(editor.document.getText()), fileNameNoExt);

	const targetUri: string = posix.join(...[posix.dirname(editor.document.fileName), fileNameNoExt + '.md']);
	vscode.workspace.fs.writeFile(vscode.Uri.parse(targetUri), new TextEncoder().encode(md));
}

function getMarkdown(parsed: ParseResult, fileName: string): string {
	let md = `# ${fileName}\n\n`;

	md += parsed.metadata.keys ? "\n## Metadata\n" : "";
	for (let key in parsed.metadata)
		md += `**${escapeMD(key)}:** ${escapeMD(parsed.metadata[key])}  \n`;

	md += parsed.ingredients.length ? "\n## Ingredients\n" : "";
	parsed.ingredients.forEach((ingredient) => {
		let amount = ingredient.units ? `${ingredient.quantity} ${ingredient.units}` : `${ingredient.quantity}`;
		md += `- **${escapeMD(amount)}** ${escapeMD(ingredient.name)}\n`;
	});

	md += parsed.cookwares.length ? "\n## Cookware\n" : "";
	parsed.cookwares.forEach((cookware) => {
		md += `- **${escapeMD(cookware.quantity.toString())}** ${escapeMD(cookware.name)}\n`;
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
