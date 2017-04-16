import * as React from 'react';

export type LifecycleEventName = keyof React.ComponentLifecycle<any, any>;

export interface ILogProps<ExtraProps, ExtraState> {
    log(eventName: LifecycleEventName, status: IChangingProps<ExtraProps, ExtraState>): void;
}

// tslint:disable-next-line:no-empty-interface
export interface ILogState {
}

export interface IPropsState<P, S> {
    props: Readonly<P>;
    state: Readonly<S>;
}
export interface IChangingProps<P, S> {
    current: IPropsState<P, S>;
    next: IPropsState<P, S>;
    prev: IPropsState<P, S>;
}

export abstract class Log<TProps extends ILogProps<ExtraProps, ExtraState>, ExtraProps, TState extends ILogState, ExtraState>
    extends React.Component<TProps, TState> {


    constructor(
        private propsAccessor: (props: Readonly<TProps>) => Readonly<ExtraProps>,
        private stateAccessor: (props: Readonly<TState>) => Readonly<ExtraState>,
    ) {
        super();
    }


    componentWillMount() {
        this.log('componentWillMount');
    }
    componentDidMount() {
        this.log('componentDidMount');
    }
    componentWillReceiveProps(nextProps: Readonly<TProps>) {
        this.log('componentWillReceiveProps', { next: { props: nextProps, state: this.state } });
    }
    shouldComponentUpdate(
        nextProps: Readonly<TProps>,
        nextState: Readonly<TState>,
    ): boolean {
        this.log('shouldComponentUpdate', { next: { props: nextProps, state: nextState } });
        return true;
    }
    componentWillUpdate(
        nextProps: Readonly<TProps>,
        nextState: Readonly<TState>,
    ): void {
        this.log('componentWillUpdate', { next: { props: nextProps, state: nextState } });
    }
    componentDidUpdate(
        prevProps: Readonly<TProps>,
        prevState: Readonly<TState>,
    ): void {
        this.log('componentDidUpdate', { prev: { props: prevProps, state: prevState } });
    }
    componentWillUnmount(): void {
        this.log('componentWillUnmount');
    }

    protected log(
        eventName: LifecycleEventName,
        args?: Partial<IChangingProps<TProps, TState>>,
    ): void {
        const { current = this.buildPropsState(), prev = this.buildPropsState(), next = this.buildPropsState() } = args || {};

        this.props.log(eventName, {
            current: this.clean(current),
            prev: this.clean(prev),
            next: this.clean(next),
        });
    }

    private buildPropsState(): IPropsState<TProps, TState> {
        return {
            props: this.props,
            state: this.state,
        };
    }

    private clean({ props, state }: IPropsState<TProps, TState>) {
        return {
            props: this.propsAccessor(props),
            state: this.stateAccessor(state),
        };
    }
}
