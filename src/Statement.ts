/**
 * Deserializer for Statement class
 */
export class StatementDeSerializer {

    /**
     * Returns the proper statement from json Object 
     * @param json JSON Object wich satisfies one of the Statement Interfaces
     * @returns Statement based on the given type
     */
    static fromJson(json: I_Statement | I_IfStatement | I_SwitchStatement | I_LoopStatement):
        Statement | IfStatement | SwitchStatement | LoopStatement | ReversedLoopStatement {
        switch (json.type) {
            case "normal":
                return Statement.fromJson(json);
            case "if":
                return IfStatement.fromJson(json as I_IfStatement);
            case "switch":
                return SwitchStatement.fromJson(json as I_SwitchStatement);
            case "loop":
                return LoopStatement.fromJson(json as I_LoopStatement);
            case "loop-reverse":
                return ReversedLoopStatement.fromJson(json as I_LoopStatement);
            default:
                return new Statement();
        }
    }

    /**
     * Returns the proper statement from json String 
     * @param json String, which contains a valid JSON
     * @returns Statement based on the given type
     */
    static fromJsonString(json: string): Statement | IfStatement | SwitchStatement | LoopStatement | ReversedLoopStatement {
        return this.fromJson(JSON.parse(json));
    }

    /**
     * Gives the proper StatementType
     * @param type A string
     * @returns StatementType based on the given string (Default: S_BLANK)
     */
    static getStatementTypeFromString(type: string): StatementType {
        switch (type) {
            case "normal":
                return StatementType.S_NORMAL;
            case "if":
                return StatementType.S_IF;
            case "switch":
                return StatementType.S_SWITCH;
            case "loop":
                return StatementType.S_LOOP;
            case "loop-reverse":
                return StatementType.S_LOOP_REVERSE;
            default:
                return StatementType.S_BLANK;
        }
    }
}

/**
 * Converter class for non-trivial Statement conversions
 */
export class StatementConverter {

    /**
     * Converts A Statement into an IfStatement
     * @param statement Can be a loop, a Switch or a regular Statement
     * @returns The Desired IfStatement
     */
    static toIfStatement(statement: Statement | IfStatement | SwitchStatement | LoopStatement | ReversedLoopStatement): IfStatement {
        if (statement instanceof IfStatement) {
            return statement;
        }
        if (statement instanceof SwitchStatement) {
            let elsePart: Statement[] = [];
            if (statement.blocks && statement.blocks.length > 1 && statement.blocks[statement.blocks.length - 1].case === "else") {
                elsePart = statement.blocks[statement.blocks.length - 1].statements;
            }
            return new IfStatement(statement?.blocks[0]?.case ?? null, [statement?.blocks[0]?.statements ?? [], elsePart]);
        }
        if (statement instanceof LoopStatement || statement instanceof ReversedLoopStatement) {
            return new IfStatement(statement?.content ?? null, [statement?.statements ?? [], []]);
        }
        if (statement instanceof Statement) {
            return new IfStatement(statement?.content ?? null);
        }
        throw new TypeError(`There's no explicit conversion between never and IfStatement!`);
    }

    /**
     * Converts A Statement into an IfStatement
     * @param statement An If of regular Statement
     * @returns A SwitchStatement
     */
    static toSwitchStatement(statement: Statement | IfStatement): SwitchStatement {
        if (statement instanceof IfStatement) {
            let firstCaseBlock: I_CaseBlock = { case: statement.content!, statements: statement.statementBlocks[0] };
            let secondCaseBlock: I_CaseBlock = { case: "else", statements: statement.statementBlocks[1] };
            return new SwitchStatement([firstCaseBlock, secondCaseBlock]);
        }
        if(statement instanceof Statement){
            return new SwitchStatement();
        }
        throw new TypeError(`There's no explicit conversion between never and SwitchStatement!`);
    }

    /**
     * Converts A Statement into a LoopStatement
     * @param statement A regular Statement
     * @returns A LoopStatement
     */
    static toLoopStatement(statement: Statement | ReversedLoopStatement): LoopStatement {
        if(statement instanceof ReversedLoopStatement){
            return new LoopStatement(statement.content,statement.statements);
        }
        if (statement instanceof Statement) {
            return new LoopStatement(statement.content);
        }
        throw new TypeError(`There's no explicit conversion between never and LoopStatement!`);
    }

    /**
     * Converts A Statement into a ReversedLoopStatement
     * @param statement A regular Statement
     * @returns A ReversedLoopStatement
     */
    static toReversedLoopStatement(statement: Statement | LoopStatement): ReversedLoopStatement {
        if(statement instanceof ReversedLoopStatement){
            return new ReversedLoopStatement(statement.content,statement.statements);
        }
        if (statement instanceof Statement) {
            return new ReversedLoopStatement(statement.content);
        }
        throw new TypeError(`There's no explicit conversion between never and ReversedLoopStatement!`);
    }

    /**
     * Converts an InfStatement into an array of Statements, starting with a LoopStatement (with the "true" part), 
     * followed by the rest of the statements (the "else" part)
     * @param statement An IfStatement
     * @returns An array of Statements, which starts with a LoopStatement
     */
    static ifToLoopStatementScope(statement: IfStatement): Statement[] {
        return [new LoopStatement(statement.content, statement.statementBlocks[0]), ...statement.statementBlocks[1]];
    }

}

export interface I_Statement { content: string, type: string };

/**
 * An Object representing a single, syncronous statement on a Structogram
 */
export class Statement {
    protected _type: StatementType = StatementType.S_BLANK;
    content: string | null;
    type = () => this._type;

    constructor();
    constructor(content: string | null);
    constructor(content: string | null, type: StatementType);
    constructor(content: string | null = null, type: StatementType = StatementType.S_BLANK) {
        this.content = content;
        if (type === StatementType.S_BLANK && content !== null) {
            this._type = StatementType.S_NORMAL;
        }
        else {
            this._type = type;
        }
    }

    static fromJson(json: I_Statement): Statement {
        let _content: string | null = json?.content ?? null;
        let _type: StatementType;
        _type = StatementDeSerializer.getStatementTypeFromString(json.type);
        if (_content != null && _type == StatementType.S_BLANK) {
            _type = StatementType.S_NORMAL;
        }
        return new Statement(_content, _type);
    }

    toJSON() {
        if (this._type === StatementType.S_BLANK) {
            return `{"type":"empty"}`;
        }
        return `{"type":"${this.type()}","content":"${this.content}"}`;
    }
}

export interface I_IfStatement extends I_Statement {
    blocks: I_Statement[][];
}

/**
 * An Object representing a simple junction point on a Structogram
 */
export class IfStatement extends Statement {
    statementBlocks: Statement[][];

    constructor();
    constructor(content: string | null);
    constructor(content: string | null, statementBlocks: Statement[][]);
    constructor(content: string | null = null, statementBlocks: Statement[][] = [[]]) {
        super(content, StatementType.S_IF);
        this.statementBlocks = statementBlocks;
    }

    static fromJson(json: I_IfStatement): IfStatement {
        let statementBlocks: Statement[][] = [];
        for (let i = 0; i < 2; i++) {
            if (i > (json?.blocks?.length - 1) ?? -1) {
                statementBlocks.push([]);
            }
            else {
                let statements: Statement[] = [];
                for (const statement of json.blocks[i]) {
                    statements.push(StatementDeSerializer.fromJson(statement));
                }
                statementBlocks.push(statements);
            }
        }
        return new IfStatement(json.content, statementBlocks);
    }

    toJSON() {
        let truePart = "";
        let falsePart = "";
        if (this.statementBlocks.length > 0) {
            if (this.statementBlocks[0].length > 0) {
                truePart = this.statementBlocks[0][0].toJSON();
            }
            for (let i = 1; i < this.statementBlocks[0].length; i++) {
                truePart = truePart.concat(`,${this.statementBlocks[0][i].toJSON()}`);
            }
        }
        if (this.statementBlocks.length > 1 && this.statementBlocks.length > 0) {
            if (this.statementBlocks[1].length > 0) {
                falsePart = this.statementBlocks[1][0].toJSON();
            }
            for (let i = 1; i < this.statementBlocks[1].length; i++) {
                falsePart = falsePart.concat(`,${this.statementBlocks[1][i].toJSON()}`);
            }
        }
        return `{"type":"${this.type()}","content":"${this.content}","blocks":[[${truePart}],[${falsePart}]]}`;
    }
}

export interface I_CaseBlock { case: string, statements: Statement[] };
export interface I_SwitchStatement extends I_Statement {
    blocks: { case: string, statements: I_Statement[] }[];
}

/**
 * An Object representing a multiple selection junction point on a Structogram
 */
export class SwitchStatement extends Statement {
    blocks: { case: string, statements: Statement[] }[];

    constructor();
    constructor(blocks: I_CaseBlock[])
    constructor(blocks: I_CaseBlock[] = []) {
        super(null, StatementType.S_SWITCH);
        this.blocks = blocks;
    }

    static fromJson(json: I_SwitchStatement): SwitchStatement {
        let blocks: { case: string, statements: Statement[] }[] = []
        for (const block of json.blocks) {
            let statements: Statement[] = [];
            for (const statement of block.statements) {
                statements.push(StatementDeSerializer.fromJson(statement));
            }
            blocks.push({ case: block.case, statements: statements });
        }
        if (blocks.length < 2) {
            blocks.push({ case: "else", statements: [] });
        }
        return new SwitchStatement(blocks);
    }

    private static caseBlockToJSON(block: { case: string, statements: Statement[] }) {
        let statements = "";
        if (block.statements.length > 0) {
            statements = block.statements[0].toJSON();
            for (let i = 1; i < block.statements.length; i++) {
                statements = statements.concat(`,${block.statements[i].toJSON()}`);
            }
        }
        return `{"case":"${block.case}","statements":[${statements}]}`;
    }

    toJSON() {
        let sBlocks = "";
        if (this.blocks.length > 0) {
            sBlocks = SwitchStatement.caseBlockToJSON(this.blocks[0]);
            for (let i = 1; i < this.blocks.length; i++) {
                sBlocks = sBlocks.concat(`,${SwitchStatement.caseBlockToJSON(this.blocks[i])}`);
            }
        }
        return `{"type":"${this.type()}","blocks":[${sBlocks}]}`;
    }
}

export interface I_LoopStatement extends I_Statement { statements: I_Statement[] };

/**
 * An Object representing a repetitive action on a Structogram (based on a condition, tested before each execution)
 */
export class LoopStatement extends Statement {
    statements: Statement[];

    constructor();
    constructor(content: string | null);
    constructor(content: string | null, satements: Statement[]);
    constructor(content: string | null = null, statements: Statement[] = []) {
        super(content, StatementType.S_LOOP);
        this.statements = statements;
    }

    static fromJson(json: I_LoopStatement): LoopStatement {
        let statements: Statement[] = [];
        for (const statement of json?.statements) {
            statements.push(StatementDeSerializer.fromJson(statement));
        }
        return new LoopStatement(json?.content ?? null, statements);
    }

    toJSON() {
        let statements = "";
        if (this.statements.length > 0) {
            statements = this.statements[0].toJSON();
            for (let i = 1; i < this.statements.length; i++) {
                statements = statements.concat(`,${this.statements[i].toJSON()}`);
            }
        }
        return `{"type":"${this.type()}","content":"${this.content}","statements":[${statements}]}`;
    }
}

/**
 * An Object representing a repetitive action on a Structogram (based on a condition, tested after each execution)
 */
export class ReversedLoopStatement extends LoopStatement {
    constructor();
    constructor(content: string | null);
    constructor(content: string | null, satements: Statement[]);
    constructor(content: string | null = null, statements: Statement[] = []) {
        super(content, statements);
        this._type = StatementType.S_LOOP_REVERSE;
    }

    static fromJson(json: I_LoopStatement): LoopStatement {
        let statements: Statement[] = [];
        for (const statement of json?.statements) {
            statements.push(StatementDeSerializer.fromJson(statement));
        }
        return new ReversedLoopStatement(json?.content ?? null, statements);
    }

    toJSON(): string {
        return super.toJSON();
    }
}


/**
 * Type of a Statement (mostly used in serialization)
 */
export enum StatementType {
    S_NORMAL = "normal",
    S_IF = "if",
    S_SWITCH = "switch",
    S_LOOP = "loop",
    S_LOOP_REVERSE = "loop-reverse",
    S_BLANK = "empty"
}