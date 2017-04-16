import * as React from 'react';

export interface IRecordedProps {
  counterExternal: number;
}
export interface IControlsProps {
  updateCounter(newValue: number, finished: () => void): void;
  logNormal(caller: keyof React.ComponentLifecycle<any, any>, props: IPropsState<IRecordedProps, IInternalProps>): void;
  logChanging(caller: keyof React.ComponentLifecycle<any, any>, props: IChangingProps<IRecordedProps, IInternalProps>): void;
}
export interface IInternalProps { counterInternal: number; }
export interface IPropsState<P, S> {
  props: P;
  state: S;
}
export interface IChangingProps<P, S> {
  current: IPropsState<P, S>;
  next: IPropsState<P, S>;
  prev: IPropsState<P, S>;
}

class LifecycleCheckTarget extends React.Component<IRecordedProps & IControlsProps, IInternalProps> {
  constructor(props: IRecordedProps & IControlsProps) {
    super(props);
    this.state = {
      counterInternal: 0,
    };
  }

  componentWillMount() {
    this.logNormal('componentWillMount');
  }
  componentDidMount() {
    this.logNormal('componentDidMount');
  }
  componentWillReceiveProps(nextProps: Readonly<IRecordedProps & IControlsProps>) {
    this.logChanging('componentWillReceiveProps', { next: { props: this.clean(nextProps), state: this.state } });

    if (nextProps.counterExternal === 4) {
      this.setState(() => ({ counterInternal: 4 }), () => console.log('setState callback'));
    }
  }
  shouldComponentUpdate(nextProps: Readonly<IRecordedProps & IControlsProps>, nextState: Readonly<IInternalProps>): boolean {
    this.logChanging('shouldComponentUpdate', { next: { props: this.clean(nextProps), state: nextState } });
    return true;
  }
  componentWillUpdate(nextProps: Readonly<IRecordedProps & IControlsProps>, nextState: Readonly<IInternalProps>): void {
    this.logChanging('componentWillUpdate', { next: { props: this.clean(nextProps), state: nextState } });
  }
  componentDidUpdate(prevProps: Readonly<IRecordedProps & IControlsProps>, prevState: Readonly<IInternalProps>): void {
    this.logChanging('componentDidUpdate', { prev: { props: this.clean(prevProps), state: prevState } });

    if (this.state.counterInternal === 0) {
      setTimeout(() => {
        console.group('begin state only');
        this.setState(() => ({ counterInternal: 1 }), () => console.groupEnd());
        console.log('actual setState call finished');
      }, 100);
    } else if (this.state.counterInternal === 1 && this.props.counterExternal === 1) {
      setTimeout(() => {
        console.group('begin state and props async');
        this.props.updateCounter(this.props.counterExternal + 1, () => console.log('props finished'));
        this.setState(() => ({ counterInternal: 2 }), () => console.groupEnd());
        console.log('actual setState call finished');
      }, 100);
    } else if (this.state.counterInternal === 2 && this.props.counterExternal === 2) {
      setTimeout(() => {
        console.group('begin state then props on callback');
        this.setState(() => ({ counterInternal: 3 }), () => {
          this.props.updateCounter(this.props.counterExternal + 1, () => {
            console.log('props finished');
            console.groupEnd();
          });
        });
        console.log('actual setState call finished');
      }, 100);
    } else if (this.props.counterExternal === 3) {
      console.group('begin props then update state in componentWillReceiveProps');
      this.props.updateCounter(this.props.counterExternal + 1, () => {
        console.log('props finished');
        console.groupEnd();
      });
      console.log('actual updateCounter call finished');
    }
  }
  componentWillUnmount(): void {
    this.logNormal('componentWillUnmount');
  }

  render(): JSX.Element | null {
    return null;
  }

  private clean(props: IRecordedProps & IControlsProps): IRecordedProps {
    return {
      counterExternal: props.counterExternal,
    };
  }

  private logNormal(caller: keyof React.ComponentLifecycle<any, any>) {
    this.props.logNormal(caller, { props: this.clean(this.props), state: this.state });
  }

  private logChanging(caller: keyof React.ComponentLifecycle<any, any>, props: Partial<IChangingProps<IRecordedProps, IInternalProps>>) {
    const current = { props: this.clean(this.props), state: this.state };
    const {
      next = current,
      prev = current,
    } = props;
    this.props.logChanging(caller, {
      current,
      next,
      prev,
    });
  }
}

export class LifecycleCheck extends React.Component<{}, IRecordedProps> {

  constructor(props: {}) {
    super(props);
    this.state = {
      counterExternal: 0,
    };

    console.group('begin mount');
  }

  componentDidMount() {
    console.groupEnd(); // end mount

    setTimeout(() => {
      console.group('begin props only');
      this.setState(() => ({ counterExternal: 1 }), () => console.groupEnd());
    }, 100);
  }

  render() {
    return (
      <LifecycleCheckTarget
        {...this.state}
        updateCounter={this.updateCounter}
        logNormal={this.logNormal}
        logChanging={this.logChanging} />
    );
  }

  private updateCounter = (newValue: number, callback: () => void) => this.setState({ counterExternal: newValue }, callback);

  private logNormal(caller: keyof React.ComponentLifecycle<any, any>, {props, state}: IPropsState<IRecordedProps, IInternalProps>) {
    console.log({
      caller,
      current: Object.assign({}, props, state),
    });
  }

  private logChanging(caller: keyof React.ComponentLifecycle<any, any>, p: IChangingProps<IRecordedProps, IInternalProps>) {
    console.log({
      caller,
      current: Object.assign({}, p.current.props, p.current.state),
      prev: Object.assign({}, p.prev.props, p.prev.state),
      next: Object.assign({}, p.next.props, p.next.state),
    });
  }

}
