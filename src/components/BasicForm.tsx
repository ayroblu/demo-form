import React from "react";
import { useLocalForm, useControlledSubForm } from "../useForm";
import styles from "./BasicForm.module.css";

type MyFormResp = {
  first: string;
  second: string;
  third: string;
  fourth: string;
  name: {
    first: string;
    last: string;
  };
  accept: boolean;
};
const initialValues: MyFormResp = {
  first: "",
  second: "",
  third: "",
  fourth: "",
  name: {
    first: "",
    last: "",
  },
  accept: false,
};

export const BasicForm: React.FC = () => {
  const form = useLocalForm({ initialData: initialValues });

  const submit = React.useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      const success = form.validate();
      if (success) {
        console.log(form.getValues());
      }
    },
    [form]
  );

  return (
    <form className={styles.BasicForm} onSubmit={submit}>
      {form.createFormItem("first", {
        required: true,
        adaptor: (e: React.ChangeEvent<HTMLInputElement>) => e.target.value,
      })(({ props, errorText }) => (
        <div className={styles.row}>
          <label htmlFor={props.name}>First*</label>
          <div className={styles.inputContainer}>
            <input id={props.name} {...props} />
            <div className={styles.error}>{errorText}&nbsp;</div>
          </div>
        </div>
      ))}
      {form.createFormItem("second", {
        adaptor: (e: React.ChangeEvent<HTMLInputElement>) => e.target.value,
      })(({ props, errorText }) => (
        <div className={styles.row}>
          <label htmlFor={props.name}>Second</label>
          <div className={styles.inputContainer}>
            <input id={props.name} {...props} />
            <div className={styles.error}>{errorText}&nbsp;</div>
          </div>
        </div>
      ))}
      {form.createFormItem("third", {
        required: true,
        validationMessages: { required: () => "Please select an option" },
        adaptor: (e: React.ChangeEvent<HTMLSelectElement>) => e.target.value,
      })(({ props, errorText }) => (
        <div className={styles.row}>
          <label htmlFor={props.name}>Select something*</label>
          <div className={styles.inputContainer}>
            <select name={props.name} id={props.name} {...props}>
              <option disabled value="">
                -- select an option --
              </option>
              <option value="volvo">Volvo</option>
              <option value="saab">Saab</option>
              <option value="mercedes">Mercedes</option>
              <option value="audi">Audi</option>
            </select>
            <div className={styles.error}>{errorText}&nbsp;</div>
          </div>
        </div>
      ))}
      {form.createFormItem("fourth", {
        adaptor: (e: React.ChangeEvent<HTMLInputElement>) => e.target.value,
      })(({ props: { onChange, value, ...props }, errorText }) => (
        <div className={styles.row}>
          <label htmlFor={props.name}>Fourth</label>
          <div className={styles.inputContainer}>
            <div className={styles.flexRow}>
              <input
                type="radio"
                id={props.name + 1}
                name={props.name}
                value="first"
                onChange={onChange}
                checked={value === "first"}
              />
              <label htmlFor={props.name + 1}>First option</label>
            </div>
            <div className={styles.flexRow}>
              <input
                type="radio"
                id={props.name + 2}
                name={props.name}
                value="second"
                onChange={onChange}
                checked={value === "second"}
              />
              <label htmlFor={props.name + 2}>Second option</label>
            </div>
            <div className={styles.flexRow}>
              <input
                type="radio"
                id={props.name + 3}
                name={props.name}
                value="third"
                onChange={onChange}
                checked={value === "third"}
              />
              <label htmlFor={props.name + 3}>Third option</label>
            </div>
            <div className={styles.error}>{errorText}&nbsp;</div>
          </div>
        </div>
      ))}
      {form.createFormItem("name")(({ props: { name, ...props } }) => (
        <div className={styles.row}>
          <NameForm {...props} />
        </div>
      ))}
      {form.createFormItem("accept", {
        required: true,
        adaptor: (e: React.ChangeEvent<HTMLInputElement>) =>
          e.currentTarget.checked,
      })(({ props: { value: checked, ...props }, errorText }) => (
        <div className={styles.row}>
          <label htmlFor={props.name}>Accept</label>
          <div className={styles.inputContainer}>
            <input
              id={props.name}
              type="checkbox"
              checked={checked}
              {...props}
            />
            <div className={styles.error}>{errorText}&nbsp;</div>
          </div>
        </div>
      ))}
      <button>submit</button>
    </form>
  );
};

type SubForm<T extends {}, K extends keyof T> = {
  value: T[K];
  onChange: (value: T[K]) => void;
  // onBlur: (value: T[K]) => void;
};
type NameFormProps = SubForm<MyFormResp, "name">;
const NameForm: React.FC<NameFormProps> = ({ value, onChange }) => {
  const form = useControlledSubForm({
    values: value,
    onChange,
  });

  return (
    <div>
      {form.createFormItem("first", {
        required: true,
        adaptor: (e: React.ChangeEvent<HTMLInputElement>) => e.target.value,
      })(({ props, errorText }) => (
        <div className={styles.row}>
          <label htmlFor={props.name}>First*</label>
          <div className={styles.inputContainer}>
            <input id={props.name} {...props} />
            <div className={styles.error}>{errorText}&nbsp;</div>
          </div>
        </div>
      ))}
      {form.createFormItem("last", {
        required: true,
        adaptor: (e: React.ChangeEvent<HTMLInputElement>) => e.target.value,
      })(({ props, errorText }) => (
        <div className={styles.row}>
          <label htmlFor={props.name}>Last*</label>
          <div className={styles.inputContainer}>
            <input id={props.name} {...props} />
            <div className={styles.error}>{errorText}&nbsp;</div>
          </div>
        </div>
      ))}
    </div>
  );
};
