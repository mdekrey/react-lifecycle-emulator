import * as React from 'react';

export interface IExternalProps {
  counterExternal: number;
  updateCounter(newValue: number, finished: () => void): void;
}
interface IInternalProps { counterInternal: number; }
interface IChangingProps<P, S> {
  nextProps?: P;
  nextState?: S;

  prevProps?: P;
  prevState?: S;
}

class LifecycleCheckTarget extends React.Component<IExternalProps, IInternalProps> {
  constructor(props: IExternalProps) {
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
  componentWillReceiveProps(nextProps: Readonly<IExternalProps>) {
    this.logChanging('componentWillReceiveProps', { nextProps });

    if (nextProps.counterExternal === 4) {
      this.setState(() => ({ counterInternal: 4 }), () => console.log('setState callback'));
    }
  }
  shouldComponentUpdate(nextProps: Readonly<IExternalProps>, nextState: Readonly<IInternalProps>): boolean {
    this.logChanging('shouldComponentUpdate', { nextProps, nextState });
    return true;
  }
  componentWillUpdate(nextProps: Readonly<IExternalProps>, nextState: Readonly<IInternalProps>): void {
    this.logChanging('componentWillUpdate', { nextProps, nextState });
  }
  componentDidUpdate(prevProps: Readonly<IExternalProps>, prevState: Readonly<IInternalProps>): void {
    this.logChanging('componentDidUpdate', { prevProps, prevState });

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

  private logNormal(caller: keyof React.ComponentLifecycle<any, any>) {
    console.log({
      caller,
      current: Object.assign({}, this.props, this.state)
    });
  }

  private logChanging(caller: keyof React.ComponentLifecycle<any, any>, props: IChangingProps<IExternalProps, IInternalProps>) {
    const {
      nextProps = this.props,
      nextState = this.state,

      prevProps = this.props,
      prevState = this.state,
    } = props;
    console.log({
      caller,
      current: Object.assign({}, this.props, this.state),
      prev: Object.assign({}, prevProps, prevState),
      next: Object.assign({}, nextProps, nextState),
    });
  }

  render(): JSX.Element | null {
    return null;
  }
}

export class LifecycleCheck extends React.Component<{}, IExternalProps> {

  constructor(props: {}) {
    super(props);
    this.state = {
      counterExternal: 0,
      updateCounter: (newValue, callback) => this.setState({ counterExternal: newValue }, callback),
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
    return <LifecycleCheckTarget {...this.state} />;
  }
}
