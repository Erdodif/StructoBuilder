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

describe("Statement fromJson tests", () => {
    it("blank should turn normally", () => {
        console.log(Statement.fromJson(JSON.parse("{}")));
        console.log(new Statement());
        assert.strictEqual(
            Statement.fromJson(JSON.parse('{}')).type(),
            new Statement().type(),
            "Conversion error on blank Statement!"
        );
        assert.strictEqual(
            Statement.fromJson(JSON.parse('{"type":"empty"}')).type(),
            new Statement().type(),
            "Conversion error on blank Statement!"
        );
    });

    it("normal should turn normally", () => {
        let json = JSON.parse('{"type":"normal","content":"F"}');
        assert.strictEqual(
            Statement.fromJson(json).content,
            new Statement("F", StatementType.S_NORMAL).content,
            "Conversion error on normal Statement!"
        );
        assert.strictEqual(
            Statement.fromJson(json).type(),
            new Statement("F", StatementType.S_NORMAL).type(),
            "Conversion error on normal Statement!"
        );
    });

    it("if should turn normally", () => {
        let json = JSON.parse('{"type": "if","content":"j <= N","blocks":[[{"type": "normal","content": "Mdb := Mdb + 1"},{"type":"normal","content":"Metszet[Mdb] := A[i]"}],[]]}');
        let statement = IfStatement.fromJson(json)
        assert.strictEqual(
            statement.content,
            new IfStatement("j <= N").content,
            "Conversion error on if Statement!"
        );
        assert.strictEqual(
            statement.type(),
            new IfStatement("j <= N").type(),
            "Conversion error on if Statement!"
        );
        assert.strictEqual(
            statement.content,
            new IfStatement("j <= N").content,
            "Conversion error on if Statement!"
        );
        let blocks :Statement[][] = [[
            new Statement("Mdb := Mdb + 1",StatementType.S_NORMAL),
            new Statement("Metszet[Mdb] := A[i]",StatementType.S_NORMAL)
        ],[]];
        assert.strictEqual(
            statement.statementBlocks[0][0].type(),
            new IfStatement("j <= N",blocks).statementBlocks[0][0].type(),
            "Conversion error on if Statement!"
        );
        assert.strictEqual(
            statement.statementBlocks[0][0].content,
            new IfStatement("Mdb := Mdb + 1",blocks).statementBlocks[0][0].content,
            "Conversion error on if Statement!"
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
            new SwitchStatement().type(),
            "Conversion error on switch statement!"
        );
        assert.strictEqual(
            statement.blocks[0].case,
            "A = 1",
            "Conversion error on switch statement!"
        );
        assert.strictEqual(
            statement.blocks[1].statements[0].type(),
            StatementType.S_NORMAL,
            "Conversion error on switch statement!"
        );
        assert.strictEqual(
            statement.blocks[1].statements[1].content,
            "KI: A - 1",
            "Conversion error on switch statement!"
        );
    });
    it("loop should turn normally", () => {

    });
    it("loop-reverse should turn normally", () => {

    });
});
/*
describe("Statement Deserializer tests", () => {
    it("should keep the type", () => {
        assert.instanceOf(Deserializer.fromJson('{"type":"normal","content":"F"}'), Statement, "Type mismatch!");
        assert.instanceOf(Deserializer.fromJson('{"type":"if","content":"F","blocks":[]}'), IfStatement, "Type mismatch!");
        assert.instanceOf(Deserializer.fromJson('{"type":"switch","predicates":[],"blocks":[]}'), SwitchStatement, "Type mismatch!");
    });
});*/
