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

    it("should keep content from json", () => {
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

describe("Structogram toJson tests", () => {
    let json = `{"signature":"test","renderStart":false,"statements":[{"type":"loop","content":"i < N and Fail(tests[i])","statements":[{"type":"normal","content":"work on methods[i]"}]}]}`;
    let structogram = Structogram.fromJson(JSON.parse(json));
    it("should convert to proper json", () => {
        assert.strictEqual(
            structogram.toJSON(),
            json,
            "json mismatch on structorgram!"
        );
    });

    it("should convert from self product", () => {
        assert.strictEqual(
            Structogram.fromJson(JSON.parse(structogram.toJSON())).toJSON(),
            json,
            "json mismatch on structorgram!"
        );
    });

});

describe("Structogram set statement by mapping tests", () => {
    let controller = StructogramController.fromJson(json);
    it("should swap to proper position", () => {
        controller.setElementByMapping([2], new Statement("A"));
        assert.strictEqual(
            (controller.getElementByMapping([2]) as Statement).content,
            "A",
            "Content mismatch after setting operation!"
        );
        controller.setElementByMapping([1], new LoopStatement("A", [new Statement(), new Statement("B")]));
        assert.strictEqual(
            (controller.getElementByMapping([1, 1]) as IfStatement).content,
            "B",
            "Content mismatch after nested setting operation!"
        );
    });

});

describe("Structogram swap tests", () => {
    let controller = StructogramController.fromJson(json);
    it("should swap to proper position", () => {
        controller.swapStatements([2], [1, 2]);
        assert.strictEqual(
            (controller.getElementByMapping([2]) as Statement).content,
            "j <= N",
            "Content mismatch after swapping operation (from)!"
        );
        assert.strictEqual(
            (controller.getElementByMapping([1, 2]) as IfStatement).content,
            "KI: Metszet, Mdb",
            "Content mismatch after swapping operation (to)!"
        );
    });

});

describe("Structogram insert into Position tests", () => {
    let controller = StructogramController.fromJson(json);
    it("should set statements on the first level properly", () => {
        controller.setElementByMapping([2], new Statement("A"), true);
        controller.setElementByMapping([2], new Statement("B"), true);
        assert.strictEqual(
            (controller.getElementByMapping([2]) as Statement).content,
            "B",
            "Content mismatch after inserting operation!"
        );
        assert.strictEqual(
            (controller.getElementByMapping([3]) as Statement).content,
            "A",
            "Content mismatch after inserting operation!"
        );
    });

    it("should set statements nested level correctly", () => {
        controller.setElementByMapping([2], new Statement("A"), true);
        controller.setElementByMapping([2], new Statement("B"), true);
        controller.setElementByMapping([2], new LoopStatement("C", [new Statement(), new Statement("D")]));
        assert.strictEqual(
            (controller.getElementByMapping([2, 1]) as IfStatement).content,
            "D",
            "Content mismatch after nested inserting operation!"
        );
        assert.strictEqual(
            (controller.getElementByMapping([3]) as IfStatement).content,
            "A",
            "Content mismatch after nested inserting operation!"
        );
        controller.setElementByMapping([2, 1], new Statement("B"), true);
        assert.strictEqual(
            (controller.getElementByMapping([2, 1]) as IfStatement).content,
            "B",
            "Content mismatch after nested inserting operation!"
        );
        assert.strictEqual(
            (controller.getElementByMapping([2, 2]) as IfStatement).content,
            "D",
            "Content mismatch after nested inserting operation!"
        );

    });

    it("should insert to the last element", () => {
        controller.setElementByMapping([1, Infinity], new Statement("A"));
        assert.strictEqual(
            (controller.getElementByMapping([1]) as LoopStatement).statements[(controller.getElementByMapping([1]) as LoopStatement).statements.length - 1].content,
            "A",
            "Placement failed to last possible position!"
        );
    });
});

describe("Structogram remove on Position test", () => {
    let controller = StructogramController.fromJson(json);
    it("should remove statement properly", () => {
        controller.setElementByMapping([2], new Statement("A"), true);
        controller.setElementByMapping([2], new Statement("B"), true);
        controller.setElementByMapping([2], null);
        assert.strictEqual(
            (controller.getElementByMapping([2]) as Statement).content,
            "A",
            "Content mismatch after inserting operation!"
        );
    });
});

describe("Structogram move to Position tests", () => {
    let controller = StructogramController.fromJson(json);
    it("should move Statements properly (simple)", () => {
        controller.setElementByMapping([2], new Statement("A"), true);
        controller.setElementByMapping([2], new Statement("B"), true);
        controller.moveToPosition([3], [2], true);
        assert.strictEqual(
            (controller.getElementByMapping([2]) as Statement).content,
            "A",
            "Content mismatch after moving operation!"
        );
        assert.strictEqual(
            (controller.getElementByMapping([3]) as Statement).content,
            "B",
            "Content mismatch after moving operation!"
        );
    });
    it("should move Statements properly (with override)", () => {
        controller.setElementByMapping([2], new Statement("A"), true);
        controller.setElementByMapping([2], new Statement("B"), true);
        controller.moveToPosition([3], [2]);
        assert.strictEqual(
            (controller.getElementByMapping([2]) as Statement).content,
            "A",
            "Content mismatch after moving operation!"
        );
        assert.notEqual(
            (controller.getElementByMapping([3]) as Statement).content,
            "B",
            "Content mismatch after moving operation!"
        );
    });
    it("should move Statements properly (to last position)", () => {
        controller.setElementByMapping([2], new Statement("A"), true);
        controller.moveToPosition([2], [Infinity]);
        assert.strictEqual(
            controller.structogram.statements[controller.structogram.statements.length - 1].content,
            "A",
            "Content mismatch after moving operation to the end!"
        );
    });
});
