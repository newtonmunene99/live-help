
import { Config } from '@stencil/core';

export const config: Config = {
  namespace: 'live-help',
  outputTargets:[
    {
      type: 'dist'
    },
    {
      type: 'www',
      serviceWorker: null
    }
  ]
};
