import ResetPasswordForm from "@/app/reset-password/[token]/form"

export default function ResetPasswordPage() {
  return (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-md">
        <ResetPasswordForm />
      </div>
    </div>
  )
}
