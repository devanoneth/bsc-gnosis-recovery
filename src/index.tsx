import React from 'react';
import ReactDOM from 'react-dom';
import { BSC, DAppProvider, Config } from '@usedapp/core';

import './index.css';
import App from './App';
import { HashRouter } from 'react-router-dom';

const config: Config = {
  readOnlyChainId: BSC.chainId,
  readOnlyUrls: {
    [BSC.chainId]: 'https://bsc-dataseed.binance.org/',
  },
};

ReactDOM.render(
  <React.StrictMode>
    <DAppProvider config={config}>
      <HashRouter>
        <App />
      </HashRouter>
    </DAppProvider>
  </React.StrictMode>,
  document.getElementById('root')
);
