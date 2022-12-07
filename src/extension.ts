import * as vscode from 'vscode';
import { TextEncoder } from 'util';
import { Parser, ParseResult } from '@cooklang/cooklang-ts';

export function activate(context: vscode.ExtensionContext) {
	let disposable = vscode.commands.registerCommand('cookrender.enableRendering', () => {
		vscode.window.showInformationMessage("Render on save enabled");
		render();
		vscode.workspace.onDidChangeTextDocument((event) => {
			// update .md file every time the .cook file is saved
			if (!event.document.isDirty) {
				render();
			}
		});
	});

	context.subscriptions.push(disposable);
}

export function deactivate() {}

function render() {
	const editor = vscode.window.activeTextEditor;
		if (!editor)
			return vscode.window.showInformationMessage('Unable to render; Please open a .cook file');

		const uri: vscode.Uri = editor.document.uri;
		const fileName: string | undefined = uri.toString().split('/').pop();

		if (fileName?.split('.').length === 2 && fileName?.split('.').pop() === "cook") {
			const fileNameNoExt: string = fileName.split('.')[0];
			const md: string = getMarkdown(new Parser().parse(editor.document.getText()), fileNameNoExt);
			const targetUri: string = uri.toString().slice(0, -fileName.length) + fileNameNoExt + '.md';
			vscode.workspace.fs.writeFile(vscode.Uri.parse(targetUri), new TextEncoder().encode(md));
			vscode.window.showInformationMessage(`Wrote to ${fileNameNoExt}.md`);
		} else {
			vscode.window.showInformationMessage('Unable to render; Please open a .cook file');
		}
}

function getMarkdown(parsed: ParseResult, fileName: string): string {
	let md = `# ${fileName}\n\n`;

	for (let key in parsed.metadata) {
		md += `**${key}:** ${parsed.metadata[key]}  \n`;
	}

	md += parsed.ingredients.length ? "## Ingredients\n" : "";
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
