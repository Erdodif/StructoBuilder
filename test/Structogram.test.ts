import { assert } from "chai";
import {
    Statement,
    StatementDeSerializer as Deserializer,
    IfStatement,
    SwitchStatement,
    LoopStatement,
    ReversedLoopStatement,
    StatementType
} from "../src/Statement.js";
import { Structogram, StructogramController } from "../src/StructogramController.js";
import json from "../samples/Iteration2.json" assert { type: "json"};

describe("Structogram fromJson tests", () => {

    let controller = StructogramController.fromJson(json);

    it("should keep structogram type from json", () => {
        assert.instanceOf(
            controller.structogram,
            Structogram,
            "Type mismatch on structogram parsing!"
        );
    });

    it("should keep content from json",()=>{
        assert.isArray(
            controller.structogram.statements,
            "Error: structogram's statements is not ana array!"
        );
        assert.strictEqual(
            (controller.getElementByMapping([1]) as Statement).type(),
            StatementType.S_LOOP,
            "Type mismatch on first statement!"
        );
        assert.strictEqual(
            (controller.getElementByMapping([1]) as Statement).content,
            "i := 1..N",
            "Content mismatch on first element!"
        );
    });

});