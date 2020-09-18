import React from "react";

type FormAnyComponent<
  T extends {},
  K extends keyof T,
  OnChange extends (...any: any[]) => void = (...any: any[]) => void,
  OnBlur extends (...any: any[]) => void = (...any: any[]) => void
> = (prop: {
  props: {
    name: K;
    onChange: OnChange;
    onBlur: OnBlur;
    value: T[K];
  };
  error?: string;
}) => React.ReactNode;

type ValueCallback<V> = (value: V) => void;

type FormComponent<T extends {}, K extends keyof T> = FormAnyComponent<
  T,
  K,
  ValueCallback<T[K]>,
  ValueCallback<T[K]>
>;
type FormTextInputComponent<T extends {}, K extends keyof T> = FormAnyComponent<
  T,
  K,
  (e: React.ChangeEvent<HTMLInputElement>) => void,
  (e: React.FocusEvent<HTMLInputElement>) => void
>;
type FormSelectComponent<T extends {}, K extends keyof T> = FormAnyComponent<
  T,
  K,
  (e: React.ChangeEvent<HTMLSelectElement>) => void,
  (e: React.FocusEvent<HTMLSelectElement>) => void
>;
type FormCheckboxInputComponent<T extends {}, K extends keyof T> = (prop: {
  props: {
    name: K;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    checked: T[K];
  };
  error?: string;
}) => React.ReactNode;

type Options<T extends {}, K extends keyof T, O extends Option = Option> = {
  [k in K]?: O;
};
type ExtendedOptions<T extends {}, K extends keyof T> = Options<
  T,
  K,
  ExtendedOption<T[K]>
>;
type Option = {
  required?: boolean;
  errorMessage?: string;
};
type ExtendedOption<V> = Option & {
  onChangeAdapter?: (onChange: ValueCallback<V>) => (...any: any[]) => void;
  onBlurAdapter?: (onBlur: ValueCallback<V>) => (...any: any[]) => void;
};

type Errors<T extends {}> = {
  [k in keyof T]?: string;
};
export type Form = ReturnType<typeof useForm>;

/**
 * Use Cases:
 * - Ephemeral state - just use local state, don't really want to persist it in redux
 * - Wizard: when you have to persist state over multiple screens
 * - Need to change a value later, dependent boxes: e.g. address, or outside config
 */
export const useForm = <T extends {}>(
  initialData: T,
  stateCb?: (val: T) => void
) => {
  const [formState, setFormState] = React.useState(initialData);
  const [errors, setErrors] = React.useState({} as Errors<T>);
  const allOptions: ExtendedOptions<T, keyof T> = {};
  const setFormStateFn = (value: T) => {
    setFormState(value);
    stateCb && stateCb(value);
  };

  const validate = () => {
    const errorItems = Object.entries(formState)
      .map(([key, value]) => validateKeyItem(key as keyof T, value as any))
      .filter((a) => a);
    const errorMap = Object.assign({}, ...errorItems);
    setErrors(errorMap);
    return !Object.keys(errorMap).length;
  };
  const validateKey = <K extends keyof T>(key: K, value: T[K]) => {
    if (allOptions[key]?.required && !value) {
      setErrors({
        ...errors,
        [key]: allOptions[key]?.errorMessage || "Field is required",
      });
    } else {
      setErrors(omit(errors, key));
    }
  };
  const validateKeyItem = <K extends keyof T>(key: K, value: T[K]) => {
    if (allOptions[key]?.required && !value) {
      return { [key]: allOptions[key]?.errorMessage || "Field is required" };
    }
    return null;
  };
  const onChangeSubscriptions: { [K in keyof T]?: ValueCallback<T[K]>[] } = {};
  const subscribeOnChange = <K extends keyof T>(
    key: K,
    onChange: ValueCallback<T[K]>
  ) => (value: T[K]) => {
    onChange(value);
    onChangeSubscriptions[key]?.forEach((onChange) => onChange(value));
  };
  const onBlurSubscriptions: { [K in keyof T]?: ValueCallback<T[K]>[] } = {};
  const subscribeOnBlur = <K extends keyof T>(
    key: K,
    onBlur: ValueCallback<T[K]>
  ) => (value: T[K]) => {
    onBlur(value);
    onBlurSubscriptions[key]?.forEach((onBlur) => onBlur(value));
  };

  const createAnyItem = <K extends keyof T>(
    key: K,
    options?: ExtendedOption<T[K]>
  ) => (func: FormAnyComponent<T, K>) => {
    allOptions[key] = options;

    const onChangeBasic = subscribeOnChange(key, (value: T[K]) => {
      validateKey(key, value);
      setFormStateFn({ ...formState, [key]: value });
    });
    const onChange = options?.onChangeAdapter
      ? options?.onChangeAdapter(onChangeBasic)
      : onChangeBasic;

    const onBlurBasic = subscribeOnBlur(key, (value: T[K]) => {
      validateKey(key, value);
    });
    const onBlur = options?.onBlurAdapter
      ? options?.onBlurAdapter(onBlurBasic)
      : onBlurBasic;

    return func({
      props: {
        name: key,
        value: formState[key],
        onChange,
        onBlur,
      },
      error: errors[key],
    });
  };
  const createItem = <K extends keyof T>(
    key: K,
    options?: ExtendedOption<T[K]>
  ) => (func: FormComponent<T, K>) => createAnyItem(key, options)(func);

  const inputOnChangeAdapter = <K extends keyof T>(
    onChange: ValueCallback<T[K]>
  ) => (e: React.ChangeEvent<HTMLInputElement>) =>
    onChange(e.currentTarget.value as any);
  const inputOnBlurAdapter = <K extends keyof T>(
    onBlur: ValueCallback<T[K]>
  ) => (e: React.FocusEvent<HTMLInputElement>) =>
    onBlur(e.currentTarget.value as any);
  const createInputItem = <K extends keyof T>(key: K, options?: Option) => (
    func: FormTextInputComponent<T, K>
  ) =>
    createAnyItem(key, {
      onChangeAdapter: inputOnChangeAdapter,
      onBlurAdapter: inputOnBlurAdapter,
      ...options,
    })(func);
  const createSelectItem = <K extends keyof T>(key: K, options?: Option) => (
    func: FormSelectComponent<T, K>
  ) =>
    createAnyItem(key, {
      onChangeAdapter: inputOnChangeAdapter,
      onBlurAdapter: inputOnBlurAdapter,
      ...options,
    })(func);

  const createCheckboxInputItem = <K extends keyof T>(
    key: K,
    options?: Option
  ) => (func: FormCheckboxInputComponent<T, K>) => {
    allOptions[key] = options;

    return func({
      props: {
        name: key,
        checked: formState[key],
        onChange: (e) => {
          const value = (e.currentTarget.checked as any) as T[K];
          validateKey(key, value);
          setFormStateFn({ ...formState, [key]: value });
        },
      },
      error: errors[key],
    });
  };
  function handleOnChange<K extends keyof T>(
    key: K,
    onChange: ValueCallback<T[K]>
  ) {
    if (!onChangeSubscriptions[key]) {
      onChangeSubscriptions[key] = [];
    }
    onChangeSubscriptions[key]?.push(onChange);
  }
  function handleOnBlur<K extends keyof T>(
    key: K,
    onBlur: ValueCallback<T[K]>
  ) {
    if (!onBlurSubscriptions[key]) {
      onBlurSubscriptions[key] = [];
    }
    onBlurSubscriptions[key]?.push(onBlur);
  }

  function getValues() {
    return formState;
  }
  function setValues(value: T, noCallback: boolean = false) {
    if (noCallback) {
      return setFormState(value);
    }
    return setFormStateFn(value);
  }

  return {
    createItem,
    createInputItem,
    createSelectItem,
    createCheckboxInputItem,
    handleOnChange,
    handleOnBlur,
    getValues,
    setValues,
    validate,
  };
};
const omit = <T extends { [key: string]: any }, K extends keyof T>(
  obj: T,
  key: K
) => {
  obj = { ...obj };
  delete obj[key];
  return obj;
};
