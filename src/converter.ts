import {
    quicktype,
    InputData,
    jsonInputForTargetLanguage,
    JSONSchemaInput,
    FetchingJSONSchemaStore
} from "quicktype-core";
import { Glob } from "bun";

export async function quicktypeJSON(targetLanguage: string, typeName: string, jsonString: string) {
    const jsonInput = jsonInputForTargetLanguage(targetLanguage);

    // We could add multiple samples for the same desired
    // type, or many sources for other types. Here we're
    // just making one type from one piece of sample JSON.
    await jsonInput.addSource({
        name: typeName,
        samples: [jsonString]
    });

    const inputData = new InputData();
    inputData.addInput(jsonInput);

    return await quicktype({
        inputData,
        lang: targetLanguage
    });
}

export async function quicktypeJSONSchema(targetLanguage: string, typeName: string, jsonSchemaString: string) {
    const schemaInput = new JSONSchemaInput(new FetchingJSONSchemaStore());

    // We could add multiple schemas for multiple types,
    // but here we're just making one type from JSON schema.
    await schemaInput.addSource({ name: typeName, schema: jsonSchemaString });

    const inputData = new InputData();
    inputData.addInput(schemaInput);

    return await quicktype({
        inputData,
        lang: targetLanguage
    });
}

/*
const { lines: AirShoppingRQModel } = await quicktypeJSON("csharp", "AirShoppingRQ", AirShoppingRQ);
console.log(AirShoppingRQModel.join("\n"));

const { lines: pythonPerson } = await quicktypeJSONSchema("python", "Person", jsonSchemaString);
console.log(pythonPerson.join("\n"));
*/

export async function generateCSharpModels(directoryPath: string, fileNames: string[], outputPath: string, namespace: string) {

    let currentFileName = "";

    try {
        let targetLanguage = "csharp";
        const jsonInput = jsonInputForTargetLanguage(targetLanguage);

        for (const fileName of fileNames) {
            currentFileName = fileName;
            const jsonString = await Bun.file(`${directoryPath}/${fileName}`).text();
            if (jsonString != "{}" && jsonString != "") {
                await jsonInput.addSource({ name: fileName.split(".")[0], samples: [jsonString] });
            }
        }

        const inputData = new InputData();
        inputData.addInput(jsonInput);

        const result = await quicktype({
            inputData,
            lang: targetLanguage,
            rendererOptions: { //quicktype-core/src/language/CSharp/language.ts
                "namespace": namespace,
                "framework": "NewtonSoft",
                "virtual": false,
                "features": "just-types",
                "array-type": "list",
                "keep-property-name": true,
            }
        });

        Bun.write(outputPath, result.lines.join("\n"));
    } catch (error) {
        throw new Error(`Error generating C# models for ${currentFileName}.\nMessage: [${error}]`);
    }
}