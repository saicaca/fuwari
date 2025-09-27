//# Typst HTML demo mirroring Expressive Code Markdown examples
#import "../typ/fuwari-html.typ": *

#let desc = [Typst equivalents of the Expressive Code (EC) examples. Each block uses ec so that the rehype-typst-ec plugin renders fully styled EC blocks.]
#metadata((
  title: "Expressive Code (Typst HTML Examples)",
  published: "2025-09-23",
  description: desc,
  tags: ("Typst", "Expressive Code", "Demo"),
  category: "Examples",
))<frontmatter>

= Expressive Code

== Syntax Highlighting

=== Regular syntax highlighting
#fw_ec("js", "console.log(\"This code is syntax highlighted!\")")

=== Rendering ANSI escape sequences
#html.elem("ec", attrs: (
  lang: "ansi",
  code: "ANSI colors:
- Regular: \\x1b[31mRed\\x1b[0m \\x1b[32mGreen\\x1b[0m \\x1b[33mYellow\\x1b[0m \\x1b[34mBlue\\x1b[0m \\x1b[35mMagenta\\x1b[0m \\x1b[36mCyan\\x1b[0m
- Bold:    \\x1b[1;31mRed\\x1b[0m \\x1b[1;32mGreen\\x1b[0m \\x1b[1;33mYellow\\x1b[0m \\x1b[1;34mBlue\\x1b[0m \\x1b[1;35mMagenta\\x1b[0m \\x1b[1;36mCyan\\x1b[0m
- Dimmed:  \\x1b[2;31mRed\\x1b[0m \\x1b[2;32mGreen\\x1b[0m \\x1b[2;33mYellow\\x1b[0m \\x1b[2;34mBlue\\x1b[0m \\x1b[2;35mMagenta\\x1b[0m \\x1b[2;36mCyan\\x1b[0m

256 colors (160-177):
\\x1b[38;5;160m160 \\x1b[38;5;161m161 \\x1b[38;5;162m162 \\x1b[38;5;163m163 \\x1b[38;5;164m164 \\x1b[38;5;165m165\\x1b[0m
\\x1b[38;5;166m166 \\x1b[38;5;167m167 \\x1b[38;5;168m168 \\x1b[38;5;169m169 \\x1b[38;5;170m170 \\x1b[38;5;171m171\\x1b[0m
\\x1b[38;5;172m172 \\x1b[38;5;173m173 \\x1b[38;5;174m174 \\x1b[38;5;175m175 \\x1b[38;5;176m176 \\x1b[38;5;177m177\\x1b[0m

Full RGB colors:
\\x1b[38;2;34;139;34mForestGreen - RGB(34, 139, 34)\\x1b[0m

Text formatting: \\x1b[1mBold\\x1b[0m \\x1b[2mDimmed\\x1b[0m \\x1b[3mItalic\\x1b[0m \\x1b[4mUnderline\\x1b[0m",
))

== Editor & Terminal Frames

=== Code editor frames (title)
#html.elem("ec", attrs: (
  lang: "js",
  title: "my-test-file.js",
  code: "console.log(\"Title attribute example\");",
))

#fw_hr()

#html.elem("ec", attrs: (
  lang: "html",
  title: "src/content/index.html",
  code: "<!-- src/content/index.html -->
<div>File name comment example</div>",
))

=== Terminal frames
#fw_ec("bash", "echo \"This terminal frame has no title\"")

#fw_hr()

#html.elem("ec", attrs: (
  lang: "powershell",
  title: "PowerShell terminal example",
  code: "Write-Output \"This one has a title!\"",
))

=== Overriding frame types
#html.elem("ec", attrs: (
  lang: "sh",
  frame: "none",
  code: "echo \"Look ma, no frame!\"",
))

#html.elem("hr")

#html.elem("ec", attrs: (
  lang: "ps",
  frame: "code",
  title: "PowerShell Profile.ps1",
  code: "# Without overriding, this would be a terminal frame
function Watch-Tail { Get-Content -Tail 20 -Wait $args }
New-Alias tail Watch-Tail",
))

== Text & Line Markers

=== Marking full lines & ranges
#html.elem("ec", attrs: (
  lang: "js",
  mark: "1,4,7-8",
  code: "// Line 1 - targeted by line number
// Line 2
// Line 3
// Line 4 - targeted by line number
// Line 5
// Line 6
// Line 7 - targeted by range \"7-8\"
// Line 8 - targeted by range \"7-8\"",
))

=== Selecting line marker types (mark, ins, del)
#html.elem("ec", attrs: (
  lang: "js",
  title: "line-markers.js",
  del: "2",
  ins: "3-4",
  mark: "6",
  code: "function demo() {
  console.log(\"this line is marked as deleted\");
  // This line and the next one are marked as inserted
  console.log(\"this is the second inserted line\");

  return \"this line uses the neutral default marker type\";
  }",
))

=== Adding labels to line markers
#html.elem("ec", attrs: (
  lang: "jsx",
  mark: "{\"1\":5}",
  del: "{\"2\":\"7-8\"}",
  ins: "{\"3\":\"10-12\"}",
  code: "// labeled-line-markers.jsx
<button
  role=\"button\"
  {...props}
  value={value}
  className={buttonClassName}
  disabled={disabled}
  active={active}
>
  {children &&
    !active &&
    (typeof children === \"string\" ? <span>{children}</span> : children)}
</button>;",
))

=== Adding long labels on their own lines
#html.elem("ec", attrs: (
  lang: "jsx",
  mark: "{\"1. Provide the value prop here:\":\"5-6\"}",
  del: "{\"2. Remove the disabled and active states:\":\"8-10\"}",
  ins: "{\"3. Add this to render the children inside the button:\":\"12-15\"}",
  code: "// labeled-line-markers.jsx
<button
  role=\"button\"
  {...props}
  value={value}
  className={buttonClassName}
  disabled={disabled}
  active={active}
>
  {children &&
    !active &&
    (typeof children === \"string\" ? <span>{children}</span> : children)}
</button>;",
))

=== Using diff-like syntax
#html.elem("ec", attrs: (
  lang: "diff",
  code: "+this line will be marked as inserted
-this line will be marked as deleted
 this is a regular line",
))

#html.elem("hr")

#html.elem("ec", attrs: (
  lang: "diff",
  code: "--- a/README.md
+++ b/README.md
@@ -1,3 +1,4 @@
+this is an actual diff file
-all contents will remain unmodified
 no whitespace will be removed either",
))

=== Combining syntax highlighting with diff-like syntax
// Note: EC supports combining diff with a highlight language (e.g. js).
// Here we keep `lang: "diff"`; the rehype plugin can be extended to add `highlightLang` if desired.
#html.elem("ec", attrs: (
  lang: "diff",
  code: "  function thisIsJavaScript() {
    // This entire block gets highlighted as JavaScript,
    // and we can still add diff markers to it!
-   console.log('Old code to be removed')
+   console.log('New and shiny code!')
  }",
))

=== Marking individual text inside lines
#html.elem("ec", attrs: (
  lang: "js",
  mark: "given text",
  code: "function demo() {
  // Mark any given text inside lines
  return \"Multiple matches of the given text are supported\";
  }",
))

=== Regular expressions
#html.elem("ec", attrs: (
  lang: "ts",
  mark: "/ye[sp]/",
  code: "console.log(\"The words yes and yep will be marked.\")",
))

=== Escaping forward slashes
#html.elem("ec", attrs: (
  lang: "sh",
  mark: "//ho.*//",
  code: "echo \"Test\" > /home/test.txt",
))

=== Selecting inline marker types (mark, ins, del)
#html.elem("ec", attrs: (
  lang: "js",
  ins: "inserted",
  del: "deleted",
  mark: "return true;",
  code: "function demo() {
  console.log(
  \"These are inserted and deleted marker types\");
  // The return statement uses the default marker type
  return true;
}",
))

== Word Wrap

=== Configuring word wrap per block
#html.elem("ec", attrs: (
  lang: "js",
  wrap: "true",
  code: "// Example with wrap
function getLongString() {
  return \"This is a very long string that will most probably not fit into the available space unless the container is extremely wide\";
}",
))

#html.elem("hr")

#html.elem("ec", attrs: (
  lang: "js",
  wrap: "false",
  code: "// Example with wrap=false
function getLongString() {
  return \"This is a very long string that will most probably not fit into the available space unless the container is extremely wide\";
}",
))

=== Configuring indentation of wrapped lines
#html.elem("ec", attrs: (
  lang: "js",
  wrap: "true",
  preserveIndent: "true",
  code: "// Example with preserveIndent (enabled by default)
function getLongString() {
  return \"This is a very long string that will most probably not fit into the available space unless the container is extremely wide\";
}",
))

#html.elem("hr")

#html.elem("ec", attrs: (
  lang: "js",
  wrap: "true",
  preserveIndent: "false",
  code: "// Example with preserveIndent=false
function getLongString() {
  return \"This is a very long string that will most probably not fit into the available space unless the container is extremely wide\";
}",
))

== Collapsible Sections

#html.elem("ec", attrs: (
  lang: "js",
  collapse: "1-5, 12-14, 21-24",
  code: "// All this boilerplate setup code will be collapsed
import { someBoilerplateEngine } from \"@example/some-boilerplate\";
import { evenMoreBoilerplate } from \"@example/even-more-boilerplate\";

const engine = someBoilerplateEngine(evenMoreBoilerplate());

// This part of the code will be visible by default
engine.doSomething(1, 2, 3, calcFn);

function calcFn() {
  // You can have multiple collapsed sections
  const a = 1;
  const b = 2;
  const c = a + b;

  // This will remain visible
  console.log(`Calculation result: ${a} + ${b} = ${c}`);
  return c;
}

// All this code until the end of the block will be collapsed again
engine.closeConnection();
engine.freeMemory();
engine.shutdown({ reason: \"End of example boilerplate code\" });",
))

== Line Numbers

=== Displaying line numbers per block
#html.elem("ec", attrs: (
  lang: "js",
  showLineNumbers: "true",
  // Use explicit code attr to preserve newlines reliably
  code: "// This code block will show line numbers
console.log(\"Greetings from line 2!\");
console.log(\"I am on line 3\");",
))

#html.elem("hr")

#html.elem("ec", attrs: (
  lang: "js",
  showLineNumbers: "false",
  code: "// Line numbers are disabled for this block
console.log(\"Hello?\");
console.log(\"Sorry, do you know what line I am on?\");",
))

=== Changing the starting line number
#html.elem("ec", attrs: (
  lang: "js",
  showLineNumbers: "true",
  startLineNumber: "5",
  code: "console.log(\"Greetings from line 5!\");
console.log(\"I am on line 6\");",
))
