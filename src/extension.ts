import * as vscode from 'vscode';
import { TextEncoder } from 'util';
import { Parser, ParseResult } from '@cooklang/cooklang-ts';

export function activate(context: vscode.ExtensionContext) {
	let disposable = vscode.commands.registerCommand('cookrender.render', () => {
		const editor = vscode.window.activeTextEditor;

		if(editor) {
			const uri: vscode.Uri = editor.document.uri;
			const fileName: string | undefined = uri.toString().split('/').pop();

			if (fileName?.split('.').length === 2 && fileName?.split('.').pop() === "cook") {
				const fileNameNoExt: string = fileName.split('.')[0];
				const md: string = getMarkdown(new Parser().parse(editor.document.getText()), fileNameNoExt);
				const targetUri: string = uri.toString().slice(0, -fileName.length) + fileNameNoExt + '.md';
				vscode.workspace.fs.writeFile(vscode.Uri.parse(targetUri), new TextEncoder().encode(md));
				vscode.window.showInformationMessage(`Created ${fileNameNoExt}.md`);
			} else {
				vscode.window.showInformationMessage('Unable to render; Please open a .cook file');
			}
		} else {
			vscode.window.showInformationMessage('Unable to render; Please open a .cook file');
		}
	});

	context.subscriptions.push(disposable);
}

export function deactivate() {}

function getMarkdown(parsed: ParseResult, fileName: string): string {
	let md = `# ${fileName}\n\n`;

	for (let key in parsed.metadata) {
		md += `**${key}:** ${parsed.metadata[key]} \\\n`;
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
			if(part.type === "text") {
				md += part.value;
			}
			else {
				md += `**${part.name?.trim()}**`;
			}
		});
		md += "\n";
	});

	return md;
}
