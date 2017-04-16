import * as React from 'react';

import { IChangingProps } from './log';
import { HookAndInstruction, IRecordedProps, IScriptedProps, Scripted } from './scripted';

export type ScriptToRun =
    'OnMount'
    | 'PropsOnly'
    | 'StateOnly'
    | 'StateAndPropsAsync'
    | 'StateThenCallbackProps'
    | 'PropsAndStateInWillReceive';

export interface IScriptRunnerProps {
    script: ScriptToRun;
    completed: () => void;
    log(eventName: string, status?: IChangingProps<IRecordedProps, any>): void;
}

export class ScriptRunner extends React.Component<IScriptRunnerProps, IRecordedProps> {
    private started = false;

    constructor() {
        super();
        this.state = { counterExternal: 0 };
    }

    render() {
        const script = this.getScript();
        return (
            <Scripted log={this.log} {...this.state} script={script} recorded={this.state}>
            </Scripted>
        );
    }

    private log: IScriptedProps['log'] = (eventName, status) => {
        if (this.started) {
            this.props.log(eventName, status);
        }
    }

    private start(): void;
    private start<T extends Function>(action: T): T;
    private start(action?: (...args: any[]) => void) {
        if (action) {
            return (...args: any[]) => {
                this.started = true;
                action(...args);
            };
        } else {
            this.started = true;
        }
    }

    private stop = (action: () => void = this.props.completed) => {
        return () => {
            this.started = false;
            action();
        };
    }

    getScript(): HookAndInstruction[] {
        const {script} = this.props;
        switch (script) {
            case 'OnMount':
                this.start();
                return [
                    { on: 'componentDidMount', action: this.stop() },
                ];
            case 'PropsOnly':
                return [
                    {
                        on: 'componentDidMount',
                        action: this.start(
                            () =>
                                this.setState(
                                    { counterExternal: 1 },
                                    this.stop(),
                                ),
                            ),
                    },
                ];
            case 'StateOnly':
                return [
                    {
                        on: 'componentDidMount',
                        action: this.start<HookAndInstruction['action']>(
                            (setState) =>
                                setState(
                                    () => ({ counterInternal: 1 }),
                                    this.stop(),
                                ),
                            ),
                    },
                ];
            case 'StateAndPropsAsync':
                return [
                    {
                        on: 'componentDidMount',
                        action: this.start<HookAndInstruction['action']>(
                            (setState) => {
                                let finishCount = 0;
                                const finish = () => {
                                    finishCount++;
                                    if (finishCount === 2) {
                                        this.stop()();
                                    }
                                };
                                this.setState(
                                    { counterExternal: 1 },
                                    finish,
                                );
                                setState(
                                    () => ({ counterInternal: 1 }),
                                    finish,
                                );
                            }),
                    },
                ];
            case 'StateThenCallbackProps':
                return [
                    {
                        on: 'componentDidMount',
                        action: this.start<HookAndInstruction['action']>(
                            (setState) =>
                                setState(
                                    () => ({ counterInternal: 1 }),
                                    () =>
                                        this.setState(
                                            { counterExternal: 1 },
                                            this.stop(),
                                        ),
                                ),
                            ),
                    },
                ];
            case 'PropsAndStateInWillReceive':
                return [
                    {
                        on: 'componentDidMount',
                        action: this.start(
                            () =>
                                this.setState(
                                    { counterExternal: 1 },
                                    this.stop(),
                                ),
                            ),
                    },
                    {
                        on: 'componentWillReceiveProps',
                        action: (setState) =>
                            setState(
                                () => ({ counterInternal: 1 }),
                                () => this.props.log('state update completed'),
                            ),
                    },
                ];
            default:
                return neverEver(script);
        }
    }
}

function neverEver(_: never): never {
    throw new Error('Not implemented');
}
