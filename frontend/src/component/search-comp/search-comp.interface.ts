import { ZodType } from "zod";

export interface SearchCompProps {
    onSearch: (value: string) => void;
    placeholder?: string;
    debounceDelay?: number;
    schema?: ZodType<string>;
}
