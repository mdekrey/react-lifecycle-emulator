import * as React from 'react';

export type Unsubscriber = () => void;

export interface ISubscribable {
  subscribe(callback: () => void): Unsubscriber;
}

export interface ComponentConstructor<T, TProps> {
  new?(props?: TProps, context?: any): T;
}
export interface Emulator<TInstance, TProps> {
  component: TInstance;
  rendering: ISubscribable;
  controls: {
    mount: () => void;
    checkUpdate: () => void;
    updateProps: (props: TProps, context?: any) => void;
  };
  getRendered(): JSX.Element | null;
}
export function reactEmulator<TInstance extends React.Component<any, any>>(type: ComponentConstructor<TInstance, TInstance['props']>) {
  type TProps = TInstance['props'];
  type TState = TInstance['state'];
  type TContext = TInstance['context'];
  interface PendingStateChange {
    change: Partial<TState> | ((state: TState, props: TProps) => Partial<TState>);
    callback?: () => void;
  }

  return {
    construct: (originalProps: TProps, originalContext: any = {}): Emulator<TInstance, TProps> => {
      const component = new (type as any)(originalProps, originalContext) as TInstance & React.ComponentLifecycle<TProps, any>;
      component.props = originalProps;
      component.context = originalContext;
      let currentProps = originalProps;
      let currentState: TState = component.state;
      let currentContext = originalContext;
      const pendingPropsChanges: { props: TProps; context: TContext; }[] = [];
      const pendingStateChanges: PendingStateChange[] = [];
      let rendered: JSX.Element | null = null;
      const renderingNotify: (() => void)[] = [];

      component.setState = (nextState: PendingStateChange['change'], callback?: () => void) => {
        pendingStateChanges.push({
          change: nextState,
          callback,
        });
      };

      function mount() {
        if (component.componentWillMount) {
          component.componentWillMount();
        }
        rendered = component.render();
        renderingNotify.forEach(v => v());
        if (component.componentDidMount) {
          component.componentDidMount();
        }
      }

      function updateProps(props: TProps, context?: TContext) {
        context = context || component.context;
        pendingPropsChanges.splice(0, pendingPropsChanges.length, { props, context });
        if (component.componentWillReceiveProps) {
          component.componentWillReceiveProps(props, context);
        }
        checkUpdate();
      }

      function checkUpdate() {
        if (!pendingPropsChanges.length && !pendingStateChanges.length) {
          return;
        }
        const old = { props: currentProps, context: currentContext, state: currentState };

        let resultState = currentState;
        pendingStateChanges.forEach(({change}) =>
          resultState =
            typeof change === 'function'
              ? change(resultState, currentProps)
              : Object.assign({}, resultState, change));
        const callbacks = pendingStateChanges.map(({ callback }) => callback).filter(Boolean);
        pendingStateChanges.splice(0);
        currentState = resultState;
        pendingPropsChanges.forEach(({ props, context}) => {
          currentProps = props;
          currentContext = context;
        });
        pendingPropsChanges.splice(0);

        if (component.shouldComponentUpdate && !component.shouldComponentUpdate(currentProps, currentState, currentContext)) {
          return false;
        }
        if (component.componentWillUpdate) {
          component.componentWillUpdate(currentProps, currentState, currentContext);
        }
        component.props = currentProps;
        component.context = currentContext;
        component.state = currentState;

        rendered = component.render();
        renderingNotify.forEach(v => v());

        if (component.componentDidUpdate) {
          component.componentDidUpdate(old.props, old.state, old.context);
        }

        callbacks.forEach(v => v!());
      }

      function getRendered() {
        return rendered;
      }

      const rendering: ISubscribable = {
        subscribe: (callback) => {
          renderingNotify.push(callback);
          return () => {
            const index = renderingNotify.findIndex(entry => entry === callback);
            if (index !== -1) {
              renderingNotify.splice(index, 1);
            }
          };
        },
      };

      return {
        component,
        rendering,
        controls: { mount, updateProps, checkUpdate },
        getRendered,
      };
    },
  };
}
