import { configureStore } from "@reduxjs/toolkit";
import counterSlice from "./slices/counterslice";
import menuSlice from "./slices/menuSlice";
import mbCreateSlice from "./slices/mbCreateSlice";

export const store = configureStore({
  reducer: {
    counter: counterSlice,
    menu: menuSlice,
    mbCreate: mbCreateSlice,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

