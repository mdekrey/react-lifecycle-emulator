# React-Lifecycle-Emulator Core

A package to emulate React's lifecycle for components while making it easy to
unit test. For more information, see the full [react-lifecycle-emulator
project](/readme.md).

## Core usage

TypeScript:

    import {reactEmulator} from 'react-lifecycle-emulator';

    // without TSX
    const emulator = reactEmulator<MyComponent>(MyComponent);
    const target = emulator.construct(initialProps, context);

    // with TSX
    const target = emulate<MyComponent>(<MyComponent />);

    // control lifecycle
    target.controls.mount();
    target.controls.updateProps(newProps);
    target.controls.updateProps(newProps, newContext);

    // access functions on component instance
    target.component.handleClick();

    // access the rendered JSX elements
    const rendered: JSX.Element | null = target.getRendered();

JavaScript:

    import {emulate} from 'react-lifecycle-emulator';

    const target = emulate(<MyComponent {...initialProps} />, context);

    // control lifecycle
    target.controls.mount();
    target.controls.updateProps(newProps);
    target.controls.updateProps(newProps, newContext);

    // access functions on component instance
    target.component.handleClick();

    // access the rendered JSX elements
    const rendered = target.getRendered();

Note that the core framework never mounts children, this way you can test the
behavior of your component in isolation.
