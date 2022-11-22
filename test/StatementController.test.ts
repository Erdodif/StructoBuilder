import { assert } from "chai";
import {
    Statement,
    StatementDeSerializer as Deserializer,
    IfStatement,
    SwitchStatement,
    LoopStatement,
    ReversedLoopStatement,
    StatementType,
    StatementConverter as Converter
} from "../src/Statement.js";
import { Structogram, StructogramController } from "../src/StructogramController.js";

describe("Statement Controller tests", () => {
    let loop = new LoopStatement("F", [
        new Statement("A"),
        new Statement(),
        new IfStatement("C", [[new Statement("D"), new Statement()]]),
    ]);
    it("getSubElement should give proper statement type", () => {
        assert.strictEqual(
            (StructogramController.getSubElement(loop, 0) as Statement).type(),
            StatementType.S_NORMAL,
            "Type mismatch on first element"
        );
        assert.strictEqual(
            (StructogramController.getSubElement(loop, 1) as Statement).type(),
            StatementType.S_BLANK,
            "Type mismatch on second element"
        );
        assert.strictEqual(
            (StructogramController.getSubElement(loop, 2) as Statement).type(),
            StatementType.S_IF,
            "Type mismatch on third element"
        );
    });

    it("getSubElement should give proper content", () => {
        assert.strictEqual((StructogramController.getSubElement(loop, 2) as Statement).content,
            "C",
            "Content on nested element"
        );
    });
    it("getSubElement should give proper nested content", () => {
        assert.instanceOf(
            StructogramController.getSubElement(loop, 2),
            IfStatement,
            "Type mismatch on getElement's first level"
        );
        assert.strictEqual(
            (StructogramController.getSubElement(StructogramController.getSubElement(loop, 2) as IfStatement, 0) as Statement[])[0].type(),
            StatementType.S_NORMAL,
            "Type mismatch on getElement's second level"
        );
        assert.strictEqual(
            (StructogramController.getSubElement(StructogramController.getSubElement(loop, 2) as IfStatement, 0) as Statement[])[1].type(),
            StatementType.S_BLANK,
            "Type mismatch on getElement's second level"
        );
        assert.strictEqual(
            (StructogramController.getSubElement(
                StructogramController.getSubElement(loop, 2) as IfStatement, 0) as Statement[])[0].content,
            "D",
            "Content mismatch on nested element"
        );
    });

    it("should give element by mapping", () => {
        let controller = new StructogramController(new Structogram(null, [loop]));
        assert.instanceOf(
            controller.getElementByMapping([0]),
            LoopStatement,
            "Type mismatch on first level"
        );
        assert.strictEqual(
            controller.getElementByMapping([1]),
            null,
            "Error while fetching null object on first level"
        );
        assert.instanceOf(
            controller.getElementByMapping([0, 2]),
            IfStatement,
            "Type mismatch on second level"
        );
        assert.strictEqual(
            controller.getElementByMapping([0, 3]),
            null,
            "Error while fetching null object on second level"
        );
    });
});
