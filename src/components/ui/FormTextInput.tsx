/* eslint-disable @typescript-eslint/no-explicit-any */
import { Control, Controller } from "react-hook-form";
import { FormControl, FormItem, FormLabel, FormMessage } from "./form";
import { Input } from "./input";

interface TextInputFieldProps {
  name: string;
  control: Control<any>;
  label: string;
  placeholder?: string;
  type?: string;
  required?: boolean;
  className?: string;
}

export const TextInputField: React.FC<TextInputFieldProps> = ({
  name,
  control,
  label,
  placeholder,
  type = "text",
  required = false,
  className = "",
}) => (
  <Controller
    name={name}
    control={control}
    render={({ field, fieldState: { error } }) => (
      <FormItem className={className}>
        <FormLabel>
          {label} {required && <span className="text-red-500">*</span>}
        </FormLabel>
        <FormControl>
          <Input {...field} type={type} placeholder={placeholder} />
        </FormControl>
        {error && <FormMessage>{error.message}</FormMessage>}
      </FormItem>
    )}
  />
);
