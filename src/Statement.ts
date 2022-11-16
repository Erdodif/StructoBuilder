export class StatementDeSerializer {
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

    static fromJsonString(json: string): Statement | IfStatement | SwitchStatement | LoopStatement | ReversedLoopStatement {
        return this.fromJson(JSON.parse(json));
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

export enum StatementType {
    S_NORMAL = "normal",
    S_IF = "if",
    S_SWITCH = "switch",
    S_LOOP = "loop",
    S_LOOP_REVERSE = "loop-reverse",
    S_BLANK = "empty"
}