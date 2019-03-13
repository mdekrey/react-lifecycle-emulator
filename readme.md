# Deprecation Notice

This was a WIP project that was never ready for or used in production. These days, Jest is a much better tool than when I initially wrote this.

# React Lifecycle Emulator

Allows behavior-driven tests against React components by exposing the raw
functions to test harnesses. Built with TypeScript and shipped with JS files, so
you can use it wherever and however you please.

## Welcome

| Question | Answer |
|--------|-------|
| "I want to learn react-lifecycle-emulator" | Documentation TODO |
| "I have a question" | [Open an issue](./issues/new) and we'll get it tagged appropriately |
| "I found a bug" | [Open an issue](./issues/new) and we'll get it tagged appropriately |
| "I want to help build" | Contributing guidelines TODO<br />Then<br />[Choose an issue marked "help wanted"](.//issues?q=is%3Aissue+is%3Aopen+label%3A%22help+wanted%22) |

## Core usage

TypeScript:

    import {reactEmulator} from 'react-lifecycle-emulator';

    const emulator = reactEmulator<MyComponent>(MyComponent);
    const target = emulator.construct(initialProps, context);

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
