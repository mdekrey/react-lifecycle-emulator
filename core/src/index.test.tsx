import 'mocha';
import {expect} from 'chai';

import * as React from 'react';

import {reactEmulator} from './index';

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
