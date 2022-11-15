export class StatementDeSerializer {
    static fromJson(json: any): Statement {
        switch (json.type) {
            case "normal":
                return Statement.fromJson(json);
            case "if":
                return IfStatement.fromJson(json);
            case "switch":
                return SwitchStatement.fromJson(json);
            case "loop":
                return LoopStatement.fromJson(json);
            case "loop-reverse":
                return ReversedLoopStatement.fromJson(json);
            default:
                return new Statement();
        }
    }

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

export interface I_Statement { content: string, type: string };
export class Statement {
    protected _type: StatementType = StatementType.S_BLANK;
    content: string | null;
    type = () => this._type;

    constructor();
    constructor(content: string | null);
    constructor(content: string | null, type: StatementType);
    constructor(content: string | null = null, type: StatementType = StatementType.S_BLANK) {
        this.content = content;
        this._type = type;
    }

    toJSON() {
        let temp = this;
        temp._type = this._type;
        return JSON.stringify(temp);
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
}

export interface I_IfStatement extends I_Statement {
    blocks: I_Statement[][];
}
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
        for (const block of json.blocks) {
            let statements: Statement[] = [];
            for (const statement of block) {
                statements.push(StatementDeSerializer.fromJson(statement));
            }
            statementBlocks.push(statements);
        }
        return new IfStatement(json.content, statementBlocks);
    }
}

export interface I_CaseBlocks { case: string, statements: Statement[] };
export interface I_SwitchStatement extends I_Statement {
    blocks: { case: string, statements: I_Statement[] }[];
}
export class SwitchStatement extends Statement {
    blocks: { case: string, statements: Statement[] }[];

    constructor();
    constructor(blocks: I_CaseBlocks[])
    constructor(blocks: I_CaseBlocks[] = []) {
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
        return new SwitchStatement(blocks);
    }
}

export interface I_LoopStatement extends I_Statement { statements: I_Statement[] };
export class LoopStatement extends Statement {
    statements: Statement[];

    constructor();
    constructor(content: string | null);
    constructor(content: string | null, satements: Statement[]);
    constructor(content: string | null = null, statements: Statement[] = []) {
        super(content, StatementType.S_LOOP);
        this.statements = statements;
    }

    static fromJson(json: any): LoopStatement {
        let statements: Statement[] = []
        for (const statement of json?.statements) {
            statements.push(StatementDeSerializer.fromJson(statement));
        }
        return new LoopStatement(json?.content ?? null, statements);
    }
}

export class ReversedLoopStatement extends LoopStatement {
    constructor();
    constructor(content: string | null);
    constructor(content: string | null, satements: Statement[]);
    constructor(content: string | null = null, statements: Statement[] = []) {
        super(content, statements);
        this._type = StatementType.S_LOOP_REVERSE;
    }

    static fromJson(json: any): LoopStatement {
        let statements: Statement[] = []
        for (const statement of json?.statements) {
            statements.push(StatementDeSerializer.fromJson(statement));
        }
        return new ReversedLoopStatement(json?.content ?? null, statements);
    }
}

export enum StatementType {
    S_NORMAL = "normal",
    S_IF = "if",
    S_SWITCH = "switch",
    S_LOOP = "loop",
    S_LOOP_REVERSE = "loop-reverse",
    S_BLANK = "empty"
}