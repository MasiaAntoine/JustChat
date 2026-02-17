export let initialState: { message: string; pendingImages: string[] } = {
  message: "",
  pendingImages: [],
};

const getDefaultState = (): IState => ({
  message: "",
  pendingImages: [],
});

export type IState = typeof initialState;

export enum IAction {
  SET_MESSAGE = "set_message",
  SET_PENDING_IMAGES = "set_pending_images",
}

export const componentIsUnmounting = () => {
  initialState = getDefaultState();
};

const actionHandlers: Record<string, (s: IState, p: Partial<IState>) => IState> = {
  [IAction.SET_MESSAGE]: (s, p) => ({ ...s, ...p }),
  [IAction.SET_PENDING_IMAGES]: (s, p) => ({ ...s, ...p }),
};

export function reducer(state: IState, { type, payload }: { type: IAction; payload: Partial<IState> }): IState {
  const actionHandler = actionHandlers[type] ?? ((s) => s);
  return actionHandler(state, payload);
}
