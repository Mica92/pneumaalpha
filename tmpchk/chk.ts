import { GRAPH_NODES } from "../src/lib/knowledge-graph";
import { PHILOSOPHERS } from "../src/lib/philosophers";
const have = new Set(GRAPH_NODES.filter(n=>n.chat).map(n=>n.chat));
const all = Object.keys(PHILOSOPHERS);
console.log("total", all.length, "linked", have.size);
console.log("missing:", all.filter(a=>!have.has(a as any)).join(","));
