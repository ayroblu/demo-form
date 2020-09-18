import React from "react";
import { useForm } from "../useForm";
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

export const BasicForm: React.FC = () => {
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
  const form = useForm(initialValues);

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
      {form.createInputItem("first", {
        required: true,
      })(({ props, error }) => (
        <div className={styles.row}>
          <label htmlFor={props.name}>First*</label>
          <div className={styles.inputContainer}>
            <input id={props.name} {...props} />
            <div className={styles.error}>{error}&nbsp;</div>
          </div>
        </div>
      ))}
      {form.createInputItem("second")(({ props, error }) => (
        <div className={styles.row}>
          <label htmlFor={props.name}>Second</label>
          <div className={styles.inputContainer}>
            <input id={props.name} {...props} />
            <div className={styles.error}>{error}&nbsp;</div>
          </div>
        </div>
      ))}
      {form.createSelectItem("third", {
        required: true,
        errorMessage: "Please select an option",
      })(({ props, error }) => (
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
            <div className={styles.error}>{error}&nbsp;</div>
          </div>
        </div>
      ))}
      {form.createInputItem("fourth")(
        ({ props: { onChange, value, ...props }, error }) => (
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
              <div className={styles.error}>{error}&nbsp;</div>
            </div>
          </div>
        )
      )}
      {form.createItem("name")(({ props: { name, ...props } }) => (
        <div className={styles.row}>
          <NameForm {...props} />
        </div>
      ))}
      {form.createCheckboxInputItem("accept", {
        required: true,
      })(({ props, error }) => (
        <div className={styles.row}>
          <label htmlFor={props.name}>Accept</label>
          <div className={styles.inputContainer}>
            <input id={props.name} type="checkbox" {...props} />
            <div className={styles.error}>{error}&nbsp;</div>
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
  onBlur: (value: T[K]) => void;
};
type NameFormProps = SubForm<MyFormResp, "name">;
const NameForm: React.FC<NameFormProps> = ({ value, onChange, onBlur }) => {
  const form = useForm(value);
  React.useEffect(() => {
    console.log("new", form.getValues(), value);
    // form.handleOnChange('first',
    // form.setValues(value);
  }, [form, value]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return (
    <div>
      {form.createInputItem("first", {
        required: true,
      })(({ props, error }) => (
        <div className={styles.row}>
          <label htmlFor={props.name}>First*</label>
          <div className={styles.inputContainer}>
            <input id={props.name} {...props} />
            <div className={styles.error}>{error}&nbsp;</div>
          </div>
        </div>
      ))}
      {form.createInputItem("last", {
        required: true,
      })(({ props, error }) => (
        <div className={styles.row}>
          <label htmlFor={props.name}>Last*</label>
          <div className={styles.inputContainer}>
            <input id={props.name} {...props} />
            <div className={styles.error}>{error}&nbsp;</div>
          </div>
        </div>
      ))}
    </div>
  );
};
