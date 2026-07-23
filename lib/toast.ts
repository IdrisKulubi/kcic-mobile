export type ToastTone = 'success' | 'error' | 'warning' | 'info';

export type ToastInput = {
  title: string;
  message?: string;
  tone?: ToastTone;
  duration?: number;
};

export type ToastMessage = ToastInput & {
  id: number;
  tone: ToastTone;
};

type ToastListener = (message: ToastMessage) => void;

const listeners = new Set<ToastListener>();
let nextToastId = 1;

function emit(input: ToastInput) {
  const message: ToastMessage = {
    ...input,
    id: nextToastId++,
    tone: input.tone ?? 'info',
  };

  listeners.forEach((listener) => listener(message));
  return message.id;
}

function withTone(tone: ToastTone) {
  return (title: string, message?: string, duration?: number) =>
    emit({ title, message, duration, tone });
}

export const toast = {
  show: emit,
  success: withTone('success'),
  error: withTone('error'),
  warning: withTone('warning'),
  info: withTone('info'),
};

export function subscribeToToasts(listener: ToastListener) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
