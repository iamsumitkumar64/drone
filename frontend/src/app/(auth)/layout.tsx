import AuthLayoutComp from "@/component/auth-layout/auth-layout";
import { Box } from "@mui/material";
import styles from './layout.module.css';

export default function AuthLayout({ children }: { children: React.ReactNode }) {

    return (
        <Box className={styles.container}>
            <Box className={styles.leftContainer}>
                <AuthLayoutComp description="Be one of Us" title="Setup" />
            </Box>

            <Box className={styles.rightContainer}>
                {children}
            </Box>
        </Box>
    );
}
