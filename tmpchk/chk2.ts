import { GRAPH_NODES } from "../src/lib/knowledge-graph";
import { PHILOSOPHERS } from "../src/lib/philosophers";
const have = new Set(GRAPH_NODES.filter(n=>n.chat).map(n=>n.chat as string));
const ids = new Set(GRAPH_NODES.map(n=>n.id));
const missing = Object.keys(PHILOSOPHERS).filter(a=>!have.has(a));
console.log("node exists:", missing.filter(m=>ids.has(m)).join(","));
console.log("no node:", missing.filter(m=>!ids.has(m)).join(","));
