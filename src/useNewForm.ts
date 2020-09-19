import React from "react";

type ControlledParams<T extends {}> = {
  values: T;
  onChange: (value: Partial<T>) => void;
};
type LocalParams<T extends {}> = {
  initialData: T;
};
type FormItemParams<T extends {}, K extends keyof T, A> = {
  props: { value: T[K]; onChange: (value: A) => void; name: K };
  errorText: string | null;
};
type CopyMap<T extends {}, V> = {
  [k in keyof T]?: V;
};
type ValidationTypes =
  | {
      type?: "email" | "whitespace";
    }
  | {
      type: "regex";
      regex: RegExp;
    };
type ValidationParams<T extends {}, K extends keyof T> = {
  required?: boolean;
  validationMessages?: {
    [key in NonNullable<ValidationTypes["type"]> | "required"]?: (
      name: K
    ) => string;
  };
  custom?: (val: T[K]) => string;
} & ValidationTypes;
type NamedValidationParams<T extends {}, K extends keyof T> = {
  name: K;
} & ValidationParams<T, K>;

/**
 * Cases: Required (localvalidation), optional, async validation
 * local state, global state
 *
 * Must implement:
 * - Data type passed in, initial data
 * - create a form item
 */
export const useControlledForm = <T extends {}>({
  values,
  onChange,
}: ControlledParams<T>) => {
  const [touched, setTouched] = React.useState<CopyMap<T, boolean>>({});

  const createFormItem = <K extends keyof T, A = undefined>(
    key: K,
    {
      adaptor,
      ...validationParams
    }: ValidationParams<T, K> & { adaptor?: (input: A) => T[K] } = {}
  ) => (
    formItem: (
      params: typeof adaptor extends undefined
        ? FormItemParams<T, K, T[K]>
        : FormItemParams<T, K, A>
    ) => React.ReactNode
  ) => {
    const getErrorText = getErrorTextFn<T, K>({
      name: key,
      ...validationParams,
    });

    return formItem({
      props: {
        name: key,
        value: values[key],
        onChange: (val) => {
          // https://stackoverflow.com/questions/60456679/assignment-of-generic-object-to-partial-type
          onChange({ [key]: adaptor ? adaptor(val) : val } as Pick<T, K> &
            Partial<T>);
          setTouched({ ...touched, [key]: true });
        },
      },
      errorText: touched[key] ? getErrorText(values[key]) : null,
    });
  };
  return {
    createFormItem,
  };
};

const getErrorTextFn = <T extends {}, K extends keyof T>({
  name,
  required,
  validationMessages,
  custom,
}: NamedValidationParams<T, K>) => (value: T[K]) => {
  if (required && !value) {
    return validationMessages?.required?.(name) ?? `${name} is required`;
  } else if (custom) {
    return custom(value);
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
