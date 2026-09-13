"use client"

import styles from "./signup.module.css"
import { useDispatch } from "react-redux"
import { AppDispatch } from "@/redux/store"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { signupSchema, SignupSchemaType } from "@/schemas/signup"
import { signupUser } from "@/redux/feature/user/user-action"
import { useRouter } from "next/navigation"

import {
    Box,
    Button,
    Card,
    MenuItem,
    TextField,
    Typography
} from "@mui/material"
import { UserRoleEnum } from "@/redux/feature/user/user-role.enum"
import { enqueueSnackbar } from "notistack"

export default function SignupForm() {
    const dispatch = useDispatch<AppDispatch>();
    const router = useRouter();
    const {
        register,
        handleSubmit,
        formState: { errors }
    } = useForm<SignupSchemaType>({
        resolver: zodResolver(signupSchema),
        defaultValues: {
            role: UserRoleEnum.USER
        }
    })

    const onSubmit = async (data: SignupSchemaType) => {
        try {
            await dispatch(signupUser(data)).unwrap()
            router.replace("/")
        } catch (error) {
            enqueueSnackbar(String(error || "Something wrong"), { variant: "error" });
            console.log(error)
        }
    }

    return (
        <Box className={styles.container}>
            <Card className={styles.formWrapper} elevation={3}>
                <Typography variant="h5" className={styles.title}>
                    Join Us! It's free
                </Typography>

                <form onSubmit={handleSubmit(onSubmit)} className={styles.form}>
                    <Box className={styles.field}>
                        <TextField
                            label="Username"
                            type="text"
                            fullWidth
                            {...register("username")}
                        />
                        {errors.username && (
                            <span className={styles.error}>
                                {errors.username.message}
                            </span>
                        )}
                    </Box>

                    <TextField
                        label="Email"
                        type="email"
                        fullWidth
                        {...register("email")}
                    />
                    {errors.email && (
                        <span className={styles.error}>
                            {errors.email.message}
                        </span>
                    )}

                    <TextField
                        select
                        label="Role"
                        defaultValue="user"
                        {...register("role")}
                    >
                        <MenuItem value="user">{UserRoleEnum.USER.toUpperCase()}</MenuItem>
                        <MenuItem value="company">{UserRoleEnum.COMPANY.toUpperCase()}</MenuItem>
                    </TextField>

                    <Box className={styles.field}>
                        <TextField
                            label="Password"
                            type="password"
                            fullWidth
                            {...register("password")}
                        />
                        {errors.password && (
                            <span className={styles.error}>
                                {errors.password.message}
                            </span>
                        )}
                    </Box>

                    <Box className={styles.field}>
                        <TextField
                            label="Confirm Password"
                            type="password"
                            fullWidth
                            {...register("confirmPassword")}
                        />
                        {errors.confirmPassword && (
                            <span className={styles.error}>
                                {errors.confirmPassword.message}
                            </span>
                        )}
                    </Box>

                    <Button
                        variant="contained"
                        type="submit"
                        className={styles.button}
                    >
                        Signup
                    </Button>

                    <Button
                        // variant="outlined"
                        className={styles.loginBtn}
                        onClick={() => router.replace("/login")}
                    >
                        Already have an account?
                    </Button>
                </form>
            </Card>
        </Box >
    )
}