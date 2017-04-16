import * as React from 'react';
import { IChangingProps, ILogProps, ILogState, Log, LifecycleEventName } from './log';

export interface HookAndInstruction {
    on: LifecycleEventName;
    action: (setState: (state: (prevState: IRecordedState) => IRecordedState, callback: () => void) => void) => void;
}

export interface IScriptedProps extends ILogProps<IRecordedProps, IRecordedState> {
    script: HookAndInstruction[];
    recorded: IRecordedProps;
}

export interface IScriptedState extends ILogState {
    recorded: IRecordedState;
}

export interface IRecordedProps {
    counterExternal: number;
}
export interface IRecordedState {
    counterInternal: number;
}


export class Scripted extends Log<IScriptedProps, IRecordedProps, IScriptedState, IRecordedState> {
    private scriptCounter = 0;

    constructor() {
        super(p => p.recorded, s => s.recorded);
        this.state = {
            recorded: { counterInternal: 0 },
        };
    }

    render() {
        return (
            <pre>
                Something here?
            </pre>
        );
    }

    protected log(
        eventName: LifecycleEventName,
        args?: Partial<IChangingProps<IScriptedProps, IScriptedState>>,
    ): void {
        super.log(eventName, args);

        if (this.props.script[this.scriptCounter] && this.props.script[this.scriptCounter].on === eventName) {
            this.props.script[this.scriptCounter++].action(
                (mutate, callback) =>
                    this.setState(({recorded}) => ({ recorded: mutate(recorded) }), callback),
            );
        }
    }
}
