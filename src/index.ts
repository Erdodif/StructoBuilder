import json from "../samples/Iteration2.json" assert { type: "json"};
import { question } from "readline-sync";
import { StructogramController as Controller, Structogram } from "./StructogramController.js";
import { type } from "os";

async function main(): Promise<void> {
    let structoController: Controller = Controller.fromJson(json);
    console.log(json);
    console.log(structoController.structogram);
    console.log("Structogram readed!");
    console.log(structoController.getElementByMapping([1]) ?? "Not found");
    let answer = await question("Position: ");
    console.log(structoController.getElementByMapping(Controller.splitMappingString(answer)) ?? "Not found");
}

main();