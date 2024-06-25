import { Glob } from "bun";
import { generateCSharpModels } from "./converter";

const namespace = "VerteilApi.VerteilModels";
const outputCSharpFile = "VerteilModel.cs";
const directoryPath: string = "./src/JsonFiles";

let jsonFiles: string[] = [];

const glob = new Glob("*");
for (const fileName of glob.scanSync(directoryPath)) {
    jsonFiles.push(fileName);
}

await generateCSharpModels(directoryPath, jsonFiles, outputCSharpFile, namespace).then(() => {
    console.log(`C# models generated at ${outputCSharpFile}`);
}).catch(err => {
    console.error(err.message);
});