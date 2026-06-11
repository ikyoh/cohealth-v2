"use client"
import { PropsWithChildren } from "react";

type Props = PropsWithChildren<{
    title?: string;
    description?: string;
}>;

const FormContainer = ({ title, description, children }: Props) => {

    return (
        <div className="min-h-screen">
            {children}
        </div>
    );
}

export default FormContainer;