import React from 'react';
const JahiaCtx = React.createContext({});
const {Provider, Consumer} = JahiaCtx;

export {JahiaCtx, Provider as JahiaCtxProvider, Consumer as JahiaCtxConsumer};
