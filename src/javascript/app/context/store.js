import React from 'react';

const StoreCtx = React.createContext(null);
const {Provider: StoreCtxProvider, Consumer: StoreCtxConsumer} = StoreCtx;

export {StoreCtx, StoreCtxProvider, StoreCtxConsumer};
