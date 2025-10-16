import { type ComponentProps, type FormEvent } from "react"

import { Button } from "@/shared/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/ui/card"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldError,
  FieldLabel,
} from "@/shared/ui/field"
import { Input } from "@/shared/ui/input"
import { cn } from "@/shared/lib/utils"

type LoginFormProps = ComponentProps<"div"> & {
  email: string
  password: string
  onEmailChange: (value: string) => void
  onPasswordChange: (value: string) => void
  onSubmit: (event: FormEvent<HTMLFormElement>) => void
  submitLabel: string
  disabled?: boolean
  submitDisabled?: boolean
  errorMessage?: string | null
  onSwitchToSignup: () => void
}

export function LoginForm({
  className,
  email,
  password,
  onEmailChange,
  onPasswordChange,
  onSubmit,
  submitLabel,
  disabled = false,
  submitDisabled = false,
  errorMessage,
  onSwitchToSignup,
  ...props
}: LoginFormProps) {
  return (
    <div
      className={cn("flex flex-col gap-6 text-neutral-200", className)}
      {...props}
    >
      <Card className="bg-neutral-900 border-neutral-800 shadow-none">
        <CardHeader className="space-y-2 text-center">
          <CardTitle className="text-xl font-semibold text-white">
            Welcome back
          </CardTitle>
          <CardDescription className="text-sm text-neutral-400">
            Sign in with your email and password
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-6">
            <FieldGroup>
              {errorMessage ? <FieldError>{errorMessage}</FieldError> : null}
              <Field>
                <FieldLabel
                  htmlFor="email"
                  className="text-sm font-medium text-neutral-200"
                >
                  Email
                </FieldLabel>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(event) => onEmailChange(event.target.value)}
                  disabled={disabled}
                  className="bg-neutral-950 border-neutral-800 text-neutral-100 placeholder:text-neutral-500"
                />
              </Field>
              <Field>
                <FieldLabel
                  htmlFor="password"
                  className="text-sm font-medium text-neutral-200"
                >
                  Password
                </FieldLabel>
                <Input
                  id="password"
                  type="password"
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(event) => onPasswordChange(event.target.value)}
                  disabled={disabled}
                  className="bg-neutral-950 border-neutral-800 text-neutral-100 placeholder:text-neutral-500"
                />
              </Field>
              <Field>
                <Button
                  type="submit"
                  disabled={submitDisabled || disabled}
                  className="bg-white text-neutral-900 hover:bg-neutral-200 disabled:bg-neutral-700 disabled:text-neutral-400"
                >
                  {submitLabel}
                </Button>
                <Field className="items-center gap-3">
                  <div className="h-px w-full bg-neutral-800" />
                  <span className="text-xs uppercase tracking-wide text-neutral-500">
                    Or continue with
                  </span>
                  <div className="h-px w-full bg-neutral-800" />
                </Field>
                <Button
                  type="button"
                  variant="ghost"
                  disabled={disabled}
                  className="bg-neutral-900 text-neutral-100 hover:bg-neutral-800 border border-neutral-800 rounded-md"
                >
                  Continue with Google
                </Button>
                <FieldDescription className="text-center text-sm text-neutral-400">
                  Don&apos;t have an account?{" "}
                  <button
                    type="button"
                    onClick={onSwitchToSignup}
                    className="underline-offset-4 hover:underline text-white"
                  >
                    Sign up
                  </button>
                </FieldDescription>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
