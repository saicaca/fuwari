/** @import { TSESTree } from '@typescript-eslint/types' */
/** @import { Visitors } from '../../types.js' */
/** @import { TSOptions } from '../types.js' */
import ts from '../ts/index.js';

/** @typedef {TSESTree.Node} Node */

/**
 * @param {TSOptions} [options]
 * @returns {Visitors<TSESTree.Node>}
 */
export default (options) => ({
	...ts(options),

	JSXElement(node, context) {
		context.visit(node.openingElement);

		if (node.children.length > 0) {
			context.indent();
		}

		for (const child of node.children) {
			context.visit(child);
		}

		if (node.children.length > 0) {
			context.dedent();
		}

		if (node.closingElement) {
			context.visit(node.closingElement);
		}
	},

	JSXOpeningElement(node, context) {
		context.write('<');

		context.visit(node.name);

		for (const attribute of node.attributes) {
			context.write(' ');
			context.visit(attribute);
		}

		if (node.selfClosing) {
			context.write(' /');
		}

		context.write('>');
	},

	JSXClosingElement(node, context) {
		context.write('</');

		context.visit(node.name);

		context.write('>');
	},

	JSXNamespacedName(node, context) {
		context.visit(node.namespace);
		context.write(':');
		context.visit(node.name);
	},

	JSXIdentifier(node, context) {
		context.write(node.name, node);
	},

	JSXMemberExpression(node, context) {
		context.visit(node.object);
		context.write('.');
		context.visit(node.property);
	},

	JSXText(node, context) {
		context.write(node.value, node);
	},

	JSXAttribute(node, context) {
		context.visit(node.name);
		if (node.value) {
			context.write('=');
			context.visit(node.value);
		}
	},

	JSXEmptyExpression(node, context) {},

	JSXFragment(node, context) {
		context.visit(node.openingFragment);

		if (node.children.length > 0) {
			context.indent();
		}

		for (const child of node.children) {
			context.visit(child);
		}

		if (node.children.length > 0) {
			context.dedent();
		}

		context.visit(node.closingFragment);
	},

	JSXOpeningFragment(node, context) {
		context.write('<>');
	},

	JSXClosingFragment(node, context) {
		context.write('</>');
	},

	JSXExpressionContainer(node, context) {
		context.write('{');

		context.visit(node.expression);

		context.write('}');
	},

	JSXSpreadChild(node, context) {
		context.write('{...');

		context.visit(node.expression);

		context.write('}');
	},

	JSXSpreadAttribute(node, context) {
		context.write('{...');

		context.visit(node.argument);

		context.write('}');
	}
});
