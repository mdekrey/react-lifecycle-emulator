import 'mocha';
import {expect} from 'chai';

import * as React from 'react';

import {reactEmulator} from './index';
import {
  IChangingProps,
  IRecordedProps,
  IRecordedState,
  ScriptRunner,
  ScriptToRun,
} from '../../react-test-environment/src/lifecycle-check';

interface Log {
  eventName: string;
  params?: IChangingProps<IRecordedProps, IRecordedState>;
}

interface IBasicProps {
  onClick?: () => void;
}

class Basic extends React.Component<IBasicProps, never> {
  render() {
    return (
      <div onClick={this.handleClick}>For testing purposes</div>
    );
  }

  calculate = (a: number, b: number) => a + b;
  handleClick = () => this.props.onClick!();
}

describe('lifecycle emulator', () => {
  const emulator = reactEmulator<Basic>(Basic);

  it('constructs the component', () => {
    const target = emulator.construct({ });

    expect(target.component).to.be.instanceof(Basic);
  });

  it('allows access to click handlers', () => {
    let called = false;
    const target = emulator.construct({ onClick: () => called = true });

    target.component.handleClick();

    expect(called).to.be.true;
  });

  it('allows access to calculation functions', () => {
    const target = emulator.construct({ });

    const result = target.component.calculate(1, 2);

    expect(result).to.be.equal(3);
  });

  it('does not render yet', () => {
    const target = emulator.construct({ });

    const result = target.getRendered();

    expect(result).to.be.null;
  });

  describe('handles lifecycle events properly: ', () => {
    function run(script: ScriptToRun, result: Log[]) {
      let done = false;
      const logs: Log[] = [];
      const em = reactEmulator<ScriptRunner>(ScriptRunner);
      const target = em.construct({
        script,
        completed: () => done = true,
        log: (eventName, params) => {
          logs.push({ eventName, params });
        },
      });

      target.controls.mount();
      const elem = target.getRendered();
      const childEmulator = reactEmulator(elem!.type);
      const child = childEmulator.construct(elem!.props);
      child.controls.mount();

      target.rendering.subscribe(() => {
        child.controls.updateProps(target.getRendered()!.props);
      });

      for (let i = 0; i < 100 && !done; i++) {
        target.controls.checkUpdate();
        child.controls.checkUpdate();
      }

      expect(logs).to.be.eql(result);
      expect(done).to.be.true;
    }

    it('runs "OnMount" as expected', () => {
      run('OnMount', require('./test/OnMount.result.json'));
    });

    it('runs "PropsOnly" as expected', () => {
      run('PropsOnly', require('./test/PropsOnly.result.json'));
    });

    it('runs "StateOnly" as expected', () => {
      run('StateOnly', require('./test/StateOnly.result.json'));
    });

    it('runs "StateAndPropsAsync" as expected', () => {
      run('StateAndPropsAsync', require('./test/StateAndPropsAsync.result.json'));
    });

    it('runs "StateThenCallbackProps" as expected', () => {
      run('StateThenCallbackProps', require('./test/StateThenCallbackProps.result.json'));
    });

    it('runs "PropsAndStateInWillReceive" as expected', () => {
      run('PropsAndStateInWillReceive', require('./test/PropsAndStateInWillReceive.result.json'));
    });
  });

  describe('allows the component to be mounted and then', () => {
    it('access the props', () => {
      let called = false;
      const onClick = () => called = true;
      const target = emulator.construct({ onClick });
      target.controls.mount();

      expect(target.component.props.onClick).to.be.equal(onClick);
    });

    it('accesses the rendered values', () => {
      const target = emulator.construct({ });
      target.controls.mount();

      // Under most circumstances, you probably should not be testing the rendered
      // result. However, since React does always render, we will here, too, and
      // give you access to it.
      const result = target.getRendered();

      expect(result).to.be.not.null;
      if (result != null) {
        expect(result.type).to.equal('div');
        expect(result.props.onClick).to.equal(target.component.handleClick);
        expect(result.props.children).to.equal('For testing purposes');
      }
    });
  });
});
