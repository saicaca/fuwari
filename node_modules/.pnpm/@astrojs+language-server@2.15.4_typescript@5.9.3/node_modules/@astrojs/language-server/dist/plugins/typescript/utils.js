"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mapEdit = mapEdit;
const utils_js_1 = require("../utils.js");
function mapEdit(edit, code, languageId) {
    // Don't attempt to move the edit to the frontmatter if the file isn't the root TSX file, it means it's a script tag
    if (languageId === 'typescriptreact') {
        if ((0, utils_js_1.editShouldBeInFrontmatter)(edit.range, code.astroMeta).itShould) {
            edit = (0, utils_js_1.ensureProperEditForFrontmatter)(edit, code.astroMeta, '\n');
        }
    }
    else {
        // If the edit is at the start of the file, add a newline before it, otherwise we'll get `<script>text`
        if (edit.range.start.line === 0 && edit.range.start.character === 0) {
            edit.newText = '\n' + edit.newText;
        }
    }
    return edit;
}
//# sourceMappingURL=utils.js.map