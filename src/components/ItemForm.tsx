import { memo, useRef } from "react";
import type { FieldProps, FormikProps } from "formik";
import { ErrorMessage, FastField, Form, Formik } from "formik";
import * as Yup from "yup";

export type ItemFormValues = {
  name: string;
  price: string;
};

type ItemFormProps = {
  initialValues: ItemFormValues;
  isEditing: boolean;
  isLoading: boolean;
  errorMessage: string | null;
  onSubmit: (values: ItemFormValues) => Promise<boolean>;
  onClear: () => void;
};

const ItemForm = ({
  initialValues,
  isEditing,
  isLoading,
  errorMessage,
  onSubmit,
  onClear,
}: ItemFormProps) => {
  const formikRef = useRef<FormikProps<ItemFormValues>>(null);

  return (
    <div className="panel">
      <h2>{isEditing ? "Editar item" : "Nuevo item"}</h2>
      <Formik
        innerRef={formikRef}
        enableReinitialize
        initialValues={initialValues}
        validateOnChange
        validateOnBlur
        validationSchema={validationSchema}
        onSubmit={async (values, helpers) => {
          const ok = await onSubmit(values);
          if (ok) helpers.resetForm();
        }}
      >
        <Form className="form">
          <label className="field">
            <span>Nombre</span>
            <FastField name="name">
              {({ field, meta }: FieldProps<ItemFormValues["name"]>) => (
                <>
                  <input
                    {...field}
                    placeholder="Nombre del item"
                    className={meta.touched && meta.error ? "input--error" : ""}
                  />
                  <ErrorMessage name="name">
                    {(msg) => <span className="field__error">{msg}</span>}
                  </ErrorMessage>
                </>
              )}
            </FastField>
          </label>
          <label className="field">
            <span>Precio</span>
            <FastField name="price">
              {({ field, meta }: FieldProps<ItemFormValues["price"]>) => (
                <>
                  <input
                    {...field}
                    placeholder="0.00"
                    inputMode="decimal"
                    className={meta.touched && meta.error ? "input--error" : ""}
                  />
                  <ErrorMessage name="price">
                    {(msg) => <span className="field__error">{msg}</span>}
                  </ErrorMessage>
                </>
              )}
            </FastField>
          </label>
          <div className="actions">
            <button type="submit" className="primary" disabled={isLoading}>
              {isEditing ? "Guardar cambios" : "Crear item"}
            </button>
            <button
              type="button"
              className="ghost"
              onClick={() => {
                formikRef.current?.resetForm();
                onClear();
              }}
            >
              Limpiar
            </button>
          </div>
          {errorMessage && <div className="alert">{errorMessage}</div>}
        </Form>
      </Formik>
    </div>
  );
};

const validationSchema = Yup.object({
  name: Yup.string().trim().required("Requerido"),
  price: Yup.number().typeError("Debe ser numero").required("Requerido"),
});

export default memo(ItemForm);
