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
     * @param newStatement The new Statement
     * @throws When there's no statement on the given mapping
     */
    setElementByMapping(mapping: number[], newStatement: Statement): void {
        let old = this.getElementByMapping(mapping)
        if (old === null) {
            throw new Error("Statement not found!");
        }
        old = newStatement;
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
     */
    moveToPosition(from: number[], to: number[]): void {
        this.ensureMappingValid(from);
        let tmpStatement = this.getElementByMapping(from) as Statement | Statement[];
        let parentMapping = [...to];
        let index = parentMapping.pop()!;
        this.ensureMappingValid(parentMapping);
        let parent: Statement[] | Statement | null = to.length == 0 ? this.structogram.statements : this.getElementByMapping(parentMapping);
        if (parent === null) {
            throw new Error("Target parent element not found!");
        }
        if (parent instanceof LoopStatement) {

            return this.insertToPosition(parent.statements, tmpStatement, index);
        }
        if (Array.isArray(parent)) {
            return this.insertToPosition(parent, tmpStatement, index);
        }
        throw new Error(`Statement type "${parent.type()} is not capable to hold elements directly!"`);
    }

    /**
     * Inserts a statement item, or an array of statements into the given position.
     * @param array An array of Statement
     * @param statement A statement item or an array of statements
     * @param index The desired position
     */
    private insertToPosition(array: Statement[], statement: Statement | Statement[], index: number): void {
        if (array) {
            if (index > array.length) {
                index = -1;
            }
            if (Array.isArray(statement)) {
                array.splice(index, 0, ...statement);
                return;
            }
            array.splice(index, 0, statement);
            return;
        }
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
