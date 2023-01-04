# Cook Render
This extension enables easy conversion of `.cook` files to `.md` files. 

To run the extension, open a `.cook` file and run the `cookrender.enableRendering` **.cook: enable rendering** command. Then any edits made to `.cook` files in the workspace will be automatically written to the `.md` file with the same name. *This means that `foo.md` will be overwritten by `foo.cook` if rendering is turned on in the workspace*.

![Demo](demo.gif)

To turn on inline quantities for ingredients place `"cookrender.enableInlineIngredientQuanitites": true` in your user settings.json file. The same can be done for cookware.

Check out [cooklang.org](https://cooklang.org) for more information.

Cook Render supports the recipe and shopping list specifications but each file may only contain one of the two.

Feel free to open an issue or PR!
