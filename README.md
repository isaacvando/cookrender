# Cook Render
This extension enables easy conversion of `.cook` files to `.md` files. 

To run the extension, first open a `.cook` file, then open the command palette with <kbd>ctrl/cmd</kbd> + <kbd>shift</kbd> + <kbd>p</kbd> and run the **.cook: render open editor** command. Then any edits made to `.cook` files in the workspace will be automatically written to the `.md` file with the same name. *This means that `foo.md` will be overwritten if `foo.cook` is edited*.

![Demo](demo.gif)

To render all files in your workspace, run the **.cook: render all files in workspace** command. This command is not recursive, i.e. files in subdirectories will not be rendered.

To turn on inline quantities for ingredients place `"cookrender.enableInlineIngredientQuanitites": true` in your user settings.json file. The same can be done for cookware.

Check out [cooklang.org](https://cooklang.org) for more information.

Cook Render supports the recipe and shopping list specifications but each file may only contain one of the two.

Feel free to open an issue or PR!
