import React from 'react';
import ReactDOM from 'react-dom';
import { BSC, DAppProvider, Config } from '@usedapp/core';

import './index.css';
import App from './App';
import { BrowserRouter } from 'react-router-dom';

const config: Config = {
  readOnlyChainId: BSC.chainId,
  readOnlyUrls: {
    [BSC.chainId]: 'https://bsc-dataseed.binance.org/',
  },
};

ReactDOM.render(
  <React.StrictMode>
    <DAppProvider config={config}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </DAppProvider>
  </React.StrictMode>,
  document.getElementById('root')
);
