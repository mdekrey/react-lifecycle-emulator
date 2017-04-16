import * as React from 'react';
import { render } from 'react-dom';

import { IChangingProps, IRecordedProps, IRecordedState, ScriptRunner, ScriptToRun } from './lifecycle-check';

const rootEl = document.getElementById('app');

interface IScriptHostState {
  activeScript: ScriptToRun | null | undefined;
}

const scriptOrder: Partial<{[previous in ScriptToRun]: ScriptToRun }> = {
  'OnMount': 'PropsOnly',
  'PropsOnly': 'StateOnly',
  'StateOnly': 'StateAndPropsAsync',
  'StateAndPropsAsync': 'StateThenCallbackProps',
  'StateThenCallbackProps': 'PropsAndStateInWillReceive',
};

class ScriptHost extends React.Component<{}, IScriptHostState> {
  runningLog: { eventName: string; params?: IChangingProps<IRecordedProps, IRecordedState>; }[] = [];

  constructor() {
    super();
    this.state = { activeScript: 'OnMount' };
  }

  render() {
    if (!this.state.activeScript) {
      return null;
    }
    console.group(this.state.activeScript);
    this.runningLog = [];
    return (
      <ScriptRunner script={this.state.activeScript} completed={this.completed} log={this.log} />
    );
  }

  log = (eventName: string, params?: IChangingProps<IRecordedProps, IRecordedState>) => {
    console.log(eventName, params);
    this.runningLog.push({eventName, params});
  }

  completed = () => {
    const { activeScript } = this.state;
    if (activeScript) {
      console.groupEnd();
      console.log(this.runningLog);
      this.setState(
        () => ({ activeScript: null }),
        () => this.setState({ activeScript: scriptOrder[activeScript] }),
      );
    }
  }
}

// And render our App into it, inside the HMR App Container which handles the reloading
render(
  <div>
    <ScriptHost />
  </div>,
  rootEl,
);
