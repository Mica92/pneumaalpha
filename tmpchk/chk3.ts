import { GRAPH_NODES } from "../src/lib/knowledge-graph";
console.log(GRAPH_NODES.filter(n=>n.kind!=="philosopher").map(n=>n.id).join(" "));
