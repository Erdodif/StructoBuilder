import { deepCopy } from "deep-copy-ts";
import {
    StatementType,
    Statement,
    StatementDeSerializer,
    LoopStatement,
    IfStatement,
    I_Statement,
    SwitchStatement,
    ReversedLoopStatement
} from "./Statement.js";

/**
 * Controller class for Structogram
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
                if (index > 1) {
                    return null;
                }
                return (holder as IfStatement).statementBlocks[index] as Statement[];
            case StatementType.S_SWITCH:
                if (index > (holder as SwitchStatement).blocks.length - 1) {
                    return null;
                }
                return (holder as SwitchStatement).blocks[index].statements as Statement[];
            case StatementType.S_LOOP:
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

    /**
     * Throws error if the there's no statement on the given mapping.
     * @param mapping The mapping to a position
     */
    private ensureMappingValid(mapping: number[]): void {
        if (mapping.length === 0) {
            throw new Error("Mappings should have at least one element each!");
        }
        if (this.getElementByMapping(mapping) === null) {
            throw new Error("Element not found!");
        }
    }

    /**
     * Sets Statement on the given position.
     * @param mapping The position of the old Element
     * @param newStatement The new Statement, a list of Statements, or null, to remove an element on the iven mapping
     * @param moveJam If there is an element on the given position, 
     * that statement and all statements after will be moved after the `newStatement`
     * (Default `false`, which means that the Statement on the given location will be overriden)
     * 
     * Note that if newStatement is null, a deletion will happen, and moveJam will be ignored.
     * @throws When there's no statement on the given mapping, or the mapping is incomplete
     */
    setElementByMapping(mapping: number[], newStatement: Statement[] | Statement | null, moveJam: boolean = false): void {
        let index = mapping.pop()!;
        if (mapping.length == 0) {
            if (this.structogram.statements.length < index) {
                index = this.structogram.statements.length - 1
            }
            if (Array.isArray(newStatement)) {
                this.structogram.statements.splice(index, moveJam ? 0 : 1, ...newStatement);
            }
            else if (newStatement) {
                this.structogram.statements.splice(index, moveJam ? 0 : 1, newStatement);
            }
            else {
                this.structogram.statements.splice(index, 1);
            }
            return;
        }
        if (!this.getElementByMapping(mapping)) {
            throw new Error("Statement not found!");
        }
        let statement = this.getElementByMapping(mapping);
        if (Array.isArray(statement)) {
            if (statement.length < index) {
                index = statement.length - 1
            }
            if (Array.isArray(newStatement)) {
                statement.splice(index, moveJam ? 0 : 1, ...newStatement);
            }
            else if (newStatement) {
                statement.splice(index, moveJam ? 0 : 1, newStatement);
            }
            else {
                statement.splice(index, 1);
            }
            return;
        }
        switch (statement?.type()) {
            case "loop":
            case "loop-reverse":
                if ((statement as LoopStatement).statements.length < index) {
                    index = (statement as LoopStatement).statements.length - 1
                }
                if (Array.isArray(newStatement)) {
                    (statement as LoopStatement).statements.splice(index, moveJam ? 0 : 1, ...newStatement);
                }
                else if (newStatement) {
                    (statement as LoopStatement).statements.splice(index, moveJam ? 0 : 1, newStatement);
                }
                else {
                    (statement as LoopStatement).statements.splice(index, 1);
                }
                return;
            default:
                throw new Error("Statement not capable for holding subElements directly.");
        }
    }

    /**
     * Moves a statement, or an array of statement into a new location.
     * 
     * Note that the desired location should ba capable of holding multiple statements.
     * 
     * Direct indexing to an IfStatement or a SwitchStatement will fail, 
     * beacuse the statetemt-block is not defined 
     * (in this case, clarify which block you want to insert).
     * @param from The mapping of the statement or an array of statement
     * @param to The mapping of the desired location
     * @param moveJam If there is an element on the given position, 
     * that statement and all statements after will be moved after the `newStatement`
     * (Default `false`, which means that the Statement on the given location will be overriden)
     * @throws If the origin of the statement is non-existing
     */
    moveToPosition(from: number[], to: number[], moveJam: boolean = false): void {
        let statement = this.getElementByMapping(from);
        if (statement === null) {
            throw new Error("Element not found!");
        }
        this.setElementByMapping(from, null);
        this.setElementByMapping(to, statement, moveJam)

    }

    /**
     * Swaps two statement on the given positions (only with statements).
     * @param left mapping to the first element
     * @param right mapping to the second element
     * @throws When the mapping are invalid.
     */
    swapStatements(left: number[], right: number[]) {
        this.ensureMappingValid(left);
        this.ensureMappingValid(right);
        let leftElement = this.getElementByMapping(left);
        let rightElement = this.getElementByMapping(right);
        if (rightElement instanceof Statement && leftElement instanceof Statement) {
            let tmpStatement: Statement = deepCopy(leftElement);
            this.setElementByMapping(left, rightElement);
            this.setElementByMapping(right, tmpStatement);
            return;
        }
        throw new Error("TypeError: One of the statements is an array!");
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
