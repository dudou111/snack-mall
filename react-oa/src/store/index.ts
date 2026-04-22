import { configureStore } from '@reduxjs/toolkit'
import userReducer from './modules/user'
import reservation from './modules/reservation';
import cost from './modules/cost/cost';
import costuser from './modules/cost/costuser';
import doctor from './modules/doctor'

const store = configureStore({
  reducer: {
    user: userReducer,
    costuser: costuser,
    reservation,
    cost,
    doctor,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      // 序列化检查配置
      serializableCheck: {
        // 忽略特定的action types
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
        // 忽略特定的action payload paths
        ignoredActionPaths: ['meta.arg', 'payload.timestamp'],
        // 忽略特定的state paths
        ignoredPaths: ['items.dates'],
      },
    }),
  // 开发环境下启用Redux DevTools
  devTools: process.env.NODE_ENV !== 'production',
});

export type StoreState = ReturnType<typeof store.getState>;
export type StoreDispatch = typeof store.dispatch;

export default store;
