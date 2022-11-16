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

describe("Statement fromJson tests", () => {
    it("blank should turn normally", () => {
        assert.strictEqual(
            Statement.fromJson(JSON.parse('{}')).type(),
            new Statement().type(),
            "Cannot convert Empty Json properly!"
        );
        assert.strictEqual(
            Statement.fromJson(JSON.parse('{"type":"empty"}')).type(),
            new Statement().type(),
            "Conversion error on empty Statement-type!"
        );
    });

    it("normal should turn normally", () => {
        let json = JSON.parse('{"type":"normal","content":"F"}');
        assert.strictEqual(
            Statement.fromJson(json).content,
            "F",
            "Content mismatch on normal Statement!"
        );
        assert.strictEqual(
            Statement.fromJson(json).type(),
            StatementType.S_NORMAL,
            "Type mismatch on normal Statement!"
        );
    });

    it("if should turn normally", () => {
        let json = JSON.parse('{"type": "if","content":"j <= N","blocks":[[{"type": "normal","content": "Mdb := Mdb + 1"},{"type":"normal","content":"Metszet[Mdb] := A[i]"}],[]]}');
        let statement = IfStatement.fromJson(json)
        assert.strictEqual(
            statement.content,
            "j <= N",
            "Content conversion Error on if Statement!"
        );
        assert.strictEqual(
            statement.type(),
            StatementType.S_IF,
            "Type mismatch on if Statement!"
        );
        assert.strictEqual(
            statement.statementBlocks[0][0].type(),
            StatementType.S_NORMAL,
            "Type mismatch on if Statement statement-blocks!"
        );
        assert.strictEqual(
            statement.statementBlocks[0][0].content,
            "Mdb := Mdb + 1",
            "Content mismatch on if Statement statement-blocks!"
        );
        assert.isEmpty(
            statement.statementBlocks[1],
            "Conversion error on if Statement!"
        );
    });

    it("switch should turn normally", () => {
        let json = JSON.parse(`{
            "type":"switch",
            "blocks":[
                {
                    "case":"A = 1",
                    "statements":[
                        {"type":"normal","content":"KI: A"}
                    ]
                },
                {
                    "case":"A = 2",
                    "statements":[
                        {"type":"normal","content":"A := A - 1"},
                        {"type":"normal","content":"KI: A - 1"}
                    ]
                },
                {
                    "case":"else",
                    "statements":[
                        {"type":"empty"}
                    ]
                }
            ]
        }`);
        let statement = SwitchStatement.fromJson(json);
        assert.strictEqual(
            statement.type(),
            StatementType.S_SWITCH,
            "Type mismatch on switch statement!"
        );
        assert.strictEqual(
            statement.blocks[0].case,
            "A = 1",
            "Content mismatch on switch statement case!"
        );
        assert.strictEqual(
            statement.blocks[1].statements[0].type(),
            StatementType.S_NORMAL,
            "Conversion error on switch statement case-blocks!"
        );
        assert.strictEqual(
            statement.blocks[1].statements[1].content,
            "KI: A - 1",
            "Conversion error on switch statement case-blocks!"
        );
    });

    it("loop should turn normally", () => {
        let json = JSON.parse(`{
            "type": "loop",
            "content": "i := 1..N",
            "statements": [
                {
                    "type": "normal",
                    "content": "j := 1"
                },
                {
                    "type": "loop-reverse",
                    "content": "j <= M és A[i] != B[i]",
                    "statements": [
                        {
                            "type": "normal",
                            "content": "j := j + 1"
                        }
                    ]
                },
                {
                    "type": "if",
                    "content": "j <= N",
                    "blocks": [
                        [
                            {
                                "type": "normal",
                                "content": "Mdb := Mdb + 1"
                            },
                            {
                                "type": "normal",
                                "content": "Metszet[Mdb] := A[i]"
                            }
                        ],
                        []
                    ]
                }
            ]
        }`);
        let statement = LoopStatement.fromJson(json);
        assert.strictEqual(
            statement.type(),
            StatementType.S_LOOP,
            "Type mismatch on loop statement!"
        );
        assert.strictEqual(
            statement.content,
            "i := 1..N",
            "Content mismatch error on loop statement!");
        assert.strictEqual(
            statement.statements[1].content,
            "j <= M és A[i] != B[i]",
            "Conversion error on loop statement!"
        );
        assert.strictEqual(
            statement.statements[1].type(),
            StatementType.S_LOOP_REVERSE,
            "Type mismatch on loop statement block!"
        );
        assert.strictEqual(
            (statement.statements[2] as IfStatement).statementBlocks[0][1].content,
            "Metszet[Mdb] := A[i]",
            "Conversion error on loop statement block!"
        );
    });
});

describe("Statement Deserializer tests", () => {
    it("should give proper type", () => {
        assert.instanceOf(
            Deserializer.fromJsonString('{}'),
            Statement,
            "Type mismatch on empty conversion!"
        );
        assert.instanceOf(
            Deserializer.fromJsonString('{"type":"normal","content":"F"}'),
            Statement,
            "Type mismatch on normal conversion!"
        );
        assert.instanceOf(
            Deserializer.fromJsonString('{"type":"if","content":"F","blocks":[]}'),
            IfStatement,
            "Type mismatch on if conversion!"
        );
        assert.instanceOf(
            Deserializer.fromJsonString('{"type":"switch","predicates":[],"blocks":[]}'),
            SwitchStatement,
            "Type mismatch on switch conversion!"
        );
        assert.instanceOf(
            Deserializer.fromJsonString('{"type":"loop","statements":[{"type":"empty"}]}'),
            LoopStatement,
            "Type mismatch on loop conversion!"
        );
        assert.instanceOf(
            Deserializer.fromJsonString('{"type":"loop-reverse","statements":[{"type":"empty"}]}'),
            ReversedLoopStatement,
            "Type mismatch reverse-loop conversion!"
        );
    });
});

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
            (StructogramController.getSubElement(StructogramController.getSubElement(loop, 2) as IfStatement, 0)as Statement[])[0].type(),
            StatementType.S_NORMAL,
            "Type mismatch on getElement's second level"
        );
        assert.strictEqual(
            (StructogramController.getSubElement(StructogramController.getSubElement(loop, 2) as IfStatement, 0)as Statement[])[1].type(),
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

    it("should give element by mapping",()=>{
        let controller = new StructogramController(new Structogram(null,[loop]));
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
            controller.getElementByMapping([0,2]),
            IfStatement,
            "Type mismatch on second level"
        );
        assert.strictEqual(
            controller.getElementByMapping([0,3]),
            null,
            "Error while fetching null object on second level"
        );
    });
});