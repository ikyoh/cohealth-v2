import { SignupForm } from "@/app/signup/form"
export default function SignupPage() {
    return (
        <div className="bg-muted flex min-h-svh flex-col items-center justify-center p-6 md:p-10">
            <div className="w-full max-w-4xl">
                <SignupForm />
            </div>
        </div>
    )
}
