import "./Statement.js";
import { StatementType, Statement, StatementDeSerializer, LoopStatement, IfStatement, I_Statement, SwitchStatement, ReversedLoopStatement } from "./Statement.js";

/**
 * Controlelr class for Structogram
 */
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

    /**
     * Gives a mapping from the given string
     * @param mapping A semi-colon (;) separated list of integers
     * @returns A list of numbers, also known as mapping
     */
    static splitMappingString(mapping: string): number[] {
        return mapping.replace(/[^;0-9]/, "").split(";").map(Number);
    }

    /**
     * Gives the proper statement from the statement/structogram hierarchy (one level below)
     * @param holder A statement, a list of Statement, or even a Structogram (null returns null)
     * @param index Index of the element
     * @returns A statement, a list of statement or null, if not found
     */
    static getSubElement(holder: Statement | Statement[] | Structogram | null, index: number):
        Statement[] | Statement | null {
        if (!holder) {
            return null;
        }
        if (holder instanceof Structogram) {
            return holder.statements[index];
        }
        if (Array.isArray(holder)) {
            return holder[index];
        }
        switch (holder.type()) {
            case StatementType.S_IF:
                return (holder as IfStatement).statementBlocks[index] as Statement[];
            case StatementType.S_SWITCH:
                return (holder as SwitchStatement).blocks[index].statements as Statement[];
            case StatementType.S_LOOP:
                return (holder as ReversedLoopStatement).statements[index] as Statement;
            case StatementType.S_LOOP_REVERSE:
                return (holder as LoopStatement).statements[index] as Statement;
            default:
                return null;
        }
    }

    /**
     * Gives the proper statement from the structogram hierarchy (any level)
     * @param mapping a list of numbers, representing the index of each search depth
     * @returns A Statement, a list of Statements, or null, if not found
     */
    getElementByMapping(mapping: number[])
        : Statement[] | Statement | IfStatement | SwitchStatement | LoopStatement | ReversedLoopStatement | null {
        if (mapping.length < 1) {
            return null;
        }
        let current: Statement | Statement[] | null = this.structogram.statements[mapping[0]];
        let i: number = 1;
        while (i < mapping.length && current !== null) {
            current = StructogramController.getSubElement(current, mapping[i]);
            i++;
        }
        return current as Statement ?? null;
    }

    static fromJson(json: any): StructogramController {
        return new StructogramController(Structogram.fromJson(json));
    }
}

export interface I_Structogram { signature: string | null | undefined, renderStart: boolean | undefined, statements: I_Statement[] };

/**
 * An Object representing an algorithm (pseudocode-like) structure
 */
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
        structogram.statements = [];
        for (let i = 0; i < json.statements.length; i++) {
            structogram.statements.push(StatementDeSerializer.fromJson(json.statements[i]));
        }
        return structogram;
    }

    toJSON() {
        let statements = "";
        if (this.statements.length > 0) {
            statements = this.statements[0].toJSON();
            for (let i = 1; i < this.statements.length; i++) {
                statements = statements.concat(`,${this.statements[i].toJSON()}`);
            }
        }
        let renderStart = this.renderStart ? "true" : "false"
        return `{"signature":"${this.name}","renderStart":${renderStart},"statements":[${statements}]}`;
    }

}
