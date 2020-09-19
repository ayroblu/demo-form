import React from "react";
import { useControlledForm } from "../useNewForm";
import styles from "./NewForm.module.css";

type MyFormResp = {
  myRequired: string;
  myOptional: string;
  subForm: {
    subRequired: string;
    subOptionaln: string;
  };
  accept: boolean;
};
const initialValues: MyFormResp = {
  myRequired: "",
  myOptional: "",
  subForm: {
    subRequired: "",
    subOptionaln: "",
  },
  accept: false,
};
/**
 * Cases: Required (localvalidation), optional, async validation
 * local state, global state
 */
export const NewForm: React.FC = () => {
  const [formState, setFormState] = React.useState(initialValues);
  const form = useControlledForm({
    values: formState,
    onChange: (value: Partial<MyFormResp>) =>
      setFormState({ ...formState, ...value }),
  });
  return (
    <section>
      <div>
        {form.createFormItem(
          "myRequired",
          {
            required: true,
          },
          (e: React.ChangeEvent<HTMLInputElement>) => e.target.value
        )(({ props, errorText }) => (
          <div className={styles.row}>
            <label htmlFor={props.name}>My Required*</label>
            <div className={styles.inputContainer}>
              <input id={props.name} {...props} />
              <div className={styles.error}>{errorText}&nbsp;</div>
            </div>
          </div>
        ))}
        {form.createFormItem(
          "myOptional",
          {},
          (e: React.ChangeEvent<HTMLInputElement>) => e.target.value
        )(({ props, errorText }) => (
          <div className={styles.row}>
            <label htmlFor={props.name}>My Optional</label>
            <div className={styles.inputContainer}>
              <input id={props.name} {...props} />
              <div className={styles.error}>{errorText}&nbsp;</div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
