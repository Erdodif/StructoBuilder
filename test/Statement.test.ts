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

describe("Statement toJson tests", () => {
    it("should convert normal Statement to json normally", () => {
        let json = `{"type":"normal","content":"G"}`;
        let statement = Statement.fromJson(JSON.parse(json));
        assert.strictEqual(
            statement.toJSON(),
            json,
            "json mismatch on normal Statement!"
        );
        assert.strictEqual(
            Statement.fromJson(JSON.parse(statement.toJSON())).toJSON(),
            json,
            "json mismatch on normal Statement!"
        );
    });

    it("should convert if Statement to json normally", () => {
        let json = `{"type":"if","content":"H","blocks":[[],[{"type":"empty"}]]}`;
        let statement = IfStatement.fromJson(JSON.parse(json));
        assert.strictEqual(
            statement.toJSON(),
            json,
            "json mismatch on if Statement!"
        );
        assert.strictEqual(
            IfStatement.fromJson(JSON.parse(statement.toJSON())).toJSON(),
            json,
            "json mismatch on if Statement!"
        );
    });

    it("should convert switch Statement to json normally", () => {
        let json = `{"type":"switch","blocks":[{"case":"A = B","statements":[]},{"case":"A < B","statements":[{"type":"empty"}]}]}`;
        let statement = SwitchStatement.fromJson(JSON.parse(json));
        assert.strictEqual(
            statement.toJSON(),
            json,
            "json mismatch on switch Statement!"
        );
        assert.strictEqual(
            SwitchStatement.fromJson(JSON.parse(statement.toJSON())).toJSON(),
            json,
            "json mismatch on switch Statement!"
        );
    });

    it("should convert loop Statement to json normally", () => {
        let json = `{"type":"loop","content":"i := 1 .. N","statements":[{"type":"empty"},{"type":"normal","content":"I"}]}`;
        let statement = LoopStatement.fromJson(JSON.parse(json));
        assert.strictEqual(
            statement.toJSON(),
            json,
            "json mismatch on loop Statement!"
        );
        assert.strictEqual(
            LoopStatement.fromJson(JSON.parse(statement.toJSON())).toJSON(),
            json,
            "json mismatch on loop Statement!"
        );
    });

    it("should convert loop-reverse Statement to json normally", () => {
        let json = `{"type":"loop-reverse","content":"i := 1 .. N","statements":[{"type":"empty"},{"type":"normal","content":"I"}]}`;
        let statement = ReversedLoopStatement.fromJson(JSON.parse(json));
        assert.strictEqual(
            statement.toJSON(),
            json,
            "json mismatch on loop-reverse Statement!"
        );
        assert.strictEqual(
            ReversedLoopStatement.fromJson(JSON.parse(statement.toJSON())).toJSON(),
            json,
            "json mismatch on loop-reverse Statement!"
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

describe("Statement Converter tests", () => {
    let statement = new Statement("A");
    let ifStatement = new IfStatement("B", [[new Statement("C"), new Statement("D")], [new Statement("E"), new Statement("F")]]);
    let switchStatement = new SwitchStatement([
        { case: "G", statements: [new Statement("H")] },
        { case: "I", statements: [] },
        { case: "else", statements: [new Statement("J"), new Statement("K")] }]
    );
    let loopStatement = new LoopStatement("L", [new Statement("M"), new Statement("N")]);
    it("should convert to IfStatement properly (with content)", () => {
        assert.strictEqual(
            Converter.toIfStatement(statement).content,
            "A",
            "Content mismatch on Statement to IfStatement conversion!"
        );
        assert.strictEqual(
            Converter.toIfStatement(switchStatement).content,
            "G",
            "Content mismatch on SwitchStatement to IfStatement conversion!"
        );
        assert.isNull(
            Converter.toIfStatement(new SwitchStatement()).content,
            "Content mismatch on empty SwitchStatement to IfStatement conversion!"
        );
        assert.strictEqual(
            Converter.toIfStatement(loopStatement).content,
            "L",
            "Content mismatch on LoopStatement to IfStatement conversion!"
        );
    });

    it("should convert to IfStatement properly (with subElements)", () => {
        assert.isEmpty(
            Converter.toIfStatement(statement).statementBlocks[0],
            "Converted IfStatement has something in the statementBlocks!"
        );
        assert.strictEqual(
            Converter.toIfStatement(switchStatement).statementBlocks[1][0].content,
            "J",
            "Content mismatch in ElsePart"
        );
        switchStatement.blocks[2].case = "";
        assert.isEmpty(
            Converter.toIfStatement(switchStatement).statementBlocks[1],
            "Content mismatch in ElsePart (when there's no else provided)!"
        );
        assert.deepStrictEqual(
            Converter.toIfStatement(loopStatement).statementBlocks[0],
            loopStatement.statements,
            "Content mismatch at Loop conversion"
        );
        assert.strictEqual(
            Converter.toIfStatement(ifStatement),
            ifStatement,
            "Content mismatch on self Conversion"
        );
    });

    it("should convert to SwitchStatement properly (with statementBlocks)", () => {
        assert.isEmpty(
            Converter.toSwitchStatement(statement).blocks,
            "Switch blocks not empty!"
        );
        assert.isEmpty(
            Converter.toSwitchStatement(loopStatement).blocks,
            "Switch blocks not empty!"
        );
        assert.strictEqual(
            Converter.toSwitchStatement(ifStatement).blocks[0].case,
            "B",
            "Content mismatch on IfStatement to SwitchStatement conversion (Case)!"
        );
        assert.deepStrictEqual(
            Converter.toSwitchStatement(ifStatement).blocks[0].statements,
            ifStatement.statementBlocks[0],
            "Content mismatch on IfStatement to SwitchStatement conversion (Statements)!"
        );
    });

    it("should convert to LoopStatement properly (with content)", () => {
        assert.strictEqual(
            Converter.toLoopStatement(ifStatement).content,
            "B",
            "Content mismatch on LoopStatement conversion!"
        );
    });

    it("should convert to LoopStatementScope properly", () => {
        assert.deepStrictEqual(
            (Converter.ifToLoopStatementScope(ifStatement)[0] as LoopStatement).statements,
            ifStatement.statementBlocks[0],
            "Content mismatch on LoopStatement conversion!"
        );
        assert.deepStrictEqual(
            Converter.ifToLoopStatementScope(ifStatement)[1],
            ifStatement.statementBlocks[1][0],
            "Content mismatch on LoopStatement conversion!"
        );
    });
});