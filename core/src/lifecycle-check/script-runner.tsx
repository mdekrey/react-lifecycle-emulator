import * as React from 'react';

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
    log: IScriptedProps['log'];
}

export interface IScriptRunnerState {
    script: HookAndInstruction[];
    recorded: IRecordedProps;
}

export class ScriptRunner extends React.Component<IScriptRunnerProps, IScriptRunnerState> {
    private started = false;

    constructor(props: IScriptRunnerProps) {
        super();
        this.state = {
            script: ScriptRunner.getScript(props.script, this),
            recorded: {counterExternal: 0},
        };
    }

    render() {
        return (
            <Scripted log={this.log} script={this.state.script} recorded={this.state.recorded}>
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

    private stop = (action?: () => void) => {
        return () => {
            this.started = false;
            (action || this.props.completed)();
        };
    }

    static getScript(script: ScriptToRun, target: ScriptRunner): HookAndInstruction[] {
        switch (script) {
            case 'OnMount':
                target.start();
                return [
                    { on: 'componentDidMount', action: target.stop() },
                ];
            case 'PropsOnly':
                return [
                    {
                        on: 'componentDidMount',
                        action: target.start(
                            () =>
                                target.setState(
                                    { recorded: { counterExternal: 1 } },
                                    target.stop(),
                                ),
                            ),
                    },
                ];
            case 'StateOnly':
                return [
                    {
                        on: 'componentDidMount',
                        action: target.start<HookAndInstruction['action']>(
                            (setState) =>
                                setState(
                                    () => ({ counterInternal: 1 }),
                                    target.stop(),
                                ),
                            ),
                    },
                ];
            case 'StateAndPropsAsync': {
                let finishCount = 0;
                const finish = () => {
                    finishCount++;
                    if (finishCount === 2) {
                        target.stop()();
                    }
                };
                return [
                    {
                        on: 'componentDidMount',
                        action: target.start<HookAndInstruction['action']>(
                            (setState) => {
                                target.setState(
                                    { recorded: { counterExternal: 1 } },
                                    () => {
                                        finish();
                                    },
                                );
                                setState(
                                    () => ({ counterInternal: 1 }),
                                    () => {
                                        finish();
                                    },
                                );
                            }),
                    },
                ];
            }
            case 'StateThenCallbackProps':
                return [
                    {
                        on: 'componentDidMount',
                        action: target.start<HookAndInstruction['action']>(
                            (setState) =>
                                setState(
                                    () => ({ counterInternal: 1 }),
                                    () =>
                                        target.setState(
                                            { recorded: { counterExternal: 1 } },
                                            target.stop(),
                                        ),
                                ),
                            ),
                    },
                ];
            case 'PropsAndStateInWillReceive': {
                let finishCount = 0;
                const finish = () => {
                    finishCount++;
                    if (finishCount === 2) {
                        target.stop()();
                    }
                };
                return [
                    {
                        on: 'componentDidMount',
                        action: target.start(
                            () =>
                                target.setState(
                                    { recorded: { counterExternal: 1 } },
                                    () => {
                                        finish();
                                    },
                                ),
                            ),
                    },
                    {
                        on: 'componentWillReceiveProps',
                        action: (setState) =>
                            setState(
                                () => ({ counterInternal: 1 }),
                                () => {
                                    finish();
                                },
                            ),
                    },
                ];
            }
            default:
                return neverEver(script);
        }
    }
}

function neverEver(_: never): never {
    throw new Error('Not implemented');
}
