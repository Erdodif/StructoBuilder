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

    static fromJson(json: any): Statement {
        let _content: string | null = json?.content ?? null;
        let _type: StatementType;
        if (json?.type != null) {
            _type = json.type;
        }
        else if (_content == null) {
            _type = StatementType.S_BLANK;
        }
        else {
            _type = StatementType.S_NORMAL;
        }
        return new Statement(_content, _type);
    }
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

    static fromJson(json: any): IfStatement {
        let statementBlocks: Statement[][] = [];
        for (const block of json?.blocks) {
            let statements: Statement[] = [];
            for (const statement of block) {
                statements.push(StatementDeSerializer.fromJson(statement));
            }
            statementBlocks.push(statements);
        }
        return new IfStatement(json?.content,statementBlocks);
    }
}

export class SwitchStatement extends IfStatement {
    predicates: string[];

    constructor();
    constructor(predicates: string[]);
    constructor(predicates: string[], statementBlocks: Statement[][]);
    constructor(predicates: string[] = [], statementBlocks: Statement[][] = [[]]) {
        super(null, statementBlocks);
        this._type = StatementType.S_SWITCH;
        this.predicates = predicates;
    }

    static fromJson(json: any): SwitchStatement {
        let cases: string[] = [];
        let blocks: Statement[][] = []
        for (const block of json.blocks) {
            cases.push(json?.case);
            let statements: Statement[] = [];
            for (const statement of block) {
                statements.push(StatementDeSerializer.fromJson(statement));
            }
            blocks.push(statements);
        }
        return new SwitchStatement(cases, blocks);
    }
}

export class LoopStatement extends Statement {
    statements: Statement[];

    constructor();
    constructor(content: string | null);
    constructor(content: string | null, satements: Statement[]);
    constructor(content: string | null = null, statements: Statement[] = []) {
        super(content, StatementType.S_LOOP);
        this.statements = [];
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
    S_BLANK = "empty",
}