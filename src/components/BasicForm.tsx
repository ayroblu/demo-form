import React from "react";
import { useForm } from "../useForm";
import { useLocalStorage } from "../useLocalStorage";
import styles from "./BasicForm.module.css";

type MyFormResp = {
  first: string;
  second: string;
  accept: boolean;
};

export const BasicForm: React.FC = () => {
  const initialValues: MyFormResp = {
    first: "",
    second: "",
    accept: false,
  };
  const [initialStorageValues, setStorage] = useLocalStorage(
    "basic-form",
    initialValues
  );
  const form = useForm(initialStorageValues, (v) => setStorage(v));

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
      {form.createTextInputItem("first", {
        required: true,
      })(({ props, error }) => (
        <div className={styles.row}>
          <label htmlFor={props.name}>First*</label>
          <div className={styles.inputContainer}>
            <input {...props} required />
            <div className={styles.error}>{error}&nbsp;</div>
          </div>
        </div>
      ))}
      {form.createTextInputItem("second")(({ props, error }) => (
        <div className={styles.row}>
          <label htmlFor={props.name}>Second</label>
          <div className={styles.inputContainer}>
            <input {...props} />
            <div className={styles.error}>{error}&nbsp;</div>
          </div>
        </div>
      ))}
      {form.createCheckboxInputItem("accept")(({ props, error }) => (
        <div className={styles.row}>
          <label htmlFor={props.name}>Accept</label>
          <div className={styles.inputContainer}>
            <input type="checkbox" {...props} />
            <div className={styles.error}>{error}&nbsp;</div>
          </div>
        </div>
      ))}
      <button>submit</button>
    </form>
  );
};
