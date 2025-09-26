import { Buffer } from "node:buffer";
import { createHash } from "node:crypto";
import { NodeCompiler } from "@myriaddreamin/typst-ts-node-compiler";
import { h } from "hastscript";

let _compiler;
export function getCompiler() {
  if (!_compiler) _compiler = NodeCompiler.create({ workspace: "./" });
  return _compiler;
}

export function svgAddClass(svg, cls) {
  try {
    return svg.replace(/<svg(\s+)/, (_m, g1) => `<svg${g1}class="${cls}" `);
  } catch {
    return svg;
  }
}

export function toBase64(utf8) {
  return Buffer.from(utf8, "utf-8").toString("base64");
}

export function deterministicId(prefix, input) {
  return `${prefix}${createHash("sha1").update(String(input)).digest("hex").slice(0, 8)}`;
}

export function makeInlineDocElements({ id, className, svg, tag = "div" }) {
  const b64 = toBase64(svg);
  const holder = h(tag, { id, class: className, "data-svg": b64 });
  const script = h(
    "script",
    { type: "text/javascript", defer: true },
    `(()=>{try{const el=document.getElementById('${id}');if(!el)return;const data=el.getAttribute('data-svg');if(!data)return;const bin=atob(data);const bytes=new Uint8Array(bin.length);for(let i=0;i<bin.length;i++)bytes[i]=bin.charCodeAt(i);const text=new TextDecoder('utf-8').decode(bytes);el.innerHTML=text;const root=el.querySelector('svg');if(root){root.classList.add('typst-doc');root.removeAttribute('width');root.removeAttribute('height');root.style.maxWidth='100%';root.style.width='100%';root.style.height='auto';}}catch(e){console.warn('[typst-inline] error',e)}})();`,
  );
  return [holder, script];
}

// Removed legacy inline-math support in favor of full-doc inline SVG
