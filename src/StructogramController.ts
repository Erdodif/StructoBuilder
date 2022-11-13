import "./Statement.js";
import { StatementType, Statement, StatementDeSerializer, LoopStatement, IfStatement, I_Statement } from "./Statement.js";
export class StructogramController {
    structogram: Structogram;

    constructor(core: Structogram | null = null) {
        if (core !== null) {
            this.structogram = core;
        }
        else {
            this.structogram = new Structogram();
        }
    }

    static splitMappingString(mapping: string): number[] {
        return mapping.replace(/[^;0-9]/, "").split(";").map(Number);
    }

    protected getSubElement(statement: Statement | Statement[], index: number): Statement[] | Statement | null {
        if (Array.isArray(statement)) {
            return statement[index];
        }
        switch (statement.type()) {
            case StatementType.S_IF:
            case StatementType.S_SWITCH:
                return (statement as IfStatement).statementBlocks[index];
            case StatementType.S_LOOP:
            case StatementType.S_LOOP_REVERSE:
                return (statement as LoopStatement).statements[index];
            default:
                return null;
        }
    }

    getElementByMapping(mapping: number[]): Statement | null {
        if (mapping.length < 1) {
            return null;
        }
        let current: Statement | Statement[] | null = this.structogram.statements[mapping[0]];
        let i: number = 1;
        while (i < mapping.length && current !== null) {
            current = this.getSubElement(current, mapping[i]);
            i++;
        }
        return current as Statement | null;
    }

    static fromJson(json: any): StructogramController {
        return new StructogramController(Structogram.fromJson(json));
    }
}

export interface I_Structogram{signature: string | null | undefined, renderStart: boolean | undefined, statements: I_Statement[] };
export class Structogram {
    name: string | null;
    statements: Statement[];
    renderStart = false;

    constructor(name: string | null = null, statements: Statement[] = []) {
        this.name = name;
        this.statements = statements;
    }

    static fromJson(json: I_Structogram): Structogram {
        let structogram = new Structogram(json.signature);
        structogram.renderStart = json?.renderStart === true;
        let statements: Statement[] = [];
        for(let i = 0; i <json.statements.length; i++){
            statements.push(StatementDeSerializer.fromJson(json.statements[i]));
            //TODO: Not Workin' F
        }
        return structogram;
    }

}
