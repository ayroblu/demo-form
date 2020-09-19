import React from "react";
import { ObjectKeys } from "./utils";
import {
  ControlledParams,
  FormItemParams,
  ValidationParams,
  NamedValidationParams,
  LocalParams,
  ControlledSubParams,
} from "./useFormTypes";
import { useIsMounted } from "./hooks";

/**
 * Cases: Required (localvalidation), optional, async validation, custom validation messages
 * local state, global state
 * adaptor for custom form items
 * type check everything after "name"
 *
 * Must implement:
 * - Data type passed in, initial data
 * - create a form item
 */
export const useControlledForm = <T extends {}>({
  values,
  onChange,
}: ControlledParams<T>) => {
  const getIsMounted = useIsMounted();
  const [touched, setTouched] = React.useState<
    Partial<Record<keyof T, boolean>>
  >({});
  const [errors, setErrors] = React.useState<Partial<Record<keyof T, string>>>(
    {}
  );

  type AdaptedFormItemParams<
    K extends keyof T,
    A = undefined
  > = A extends undefined
    ? FormItemParams<T, K, T[K]>
    : FormItemParams<T, K, A>;
  const createFormItem = <K extends keyof T, A = undefined>(
    key: K,
    {
      adaptor,
      ...validationParams
    }: ValidationParams<T, K> & { adaptor?: (input: A) => T[K] } = {}
  ) => (formItem: (params: AdaptedFormItemParams<K, A>) => React.ReactNode) => {
    const getErrorText = getErrorTextFn<T, K>({
      name: key,
      ...validationParams,
    });
    const errorText = getErrorText(values[key]);
    if (errorText instanceof Promise) {
      if (validationParams.customAsync) {
        setErrors({
          ...errors,
          [key]: validationParams.customAsync.handleLoading(values[key]),
        });
      }
      errorText
        .then(
          (errorText) =>
            getIsMounted() && setErrors({ ...errors, [key]: errorText })
        )
        .catch(
          (err) =>
            getIsMounted() &&
            validationParams.customAsync &&
            setErrors({
              ...errors,
              [key]: validationParams.customAsync.handleCatch(err),
            })
        );
    } else if (errorText !== errors[key]) {
      setErrors({ ...errors, [key]: errorText });
    }

    const onChangeHandler = (val: A extends undefined ? T[K] : A) => {
      // https://stackoverflow.com/questions/60456679/assignment-of-generic-object-to-partial-type
      const value = adaptor ? adaptor(val as A) : val;
      onChange({ [key]: value } as Pick<T, K> & Partial<T>);
      setTouched({ ...touched, [key]: true });
    };
    return formItem({
      props: {
        name: key,
        value: values[key],
        onChange: onChangeHandler,
        onBlur: onChangeHandler,
      },
      errorText: (touched[key] && errors[key]) || null,
    } as AdaptedFormItemParams<K, A>);
  };
  const validate = () => {
    const allTouched = ObjectKeys(values).reduce<
      Partial<Record<keyof T, boolean>>
    >((a, n) => {
      a[n] = true;
      return a;
    }, {});
    setTouched(allTouched);
    return !Object.values(errors).filter((value) => value).length;
  };
  return {
    createFormItem,
    validate,
  };
};

const getErrorTextFn = <T extends {}, K extends keyof T>({
  name,
  required,
  validationMessages,
  custom,
  customAsync,
}: NamedValidationParams<T, K>) => (value: T[K]) => {
  if (required && !value) {
    return validationMessages?.required?.(name) ?? `${name} is required`;
  } else {
    if (custom) {
      const result = custom(value);
      if (result) return result;
    }
    if (customAsync) {
      return customAsync.validator(value);
    }
  }
  return null;
};

export const useLocalForm = <T>({ initialData }: LocalParams<T>) => {
  const [formState, setFormState] = React.useState(initialData);
  return {
    ...useControlledForm({
      values: formState,
      onChange: (val) => setFormState({ ...formState, ...val }),
    }),
    getValues: () => formState,
  };
};
export const useControlledSubForm = <T extends {}>({
  values,
  onChange,
}: ControlledSubParams<T>) => {
  return {
    ...useControlledForm({
      values,
      onChange: (val) => onChange({ ...values, ...val }),
    }),
  };
};
